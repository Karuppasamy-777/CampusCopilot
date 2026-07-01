# CampusCopilot Project Roadmap

## Vision

CampusCopilot is an AI-powered campus assistant that helps students, faculty, and administrators manage their academic life.

The goal is to build a scalable platform that can eventually support institutions worldwide.

---

# Product Philosophy

CampusCopilot should never overwhelm users.

Ask only for information that is immediately useful.

Collect additional information only when a feature requires it.

This is called Progressive Profiling.

---

# Core Principles

1. Keep the user experience simple.

2. Build features incrementally.

3. Never rewrite working features without a strong reason.

4. Prefer modifying existing components over replacing them.

5. Every new feature must integrate with the existing architecture.

6. Every feature should be production-ready.

---

# Current Tech Stack

Frontend

* Next.js 15
* TypeScript
* Tailwind CSS

Backend

* Firebase Authentication
* Cloud Firestore

AI

* Google Gemini

---

# Firestore Collections

users

institutions

timetables

assignments

notices

events

Future collections

courses

studentSchedules

attendance

library

placements

---

# User Flow

Login

↓

Onboarding

↓

Home Dashboard

↓

Campus Features

↓

AI Assistant

---

# Onboarding Rules

Required

* Full Name
* Role
* Institution

Optional

* Course / Program
* Year of Study

Everything else belongs in Settings or is collected when needed.

---

# AI Rules

AI must never assume information that the user has not provided.

If information is missing, ask for it naturally.

Example

"I can build your timetable once you tell me your course and year."

---

# Coding Rules

Never perform large rewrites without approval.

Implement one feature at a time.

After every completed feature:

* Test
* Verify
* Commit

---

# Current Roadmap

Sprint 1

✅ Authentication

✅ Institution Search

✅ Firestore

Sprint 2

✅ Simplified Onboarding

Sprint 3

Student Dashboard

Sprint 4

Timetable

Sprint 5

Assignments

Sprint 6

Notices

Sprint 7

Events

Sprint 8

Gemini AI

Sprint 9

Polish

Sprint 10

Global Institution Support

---

# Long-Term Goal

CampusCopilot should become a universal AI-powered campus operating system capable of supporting any educational institution in the world.
