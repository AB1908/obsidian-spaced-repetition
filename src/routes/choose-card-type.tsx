import {useLoaderData} from "react-router";
import {NoteAndHighlight} from "src/ui/components/note-and-highlight";
import {CardTypePicker} from "src/ui/components/card-creation";
import React from "react";
import type {annotation} from "src/data/import/annotations";

export function ChooseCardType() {
    const annotation = useLoaderData() as annotation;

    return (
        <>
            <NoteAndHighlight highlightText={annotation.highlight} noteText={annotation.note}/>
            <CardTypePicker/>
        </>
    );
}