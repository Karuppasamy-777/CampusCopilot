# 🏗️ CampusCopilot Architecture & Design System

This document outlines the system architecture, component design, and data lifecycle flow for CampusCopilot.

---

## 📊 System Architecture Diagram

Below is the complete system diagram representing the relationship between the Frontend application, Firebase services, FastAPI backend, and the Google ADK AI layer.

```mermaid
flowchart TD
    subgraph Frontend["Frontend Layer (Next.js 15 + TypeScript)"]
        UI["User Interface (Tailwind CSS + Framer Motion)"]
        AuthProvider["Firebase Auth State"]
        ChatContext["Shared AI Chat Provider (useAiChat)"]
        Pages["App Routes: /home, /settings, /ai-assistant, etc."]
    end

    subgraph FirebaseServices["Firebase Platform"]
        FirebaseAuth["Firebase Authentication"]
        Firestore["Cloud Firestore (Profiles / Settings)"]
    end

    subgraph Backend["Backend API Layer (FastAPI)"]
        Router["FastAPI Chat Router (/api/v1/chat)"]
        PromptBuilder["AI Prompt & Persona Constructor"]
        ADKRunner["Google ADK InMemoryRunner"]
    end

    subgraph AILayer["AI & Generation Layer (Google ADK)"]
        GeminiClient["Gemini 2.5 Flash Model"]
        Persona["Academic Mentor Personality Rules"]
    end

    %% Frontend Interactions
    UI --> ChatContext
    Pages --> ChatContext
    AuthProvider --> FirebaseAuth
    ChatContext --> Firestore

    %% API Data Flow
    ChatContext -- "/api/v1/chat POST (payload: message, profile, history)" --> Router
    Router --> PromptBuilder
    PromptBuilder --> ADKRunner
    ADKRunner --> GeminiClient
    GeminiClient --> Persona

    %% Feedback flow
    Persona -. "Markdown Response Stream" .-> Router
    Router -. "JSON response (reply, agent)" .-> ChatContext
    ChatContext -. "Renders via MarkdownRenderer" .-> UI

    %% Styles
    classDef frontend fill:#eef2ff,stroke:#6366f1,stroke-width:2px,color:#1e1b4b;
    classDef firebase fill:#fff7ed,stroke:#ea580c,stroke-width:2px,color:#7c2d12;
    classDef backend fill:#ecfdf5,stroke:#059669,stroke-width:2px,color:#064e3b;
    classDef ai fill:#faf5ff,stroke:#9333ea,stroke-width:2px,color:#581c87;

    class UI,AuthProvider,ChatContext,Pages frontend;
    class FirebaseAuth,Firestore firebase;
    class Router,PromptBuilder,ADKRunner backend;
    class GeminiClient,Persona ai;
```

---

## 🧩 Component Breakdown

### 1. Frontend Layer
* **Next.js 15 & TypeScript**: Core application architecture offering type safety, optimized file-based routing, and responsive client layouts.
* **Tailwind CSS & Framer Motion**: Provides curated visual aesthetics, smooth layout animations, support for light/dark themes, and responsive design systems.
* **Shared AI Chat Provider (`useAiChat`)**: Manages the application's conversation memory, active loading states, copy tasks, detail widgets toggles, and UI-wide chat feed synchronization.
* **Component Views**:
  - **Dashboard**: Consolidates study agendas, Quick Action cards, and the AI Daily Brief.
  - **AI Workspace**: Embedded workspace panel that syncs with the floating widget.
  - **Settings**: Dynamic cards for profile maintenance, academic milestones, and AI tones.

### 2. Firebase Services Platform
* **Firebase Authentication**: Handles secure user registration, email validation, onboarding, and auth tracking.
* **Cloud Firestore**: Holds data models for User Profiles, course preferences, and sync parameters.

### 3. Backend API Layer
* **FastAPI**: High-performance, asynchronous Python web framework hosting modular REST endpoints.
* **AI Prompt Construction**: Programmatically creates system instruction strings combining tone parameters, persona requirements, and student demographics.
* **Conversation Memory**: Prepares history payloads to maintain context across messages.
* **Profile Personalization**: Adapts system prompt instructions to include profile details implicitly.

### 4. AI & Generation Layer
* **Google ADK**: Agent Development Kit orchestrating agent creation and runtime loops.
* **Gemini 2.5 Flash**: Decides actions, processes context-heavy user prompts, and generates accurate output.
* **Academic Mentor Persona**: Tone rules ensuring responses sound natural, friendly, and structured.
* **Markdown Responses**: Native generation formatting for tables, headers, blockquotes, code syntax, and bullet lists.

---

## 🔄 Request Lifecycle (Data Flow)

The timeline below details how data flows when a student prompts the assistant:

```mermaid
sequenceDiagram
    autonumber
    actor User as Student
    participant FE as Frontend App
    participant BE as FastAPI Backend
    participant ADK as Google ADK Runner
    participant Gemini as Gemini 2.5 Flash

    User->>FE: Inputs prompt or clicks Suggestion Chip
    FE->>FE: Append message to chat memory state
    FE->>BE: POST request to `/chat` (with Prompt, Profile, History)
    BE->>BE: Parse tone, profile & conversation history
    BE->>BE: Generate unified system prompt instructions
    BE->>ADK: Instantiate Agent & InMemoryRunner with prompt
    ADK->>Gemini: Stream payload request to model API
    Gemini->>Gemini: Process context & apply Mentor Persona rules
    Gemini-->>ADK: Return text stream response
    ADK-->>BE: Complete markdown text compilation
    BE-->>FE: Return JSON payload response
    FE->>FE: Sync unified chat state provider
    FE->>User: Renders response using MarkdownRenderer
```

1. **User Action**: The student inputs a message or clicks a suggested prompt chip.
2. **State Appended**: The prompt is appended to the unified frontend chat memory.
3. **API Dispatch**: The frontend dispatches a POST request to the backend `/chat` endpoint.
4. **Context Injection**: The backend retrieves the request data, formats the profile context, and parses conversation memory.
5. **Prompt Setup**: The backend constructs a system instruction containing the personalization variables and mentor persona rules.
6. **Agent Launch**: The backend starts a Google ADK InMemoryRunner with the instruction set.
7. **Gemini Execution**: The ADK runner queries Gemini 2.5 Flash.
8. **Generation**: Gemini generates a structured response using Markdown notation.
9. **Return**: The FastAPI server returns the finalized response to the frontend client.
10. **Render**: The frontend updates the shared context state and renders the markdown cleanly using the `MarkdownRenderer`.
