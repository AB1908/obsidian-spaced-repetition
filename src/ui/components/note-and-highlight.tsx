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
        {noteText && <div>
            <blockquote className={"sr-blockquote"}>
                <p>
                    {noteText}
                </p>
            </blockquote>
        </div>}
    </>;
}