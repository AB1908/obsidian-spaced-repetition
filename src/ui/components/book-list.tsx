import React from "react";
import { createFlashcardNoteForAnnotationsNote, getNotesWithoutReview, NotesWithoutBooks } from "src/api";
import { useNavigate } from "react-router-dom";
import { useLoaderData } from "react-router";

export function bookCreatorLoader() {
    return getNotesWithoutReview();
}

export function BookCreator() {
    const bookList = useLoaderData() as NotesWithoutBooks[];
    const navigate = useNavigate();

    function confirmMutation() {
        try {
            return window.confirm("This will alter your file and add block IDs to all paragraphs. Continue?");
        } catch (_) {
            return true;
        }
    }

    async function clickHandler(book: NotesWithoutBooks) {
        if (book.requiresSourceMutationConfirmation) {
            const shouldProceed = confirmMutation();
            if (!shouldProceed) return;
            await createFlashcardNoteForAnnotationsNote(book.id, { confirmedSourceMutation: true });
        } else {
            await createFlashcardNoteForAnnotationsNote(book.id);
        }

        navigate(`/books/${book.id}`, { replace: true });
    }

    if (bookList.length) {
        return (
            <>
                <p>Choose a source to create a new flashcard deck.</p>
                <ul className="sr-deck-tree">
                    {bookList.map((book) => (
                        <li
                            key={book.id}
                            className="tree-item-self is-clickable"
                            onClick={async () => await clickHandler(book)}
                        >
                            <div className="tree-item-inner">
                                {book.name}
                            </div>
                            <div className="tree-item-outer">
                                <span className="tree-item-flair sr-deck-counts">
                                    {book.tags.length ? book.tags.join(", ") : "no-tags"}
                                </span>
                            </div>
                        </li>
                    ))}
                </ul>
            </>
        );
    } else {
        return <p>To see a note here, add the tag <code>#review/note</code> to your note.</p>;
    }
}
