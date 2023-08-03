import {useLoaderData} from "react-router";
import {annotation} from "src/data/import/annotations";
import {Link} from "react-router-dom";
import React from "react";

export async function highlightLoader({params}: { params: any }) {
    // todo: use redirect
    return fetch(`http://localhost:3000/flashcardsForAnnotation/${params.annotationId}`);
}

export function PreviewExistingFlashcards() {
    const annotation = useLoaderData() as annotation;
    return (
        <>
            <div>
                {annotation.flashcards.length != 0 &&
                    (<>
                        <p>
                            Existing questions:
                        </p>
                        <ul>
                            {annotation.flashcards.map((t, i) => (
                                <Link to={`${t.id}`}>
                                    <li key={t.id}>
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