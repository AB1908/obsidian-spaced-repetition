import {Outlet, useLoaderData} from "react-router";
import {Annot} from "src/data/models/book";
import {NoteAndHighlight} from "src/ui/components/note-and-highlight";
import React from "react";

export async function annotationLoader({params}: { params: any }) {
    // todo: use redirect
    return fetch(`http://localhost:3000/flashcardsForAnnotation/${params.annotationId}`);
}

export function AnnotationWithOutlet() {
    const annotation = useLoaderData() as Annot;
    return (
        <>
            <NoteAndHighlight highlightText={annotation.highlight} noteText={annotation.note}/>
            <Outlet/>
        </>
    )
}
