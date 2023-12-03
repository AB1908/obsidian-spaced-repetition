import React from "react";
import { Link, Outlet, useNavigate, useLoaderData } from "react-router-dom";
import { DeckCounts } from "src/routes/notes-home-page";
import { USE_ACTUAL_BACKEND } from "src/routes/review";
import { frontEndBook, getBookById, resetBookReviewState } from "src/api";

interface DeckLoaderParams {
    bookId: string;
}

export function deckLoader({params}: {params: DeckLoaderParams}) {
    console.log("side effect")
    // warn: performing side effect!
    resetBookReviewState(params.bookId);
    return getBookById(params.bookId);
}

export function BookButtons() {
    const navigate = useNavigate();
    const book = useLoaderData() as frontEndBook;
    return <p>
        <Link to={"chapters"}>
            <button>
                Create New Cards
            </button>
        </Link>
        <button onClick={() => navigate("review")} disabled={!book.canBeReviewed}>
            Review
        </button>
    </p>;
}

export function DeckLandingPage() {
    const book = useLoaderData() as frontEndBook;
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
                    {book.counts.annotations.withoutFlashcards}
                </span>
                <span
                    // aria-label={t(this.props.cardType)}
                    className={"tree-item-flair sr-deck-counts "}
                    // backgroundColor="#4caf50"
                >
                    {book.counts.annotations.withFlashcards}
                </span>
            </h4>
            {/*    TODO: Add the untested highlight counts as well?*/}
            <Outlet/>
        </>
    );
}