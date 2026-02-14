# Project Architecture Overview

This document provides a high-level overview of the Obsidian Spaced Repetition plugin's architecture.

## Core Technologies
- **Language:** TypeScript
- **UI Framework:** React
- **UI Routing:** `react-router-dom`
- **Testing:** Jest, with some React Testing Library

## Architectural Layers

The plugin is broadly structured into three main layers: the UI Layer, the API/Facade Layer, and the Data Model Layer.

### 1. UI Layer (`src/routes/`, `src/ui/`)

- Consists of React functional components written in TypeScript (`.tsx`).
- `react-router-dom` is used for navigation and data loading. Routes are defined in `src/routes/routes.tsx`.
- UI components use `loader` functions to fetch data before rendering. These loaders typically call functions from the API Layer.
- State is managed within components using standard React hooks (`useState`, `useEffect`, etc.).

### 2. API/Facade Layer (`src/api.ts`)

- Acts as a bridge between the UI Layer and the Data Model Layer.
- It exposes a set of functions that the UI's `loader`s and event handlers can call (e.g., `getAnnotationById`, `updateAnnotationMetadata`).
- This layer orchestrates calls to the underlying data models and services, hiding the complexity of the data layer from the UI. This is a good separation of concerns, though the file itself is becoming large (see `tech_debt.md`).

### 3. Data Model Layer (`src/data/`)

This layer contains the core business logic and data structures of the plugin.

- **Models (`src/data/models/`):**
    - `sourceNote.ts`: Defines the `SourceNote` class, a central model representing a note with annotations. It holds the note's content, parsed into sections (`bookSections`), and contains business logic for updating annotations, managing reviews, etc.
    - `flashcard.ts`: Defines the `Flashcard` and `FlashcardNote` classes.
    - **Indexes:** The `SourceNoteIndex` and `FlashcardIndex` classes act as in-memory databases, holding collections of the main data models.

- **Disk Abstraction (`src/data/disk.ts`):**
    - A crucial facade that abstracts all interactions with the Obsidian vault filesystem (`app.vault`, `app.fileManager`).
    - This pattern isolates the core logic from the specifics of the Obsidian API, which is beneficial for testing and maintainability.

- **Parsers (`src/data/parser.ts`, `src/data/import/`):**
    - Responsible for parsing markdown files, extracting metadata, and handling import formats like MoonReader.

## Data Flow Example (Updating an Annotation)

1.  A user edits a personal note in the `PersonalNotePage` component (UI Layer).
2.  On "Save", an event handler calls `updateAnnotationMetadata` from `src/api.ts` (API Layer).
3.  The `updateAnnotationMetadata` function retrieves the appropriate `SourceNote` instance from the `SourceNoteIndex`.
4.  It calls the `.updateAnnotation()` method on the `SourceNote` instance (Data Model Layer).
5.  The `updateAnnotation` method updates its in-memory representation of the annotation.
6.  It calls `renderAnnotation` (a utility) to create the new markdown text for the annotation.
7.  It then calls `updateCardOnDisk` from `src/data/disk.ts` (Disk Abstraction) to write the changes to the file.
