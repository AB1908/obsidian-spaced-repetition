import React from "react";

export function NoteAndHighlight({highlightText, noteText}: { highlightText: string, noteText: string }) {
    return <>
        <div>
            <blockquote className={"markdown-rendered blockquote"}>
                <p>
                    {highlightText}
                </p>
            </blockquote>

        </div>
        <div>
            <blockquote>
                <p>
                    {noteText}
                </p>
            </blockquote>
        </div>
    </>;
}