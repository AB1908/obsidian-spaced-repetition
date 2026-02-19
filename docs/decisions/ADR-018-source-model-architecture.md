# ADR-018: A Generic Source Model with a Strategy Pattern

## Status
Superseded by [ADR-022: FlashcardSource Composition](ADR-022-flashcardsource-composition.md)

## Context
The existing `SourceNote` model has become a bottleneck. It is overloaded with responsibilities, representing both the origin of information (like a `.mrexpt` file) and the processed, studyable annotation note. This makes it difficult to reason about and, more importantly, extremely difficult to extend to new source types like plain Markdown files or Kindle exports without significant "model pollution."

## Decision
We will refactor our core data model to a more scalable, explicit architecture based on the Strategy design pattern. This involves three key components:

1.  **`AnnotationsNote` (Formerly `SourceNote`):** This class will be refactored to have a single responsibility: representing the processed, studyable `(Annotations).md` file. It will contain all logic for parsing its own content, managing its sections, and interacting with its `FlashcardNote`.

2.  **`Source`:** A new, generic shell class that represents the *origin* of the information (e.g., `MyNote.md`, `Book.mrexpt`). It is a lightweight, stateless object concerned only with:
    *   **Identity:** Its path and type (`markdown`, `moonreader`).
    *   **Association:** Knowing how to find its corresponding `AnnotationsNote`.
    *   **Delegation:** Exposing actions (`sync`, `extract`) which it delegates to a strategy.

3.  **`ISourceStrategy`:** An interface that defines the contract for all source-specific logic. Concrete implementations (`MarkdownStrategy`, `MoonReaderStrategy`) will contain the actual business logic for either syncing from a log or extracting from a document.

The `Source` class will use composition (holding an `ISourceStrategy` instance) rather than inheritance to ensure maximum flexibility for future source types.

## Consequences

**Positive:**
- **Extensibility:** Adding a new source type (e.g., PDF, Kindle) becomes as simple as creating a new strategy class, with minimal changes to the core models.
- **Separation of Concerns:** `AnnotationsNote` is simplified and focuses only on the studyable note. Source-specific parsing and sync logic is perfectly isolated within each strategy.
- **Testability:** Each strategy can be unit tested in complete isolation.
- **Clarity:** The new model names (`Source`, `AnnotationsNote`) are explicit and accurately reflect the role of each component in the system.

**Negative:**
- **Initial Refactor Cost:** This requires a significant, one-time effort to refactor the existing MoonReader workflow and rename `SourceNote` throughout the codebase.

## Alternatives Considered
- **Inheritance Model:** A `BaseSource` class with `MarkdownSource` and `MoonReaderSource` subclasses was considered. It was rejected in favor of the more flexible Strategy pattern, which avoids rigid class hierarchies.
- **Modifying `SourceNote`:** Adding more properties and `if/else` logic to the existing `SourceNote` was rejected as it would worsen the existing model pollution and technical debt.
