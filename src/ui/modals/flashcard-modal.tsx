import React from "react";
import {App, Modal} from "obsidian";
import {createRoot, Root as ReactDomRoot} from "react-dom/client";
import type SRPlugin from "src/main";
import {AppContext} from "src/contexts/PluginContext";
import {createMemoryRouter, RouterProvider} from "react-router-dom";
import {Root, Tabs, Tags} from "src/routes/root";
import ErrorPage from "src/routes/errorPage";
import {ChapterList, chapterLoader} from "src/ui/components/chapters-list";
import {DeckLandingPage, deckLoader} from "src/routes/deck-preview";
import {chapterLoaderData, HighlightsList} from "src/ui/components/highlights";
import {UpsertCard, creationAction, ClozeCard, clozeLoader} from "src/routes/upsert-card";
import {ChooseCardType} from "src/routes/choose-card-type";
import {Notes, notesLoader} from "src/routes/notes-home-page";
import {highlightLoader, PreviewExistingFlashcards} from "src/routes/preview-existing-flashcards";
import {reviewAction, ReviewDeck, reviewLoader} from "src/routes/review";

export enum FlashcardModalMode {
    DecksList,
    Front,
    Back,
    Closed,
}

export const routes = {
    // bookList: "/notes/books",
    book: "/books/:bookId",
    chapterList: "/books/:bookId/chapters",
    highlightList: "/books/:bookId/chapters/:sectionId/annotations",
    flashcardsList: "/books/:bookId/chapters/:chapterId/annotations/:annotationId/flashcards",
    flashcard: "/books/:bookId/chapters/:chapterId/annotations/:annotationId/flashcards/:flashcardId",
    createCard: "/books/:bookId/chapters/:chapterId/annotations/:annotationId/flashcards/new",
    createRegularCard: "/books/:bookId/chapters/:chapterId/annotations/:annotationId/flashcards/new/regular",
    createClozeCard: "/books/:bookId/chapters/:chapterId/annotations/:annotationId/flashcards/new/cloze",
};

/*
books by title or id?
generated id might be diff in every scenario
but that shouldn't matter since routing is completely internal
any other potential downsides?
makes it difficult to use navigate? no doesn't seem like it
id -> would be array index of the books list which we would pass to nested routes I guess
or should I pass the book itself?

I have three options for passing data:
- useref
- context: this seems like a decent option
- action data but how do I associate a link with an action? onclick
  - this won't scale well, i don't need dozens of actions and loaders
/notes/books/The
 */

export class FlashcardModal extends Modal {
    public plugin: SRPlugin;
    public ignoreStats: boolean;
    private modalElReactRoot: ReactDomRoot;

    private router = createMemoryRouter([
        {
            path: "/",
            element: <Root handleCloseButton={()=>this.close()}/>,
            errorElement: <ErrorPage />,
            children: [
                {
                    path: "/home",
                    element: <Tabs />,
                    children: [
                        {
                            path: "/home/tags",
                            element: <Tags />,
                            // index: true
                        },
                        {
                            path: "/home/books",
                            element: <Notes />,
                            loader: notesLoader,
                        },
                    ]
                },
                {
                    path: "/books/:bookId",
                    element: <DeckLandingPage/>,
                    loader: deckLoader,
                },
                {
                    path: "/books/:bookId/review",
                    element: <ReviewDeck/>,
                    loader: reviewLoader,
                },
                {
                    path: "/books/:bookId/review/:flashcardId",
                    element: <ReviewDeck/>,
                    loader: reviewLoader,
                    action: reviewAction
                },
                {
                    path: routes.chapterList,
                    element: <ChapterList/>,
                    loader: chapterLoader,
                },
                // {
                //     path: "/notes/books/:bookId/chapters",
                //     element: <ChapterList/>
                // },
                {
                    path: routes.highlightList,
                    element: <HighlightsList/>,
                    //todo: conditional logic for intermediate page where we display existing flashcards
                    loader: chapterLoaderData
                },
                // TODO: make these children and use layout routes?
                {
                    path: routes.flashcardsList,
                    element: <PreviewExistingFlashcards/>,
                    loader: highlightLoader
                },
                {
                    path: routes.createCard,
                    element: <ChooseCardType/>,
                    loader: highlightLoader
                },
                {
                    // TODO: this should be refactored into a single add with params for type of card
                    path: routes.flashcard,
                    element: <UpsertCard/>,
                    action: creationAction,
                    loader: highlightLoader
                },
                {
                    // TODO: this should be refactored into a single add with params for type of card
                    path: routes.createRegularCard,
                    element: <UpsertCard/>,
                    action: creationAction,
                    loader: highlightLoader
                },
                {
                    // TODO: this should be refactored into a single add with params for type of card
                    path: routes.createClozeCard,
                    element: <ClozeCard/>,
                    action: creationAction,
                    loader: clozeLoader,
                }
            ]
        },
    ]);

    constructor(app: App, plugin: SRPlugin, ignoreStats = false) {
        super(app);

        this.plugin = plugin;
        this.ignoreStats = ignoreStats;

        this.modalEl.addClass("sr-modal");


        // document.body.onkeydown = (e) => {
        //     if (this.mode !== FlashcardModalMode.DecksList) {
        //         if (this.mode !== FlashcardModalMode.Closed && e.code === "KeyS") {
        //             this.currentDeck.deleteFlashcardAtIndex(
        //                 this.currentCardIdx,
        //                 this.currentCard.isDue
        //             );
        //             this.burySiblingCards(false);
        //             this.currentDeck.nextCard(this);
        //         } else if (
        //             this.mode === FlashcardModalMode.Front &&
        //             (e.code === "Space" || e.code === "Enter")
        //         ) {
        //             this.showAnswer();
        //         } else if (this.mode === FlashcardModalMode.Back) {
        //             if (e.code === "Numpad1" || e.code === "Digit1") {
        //                 this.processReview(ReviewResponse.Hard);
        //             } else if (e.code === "Numpad2" || e.code === "Digit2" || e.code === "Space") {
        //                 this.processReview(ReviewResponse.Good);
        //             } else if (e.code === "Numpad3" || e.code === "Digit3") {
        //                 this.processReview(ReviewResponse.Easy);
        //             } else if (e.code === "Numpad0" || e.code === "Digit0") {
        //                 this.processReview(ReviewResponse.Reset);
        //             }
        //         }
        //     }
        // };
    }

    onOpen(): void {
        this.modalElReactRoot = createRoot(this.modalEl)
        this.modalElReactRoot.render(
            <>
                <AppContext.Provider value={this.plugin}>
                    <RouterProvider router={this.router}/>
                </AppContext.Provider>
            </>
        )
    }

    onClose(): void {
        this.modalElReactRoot.unmount();
    }
}
