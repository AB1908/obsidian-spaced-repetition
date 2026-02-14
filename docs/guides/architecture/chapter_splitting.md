# Architecture: Splitting Chapters into Individual Files

This document outlines the architectural implications and complexity of changing the application's data model from a "one file per book" to a "one folder per book" structure, where each chapter is a separate Markdown file.

This change is a long-term goal aimed at improving scalability for large books and enabling more focused future integrations with LLMs.

## Current vs. Proposed Architecture

*   **Current:** `1 SourceNote` = `1 Markdown File` = `1 Book`. The system is file-centric.
*   **Proposed:** `1 Book` = `A Folder` containing multiple Markdown files, where each file is a chapter.

## Areas of Impact and Complexity

This is a high-complexity refactoring that touches the core of the application.

### 1. Data Modeling (`sourceNote.ts`)
*   **Complexity: High**
*   The `SourceNote` class, which currently represents an entire book, would need to be re-conceptualized to represent a single chapter.
*   A new top-level `Book` class would be required to act as a container for a collection of `SourceNote` (chapter) objects.
*   The `SourceNoteIndex` would need to be rewritten to scan the vault for book folders and build the hierarchical `Book -> [Chapter]` model, instead of a flat list of files.

### 2. File Storage and Organization
*   **Complexity: Medium**
*   A strict file/folder convention would be needed (e.g., `/Book Title/Chapter 1.md`).
*   All file I/O logic (creation, finding, deletion) would need to be updated to be folder-aware.

### 3. Annotation Import Process (`api.ts`)
*   **Complexity: Medium**
*   The `importMoonReaderExport` function would need to be rewritten to split annotations by chapter and write them to separate files within a newly created book directory.

### 4. Flashcard Association (`flashcardNote`)
*   **Complexity: Medium**
*   A decision must be made on how to store flashcard notes.
    *   **Option A (Per-Book):** All flashcards for a book live in one file (e.g., `/flashcards/Book Title.md`). This is simpler. All chapter objects would reference this single, shared flashcard file.
    *   **Option B (Per-Chapter):** Each chapter gets its own flashcard file. This could create a large number of small files.
*   Logic for creating and linking flashcard notes would need to be updated accordingly.

### 5. User Interface and Navigation (`/routes`)
*   **Complexity: High**
*   The UI would need to change from displaying a flat list of notes to a hierarchical view: a list of Books, which can be expanded to show the Chapters within. This impacts routing and several view components.

## Suggested Migration Path

1.  **Refactor Data Model:** Introduce the `Book` container class first, maintaining backward compatibility by having each `Book` initially wrap a single `SourceNote`.
2.  **Update Importer:** Modify the import process to support the new multi-file structure as an optional flow.
3.  **Adapt UI:** Build the new hierarchical UI, potentially behind a feature flag.
4.  **Provide Migration Tool:** Create a utility for users to convert existing single-file notes into the new folder-per-chapter structure.
