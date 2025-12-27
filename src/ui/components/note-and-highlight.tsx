import React from "react";

export function NoteAndHighlight({highlightText, noteText, displayMode}: { highlightText: string, noteText: string, displayMode: 'highlight' | 'note' }) {
    return <>
        <div className={"annotation-note"}>
            {displayMode === 'highlight' &&
                <blockquote className={"sr-blockquote-annotation"}>
                    <p>
                        {highlightText}
                    </p>
                </blockquote>
            }
            {displayMode === 'note' && noteText &&
                <blockquote className={"sr-blockquote-note"}>
                    <p>
                        {noteText}
                    </p>
                </blockquote>
            }
        </div>
    </>;
}