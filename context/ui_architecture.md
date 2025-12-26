# UI Architecture & Navigation Analysis

## Current Navigation Implementation
The application currently handles navigation between lists (e.g., `AnnotationList`) and details (`AnnotationWithOutlet`) using standard React Router patterns, but with a custom mechanism for preserving scroll position.

### "Back Button" & Scroll Restoration
The app faces a challenge common in "Master-Detail" interfaces where the detail view replaces the list view in the DOM (mobile-style navigation):
1. User scrolls down a list (Scroll Y=500).
2. User clicks an item. The list unmounts, and the Detail view mounts.
3. User navigates "Back". The List remounts.
4. **Goal:** The user should be returned to Scroll Y=500.

**Current Solution (Brittleness):**
- **Mechanism:** `sessionStorage` is used as a "side channel" to store the ID of the last active item (`scrollToAnnotation`).
- **Implementation:** 
    - `AnnotationWithOutlet` writes to `sessionStorage` on mount.
    - `AnnotationList` reads from `sessionStorage` on mount and calls `scrollIntoView()` on the matching element.
- **Problem:** This manual restoration often races with the browser's native scroll restoration logic (especially when using `history.replace` vs `push`).

## Architectural Coupling & Risks

### 1. Side-Channel State (sessionStorage)
- **Risk:** Bypasses React lifecycle and Router state.
- **Consequences:** Can lead to race conditions where the browser restores an old position *after* the component tries to scroll to the new one. Global keys in `sessionStorage` can conflict across tabs or different books.
- **Recommendation:** Move this state into a **React Context** or a lightweight global store (e.g., Zustand) that wraps the `Outlet`. This binds the state to the navigation session's lifecycle.

### 2. DOM Coupling in Components
- **Code:** `AnnotationList` uses `document.getElementById` and `scrollIntoView`.
- **Risk:** Tightly couples the React component to the specific DOM structure and `id` attribute usage.
- **Consequences:** Refactoring the list item (e.g., to a virtualized list) will break scrolling logic.
- **Recommendation:** Encapsulate scroll logic in a custom hook (e.g., `useScrollToItem(id)`).

### 3. Hardcoded Route Paths
- **Code:** `AnnotationWithOutlet` contains a `pathGenerator` with raw strings (`"/books/:bookId/..."`).
- **Risk:** Duplicates the source of truth defined in `routes.tsx`.
- **Consequences:** Changing a URL structure requires "shotgun surgery" across multiple files.
- **Recommendation:** Centralize path generation in a helper file (e.g., `src/routes/paths.ts`) that exports functions like `getAnnotationPath(...)`.

### 4. Data Dependency on Parent Routes
- **Code:** `AnnotationWithOutlet` uses `useRouteLoaderData` to fetch sibling data for "Next/Previous" buttons.
- **Risk:** Assumes a specific route nesting hierarchy.
- **Consequences:** Refactoring the route nesting will break the child component's data access.
- **Recommendation:** Use explicit prop passing or a dedicated "Navigation Context" provided by the parent layout.

## Testing Strategy
- Avoid testing the Router's internal navigation logic (integration tests).
- Focus unit tests on the *behavior* of the components:
    - **Write:** Does Component A save the ID?
    - **Read:** Does Component B read the ID and attempt to scroll?
- This isolates tests from the complexity of the browser's History API and Router implementation.
