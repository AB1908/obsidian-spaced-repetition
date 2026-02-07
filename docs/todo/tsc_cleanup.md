# TSC Cleanup Roadmap

Goal: Resolve all 80+ TypeScript errors detected by `npx tsc --noEmit` to enable it as a reliable linter/verification step.

## High Priority
- [ ] Fix "Object is possibly 'null'" in `src/api.ts` and `AnnotationsNote.ts` (especially `flashcardNote` and `plugin` access).
- [ ] Fix type mismatches between `annotation` and `MoonReaderAnnotation` in strategy logic.
- [ ] Resolve missing property errors (`deleted`, `title`) on union types (`annotation | paragraph`).

## Medium Priority
- [ ] Fix React Router loader type mismatches in `routes.tsx`.
- [ ] Resolve `EventTarget` property access errors in UI components (`e.target.question.value`).
- [ ] Export missing types/interfaces from `obsidian-facade.ts`.

## Low Priority
- [ ] Fix implicit 'any' types in utility functions.
- [ ] Clean up unused imports and legacy type definitions.
