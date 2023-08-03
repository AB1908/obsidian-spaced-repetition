import {Outlet, useLoaderData} from "react-router";
import {NoteAndHighlight} from "src/ui/components/note-and-highlight";
import React from "react";
import {annotation} from "src/data/import/annotations";

export async function annotationLoader({params}: { params: any }) {
    // todo: use redirect
    return fetch(`http://localhost:3000/flashcardsForAnnotation/${params.annotationId}`);
}

export function AnnotationWithOutlet() {
    const annotation = useLoaderData() as annotation;
    return (
        <>
            <NoteAndHighlight highlightText={annotation.highlight} noteText={annotation.note}/>
            <Outlet/>
        </>
    )
}
