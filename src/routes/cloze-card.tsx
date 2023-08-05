import {useLoaderData} from "react-router";
import {useParams} from "react-router-dom";
import {NoteAndHighlight} from "src/ui/components/note-and-highlight";
import {ClozeCardForm} from "src/ui/components/card-creation";
import React from "react";

export function clozeLoader() {
    // TODO: Add redirect if we have cloze card
    return {
        highlight: "Onen i-Estel Edain, ú-chebin estel anim.",
        note: "What a beautiful line by Tolkien",
    };
}

export function ClozeCard() {
    // DONE: add loader logic
    const highlight = useLoaderData();
    const {flashcardId} = useParams();
    const flashcardIndex = Number(flashcardId);
    const defaultClozeValue = highlight.flashcards[flashcardIndex]?.questionText || "";
    return (
        <>
            <NoteAndHighlight highlightText={highlight.highlightContent} noteText={highlight.highlightNote}/>
            <ClozeCardForm defaultClozeValue={defaultClozeValue}/>
        </>
    );
}