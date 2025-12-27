import { RouteObject } from "react-router-dom";
import { Tabs } from "src/routes/tabs";
import { Tags } from "src/routes/tags";
import { Notes, notesLoader } from "src/routes/notes-home-page";
import { ImportDashboard, importLoader } from "src/routes/import-export";
import { BookButtons, DeckLandingPage, deckLoader } from "src/routes/deck-preview";
import { ChapterList, chapterLoader } from "src/routes/chapter-list";
import { ReviewDeck, reviewLoader } from "src/routes/review";
import { cardLoader, UpsertCard } from "src/routes/upsert-card";
import { EditCard, editCardAction } from "src/routes/edit-card";
import { AnnotationList, annotationsLoader } from "src/routes/highlights";
import { annotationLoader, AnnotationWithOutlet } from "src/routes/annotation-with-outlet";
import {
    deleteFlashcardAction,
    highlightLoader,
    PreviewExistingFlashcards
} from "src/routes/preview-existing-flashcards";
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
            },
            {
                path: "/import",
                element: <ImportDashboard />,
                loader: importLoader
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
        path: "/books/:bookId/flashcards/:flashcardId/edit",
        element: <EditCard />,
        action: editCardAction,
        loader: cardLoader
    },
    {
        path: "/books/:bookId/chapters/:sectionId/annotations",
        //todo: conditional logic for intermediate page where we display existing flashcards
        loader: annotationsLoader,
        id: "annotationsList",
        children: [
            {
                path: "",
                element: <AnnotationList />,
                loader: annotationsLoader,
            },
            {
                path: ":annotationId",
                element: <AnnotationWithOutlet />,
                loader: annotationLoader,
                children: [
                    {
                        path: "flashcards",
                        element: <PreviewExistingFlashcards />,
                        loader: highlightLoader,
                        action: deleteFlashcardAction
                    },
                    {
                        path: "flashcards/new",
                        element: <ChooseCardType />
                    },
                    {
                        // TODO: this should be refactored into a single add with params for type of card
                        path: "flashcards/:flashcardId",
                        element: <UpsertCard />,
                        loader: cardLoader
                    },
                    {
                        // TODO: this should be refactored into a single add with params for type of card
                        path: "flashcards/new/regular",
                        element: <UpsertCard />,
                        loader: cardLoader
                    }
                ]
            }
        ]
    },
    // TODO: make these children and use layout routes?
    // {
    //     // TODO: this should be refactored into a single add with params for type of card
    //     path: routes.createClozeCard,
    //     element: <ClozeCard/>,
    //     action: creationAction,
    //     loader: clozeLoader,
    // }
];