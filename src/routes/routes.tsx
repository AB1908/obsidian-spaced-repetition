import { RouteObject } from "react-router-dom";
import { Tabs } from "src/routes/tabs";
import { Tags } from "src/routes/tags";
import { Notes, notesLoader } from "src/routes/books/notes-home-page";
import { ImportDashboard, importDashboardLoader } from "src/routes/import-export";
import { BookButtons, DeckLandingPage, deckLoader } from "src/routes/deck-preview";
import { ChapterList, chapterLoader } from "src/routes/chapter-list";
import { ReviewDeck, reviewLoader } from "src/routes/review";
import { cardLoader, UpsertCard } from "src/routes/upsert-card";
import { EditCard, editCardAction } from "src/routes/edit-card";
import { ImportHighlights, annotationsLoader as importAnnotationsLoader } from "src/routes/import-highlights";
import { FlashcardHighlights, annotationsLoader as flashcardAnnotationsLoader } from "src/routes/flashcard-highlights";
import { annotationLoader, AnnotationWithOutlet } from "src/routes/annotation-with-outlet";
import {
    deleteFlashcardAction,
    highlightLoader,
    PreviewExistingFlashcards
} from "src/routes/preview-existing-flashcards";
import { ChooseCardType } from "src/routes/choose-card-type";
import React from "react";
import { BookDetailsPage, bookDetailsLoader } from "src/routes/book-details-page";
import { BookCreator, bookCreatorLoader } from "src/ui/components/book-list";
import { personalNoteLoader, PersonalNotePage } from "./personal-note";

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
                loader: importDashboardLoader
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
                        path: "import/books/:bookId",
                        children: [
                            {
                                path: "details",
                                element: <BookDetailsPage />,
                                loader: bookDetailsLoader,
                            },
                            {
                                path: "chapters/:sectionId/annotations",
                                children: [
                                    {
                                        path: "",
                                        element: <ImportHighlights />,
                                        loader: importAnnotationsLoader,
                                    },
                                    {
                                        path: ":annotationId",
                                        children: [
                                            {
                                                path: "personal-note",
                                                element: <PersonalNotePage />,
                                                loader: personalNoteLoader,
                                            }
                                        ]
                                    }
                                ]
                            }
                        ]
                    }

    ,{
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
        loader: flashcardAnnotationsLoader,
        id: "annotationsList",
        children: [
            {
                path: "",
                element: <FlashcardHighlights />,
                loader: flashcardAnnotationsLoader,
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