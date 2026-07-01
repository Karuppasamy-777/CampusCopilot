# 🎓 CampusCopilot

> **AI Operating System for Smart Campuses**

CampusCopilot is an AI-powered academic platform that helps students organize their studies, manage academic information, and interact with a personalized AI assistant—all from one unified workspace.

Built as part of the **Kaggle 5-Day AI Agents Intensive Course with Google**.

---

## 🌟 Why CampusCopilot?

Students often switch between multiple applications to manage their academic life:

- 📅 Timetable
- 📝 Assignments
- 📚 Study Notes
- 🤖 AI Chatbots
- 📄 Documents
- 🎯 Academic Planning

CampusCopilot brings these experiences together into **one intelligent platform**.

---

## ✨ Features

### 🤖 AI Academic Mentor

- Personalized AI assistant
- Conversation memory
- Natural follow-up questions
- Markdown support
- Copy & regenerate responses
- Suggested prompts

---

### 🎓 Smart Student Dashboard

- Personalized welcome
- AI Daily Brief
- Quick Actions
- Academic overview
- Profile completion tracking

---

### ⚙️ Smart Profile

- Student / Faculty / Admin onboarding
- Institution profile
- Academic details
- AI customization
- Live profile synchronization

---

### 📚 Academic Workspace

- Embedded AI Workspace
- Floating AI Assistant
- Shared conversation history

---

### 🧭 Navigation

- Dashboard
- Schedule
- Assignments
- Documents
- Library
- Clubs
- AI Assistant
- Settings

---

## 🏗️ Architecture

```text
Frontend (Next.js)

        │

        ▼

Firebase Authentication

        │

        ▼

Firestore Database

        │

        ▼

FastAPI Backend

        │

        ▼

Google ADK

        │

        ▼

Gemini 2.5 Flash

        │

        ▼

CampusCopilot Response
```

---

## 🛠️ Tech Stack

### Frontend

- Next.js 15
- TypeScript
- Tailwind CSS
- Framer Motion

### Backend

- FastAPI
- Google ADK
- Gemini 2.5 Flash
- Firebase Admin SDK

### Database

- Firebase Firestore

### Authentication

- Firebase Authentication

---

## 🚀 Installation

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Backend

```bash
cd backend

# Activate virtual environment
..\ .venv\Scripts\Activate.ps1

uvicorn app.main:app --reload
```

---

## 📸 Screenshots

Coming Soon

- Dashboard
- AI Workspace
- Floating Assistant
- Settings

---

## 🔮 Roadmap

### Version 2

- Google Calendar Integration
- Assignment Management
- Digital Library
- Campus Clubs
- Smart Notifications
- Document AI

---

## 👨‍💻 Developer

**Priyadarshan Karuppasamy**

Electronics and Communication Engineering

Saveetha Engineering College

---

## ⭐ Acknowledgements

Built during the **Kaggle 5-Day AI Agents Intensive Course with Google** using:

- Google ADK
- Gemini
- Firebase
- FastAPI
- Next.js

---