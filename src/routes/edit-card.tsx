import React from "react";
import { Form, useLoaderData, useNavigate, useParams } from "react-router-dom";
import { getAnnotationById, updateFlashcardContentsById } from "src/api";
import { HighlightBlock, NoteBlock } from "src/ui/components/display-blocks";
import { TextInputWithLabel } from "src/ui/components/card-creation";
import { CancelButton } from "src/ui/components/buttons";
import type { FrontendFlashcard } from "src/routes/review";

export function EditCard() {
    const currentCard = useLoaderData() as FrontendFlashcard;
    const params = useParams();
    const annotation = getAnnotationById(currentCard.parentId, params.bookId)
    const navigate = useNavigate();

    async function submitButtonHandler(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        await updateFlashcardContentsById(params.flashcardId, e.target.question.value, e.target.answer.value, params.bookId);
        navigate(-1);
    }

    return (
        <>
            <div className={"sr-annotation"}>
                <HighlightBlock text={annotation.highlight} />
                {annotation.note && <NoteBlock text={annotation.note} />}
            </div>
            <Form method="post" className={"sr-card-form"} replace onSubmit={(event) => submitButtonHandler(event)}>
                <TextInputWithLabel className={"sr-question-input"} htmlFor={"question"}
                                    defaultValue={currentCard.questionText}/>
                <TextInputWithLabel className={"sr-answer-input"} htmlFor={"answer"}
                                    defaultValue={currentCard.answerText}/>
                <div className={"modal-button-container"}>
                    <button type="submit" className={"mod-cta"}>Submit</button>
                    <CancelButton/>
                </div>
            </Form>
        </>
    );
}

export async function editCardAction() {
    return null
}
