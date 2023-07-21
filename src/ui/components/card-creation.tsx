import React from "react";
import {Form, Link} from "react-router-dom";
import {useLoaderData} from "react-router";
import {NoteAndHighlight} from "src/ui/components/note-and-highlight";
import {CancelButton, SubmitButton} from "src/ui/components/buttons";

export async function highlightLoader({params}) {
    // todo: use redirect
    return {

        id: "d91maa3h",
        color: "#339122",
        highlight: "Onen i-Estel Edain, ú-chebin estel anim.",
        note: "What a beautiful line by Tolkien",
        flashcards: [
            {
                "id": "ks991kna",
                "note": null,
                "questionText": " i-Estel Edain, ú-chebin estel anim.",
                "answerText": "Onen",
                "cardText": "==Onen== i-Estel Edain, ==ú-chebin== estel ==anim==.",
                "metadataText": "<!--SR:!2022-11-14,2,230!2022-11-14,2,210!2022-11-14,2,190-->",
                "context": "",
                "cardType": 4,
                "siblings": ["ks991kw1"],
                "clozeInsertionAt": 0,
                "interval": 2,
                "ease": 230,
                "delayBeforeReview": 17662032301
            },
            {
                "id": "ks991kw1",
                "note": null,
                "questionText": "Onen i-Estel Edain,  estel anim.",
                "answerText": "ú-chebin",
                "cardText": "==Onen== i-Estel Edain, ==ú-chebin== estel ==anim==.",
                "metadataText": "<!--SR:!2022-11-14,2,230!2022-11-14,2,210!2022-11-14,2,190-->",
                "context": "",
                "cardType": 4,
                "siblings": ["ks991kna"],
                "clozeInsertionAt": 19,
                "interval": 2,
                "ease": 210,
                "delayBeforeReview": 17662032301
            }
        ]
    };
}

export function PreviewExistingFlashcards() {
    const highlight = useLoaderData();
    return (
        <>
            <NoteAndHighlight highlightText={highlight.highlight} noteText={highlight.note}/>
            <div>
                {highlight.flashcards.length != 0 &&
                    (<>
                        <p>
                            Existing questions:
                        </p>
                        <ul>
                            {highlight.flashcards.map((t, i) => (
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