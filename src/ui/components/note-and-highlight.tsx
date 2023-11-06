import React from "react";

export function NoteAndHighlight({highlightText, noteText}: { highlightText: string, noteText: string }) {
    return <>
        <div className={"annotation-note"}>
            <blockquote className={"sr-blockquote-annotation"}>
                <p>
                    {highlightText}
                </p>
            </blockquote>
            {noteText &&
                <blockquote className={"sr-blockquote-note"}>
                    <p>
                        {noteText}
                    </p>
                </blockquote>
            }
        </div>
    </>;
}