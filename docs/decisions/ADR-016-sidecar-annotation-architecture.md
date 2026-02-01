# ADR-016: Sidecar Annotation Architecture for Knowledge Extraction

## Status
Proposed

## Context
The project needs a robust way to transform long-form "Source" content (Markdown notes, MoonReader exports, etc.) into "Atomic Chunks" suitable for spaced repetition. 

### Constraints & Challenges:
1.  **Cognitive Atomicity:** Flashcards are most effective when they test a single, discrete concept. Long-form notes often contain too much context, leading to "Encoding Specificity" where a user remembers the position of text rather than the concept.
2.  **Source Integrity:** Users want to keep their primary notes clean and "fluid," but flashcards require a "stable" or "snapshotted" source to remain valid over time.
3.  **The "Stale Test" Problem:** If a source note is edited, existing flashcards may no longer accurately test the modified content.

## Decision
We will adopt a **Sidecar Annotation** architecture as the standard pattern for knowledge extraction. 

1.  **The Sidecar File:** For every source document being studied, a companion file named `[NoteName] (Annotations).md` will be created.
2.  **Storage:** By default, this file will reside in the same directory as the source file (to maintain visibility and proximity), though the system must remain flexible for centralized storage options later.
3.  **Extraction Process:** 
    *   Users select text (chunks) from the source.
    *   The selected text is mirrored into the Sidecar file.
    *   Flashcards are authored against and stored within the Sidecar file, not the source note.
4.  **Linking:** We will use Obsidian's Block ID format (`[[SourceNote#^blockid]]`) to maintain a link between the extracted chunk and the original context.
5.  **Versioning/Stability:** The Sidecar acts as a "Cognitive Snapshot." If the source note changes, the Sidecar remains unchanged until the user explicitly chooses to "re-sync" or update the chunk.

## Consequences

**Positive:**
- **Pristine Sources:** Primary notes remain free of flashcard metadata and clutter.
- **Stable Chunks:** Flashcards don't "break" or become confusing when a user refactors their main notes.
- **Explicit Review:** The act of extracting text into the sidecar serves as an additional layer of active processing (the first step of learning).
- **Uniformity:** MoonReader exports (which are already external) and Markdown notes will now follow the same architectural pattern.

**Negative:**
- **Data Duplication:** Content is mirrored in two places.
- **Sync Overhead:** Users must manually manage the relationship between source and sidecar if they want them to stay perfectly aligned.

**Neutral:**
- **Block ID Dependency:** Relies on Obsidian's internal block-linking mechanism, which is standard but can be fragile if users manually delete IDs from source files.

## Alternatives Considered
- **In-Note Annotations:** Rejected to avoid "Note Clutter" and to prevent flashcard breakage during fluid note editing.
- **Virtual Layer (Database):** Rejected to maintain the "Markdown-First" philosophy of Obsidian; data should be human-readable and accessible outside the plugin.

## Implementation Notes
- The `SourceNote` model will need to be updated to handle both "Direct" sources and "Sidecar" relationships.
- UI will need a "Coverage" view to show which parts of a Source have been mirrored to a Sidecar.
