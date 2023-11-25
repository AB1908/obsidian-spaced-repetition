import {useLoaderData} from "react-router";
import {Link} from "react-router-dom";
import React, { useEffect, useRef } from "react";
import {USE_ACTUAL_BACKEND} from "src/routes/review";
import {getFlashcardsForAnnotation} from "src/api";
import {Flashcard} from "src/data/models/flashcard";
import { Icon } from "src/routes/root";
import { setIcon } from "obsidian";

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

function NewComponent(props: {
    t: Flashcard,
    i: number,
    onClick: () => void
}) {
    const deleteButtonRef = useRef<HTMLDivElement>(null);
    const deleteIcon: Icon = "trash";

    useEffect(() => {
        // todo: figure out how to fix this
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        setIcon(deleteButtonRef.current, deleteIcon);
        // setIcon(deleteButtonRefs.current, deleteIcon);
    }, []);
    return <li className={"sr-flashcard tree-item-self is-clickable"}>
        <Link to={`${props.t.id}`}>
            {props.t.questionText}
        </Link>
        <button>
            <div ref={deleteButtonRef} onClick={props.onClick}>
            </div>
        </button>
    </li>;
}

export function PreviewExistingFlashcards() {
    const flashcards = useLoaderData() as Flashcard[];

    return (
        <>
            <div className={"sr-flashcard-preview"}>
                {flashcards.length != 0 &&
                    (<>

                        <p>
                            Existing questions:
                        </p>
                        <ul className={"sr-flashcard-tree"}>
                            {flashcards.map((t, i) => (
                                    <NewComponent key={t.id} t={t} i={i}
                                                  onClick={() => console.log("clicked")}/>
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
    );
}