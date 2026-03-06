# Plan: STORY-032 — Vault Scenario Coverage

## What we're doing

Adding deliberate scenario coverage to `tests/vault/`: a catalog file and synthetic vault
files for scenarios that were missing from the original opportunistic captures.

## Sequencing

STORY-032 must commit before DEBT-041. DEBT-041's stamp hashes all vault files — the stamp
must cover the final vault state, not an intermediate one.

## New vault files

| Dir/File | Scenario | Key behavior |
|---|---|---|
| `Sparse Notes/Annotations.md` | Annotations, no Flashcards.md | Flashcard file creation flow; personal note field on annotation 20001 |
| `Forgotten Tome/Annotations.md` | All annotations soft-deleted (`deleted: true`) | 0% coverage, deletion edge cases |
| `Finished Book/Annotations.md` | Annotations with paired flashcards | 100% coverage, completion state |
| `Finished Book/Flashcards.md` | Flashcards for all Finished Book annotations | Pairing when coverage is complete |
| `Chapter Gaps/Annotations.md` | Heading 1 empty, Heading 2 has annotations | Section tree edge case — empty heading node |

`tests/vault/scenarios.md` catalogs all files (existing + new).

Multiple-books scenario already covered by existing 4 sources — no new file needed.

## Vault file format

MoonReader format. Annotations.md:
- Frontmatter: `path`, `title`, `author`, `lastExportedTimestamp`, `lastExportedID`, `tags: [review/dummy]`
- Annotation callouts: `> [!quote] <ID>` / `> <text>` / `> ***` / `> <personal_note or empty>` / `> %%` / metadata / `> %%`
- Soft-delete marker: `deleted: true` inside `%% ... %%`
- Personal note marker: `personal_note: <text>` inside `%% ... %%`

Flashcards.md:
- Frontmatter: `annotations: "Dummy annotations N"`
- Cards: `<question>\n?\n<answer>\n<!--SR:<ID>!L,<date>,<interval>,<ease>-->`

## Manual step (blocking)

After vault files are created, load `tests/vault/` into Obsidian and capture:
- `getFileContents_<slug>.json` for each new file
- `getMetadataForFile_<slug>.json` for each new Annotations.md
- `getTFileForPath_<slug>.json` for each new Annotations.md
- Re-capture `fileTags` and `filePathsWithTag` (tag set changed)

Then: `npm run vault:check` must pass before committing.

## Commit

After successful capture: vault files + fixtures + scenarios.md in one commit.
Run `npm run vault:stamp` as part of DEBT-041 commit (not this one).
