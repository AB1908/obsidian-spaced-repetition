import { Form, Link, useParams, useLoaderData } from "react-router-dom";
import React, { useEffect, useRef } from "react";
import { USE_ACTUAL_BACKEND } from "src/ui/routes/books/review";
import { deleteFlashcard, getFlashcardsForAnnotation } from "src/api";
import { Flashcard } from "src/data/models/flashcard";
import { Icon } from "src/types/obsidian-icons";
import { setIcon } from "src/infrastructure/obsidian-facade";
import { type AnnotationsLoaderParams } from "src/ui/routes/books/AnnotationListPage";

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

function FlashcardPreview(props: {
    id: string,
    questionText: string,
}) {
    const deleteButtonRef = useRef<HTMLDivElement>(null);
    const deleteIcon: Icon = "trash";
    const params = useParams<keyof AnnotationsLoaderParams>();

    useEffect(() => {
        // todo: figure out how to fix this
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        setIcon(deleteButtonRef.current, deleteIcon);
    }, []);
    return <li className={"sr-flashcard tree-item-self is-clickable"}>
        <Link to={`${props.id}`}>
            {props.questionText}
        </Link>
        <Form method={"delete"}>
            <button value={props.id} name={"flashcardId"}>
                <div ref={deleteButtonRef}>
                </div>
            </button>
        </Form>
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
                                    <FlashcardPreview key={t.id} questionText={t.questionText} id={t.id}/>
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

// todo: fix any
export async function deleteFlashcardAction({params, request}: {params: any, request: any}) {
    const data = await request.formData();
    await deleteFlashcard(params.bookId, data.get("flashcardId"));
    return null;
}