import React from "react";
import { Form, useLoaderData, useNavigate, useParams } from "react-router-dom";
import { CancelButton, SubmitButton } from "src/ui/components/buttons";
import { createFlashcardForAnnotation, updateFlashcardContentsById } from "src/api";
import { FrontendFlashcard } from "src/routes/review";

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

        <div className={"modal-button-container"}>
            <SubmitButton/>

            {/*TODO: Replace with useNavigate and use history?*/}
            <CancelButton/>
        </div>
    </Form>;
}

export function DefaultCardForm() {
    // todo: add some sort of header signifying the type of card being added
    const currentCard = useLoaderData() as FrontendFlashcard;
    const params = useParams();
    const navigate = useNavigate();

    // use button handler instead of action because button can behave differently based on route
    async function submitButtonHandler(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (params.flashcardId) {
            await updateFlashcardContentsById(params.flashcardId, e.target.question.value, e.target.answer.value, params.bookId);
            navigate("./..", {replace: true});
        } else {
            await createFlashcardForAnnotation(e.target.question.value, e.target.answer.value, params.annotationId, params.bookId);
            navigate(-2);
        }
    }

    return <Form method="post" className={"sr-card-form"} replace onSubmit={(event) => submitButtonHandler(event)}>
        <TextInputWithLabel className={"sr-question-input"} htmlFor={"question"}
                            defaultValue={currentCard?.questionText}/>
        <TextInputWithLabel className={"sr-answer-input"} htmlFor={"answer"}
                            defaultValue={currentCard?.answerText}/>
        <div className={"modal-button-container"}>
            <SubmitButton/>
            <CancelButton/>
        </div>
    </Form>;
}