import React from "react";

export function HighlightBlock({ text }: { text: string }) {
    return (
        <blockquote className={"sr-blockquote-annotation"}>
            <p>
                {text}
            </p>
        </blockquote>
    );
}

export function NoteBlock({ text }: { text: string }) {
    if (!text) {
        return null;
    }

    return (
        <blockquote className={"sr-blockquote-note"}>
            <p>
                {text}
            </p>
        </blockquote>
    );
}
