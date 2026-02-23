# STORY-016: Named Categories with Settings Config

## Status
Done

## Epic
[STORY-010](../archive/stories/STORY-010-markdown-engagement.md)

## Depends on
- [BUG-009](BUG-009-import-annotation-editor-state-leak.md) (state reset must work before changing category model)

## User Story
As a user, I want to define and add annotation categories with human-friendly names, so that my markdown files are readable and my categorization workflow matches how I think.

## Problem
Category buttons are hardcoded as 6 numeric indices (0-5) mapped to static icons in `ANNOTATION_CATEGORY_ICONS`. On disk, categories are stored as `category: 2` — meaningless to a human reading the markdown. Users cannot add new categories or change existing ones.

## Design

### Category Model
```typescript
interface CategoryConfig {
  name: string;   // stored on disk AND shown in UI: "idea", "quote", "definition"
  icon: Icon;     // Obsidian icon: "lightbulb", "quote", "whole-word"
}
```

- `name` is the single source of truth — what's in UI is what's on disk
- Names must be short, one-word, lowercase (enforced by input validation)
- `icon` is decorative — changing it doesn't affect stored category

### Default Categories
| name | icon |
|------|------|
| `idea` | `lightbulb` |
| `quote` | `quote` |
| `definition` | `whole-word` |
| `note` | `sticky-note` |
| `important` | `star` |
| `misc` | `asterisk` |

### Storage Format (Breaking Change)
**Before:** `category: 2` (numeric index)
**After:** `category: definition` (the name itself)

Old numeric values won't match any category name → annotation falls back to uncategorized. No migration script needed.

### "+" Button and Modal
- "+" button appears after the last category button in PersonalNotePage
- Opens an Obsidian-native modal with text input for category name
- Input validation: alphanumeric, no spaces, max ~20 chars, unique
- New category persisted to plugin settings immediately
- Icon defaults to `tag` (future story for icon picker)

## Acceptance Criteria
- [x] `CategoryConfig` interface exists with `name` (string) and `icon` (Icon)
- [x] Plugin settings store `categories: CategoryConfig[]` with 6 defaults
- [x] `serializeMetadata` writes `category: <name>` (string)
- [x] `deserializeMetadata` reads string category, returns `undefined` for unknown/numeric values
- [x] PersonalNotePage renders category buttons from settings (not hardcoded array)
- [x] Inline "add category" form persists new category to settings (modal deferred → STORY-025)
- [x] `category-filter.tsx` renders from settings-based categories (string names, not numeric indices)
- [x] `annotation-filters.ts` filter comparison uses string equality on category name
- [x] `ANNOTATION_CATEGORY_ICONS` constant removed (replaced by settings)
- [x] Existing tests updated for string categories

## Likely Touchpoints
- `src/config/annotation-categories.ts` — remove or replace with `CategoryConfig` type + defaults
- `src/settings.ts` — add `categories: CategoryConfig[]` to settings
- `src/data/utils/metadataSerializer.ts` — `category` field becomes `string`
- `src/data/models/annotations.ts` — `category` field type `number` → `string` on `annotation` interface
- `src/ui/routes/import/personal-note.tsx` — render from settings, add "+" button
- `src/ui/routes/import/useAnnotationEditor.ts` — `selectedCategory` type `number | null` → `string | null`
- `src/ui/components/category-filter.tsx` — render from settings-based categories
- `src/utils/annotation-filters.ts` — filter comparison to string equality
- New: `src/ui/components/AddCategoryModal.ts` — Obsidian Modal for new category creation

## Notes
- No separate ID/slug — disk reflects UI with no indirection
- Renaming categories requires bulk markdown update (future story STORY-021)
- DEBT-031 Phase B (`StudyNote` type) will inherit `category?: string` from this work
- Icon picker is V1-deferred (defaults to `tag` for new categories)

## Related
- [BUG-009](BUG-009-import-annotation-editor-state-leak.md) — prerequisite
- [BUG-012](BUG-012-card-creation-category-filter-regression.md) — filter system overlap
- [STORY-020](STORY-020-auto-save-annotation-editor.md) — depends on this
- [STORY-021](STORY-021-category-rename-bulk-update.md) — future: rename with markdown update
