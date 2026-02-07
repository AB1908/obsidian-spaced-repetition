import React from "react";
import { createFlashcardNoteForAnnotationsNote, getNotesWithoutReview, NotesWithoutBooks } from "src/api";
import { useNavigate } from "react-router-dom";
import { useLoaderData } from "react-router";

export function bookCreatorLoader() {
    return getNotesWithoutReview();
}

export function BookCreator() {
    //TODO: add logic to emit book object when clicked
    const bookList = useLoaderData() as NotesWithoutBooks[];
    const navigate = useNavigate();

    async function clickHandler(bookId: string) {
        // todo fix
        // some logic here to create that new file
        // todo: refactor and move to api.ts
        await createFlashcardNoteForAnnotationsNote(bookId);
        navigate(`/books/${bookId}`, { replace: true });
    }

    if (bookList.length) {
        return (
            <>
                <p>Which book do you want to review?</p>
                <ul>
                    {bookList.map(t=> {
                            return <li onClick={async () => await clickHandler(t.id)}>{t.name}</li>;
                        }
                    )}
                </ul>
            </>
        );
    } else {
        return <p>To see a note here, add the tag <code>#review/note</code> to your note.</p>;
    }
}