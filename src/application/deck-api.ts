import { addBlockIdsToParagraphs, ensureDirectMarkdownSourceInOwnFolder } from "./deck-creation-helpers";
import { getPluginContext } from "./plugin-context";

export async function createFlashcardNoteForAnnotationsNote(bookId: string, opts?: { confirmedSourceMutation?: boolean }) {
    const plugin = getPluginContext();
    const book = plugin.annotationsNoteIndex.getBook(bookId);
    const sourceRequiresMutationConfirmation = book.requiresSourceMutationConfirmation();

    if (sourceRequiresMutationConfirmation) {
        if (!opts?.confirmedSourceMutation) {
            throw new Error("createFlashcardNoteForAnnotationsNote: source mutation confirmation required for clipping source");
        }

        const oldPath = book.path;
        await addBlockIdsToParagraphs(oldPath);
        const newPath = await ensureDirectMarkdownSourceInOwnFolder(oldPath);

        if (newPath !== oldPath) {
            const tags = plugin.fileTagsMap.get(oldPath) || book.tags || [];
            plugin.fileTagsMap.delete(oldPath);
            plugin.fileTagsMap.set(newPath, tags);
            book.updatePath(newPath);
        }
    }

    await book.createFlashcardNote();
    // todo: there is an edge case here where multiple clicks to add to multiple
    // index writes
    plugin.flashcardIndex.addFlashcardNoteToIndex(book.flashcardNote);
}
