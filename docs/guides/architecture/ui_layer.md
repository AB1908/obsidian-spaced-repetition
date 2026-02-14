# UI Component Architecture Guidelines

This document outlines the principles guiding the development of user interface components within this project, particularly focusing on the decision to prefer single-responsibility components.

## Principle: Prefer Single-Responsibility Components

**Motivation:**
In the past, some UI components attempted to handle multiple rendering concerns or conditional display logic via props (e.g., `NoteAndHighlight`). While seemingly convenient, this approach led to:
- Increased complexity and cognitive load for component users.
- Reduced flexibility and reusability.
- Potential for unintended side-effects or difficult-to-test scenarios.
- Obscured the primary purpose of the component.

**Guidance:**
Components should ideally have a single, well-defined responsibility. When a UI element has distinct visual representations or behaviors that are mutually exclusive, these should often be encapsulated in separate, focused components.

**Example: Displaying Annotation Content**
- **Deprecated Approach:** A single `NoteAndHighlight` component attempting to toggle between showing a highlight, a note, or both based on a `displayMode` prop.
- **New Approach:** Two distinct components:
    - `HighlightBlock({ text })`: Renders only the highlighted text with specific styling.
    - `NoteBlock({ text })`: Renders only the note text with specific styling.
- **Benefits of New Approach:**
    - **Clarity:** It's immediately clear what each component does.
    - **Composition:** Parent components (e.g., `AnnotationWithOutlet`, `EditCard`) explicitly compose these smaller blocks to achieve the desired display, making their rendering logic more transparent.
    - **Testability:** Each component is easier to test in isolation.
    - **Reusability:** While currently specific, these single-purpose blocks are inherently more reusable in other contexts than a highly conditional multi-purpose component.

## Impact on Development

This principle encourages:
- **Modular Design:** Breaking down complex UI into manageable, focused parts.
- **Predictable Behavior:** Components behave exactly as their name and props suggest, reducing surprises.
- **Easier Refactoring:** Changes to one aspect of a display (e.g., how a highlight looks) are contained within its dedicated component.