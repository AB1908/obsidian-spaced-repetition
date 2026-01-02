import React, { useEffect, useRef } from "react";
import { Form, useLoaderData, useNavigate, useParams } from "react-router-dom";
import { CancelButton, SubmitButton } from "src/ui/components/buttons";
import { createFlashcardForAnnotation, updateFlashcardContentsById } from "src/api";
import { FrontendFlashcard } from "src/ui/routes/books/review";
import { Icon } from "src/types/obsidian-icons";
import { setIcon } from "src/infrastructure/obsidian-facade";

export function TextInputWithLabel(props: { className: string, htmlFor: string, defaultValue: string }) {
    const labelText = props.htmlFor[0].toUpperCase() + props.htmlFor.slice(1);
    return <div className={props.className}>
        <label htmlFor={props.htmlFor}>
            {labelText}
        </label>
        <textarea id={props.htmlFor} name={props.htmlFor} defaultValue={props.defaultValue} required />
    </div>;
}

export function ClozeCardForm(props: any) {
    return <Form method="post">
        {/*Done: fix default value*/}
        <TextInputWithLabel className={"sr-cloze-input"} htmlFor={"cloze"} defaultValue={props.defaultClozeValue} />

        <div className={"modal-button-container"}>
            <SubmitButton />

            {/*TODO: Replace with useNavigate and use history?*/}
            <CancelButton />
        </div>
    </Form>;
}

// Update HelpPopup to accept a forwarded ref
const HelpPopup = React.forwardRef<HTMLDivElement>((props, ref) => {
    return (
        <div className="sr-help-popup" ref={ref}>
            <ul>
                <li>
                    Is it atomic?
                </li>
                <li>
                    Is the shape unambiguous?
                </li>
                <li>
                    Does it require effortful retrieval?
                </li>
                <li>
                    Does it test "Why" or "How"?
                </li>
                <li>
                    Is it context independent?
                </li>
                <li>
                    Does it avoid binary answers?
                </li>
            </ul>
        </div>
    );
});
HelpPopup.displayName = 'HelpPopup';

export function DefaultCardForm(props: { defaultQuestionValue: string, defaultAnswerValue: string }) {
    // todo: add some sort of header signifying the type of card being added
    const currentCard = useLoaderData() as FrontendFlashcard;
    const params = useParams();
    const navigate = useNavigate();
    const helpButton = useRef<HTMLDivElement>(null);
    const popupRef = useRef<HTMLDivElement>(null); // Ref for the popup

    const [isPopupVisible, setIsPopupVisible] = React.useState(false);
    const togglePopup = () => setIsPopupVisible(previousState => !previousState);

    // This effect sets the icon
    useEffect(() => {
        const back: Icon = "question-mark-glyph";
        // todo: figure out how to fix this
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-ignore
        setIcon(helpButton.current, back);
    }, []);

    // This effect handles closing the popup when clicking outside
    useEffect(() => {
        if (!isPopupVisible) return;

        function handleClickOutside(event: MouseEvent) {
            // Do nothing if clicking the button again, its own handler will toggle the state
            if (helpButton.current && helpButton.current.contains(event.target as Node)) {
                return;
            }
            // Close if the click is outside the popup
            if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
                setIsPopupVisible(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isPopupVisible]);


    async function submitButtonHandler(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (params.flashcardId) {
            await updateFlashcardContentsById(params.flashcardId, e.target.question.value, e.target.answer.value, params.bookId);
            navigate("./..", { replace: true });
        } else {
            await createFlashcardForAnnotation(e.target.question.value, e.target.answer.value, params.annotationId, params.bookId);
            navigate(-2);
        }
    }

    return <Form method="post" className={"sr-card-form"} replace onSubmit={(event) => submitButtonHandler(event)}>
        <div className="sr-question-input-wrapper">
            <TextInputWithLabel className={"sr-question-input"} htmlFor={"question"}
                defaultValue={currentCard?.questionText} />
            <div className={"sr-question-input-icon"} onClick={togglePopup} ref={helpButton}>
            </div>
            {isPopupVisible && <HelpPopup ref={popupRef} />}
        </div>
        <TextInputWithLabel className={"sr-answer-input"} htmlFor={"answer"}
            defaultValue={currentCard?.answerText} />
        <div className={"modal-button-container sr-modal-button-container"}>
            <SubmitButton />
            <CancelButton />
        </div>
    </Form>;
}