import { Outlet, useLoaderData } from "react-router";
import { NoteAndHighlight } from "src/ui/components/note-and-highlight";
import React from "react";
import type { annotation } from "src/data/models/annotations";
import { USE_ACTUAL_BACKEND } from "src/routes/review";
import { getAnnotationById } from "src/api";
import type { AnnotationsLoaderParams } from "src/ui/components/highlights";

export interface AnnotationLoaderParams extends AnnotationsLoaderParams {
    annotationId: string;
}

export async function annotationLoader({ params }: {
    params: AnnotationLoaderParams
}) {
    // todo: use redirect
    if (USE_ACTUAL_BACKEND) {
        return getAnnotationById(params.annotationId, params.bookId);
    } else
        return fetch(`http://localhost:3000/flashcardsForAnnotation/${params.annotationId}`);
}

export function AnnotationWithOutlet() {
    const annotation = useLoaderData() as annotation;
    return (
        <>
            <NoteAndHighlight highlightText={annotation.highlight} noteText={annotation.note} />
            <Outlet />
        </>
    );
}
