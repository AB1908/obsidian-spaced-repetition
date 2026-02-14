# ADR-020: Direct Markdown Engagement Strategy

## Status
Proposed

## Context
The user wants to move beyond "sidecar" annotations for web articles converted to Markdown. The core goal is **direct engagement**: reading a note, identifying key paragraphs, and converting them into memory anchors (flashcards) without leaving the context of the source.

### Key Challenges & Nuances:
1.  **Stable Linking vs. Content Drift:** Content hashes (e.g. `^hash(text)`) are ideal for integrity but fragile for linking—a single typo fix orphans the flashcard. 
2.  **Mobile Interface Friction:** Selecting blocks in a raw Markdown file on mobile is difficult. The UI needs to present a "Candidate List" (paragraphs/headers) in a high-density, scrollable format.
3.  **Source Structure:** Web clippers often produce "flat" Markdown with poor header hierarchy, making the "Book Tree" UI unusable without further processing.

## Decision
We will implement a `MarkdownSource` strategy that prioritizes **Direct Engagement** and **Content Integrity**:

1.  **In-Situ ID Injection:** Use Obsidian's native block IDs (`^id`) as the primary link. If a paragraph is engaged with but has no ID, the system will inject a random stable `nanoid(8)`.
2.  **Fingerprint Verification:** Store a `fingerprint` (hash of the text) in the flashcard metadata. This allows the system to detect "Drift" (when the source text changes) without breaking the link.
3.  **Virtual Chapterization:**
    *   **Phase 1:** Use existing headers as chapters.
    *   **Phase 2 (Roadmap):** Explore "LLM-injected structure" to generate headers for messy clippers, enabling the Tree-UI even for poor-quality Markdown.
4.  **UI Representation:** Present paragraphs in the selection menu as **abbreviated text** to maximize density on mobile screens.

## Consequences

**Positive:**
- **High Engagement:** The "Counter" (Processed vs. Unprocessed paragraphs) provides a clear metric for "Memory Coverage."
- **Contextual Stability:** Flashcards link directly back to the original article for "contextual jumping."

**Negative:**
- **Source Mutation:** The original Markdown note is modified with block IDs.

## Roadmap & Idea Tracking

We will maintain a "Frequency of Need" log in `docs/feedback_and_ideas.md` for the following emergent ideas:

- **LLM-Structure Injection:** To handle clippers with no headers.

- **Header Tree-UI for Articles:** To mimic the hierarchical "Book" experience for long-form web content.

- **Abbreviated Menu selection:** To solve the "mobile selection" problem.
