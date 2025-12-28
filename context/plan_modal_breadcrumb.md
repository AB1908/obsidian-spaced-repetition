# Plan for Modal Breadcrumb Title Implementation

This document outlines the plan and current state of implementing a dynamic breadcrumb title for the flashcard modal, following architectural discussions and user requirements.

## Goal
To enhance the flashcard modal title to display a "bookname / chapter name" breadcrumb, derived from an annotation ID or URL parameters. The title should also dynamically change to "Editing Flashcard" or "Creating New Flashcard" when appropriate. Future goals include an expandable popup for the title.

## Architectural Decision: React Context for Title Management

After discussing alternatives, `React Context` was chosen for managing the modal title due to its balance of flexibility, maintainability, and alignment with React's idioms for this specific cross-cutting UI concern.

### Rationale:
*   **Avoids Prop Drilling:** Centralizes the `modalTitle` state and `setModalTitle` function, avoiding passing props through many intermediate components.
*   **Clear Separation of Concerns:** Title logic is distinct from component layout.
*   **Flexibility:** Any component can update the modal title using `setModalTitle`.
*   **Built-in to React:** No additional library dependency.
*   **Scalability for Use Case:** Appropriate for a single, cross-cutting piece of UI state without the overhead of a full state management library.

## Implementation Steps (Completed & Planned)

### Phase 1: Git Repository Setup & Initial Architectural Decisions (Completed)
1.  **Checked Git Status & Branches:** Confirmed current branch (`note-vs-annotation-toggle`) and existence of `main`.
2.  **Merged `note-vs-annotation-toggle` to `main`:** `git checkout main`, `git merge note-vs-annotation-toggle`, `git push origin main`.
3.  **Created New Feature Branch:** `git checkout -b feature/modal-breadcrumb-title`.
4.  **Researched Data Flow:** Identified `FlashcardModal` as the entry point, `src/routes/routes.tsx` for route definitions, and `src/data/models/sourceNote.ts` for extracting book/chapter names from IDs.

### Phase 2: React Context Implementation (Completed)
1.  **Created `src/ui/modals/ModalTitleContext.tsx`:**
    *   Defines `ModalTitleContext` and `ModalTitleProvider`.
    *   `ModalTitleProvider` hosts `modalTitle` state and `setModalTitle`.
    *   Contains the core logic to listen to URL changes (`bookId`, `sectionId`) via `useParams` and use `plugin.sourceNoteIndex` to generate the default "Book Name / Chapter Name" breadcrumb.
    *   Exports `useModalTitle` hook for consuming components.
2.  **Modified `src/ui/modals/flashcard-modal.tsx`:**
    *   Imported `ModalTitleProvider`.
    *   Wrapped the `RouterProvider` with `ModalTitleProvider`, passing the `plugin` instance. This makes the `modalTitle` context available throughout the modal's routed components.
3.  **Modified `src/routes/root.tsx`:**
    *   Imported `useModalTitle`.
    *   Removed local `modalTitle` state, `useEffect` hooks for title calculation, and the `plugin` prop.
    *   Uses `useModalTitle().modalTitle` to display the title in the `modal-title` div.

### Phase 3: Implementing Title Overrides for Flashcard Editing (In Progress)
1.  **Identified Relevant Components:** `UpsertCard` and `EditCard` are used for creating/editing flashcards based on `src/routes/routes.tsx`.
2.  **Modified `src/routes/upsert-card.tsx` (Pending User Confirmation):**
    *   Imported `useModalTitle`.
    *   Used `setModalTitle` inside a `useEffect` hook to set the title to "Creating New Flashcard" or "Editing: [Flashcard Question]" based on `flashcard` data from `useLoaderData()`.
    *   *(Next: Apply similar logic to `src/routes/edit-card.tsx` if needed.)*

### Phase 4: Verification & Final Checks (Pending)
1.  **Build and Run Plugin:** Use `npm run dev` (already running in user's terminal) to compile and update the plugin.
2.  **Obsidian Verification:**
    *   Launch Obsidian and enable the plugin.
    *   Open the Flashcard Modal.
    *   Navigate through various routes (book list, chapter list, annotation list, flashcard edit/create) and observe the modal title.
        *   Expect "Book Name / Chapter Name" for relevant routes.
        *   Expect "Creating New Flashcard" or "Editing: [Flashcard Question]" for the flashcard creation/edit routes.
3.  **Code Quality Checks:** Run linting and type-checking (e.g., `npm run lint`, `npm run typecheck` or `tsc --noEmit`). (Will execute later).

## Resuming this Session

To resume this session after quitting, you would typically:

1.  **Restart the Gemini CLI:** Start the CLI as you normally would.
2.  **Navigate to the project directory:** Ensure your terminal is in `D:\GitHub\obsidian-spaced-repetition`.
3.  **Provide Context:** You can mention that you were working on the modal breadcrumb feature and ask me to reference the `context/plan_modal_breadcrumb.md` file. I retain information about our previous conversations, but explicitly pointing to the plan file ensures I can quickly re-align.
4.  **Confirm `npm run dev` status:** Inform me if `npm run dev` is already running or if I need to start it.

Example prompt to resume:
"Hello. I'm resuming our session. We were working on the modal breadcrumb title. Please refer to `context/plan_modal_breadcrumb.md` for the plan. `npm run dev` is currently running."