import logging
from datetime import datetime
from fastapi import APIRouter, HTTPException, status, Depends
from typing import List, Optional
from pydantic import BaseModel
from app.services.gemini import agent_manager
from app.core.security import get_current_user
from firebase_admin import firestore

logger = logging.getLogger(__name__)

router = APIRouter()

def get_student_context(uid: str) -> str:
    context = ""
    try:
        db = firestore.client()
    except Exception as e:
        logger.warning(f"Firestore admin client not initialized/accessible: {e}")
        return "No live campus context available (database offline)."

    # 1. Fetch User Profile
    profile_info = {}
    profile_found = "not found"
    try:
        user_ref = db.collection("users").document(uid)
        user_doc = user_ref.get()
        if user_doc.exists:
            profile_info = user_doc.to_dict()
            profile_found = "found"
    except Exception as e:
        logger.error(f"Error fetching user profile from Firestore: {e}")

    # 2. Fetch Timetable
    timetable_entries = []
    try:
        tt_ref = db.collection("timetable").where("userId", "==", uid)
        tt_docs = tt_ref.get()
        for doc in tt_docs:
            data = doc.to_dict()
            timetable_entries.append({
                "subject": data.get("subject", ""),
                "day": data.get("day", ""),
                "startTime": data.get("startTime", ""),
                "endTime": data.get("endTime", ""),
                "room": data.get("room", ""),
                "faculty": data.get("faculty", "")
            })
    except Exception as e:
        logger.error(f"Error fetching timetable from Firestore: {e}")

    # 3. Fetch Assignments
    assignments_list = []
    try:
        assign_ref = db.collection("assignments").where("userId", "==", uid)
        assign_docs = assign_ref.get()
        for doc in assign_docs:
            data = doc.to_dict()
            assignments_list.append({
                "title": data.get("title", ""),
                "due": data.get("due", "") or data.get("dueDate", ""),
                "dueDate": data.get("dueDate", ""),
                "dueTime": data.get("dueTime", ""),
                "subject": data.get("subject", ""),
                "completed": data.get("completed", False) or data.get("status") == "Completed",
                "priority": data.get("priority", "Medium"),
                "description": data.get("description", "")
            })
    except Exception as e:
        logger.error(f"Error fetching assignments from Firestore: {e}")

    # 4. Fetch Campus Events
    events_list = []
    try:
        events_ref = db.collection("events")
        events_docs = events_ref.get()
        for doc in events_docs:
            data = doc.to_dict()
            events_list.append({
                "title": data.get("title", ""),
                "time": data.get("time", ""),
                "location": data.get("location", "")
            })
    except Exception as e:
        logger.error(f"Error fetching events from Firestore: {e}")

    # 5. Fetch Notices
    notices_list = []
    try:
        notices_ref = db.collection("notices")
        notices_docs = notices_ref.get()
        for doc in notices_docs:
            data = doc.to_dict()
            notices_list.append({
                "title": data.get("title", ""),
                "content": data.get("content", ""),
                "critical": data.get("critical", False)
            })
    except Exception as e:
        logger.error(f"Error fetching notices from Firestore: {e}")

    # Log metrics during every chat request
    timetable_count = len(timetable_entries)
    assignments_count = len(assignments_list)
    events_count = len(events_list)
    notices_count = len(notices_list)

    logger.info(
        f"Chat Request Audit Metrics:\n"
        f"  - authenticated UID: {uid}\n"
        f"  - profile: {profile_found}\n"
        f"  - timetable document count: {timetable_count}\n"
        f"  - assignments count: {assignments_count}\n"
        f"  - events count: {events_count}\n"
        f"  - notices count: {notices_count}"
    )

    # Format the structured context block
    now = datetime.now()
    current_day_name = now.strftime("%A")

    context += "=== LIVE STUDENT CONTEXT ===\n"
    context += f"Current Date/Time: {now.strftime('%Y-%m-%d %H:%M')}\n"
    context += f"Current Day of Week: {current_day_name}\n\n"

    context += "--- USER PROFILE ---\n"
    context += f"Name: {profile_info.get('name') or profile_info.get('fullName') or 'Unknown'}\n"
    context += f"Role: {profile_info.get('role') or 'Student'}\n"
    context += f"Institution: {profile_info.get('institutionName') or 'Not Linked'}\n"
    context += f"Course/Major: {profile_info.get('course') or 'Not Specified'}\n"
    context += f"Year of Study: {profile_info.get('yearOfStudy') or 'Not Specified'}\n"
    context += f"Academic Goals: {', '.join(profile_info.get('academicGoals', [])) if isinstance(profile_info.get('academicGoals'), list) else profile_info.get('academicGoals') or 'None Specified'}\n\n"

    # Inject timetable entries if they exist
    if timetable_entries:
        today_classes = [t for t in timetable_entries if t["day"].lower() == current_day_name.lower()]
        other_classes = [t for t in timetable_entries if t["day"].lower() != current_day_name.lower()]

        context += f"--- TODAY'S CLASSES ({current_day_name}) ---\n"
        if today_classes:
            for idx, c in enumerate(today_classes, 1):
                context += f"{idx}. {c['subject']} from {c['startTime']} to {c['endTime']} in Room {c['room'] or 'TBD'} (Faculty: {c['faculty'] or 'TBD'})\n"
        else:
            context += "No classes scheduled for today.\n"
        context += "\n"

        context += "--- OTHER SCHEDULED CLASSES (WEEKLY) ---\n"
        if other_classes:
            for idx, c in enumerate(other_classes, 1):
                context += f"{idx}. [{c['day']}] {c['subject']} ({c['startTime']} - {c['endTime']}) in Room {c['room'] or 'TBD'}\n"
        else:
            context += "No other classes scheduled.\n"
    else:
        # If no timetable exists, state it explicitly in the system instruction
        context += "--- TIMETABLE STATUS ---\n"
        context += "No timetable configured or created yet for this student. The database is reachable, but the timetable is empty.\n"
        context += "INSTRUCTION: Tell the student explicitly that they have not configured their timetable yet and suggest they create one on the schedule page. Do NOT claim you are having trouble accessing the live schedule or that the data is unavailable.\n"
    context += "\n"

    context += "--- ASSIGNMENTS ---\n"
    if assignments_list:
        for idx, a in enumerate(assignments_list, 1):
            status_str = "Completed" if a["completed"] else "Pending"
            desc_str = f", Desc: {a['description']}" if a["description"] else ""
            context += f"{idx}. {a['title']} (Subject: {a['subject']}, Due Date: {a['dueDate']}, Due Time: {a['dueTime']}, Priority: {a['priority']}) - Status: {status_str}{desc_str}\n"
    else:
        context += "No assignments listed in database.\n"
    context += "\n"

    context += "--- CAMPUS EVENTS ---\n"
    if events_list:
        for idx, ev in enumerate(events_list, 1):
            context += f"{idx}. {ev['title']} at {ev['time']} in {ev['location']}\n"
    else:
        context += "No campus events scheduled.\n"
    context += "\n"

    context += "--- CRITICAL CAMPUS NOTICES ---\n"
    if notices_list:
        for idx, n in enumerate(notices_list, 1):
            critical_marker = " [CRITICAL]" if n["critical"] else ""
            context += f"{idx}.{critical_marker} {n['title']}: {n['content']}\n"
    else:
        context += "No recent campus notices.\n"
    
    context += "============================\n"
    return context

class UserProfileSchema(BaseModel):
    fullName: str
    role: str
    institutionName: str
    course: Optional[str] = None
    yearOfStudy: Optional[str] = None
    academicGoals: Optional[List[str]] = None
    aiTone: Optional[str] = "concise"

class ChatMessageSchema(BaseModel):
    role: str
    text: str

class ChatRequest(BaseModel):
    message: str
    profile: Optional[UserProfileSchema] = None
    history: Optional[List[ChatMessageSchema]] = None

class ChatResponse(BaseModel):
    reply: str
    agent: str

def is_gemini_quota_error(e: Exception) -> bool:
    err_str = str(e).lower()
    class_name = e.__class__.__name__
    if class_name in ("ResourceExhausted", "QuotaExceeded"):
        return True
    if hasattr(e, "status_code") and e.status_code == 429:
        return True
    if hasattr(e, "code") and e.code == 429:
        return True
    if "429" in err_str:
        return True
    if "resource_exhausted" in err_str:
        return True
    if "quota exceeded" in err_str:
        return True
    if "quota_exceeded" in err_str:
        return True
    return False

@router.post("", response_model=ChatResponse)
async def chat_with_agent(
    request: ChatRequest,
    current_user: dict = Depends(get_current_user)
):
    if not request.message.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Message cannot be empty."
        )
    
    uid = current_user.get("uid")
    try:
        # Create modular assistant agent
        instruction = (
            "You are CampusCopilot, an intelligent, helpful academic mentor for students. "
            "Your personality should be that of an encouraging, natural, and friendly mentor rather than a generic or formal chatbot.\n\n"
            
            "CONVERSATIONAL TONE CONSTRAINTS:\n"
            "- Always sound like a natural academic mentor. Use encouraging and casual phrasing like 'Great question!', 'Sure! Here's a simple explanation.', 'Let's break it down.', and 'Here's an example.'.\n"
            "- Avoid stuffy, overly formal, or robotic phrases. Do NOT use: 'It is a pleasure to assist you.', 'Certainly.', 'Let us delve into...', or 'I trust this explanation...'.\n"
            "- Do not include unnecessary introductions, preambles, or fluff at the start of your answers regardless of the tone setting.\n\n"
            
            "GREETING CONSTRAINTS:\n"
            "- Output a greeting ONLY on the very first message of a conversation or chat history.\n"
            "- If the conversation history is already present (messages from 'User' or 'Assistant' are shown above), do NOT greet the user. Skip greetings entirely and jump straight into answering the newest question.\n\n"
            
            "PERSONALIZATION CONSTRAINTS:\n"
            "- Do NOT repeatedly recite the student's name, course, institution, year, or role. Only mention these details when they directly improve or contextualize the academic advice (e.g., 'Based on your ECE coursework, I'd recommend...' rather than 'Hello John, as a Second Year ECE student...'). Use them implicitly to tailor the content.\n\n"
            
            "REPETITION CONSTRAINTS:\n"
            "- Review the conversation history carefully. Do NOT repeat facts, explanations, or suggestions that were already stated or discussed earlier in the conversation history, unless the user explicitly requests a recap."
        )
        
        # Load and append dynamic live student context from Firestore!
        if uid:
            live_context = get_student_context(uid)
            instruction += f"\n\n{live_context}"
        
        if request.profile:
            profile = request.profile
            course_info = profile.course if profile.course and profile.course.strip() else "not provided"
            year_info = profile.yearOfStudy if profile.yearOfStudy and profile.yearOfStudy.strip() else "not provided"
            goals_info = ", ".join(profile.academicGoals) if profile.academicGoals else "none listed"
            ai_tone = profile.aiTone or "concise"
            
            # Map tone instruction specifically
            tone_rules = ""
            if ai_tone == "concise":
                tone_rules = "Adhere to the 'concise' response style: keep your answers very short, direct, and straight-to-the-point with minimal elaboration."
            elif ai_tone == "detailed" or ai_tone == "comprehensive":
                tone_rules = "Adhere to the 'detailed' response style: provide comprehensive, thorough explanations with deep academic context and structured breakdowns."
            else: # mentoring / balanced / other
                tone_rules = "Adhere to the 'balanced' response style: provide medium-length, encouraging answers that balance clarity and depth."

            personalization = (
                f"\n\nINSTRUCTIONS FOR PROFILE & TONE:\n"
                f"1. Use the student profile details to customize your explanations and examples, but keep it implicit. Do not read the profile back to the user.\n"
                f"2. {tone_rules}\n"
                f"3. Do not assume or fabricate any missing information that is marked as 'not provided'."
            )
            instruction += personalization
        
        agent = agent_manager.create_agent(
            name="CampusCopilot",
            instruction=instruction,
            model="gemini-2.5-flash"
        )
        
        # Run agent
        prompt = ""
        if request.history:
            for msg in request.history:
                speaker = "User" if msg.role == "user" else "Assistant"
                prompt += f"{speaker}: {msg.text}\n"
        prompt += f"User: {request.message}"

        if agent_manager.is_available:
            from google.adk.runners import InMemoryRunner
            runner = InMemoryRunner(agent=agent)
            events = await runner.run_debug(prompt)
            response_text = ""
            for event in events:
                if event.content and event.content.parts:
                    for part in event.content.parts:
                        if part.text:
                            response_text += part.text
        else:
            response_text = agent.run(prompt)
        
        return ChatResponse(
            reply=response_text,
            agent=agent.name
        )
    except Exception as e:
        logger.error(f"Error calling Gemini agent: {e}", exc_info=True)
        if is_gemini_quota_error(e):
            from fastapi.responses import JSONResponse
            return JSONResponse(
                status_code=429,
                content={
                    "success": False,
                    "error": "quota_exceeded",
                    "message": "CampusCopilot has temporarily reached the Gemini API quota. Please try again later."
                }
            )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"CampusCopilot AI service is currently unavailable: {str(e)}"
        )
