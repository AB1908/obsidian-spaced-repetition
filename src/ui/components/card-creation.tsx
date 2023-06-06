// TODO: move each page to its own file
// TODO: move data to loader functions
// KILL: Figure out how to cache data between pages. may need subroutes
// TODO: handle action for card submission. How to update plugin data?
import React from "react";
import {Link, useParams} from "react-router-dom";
import {useLoaderData} from "react-router";
import {NoteAndHighlight} from "src/ui/components/note-and-highlight";
import {routes} from "src/ui/modals/flashcard-modal";
import {deck} from "src/api";

export async function highlightLoader({params}) {
    const test = deck.chapters[params.chapterId].highlights[params.highlightId];
    return test;
}

export function PreviewExistingFlashcards() {
    const highlight = useLoaderData();
    return (
        <>
            <NoteAndHighlight highlightText={highlight.highlightContent} noteText={highlight.highlightNote}/>
            <div>
                { highlight.flashcards.length != 0 &&
                    (<>
                        <p>
                            Existing questions:
                        </p>
                        <ul>
                            {highlight.flashcards.map((t,i) => (
                                <Link to={`${i}`}>
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
                        </ul>
                    </>)
                }
                <Link to={routes.createCard}>
                    <button>
                        Create New Cards
                    </button>
                </Link>
            </div>
        </>
    )
}

