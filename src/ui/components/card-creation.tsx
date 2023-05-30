// TODO: move each page to its own file
// TODO: move data to loader functions
// KILL: Figure out how to cache data between pages. may need subroutes
// TODO: handle action for card submission. How to update plugin data?
import React from "react";
import {Link, useParams} from "react-router-dom";
import {useLoaderData} from "react-router";
import {NoteAndHighlight} from "src/ui/components/note-and-highlight";
import {routes} from "src/ui/modals/flashcard-modal";

export async function highlightLoader() {
    const test = {
        id: 1,
        highlightContent: "This is a sample highlight",
        highlightNote: "This is a note for that highlight",
        flashcards: [
            {
                questionText: "This is a flashcard question that asks about highlight 1",
                answerText: "This is the answer to that question"
            },
            {
                questionText: "Flashcard 2",
                answerText: "Answer 2"
            },
        ]
    };
    return test;
}

export function PreviewExistingFlashcards() {
    const highlight = useLoaderData();
    return (
        <>
            <NoteAndHighlight highlightText={highlight.highlightContent} noteText={highlight.highlightNote}/>
            <div>
                <p>
                    Existing questions:
                </p>
                <ul>
                    {highlight.flashcards.map((t,i) => (
                        <Link to={routes.flashcard}>
                            <li key={i}>
                                <p>
                                    {t.questionText}
                                </p>
                                <p>
                                    {t.answerText}
                                </p>
                            </li>
                        </Link>
                    ))}
                    <Link to={routes.createCard}>
                        <li>
                            Add new card
                        </li>

                    </Link>
                </ul>
            </div>
        </>
    )
}

