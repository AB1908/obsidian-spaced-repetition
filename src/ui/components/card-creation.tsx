import React from "react";
import {Form, Link} from "react-router-dom";
import {CancelButton, SubmitButton} from "src/ui/components/buttons";

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

export function DefaultCardForm(props: { defaultQuestionValue: string, defaultAnswerValue: string }) {
    // todo: add some sort of header signifying the type of card being added
    return <Form method="post" className={"sr-card-form"}>
        <TextInputWithLabel className={"sr-question-input"} htmlFor={"question"}
                            defaultValue={props.defaultQuestionValue}/>
        <TextInputWithLabel className={"sr-answer-input"} htmlFor={"answer"} defaultValue={props.defaultAnswerValue}/>

        <div className={"modal-button-container"}>
            <SubmitButton/>
            {/*TODO: Replace with useNavigate and use history?*/}
            <CancelButton/>
        </div>
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