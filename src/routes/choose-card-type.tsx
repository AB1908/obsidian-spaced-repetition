import {useLoaderData} from "react-router";
import {NoteAndHighlight} from "src/ui/components/note-and-highlight";
import {CardTypePicker} from "src/ui/components/card-creation";
import React from "react";

export function ChooseCardType() {
    const highlight = useLoaderData();

    return (
        <>
            <NoteAndHighlight highlightText={highlight.highlightContent} noteText={highlight.highlightNote}/>
            <CardTypePicker/>
        </>
    );
}