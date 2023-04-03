import React from "react";

export function TestComponent({bookList}: {bookList: any}) {
    return (<>
            <p>Add flashcards from:</p>
            <ul>
            {bookList.map((book: any) => (<li id={book.id}>
                {book.title}
            </li>))}
            </ul>
        </>
    );
}