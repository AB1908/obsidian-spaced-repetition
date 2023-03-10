import React from "react";

export function QuestionEdit(props: { questionText: string; onKeyDown: (e: React.KeyboardEvent) => void; onChange: (event: any) => void; }) {
    return <>
        <h3>Question</h3>
        <textarea spellCheck="false"
            className={"question"}
            defaultValue={props.questionText}
            onKeyDown={props.onKeyDown}
            onChange={props.onChange} />
    </>;
}
export function AnswerEdit(props: { answerText: string; onKeyDown: (e: React.KeyboardEvent) => void; onChange: (event: any) => void; }) {
    return <>
        <h3>Answer</h3>
        <textarea spellCheck="false"
            className={"answer"}
            defaultValue={props.answerText}
            onKeyDown={props.onKeyDown}
            onChange={props.onChange} />
    </>;
}
