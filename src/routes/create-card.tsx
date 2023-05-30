import {useLoaderData} from "react-router";
import {NoteAndHighlight} from "src/ui/components/note-and-highlight";
import {Form, Link, useLocation} from "react-router-dom";
import {routes} from "src/ui/modals/flashcard-modal";
import React, {useState} from "react";

enum CardType {
    REGULAR,
    REVERSED,
    CLOZE
}

function CardTypePicker({setCardType}: {setCardType: (cardType: CardType) => void}) {
    return (<>
        <p>
            Which type of flashcard?
        </p>

        <ol>
            <li onClick={() => setCardType(CardType.REGULAR)}>
                Regular
            </li>
            <li onClick={() => setCardType(CardType.REVERSED)}>
                Reversed
            </li>
            <li onClick={() => setCardType(CardType.CLOZE)}>
                Cloze
            </li>
        </ol>
    </>);
}

function CardCreationForm(props: { defaultValue: any, defaultValue1: any }) {
    return <Form method="post">
        <div className={"sr-question-input"}>
            <div className={"label-wrapper"}>
                <label htmlFor={"question"} className={"sr-question-input-label"}>
                    Question
                </label>
            </div>
            <textarea id={"question"} name={"question"} className={"sr-question-input-text"}
                      defaultValue={props.defaultValue} required/>
        </div>
        <div className={"sr-answer-input"}>
            <div className={"label-wrapper"}>
                <label htmlFor={"answer"} className={"sr-answer-input-label"}>
                    Answer
                </label>
            </div>
            <textarea id={"answer"} name={"answer"} className={"sr-answer-input-text"}
                      defaultValue={props.defaultValue1} required/>
        </div>

        <button type="submit" className={"mod-cta"}>Submit</button>

        {/*TODO: Replace with useNavigate and use history?*/}
        <Link to={"./.."} className={""}>
            <button>
                Cancel
            </button>
        </Link>
    </Form>;
}

export function CreateRegularCard() {
    const highlight: any = useLoaderData();
    const [cardType, setCardType] = useState(null);
    const {pathname} = useLocation();
    const pathFragments = pathname.split("/");
    const currentPath = pathFragments[pathFragments.length - 1];
    let defaultQuestionValue = currentPath != "regular" ? highlight.flashcards[0].questionText : "";
    let defaultAnswerValue = currentPath != "regular" ? highlight.flashcards[0].answerText : "";
    return (
        <>
            <NoteAndHighlight highlightText={highlight.highlightContent} noteText={highlight.highlightNote}/>

            {cardType === null ? <CardTypePicker setCardType={setCardType}/> : <CardCreationForm defaultValue={defaultQuestionValue} defaultValue1={defaultAnswerValue}/>}
        </>
    );
}