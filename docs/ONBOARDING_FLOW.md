# CampusCopilot Onboarding Flow Blueprint

This document defines the complete technical and visual blueprint for the **CampusCopilot** onboarding experience. It aligns with the layout rules, typography, and color tokens defined in [docs/DESIGN_RULES.md](file:///c:/Users/acer/Downloads/CampusCopilot/docs/DESIGN_RULES.md).

---

## 1. Onboarding Philosophy

Onboarding is the bridge between a newly verified user account and their personalized AI workspace. It is designed to be highly structured, visual, and lightweight, collecting necessary academic context to configure the Google ADK AI agents without causing data entry fatigue.

```
[Register/Login] ➔ [1. Profile & Role] ➔ [2. Institution Search] ➔ [3. Academic Scope] ➔ [4. AI Personalization] ➔ [Ready]
```

---

## 2. Multi-Step Screen Journey

The flow consists of four primary interactive steps, concluding with a final completion screen. The layout leverages a single centered glassmorphic card on a soft white background (`#F8FAFC`).

### Step 1: Profile & Role Selection
*   **Objective**: Confirm the user's name and identify their primary relationship with the institution.
*   **Visual Layout**: Two-column layout on desktop: Left panel introduces the steps; right panel contains form controls.
*   **Required Fields**:
    *   **Full Name**: Pre-filled from registration claims, fully editable. (Placeholder: `"Enter your full name"`).
    *   **Account Role**: Segmented selector cards (Student, Faculty, Admin).
*   **Validation Rules**:
    *   Full Name must contain at least 2 characters, alphanumeric characters and spaces only.
    *   One role card must be explicitly highlighted.
*   **Role-Specific Pathing**:
    *   `Student` ➔ Routes to Class/Year select in Step 3.
    *   `Faculty` ➔ Routes to Course/Title details in Step 3.
    *   `Admin` ➔ Routes to Department Administration scopes in Step 3.

---

### Step 2: Institution Search & Verification
*   **Objective**: Connect the user to their verified university database.
*   **Institution Search Behavior**:
    *   As the user types into the search bar, the UI debounces keyboard inputs ($250\text{ms}$) and queries the backend index.
    *   A dropdown list fades in, showing matching institutions (e.g., Name, Location, Domain).
    *   If no matching school is found, a fallback option `"Add new institution request"` appears.
*   **Required Fields**:
    *   **Institution Name**: Selected from the filtered search results.
    *   **Academic Email**: Confirmed against the current logged-in user email domain (e.g., matching `.edu`).
*   **Validation Rules**:
    *   Institution selection is mandatory.
    *   Domain mismatch triggers an alert warning: `"Your registered email domain does not match this institution's standard domain. Continue?"`

---

### Step 3: Academic Scope (Role-Specific)
*   **Objective**: Gather departments, classes, or roles.
*   **Department Selection Behavior**:
    *   Displays an auto-suggest tagging input showing departments linked to the selected institution (e.g., Computer Science, Biology, Mathematics).
    *   Selected departments render as dismissible tags (capsules) with a soft background.
*   **Fields by Role**:
    *   **Student (Flow A)**:
        *   *Department* (Required): Dropdown tagging search.
        *   *Graduation Year* (Required): Dropdown list selector.
        *   *Major/Minor* (Optional): Text tag fields.
    *   **Faculty (Flow B)**:
        *   *Department* (Required): Dropdown tagging search.
        *   *Academic Title* (Required): Text input (e.g., "Associate Professor").
        *   *Research Areas* (Optional): Text tag fields.
    *   **Admin (Flow C)**:
        *   *Administrative Department* (Required): Dropdown tagging search.
        *   *Office Room Number* (Optional): Text field.
        *   *Responsibility Scope* (Required): Multiple-choice checkboxes (Registrar, IT Support, Faculty Dean).

---

### Step 4: AI Personalization Step
*   **Objective**: Configure the personalized Google ADK agent responses, tone, and priority notification metrics.
*   **Form Fields**:
    *   **AI Persona Tone** (Required): 3-option selector cards:
        *   *Direct & Concise*: Short bullets, optimized for fast reading.
        *   *Detailed & Academic*: Includes comprehensive study notes, context references, and explanations.
        *   *Conversational & Mentoring*: Highly encouraging, acts as an academic coach.
    *   **Primary Academic Goal** (Required): Multi-select options (Organizing Schedules, Synthesizing Text, Exam Preparations, Research).
    *   **Sync Calendar Integration** (Optional): Toggle switch to auto-import events.
*   **Validation Rules**:
    *   Must select at least one primary academic goal.

---

### Step 5: Completion Screen
*   **Objective**: Final confirmation and initialization of database profiles and vector tables.
*   **Visual Layout**:
    *   Displays a success checkmark animation.
    *   A list details the synchronized services:
        *   ✔️ *Database profile created*
        *   ✔️ *Personalized AI workspace initialized*
        *   ✔️ *Institution portal linked*
    *   Primary CTA: `"Enter Workspace"`.
*   **Action**: Clicking the CTA redirects the user to `/home` (Workspace Dashboard).

---

## 3. Progress Indicator Behavior

To prevent dropout, a persistent progress indicator anchors the top of the onboarding card:
*   **Type**: Multi-segment horizontal progress bar.
*   **Visual Elements**:
    *   $4$ distinct numbered nodes connected by a thin line.
    *   *Active Step*: Highlighted in Primary Accent Purple (`#6D5EF9`) with a pulsing halo effect.
    *   *Completed Step*: Rendered in Emerald green with a Checkmark icon.
    *   *Future Step*: Soft grey (`#E2E8F0`).
*   **State Management**: Updates instantly during step transitions with a Framer Motion layout shift.

---

## 4. Navigation Rules

*   **Linear Flow**: Users must complete all required fields on the current screen before the `"Continue"` button becomes active.
*   **Back Navigation**:
    *   A back button (`← Back`) is located at the top-left of the card.
    *   Navigating back preserves previously filled state in memory (React context/state).
*   **Page Reloads**: Onboarding state is saved in `sessionStorage` at each step. If the page is reloaded, the user resumes at their last uncompleted step.
*   **Gatekeeping Middleware**: An active router guard checks user profile status. Authenticated users who have not completed onboarding are auto-redirected back to `/onboarding` if they attempt to access `/home`.

---

## 5. UI & Styling Specs (DESIGN_RULES.md)

*   **Colors**:
    *   Base canvas background: Soft White (`#F8FAFC`).
    *   Onboarding Card: Solid White (`#FFFFFF`) with a thin border (`1px solid border-zinc-200/60`), and a soft blur backing (`backdrop-blur-md`).
    *   Buttons: Primary Purple (`#6D5EF9`) and Secondary Blue (`#4F8CFF`).
*   **Spacing**: Grid variables must strictly use standard 8px multiples. Card padding is fixed at `24px` (`p-6`) on mobile and `32px` (`p-8`) on desktop.
*   **Corners**: Outer card boundary uses `20px` border-radius (`rounded-2xl`). Select cards use `12px` border-radius (`rounded-xl`).
*   **Typography**: Headers use **Outfit**, form labels and body copy use **Inter**.

---

## 6. Animations (Framer Motion Guidelines)

*   **Card Exit/Enter**:
    *   During step transitions, card contents fade out (`opacity: 0, x: -15`) and slide in (`opacity: 1, x: 0`) from the opposite direction using a spring curve (`stiffness: 120, damping: 18`).
*   **Segment Selector Hover**:
    *   Role cards and Tone selection cards scale up (`1.015`) on mouse hover and compress slightly (`0.985`) on click.
*   **Progress Indicators**:
    *   The connecting line fills dynamically with an active width expansion transition (`duration: 0.3s, ease: "easeInOut"`).

---

## 7. Error Handling

*   **API Network Errors**: If the search index or database synchronization fails, the form overlay displays a toast notification:
    *   *Title*: `"Synchronization Delayed"`
    *   *Description*: `"We are having trouble connecting. Your details are cached and we will retry shortly."`
*   **Form Errors**: Fields violating validation rules display inline help text in Rose red (`#E11D48`) directly beneath the offending input box.

---

## 8. Accessibility Requirements

*   **Keyboard Access**: All form selectors, tag buttons, and checkbox grids support focus outlines (`focus-visible:ring-2 focus-visible:ring-primary`) and are reachable via `Tab` navigations.
*   **Keyboard Commands**:
    *   `Space` or `Enter` triggers button clicks and card selection toggles.
    *   `Arrow` keys navigate between segmented radio buttons.
*   **Screen Readers**:
    *   Input inputs carry descriptive `aria-describedby` links pointing to help descriptions.
    *   The progress bar uses standard attributes: `role="progressbar" aria-valuemin="1" aria-valuemax="4" aria-valuenow="[Current Step]"`.

---

## 9. Mobile Responsiveness

*   **Viewport Handling**: Layout columns shift to a single-column block layout on mobile screens (`max-width: 768px`).
*   **Heights & Spacing**: Spacing variables compress dynamically to fit screen heights, ensuring buttons remain visible above the mobile keyboard fold without excessive scrolling.
*   **Touch Targets**: Interactive options (e.g. tag filters, buttons, check grids) carry a minimum touch target diameter of `44px` to facilitate easy selection.
