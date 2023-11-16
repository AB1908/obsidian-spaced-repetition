import { RouteObject } from "react-router-dom";
import { Tabs } from "src/routes/tabs";
import { Tags } from "src/routes/tags";
import { Notes, notesLoader } from "src/routes/notes-home-page";
import { BookButtons, DeckLandingPage, deckLoader } from "src/routes/deck-preview";
import { ChapterList, chapterLoader } from "src/routes/chapter-list";
import { ReviewDeck, reviewLoader } from "src/routes/review";
import { cardLoader, creationAction, updateAction, UpsertCard } from "src/routes/upsert-card";
import { AnnotationList, annotationsLoader } from "src/routes/highlights";
import { annotationLoader, AnnotationWithOutlet } from "src/routes/annotation-with-outlet";
import { highlightLoader, PreviewExistingFlashcards } from "src/routes/preview-existing-flashcards";
import { ChooseCardType } from "src/routes/choose-card-type";
import React from "react";
import { BookCreator, bookCreatorLoader } from "src/ui/components/book-list";

export const children: RouteObject[] = [
    {
        path: "/",
        element: <Tabs />,
        children: [
            {
                path: "/tags",
                element: <Tags />
            },
            {
                path: "/books",
                element: <Notes />,
                loader: notesLoader
            }
        ]
    },
    {
        path: "/books/create",
        element: <BookCreator />,
        loader: bookCreatorLoader,
    },
    {
        path: "/books/:bookId",
        element: <DeckLandingPage />,
        loader: deckLoader,
        children: [
            {
                path: "",
                element: <BookButtons />,
                loader: deckLoader,
            },
            {
                path: "chapters",
                element: <ChapterList />,
                loader: chapterLoader
            }
        ]
    },
    {
        path: "/books/:bookId/review",
        element: <ReviewDeck />,
        loader: reviewLoader
    },
    {
        path: "/books/:bookId/review/:flashcardId",
        element: <ReviewDeck />,
        loader: reviewLoader
    },
    {
        path: "/books/:bookId/review/:flashcardId/edit",
        element: <UpsertCard />,
        action: updateAction,
        loader: cardLoader
    },
    {
        path: "/books/:bookId/chapters/:sectionId/annotations",
        element: <AnnotationList />,
        //todo: conditional logic for intermediate page where we display existing flashcards
        loader: annotationsLoader
    },
    // TODO: make these children and use layout routes?
    {
        path: "/books/:bookId/chapters/:chapterId/annotations/:annotationId",
        element: <AnnotationWithOutlet />,
        loader: annotationLoader,
        children: [
            {
                path: "flashcards",
                element: <PreviewExistingFlashcards />,
                loader: highlightLoader
            },
            {
                path: "flashcards/new",
                element: <ChooseCardType />
            },
            {
                // TODO: this should be refactored into a single add with params for type of card
                path: "flashcards/:flashcardId",
                element: <UpsertCard />,
                action: updateAction,
                loader: cardLoader
            },
            {
                // TODO: this should be refactored into a single add with params for type of card
                path: "flashcards/new/regular",
                element: <UpsertCard />,
                action: creationAction,
                loader: cardLoader
            }
        ]
    }
    // {
    //     // TODO: this should be refactored into a single add with params for type of card
    //     path: routes.createClozeCard,
    //     element: <ClozeCard/>,
    //     action: creationAction,
    //     loader: clozeLoader,
    // }
];