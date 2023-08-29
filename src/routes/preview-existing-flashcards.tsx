import {useLoaderData} from "react-router";
import {Link} from "react-router-dom";
import React from "react";
import {USE_ACTUAL_BACKEND} from "src/routes/review";
import {getFlashcardsForAnnotation} from "src/api";
import {Flashcard} from "src/data/models/flashcard";

interface HighlightParams {
    bookId: string;
    chapterId: string;
    annotationId: string;
}

export function highlightLoader({params}: {params: HighlightParams}) {
    // todo: use redirect
    if (USE_ACTUAL_BACKEND) {
        return getFlashcardsForAnnotation(params.annotationId, params.bookId);
    }
    else {
        return fetch(`http://localhost:3000/flashcardsForAnnotation/${params.annotationId}`);
    }
}

export function PreviewExistingFlashcards() {
    const flashcards = useLoaderData() as Flashcard[];
    return (
        <>
            <div>
                {flashcards.length != 0 &&
                    (<>
                        <p>
                            Existing questions:
                        </p>
                        <ul>
                            {flashcards.map((t, i) => (
                                <Link to={`${t.id}`} key={t.id} replace>
                                    <li>
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
                {/*TODO: This shouldn't be here I guess*/}
                <Link to={"new"}>
                    <button>
                        Create New Cards
                    </button>
                </Link>
            </div>
        </>
    )
}