import React from "react";
import {Form, Link} from "react-router-dom";
import {useLoaderData} from "react-router";
import {NoteAndHighlight} from "src/ui/components/note-and-highlight";
import {CancelButton, SubmitButton} from "src/ui/components/buttons";
import type {Annot} from "src/data/models/book";

export async function highlightLoader({params}: {params: any}) {
    // todo: use redirect
    return fetch(`http://localhost:3000/flashcardsForAnnotation/${params.annotationId}`);
}

export function PreviewExistingFlashcards() {
    const annotation = useLoaderData() as Annot;
    return (
        <>
            <NoteAndHighlight highlightText={annotation.highlight} noteText={annotation.note}/>
            <div>
                {annotation.flashcards.length != 0 &&
                    (<>
                        <p>
                            Existing questions:
                        </p>
                        <ul>
                            {annotation.flashcards.map((t, i) => (
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

export function TextInputWithLabel(props: { className: string, htmlFor: string, defaultValue: string }) {
    const labelText = props.htmlFor[0].toUpperCase() + props.htmlFor.slice(1);
    return <div className={props.className}>
        <label htmlFor={props.htmlFor}>
            {labelText}
        </label>
        <textarea id={props.htmlFor} name={props.htmlFor} defaultValue={props.defaultValue} required/>
    </div>;
}

export function ClozeCardForm(props: any) {
    return <Form method="post">
        {/*Done: fix default value*/}
        <TextInputWithLabel className={"sr-cloze-input"} htmlFor={"cloze"} defaultValue={props.defaultClozeValue}/>

        <SubmitButton/>

        {/*TODO: Replace with useNavigate and use history?*/}
        <CancelButton/>
    </Form>;
}

export function DefaultCardForm(props: { defaultQuestionValue: string, defaultAnswerValue: string }) {
    // todo: add some sort of header signifying the type of card being added
    return <Form method="post">
        <TextInputWithLabel className={"sr-question-input"} htmlFor={"question"}
                            defaultValue={props.defaultQuestionValue}/>
        <TextInputWithLabel className={"sr-answer-input"} htmlFor={"answer"} defaultValue={props.defaultAnswerValue}/>

        <SubmitButton/>

        {/*TODO: Replace with useNavigate and use history?*/}
        <CancelButton/>
    </Form>;
}

export function CardTypePicker() {
    return (<>
        <p>
            Which type of flashcard?
        </p>

        <ol>
            <Link to={"regular"}>
                <li>
                    Regular
                </li>
            </Link>
            <Link to={"reversed"}>
                <li>
                    Reversed
                </li>
            </Link>
            <Link to={"cloze"}>
                <li>
                    Cloze
                </li>
            </Link>
        </ol>
    </>);
}