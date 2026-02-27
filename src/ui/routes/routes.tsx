import { RouteObject } from "react-router-dom";
import { Tabs } from "src/ui/routes/tabs";
import { Tags } from "src/ui/routes/tags";
import { Notes, notesLoader } from "src/ui/routes/books";
import { ImportDashboard, importDashboardLoader } from "src/ui/routes/import/import-export";
import { BookButtons, DeckLandingPage, deckLoader } from "src/ui/routes/books/book";
import { ReviewDeck, reviewLoader } from "src/ui/routes/books/review";
import { cardLoader, UpsertCard } from "src/ui/routes/books/card/upsert-card";
import { EditCard, editCardAction } from "src/ui/routes/books/card/edit-card";
import { AnnotationListPage, annotationsLoader as flashcardAnnotationsLoader } from "src/ui/routes/books/book/annotation/AnnotationListPage";
import {
    annotationBreadcrumbTitle,
    annotationLoader,
    AnnotationWithOutlet
} from "src/ui/routes/books/book/annotation/annotation-with-outlet";
import {
    deleteFlashcardAction,
    highlightLoader,
    PreviewExistingFlashcards
} from "src/ui/components/PreviewExistingFlashcards";
import { ChooseCardType } from "src/ui/components/ChooseCardType";
import React from "react";
import { BookDetailsPage, bookDetailsLoader } from "src/ui/routes/import/index";
import { BookCreator, bookCreatorLoader } from "src/ui/components/book-list";
import { personalNoteLoader, PersonalNotePage } from "./import/personal-note";
import { ChapterList, chapterLoader } from "src/ui/components/ChapterList";
import { truncate } from "src/utils/text-helpers";

function defaultTitle() {
    return "Card Coverage";
}

function bookTitle(match: any): string | undefined {
    const bookName = match?.data?.name ?? match?.data?.bookDetails?.name;
    if (typeof bookName !== "string" || bookName.length === 0) {
        return undefined;
    }
    return bookName;
}

function cardEditingTitle(match: any): string {
    const questionText = match?.data?.questionText;
    if (typeof questionText !== "string" || questionText.length === 0) {
        return "Creating New Flashcard";
    }
    return `Editing: ${truncate(questionText, 50)}`;
}

export const children: RouteObject[] = [
    {
        path: "/",
        element: <Tabs />,
        children: [
            {
                path: "/tags",
                element: <Tags />,
                handle: {
                    title: defaultTitle
                }
            },
            {
                path: "/books",
                element: <Notes />,
                loader: notesLoader,
                handle: {
                    title: defaultTitle
                }
            },
            {
                path: "/import",
                element: <ImportDashboard />,
                loader: importDashboardLoader,
                handle: {
                    title: defaultTitle
                }
            }
        ]
    },
    {
        path: "/books/create",
        element: <BookCreator />,
        loader: bookCreatorLoader,
        handle: {
            title: defaultTitle
        }
    },
    {
        path: "/books/:bookId",
        element: <DeckLandingPage />,
        loader: deckLoader,
        handle: {
            title: bookTitle
        },
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
                handle: {
                    title: bookTitle
                }
            },
            {
                path: "chapters/:sectionId/annotations",
                loader: flashcardAnnotationsLoader,
                handle: {
                    title: annotationBreadcrumbTitle
                },
                children: [
                    {
                        path: "",
                        element: <AnnotationListPage />,
                        loader: flashcardAnnotationsLoader,
                        handle: {
                            title: annotationBreadcrumbTitle
                        }
                    },
                    {
                        path: ":annotationId",
                        handle: {
                            title: annotationBreadcrumbTitle
                        },
                        children: [
                            {
                                path: "personal-note",
                                element: <PersonalNotePage />,
                                loader: personalNoteLoader,
                                handle: {
                                    title: annotationBreadcrumbTitle
                                }
                            }
                        ]
                    }
                ]
            }
        ]
    }

    , {
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
        loader: cardLoader,
        handle: {
            title: cardEditingTitle
        }
    },
    {
        path: "/books/:bookId/chapters/:sectionId/annotations",
        //todo: conditional logic for intermediate page where we display existing flashcards
        loader: flashcardAnnotationsLoader,
        id: "annotationsList",
        handle: {
            title: annotationBreadcrumbTitle
        },
        children: [
            {
                path: "",
                element: <AnnotationListPage />,
                loader: flashcardAnnotationsLoader,
                handle: {
                    title: annotationBreadcrumbTitle
                }
            },
            {
                path: ":annotationId",
                element: <AnnotationWithOutlet />,
                loader: annotationLoader,
                handle: {
                    title: annotationBreadcrumbTitle
                },
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
                        loader: cardLoader,
                        handle: {
                            title: cardEditingTitle
                        }
                    },
                    {
                        // TODO: this should be refactored into a single add with params for type of card
                        path: "flashcards/new/regular",
                        element: <UpsertCard />,
                        loader: cardLoader,
                        handle: {
                            title: cardEditingTitle
                        }
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
