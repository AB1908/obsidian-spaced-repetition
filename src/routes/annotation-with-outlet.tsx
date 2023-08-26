import {Outlet, useLoaderData} from "react-router";
import {NoteAndHighlight} from "src/ui/components/note-and-highlight";
import React from "react";
import {annotation} from "src/data/import/annotations";
import {USE_ACTUAL_BACKEND} from "src/routes/review";
import {getAnnotationById} from "src/api";

export async function annotationLoader({params}: { params: any }) {
    // todo: use redirect
    if (USE_ACTUAL_BACKEND){
        return getAnnotationById(params.annotationId, params.bookId);
    }
    else
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
