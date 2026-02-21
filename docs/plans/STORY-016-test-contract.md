# Test Contract: STORY-016 Named Categories

**Story:** `docs/stories/STORY-016-customizable-annotation-categories.md`  
**Implementation Plan:** `docs/plans/STORY-016-named-categories-settings-config.md`  
**Mode:** Contract-first with green commits (no red commit required due pre-commit gates)

## Required Test Files
TEST_FILE: tests/metadataSerializer.test.ts
TEST_FILE: tests/models/annotations.test.ts
TEST_FILE: tests/routes/import/PersonalNotePage.test.tsx
TEST_FILE: tests/routes/books/book/annotation/AnnotationListPage.test.tsx
TEST_FILE: tests/api.test.ts

## Required Test Names
TEST_NAME: serializes string category names in metadata
TEST_NAME: ignores legacy numeric category metadata values
TEST_NAME: category buttons render from configured settings categories
TEST_NAME: selecting category saves category name string
TEST_NAME: MoonReader card creation category filter uses string categories

## Required Verification Commands
TEST_CMD: npm test -- --runInBand tests/metadataSerializer.test.ts
TEST_CMD: npm test -- --runInBand tests/routes/import/PersonalNotePage.test.tsx
TEST_CMD: npm test -- --runInBand tests/routes/books/book/annotation/AnnotationListPage.test.tsx
TEST_CMD: npm test -- --runInBand
TEST_CMD: OBSIDIAN_PLUGIN_DIR=. npm run build

## Notes
- This contract is enforced by `scripts/verify-test-contract.sh`.
- Delegated runs should pass this contract before handing control back for review.

