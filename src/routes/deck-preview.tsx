import React from "react";
import {Link, Outlet} from "react-router-dom";
import {useLoaderData} from "react-router";
import {DeckCounts, FlashCount} from "src/routes/notes-home-page";
import {USE_ACTUAL_BACKEND} from "src/routes/review";
import {getBookById} from "src/api";

interface DeckLoaderParams {
    bookId: string;
}

export function deckLoader({params}: {params: DeckLoaderParams}) {
    if (USE_ACTUAL_BACKEND)
        return getBookById(params.bookId);
    else
        return fetch(`http://localhost:3000/books/${params.bookId}`);
}

export interface Book {
    id: string;
    name: string;
    counts: Counts;
}

interface Counts {
    flashcards: FlashCount;
    annotations: Count;
}

interface Count {
    withFlashcards: number;
    withoutFlashcards: number;
}

export function BookButtons() {
    return <p>
        <Link to={"chapters"}>
            <button>
                Create New Cards
            </button>
        </Link>
        <Link to={"review"}>
            <button>
                Review
            </button>
        </Link>
    </p>;
}

export function DeckLandingPage() {
    const book = useLoaderData() as Book;
    return (
        <>
            <h3>
                {book.name}
            </h3>
            <h4>
                <DeckCounts counts={book.counts.flashcards}/>
            </h4>
            <h4>
                <span
                    // aria-label={t(this.props.cardType)}
                    className={"tree-item-flair sr-deck-counts "}
                    // backgroundColor="#4caf50"
                >
                    {book.counts.annotations.withFlashcards}
                </span>
                <span
                    // aria-label={t(this.props.cardType)}
                    className={"tree-item-flair sr-deck-counts "}
                    // backgroundColor="#4caf50"
                >
                    {book.counts.annotations.withoutFlashcards}
                </span>
            </h4>
            {/*    TODO: Add the untested highlight counts as well?*/}
            <Outlet/>
        </>
    );
}