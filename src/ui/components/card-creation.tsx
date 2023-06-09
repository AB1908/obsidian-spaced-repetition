import React from "react";
import {Form, Link} from "react-router-dom";
import {useLoaderData} from "react-router";
import {NoteAndHighlight} from "src/ui/components/note-and-highlight";
import {deck} from "src/api";
import {CancelButton, SubmitButton} from "src/ui/components/buttons";

export async function highlightLoader({params}) {
    // todo: use redirect
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
        {/*TODO: fix default value*/}
        <TextInputWithLabel className={"sr-cloze-input"} htmlFor={"cloze"} defaultValue={props.defaultClozeValue}/>

        <SubmitButton/>

        {/*TODO: Replace with useNavigate and use history?*/}
        <CancelButton/>
    </Form>;
}

export function DefaultCardForm(props: { defaultQuestionValue: string, defaultAnswerValue: string }) {
    // todo: add some sort of header signifying the type of card being added
    return <Form method="post">
        <TextInputWithLabel className={"sr-question-input"} htmlFor={"question"} defaultValue={props.defaultQuestionValue}/>
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