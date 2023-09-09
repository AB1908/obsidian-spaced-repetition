import React from "react";
import { getNotesWithoutReview, NotesWithoutBooks } from "src/api";
import { plugin } from "src/main";
import { createFlashcardsFileForBook } from "src/data/disk";
import { Book } from "src/data/models/book";
import { useNavigate } from "react-router-dom";
import { useLoaderData } from "react-router";

export function bookCreatorLoader() {
    return getNotesWithoutReview();
}

export function BookCreator() {
    //TODO: add logic to emit book object when clicked
    const bookList = useLoaderData() as NotesWithoutBooks[];
    const navigate = useNavigate();

    async function clickHandler(path: string) {
        // some logic here to create that new file
        await createFlashcardsFileForBook(path);
        const newBook = new Book(`${path}/Flashcards.md`);
        await newBook.initialize();
        // add this to array of books
        plugin.notesWithFlashcards.push(newBook);
        // redirect to the new book id
        navigate(`/books/${newBook.id}`, { replace: true });
    }

    return (
        <>
            <p>Which book do you want to review?</p>
            <ul>
                {bookList.map(t=> {
                        return <li onClick={async () => await clickHandler(t.path)}>{t.name}</li>;
                    }
                )}
            </ul>
        </>
    );
}