import React from "react";

export function TestComponent({bookList}: {bookList: any}) {
    //TODO: add logic to emit book object when clicked
    return (<>
            <p>Add flashcards from:</p>
            <ul>
            {bookList.map((book: any) => (<li key={book.id}>
                {book.title}
            </li>))}
            </ul>
        </>
    );
}