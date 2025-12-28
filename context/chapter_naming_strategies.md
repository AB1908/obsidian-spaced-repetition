# Chapter Naming Strategies for MoonReader Imports

This document outlines various strategies for deriving human-readable chapter names during the MoonReader import process. It compares the current, implemented approach with alternative, potentially more robust methods.

## Current Implemented Strategy (Based on User's Workflow)

This strategy is implemented in `src/data/import/moonreader.ts`.

*   **Mechanism:**
    *   The MoonReader parser (`parseMoonReaderExport`) identifies a "chapter marker" by looking for a specific pattern in the exported annotations.
    *   A record is considered a chapter marker if its `noteText` (Field 12 in the 16-field record structure) is exactly `#`.
    *   When such a marker is found, its `highlightText` (Field 13 in the 16-field record structure) is interpreted as the chapter name.
    *   Any `<BR>` within this chapter name is replaced with `: `.
    *   This chapter name is then applied to all subsequent annotations until a new chapter marker is encountered.
    *   Chapter marker annotations themselves are filtered out from the final list.
    *   Records identified as "bookmarks" (Field 11 has text, but Fields 12 and 13 are empty) are also filtered out.
*   **Pros:**
    *   Leverages the user's existing workflow directly.
    *   No external files or interactive steps are required.
    *   Provides dynamic chapter assignment during parsing.
*   **Cons:**
    *   **Brittleness:** Highly dependent on a precise, non-standard pattern. Any deviation in the MoonReader export format or user's tagging convention could break it.
    *   **User Burden:** Requires the user to manually insert these specific chapter marker annotations in MoonReader.
    *   **Limited Flexibility:** Does not support hierarchical chapter structures (e.g., Part 1, Chapter 1).
    *   **Hidden Logic:** The chapter naming logic is embedded within the parser, not easily discoverable or configurable by the user.

## Alternative Strategies (Future Considerations)

These alternatives aim to improve robustness, flexibility, or user experience.

### 1. External Mapping File

*   **Mechanism:** The user provides a separate configuration file (e.g., `chapters.json` or `book-title.chapters.json`) that maps the numerical or textual chapter identifiers from the MoonReader export to human-readable names.
    ```json
    {
      "1": "Introduction to Memory",
      "2": "Chapter 1: You are your memory",
      "3": "Implicit vs. Explicit Memory"
    }
    ```
    The import process would then consult this file.
*   **Pros:**
    *   **Robustness:** Decouples chapter names from the raw annotation content, making parsing less brittle.
    *   **Flexibility:** Allows for complex, multi-level chapter names regardless of the export's format.
    *   **Centralized Management:** Chapter names can be updated in one place without re-exporting annotations.
    *   **Cleanliness:** Keeps annotation notes clean.
*   **Cons:**
    *   **User Burden:** Requires the user to create and maintain an additional file.
    *   **Integration:** The import process needs to locate and read this file.
    *   **Discovery:** Users need to be aware of this feature.

### 2. Interactive Import Prompt

*   **Mechanism:** During the import process, if the parser encounters a new, unknown chapter identifier (e.g., "Chapter 3" or just "3" from the `chapter` field of the MoonReader record), it pauses and prompts the user to enter a human-readable name for that chapter. The mapping could then be remembered for subsequent imports of the same book.
*   **Pros:**
    *   **User-Friendly:** No pre-configuration files needed.
    *   **Dynamic:** Adapts to whatever chapter identifiers are present in the export.
    *   **"Set it and forget it":** Once names are provided for a book, they are remembered.
*   **Cons:**
    *   **Interactivity:** Not suitable for automated or headless imports.
    *   **UI Complexity:** Requires a UI component for the prompt and storage for the mapping.
    *   **Consistency:** Relies on the user to provide consistent naming.

### 3. Frontmatter Directive in Target File

*   **Mechanism:** If the target Markdown file already exists, it could contain a YAML frontmatter section with chapter mappings.
    ```yaml
    ---
    moonreader_chapter_map:
      "1": "Introduction to Memory"
      "2": "Chapter 1: You are your memory"
    ---
    ```
*   **Pros:**
    *   **Self-Contained:** Mapping lives with the destination file.
    *   **Standard:** Uses Obsidian's frontmatter.
*   **Cons:**
    *   **Pre-configuration:** The target file needs to exist and contain this mapping before import.
    *   **Limited to existing files:** Doesn't help with new imports.

## Conclusion

While the currently implemented strategy addresses the immediate need based on your existing workflow, its brittle nature highlights the value of exploring more robust solutions in the future. Strategies involving external mapping files or interactive prompts offer greater flexibility and maintainability for chapter naming.