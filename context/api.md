# src/api.ts - Context Map
## 1. High-Level Purpose
* **Role:** Flashcard scheduling and review logic for Anki.
* **Domain:** Anki plugin (Flashcards).
* **Key Responsibility:** Schedules flashcards, provides reviews, and manages annotation coverage.

## 2. Interface Contract

### Incoming Dependencies (Imports)
* `plugin`: Provides access to source note index and other necessary resources.
* `CardType`, `ReviewResponse`, etc.: Imported types used for specific logic functions.

### Public Interface (Exports)
* `getAnnotationById`:
    * Input: bookId, blockId
    * Output: Annotation object with transformed data
    * Behavior: Retrieves a specific annotation by ID from the source note index.
* `getNextCard`, `getCurrentCard`, etc.: Functions to retrieve next or current flashcard in review process.
* `createFlashcardForAnnotation`: Creates a new flashcard for an existing annotation.
* `updateFlashcardSchedulingMetadata`: Updates scheduling metadata for a specific flashcard.

## 3. Core Logic & Data Flow

* **State Management:** Flashcards are stored and updated in the flashcard note object, managed by the source note index.
* **Key Algorithms:**
    1. Processes annotation coverage to determine review state.
    2. Retrieves flashcards for a specific book or section.
    3. Updates scheduling metadata upon flashcard review.
* **Edge Cases:**
    - Returns null if no next heading is found in the source note index.
    - Handles errors when retrieving flashcards, updating scheduling metadata.

## 4. Architectural Notes

* **Coupling:** This file is tightly coupled to other files within the Anki plugin (e.g., `sourceNoteIndex`, `flashcardNote`).
* **Tech Debt/Todos:**
    - There are TODO comments scattered throughout the code, indicating areas that need improvement or clarification.
    - Non-standard logic patterns observed in certain functions may require refactoring.
* **Modification Risk:** Medium to High - Changes made to this file can have significant effects on other parts of the Anki plugin, including flashcard scheduling and review processes.