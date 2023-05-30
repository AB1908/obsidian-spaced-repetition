import React from "react";
import {App, Modal} from "obsidian";
import {createRoot, Root as ReactDomRoot} from "react-dom/client";
import type SRPlugin from "src/main";
import {AppContext} from "src/contexts/PluginContext";
import {createMemoryRouter, RouterProvider} from "react-router-dom";
import {Notes, Root, Tabs, Tags} from "../../routes/root";
import ErrorPage from "src/routes/errorPage";
import {ChapterList} from "src/ui/components/chapters-list";
import {DeckLandingPage} from "src/routes/flashcard-review";
import {HighlightsList} from "src/ui/components/highlights";
import {
    creationAction,
    highlightLoader,
    PreviewExistingFlashcards
} from "src/ui/components/card-creation";
import {ChooseCardType, CreateCard} from "src/routes/create-card";

export enum FlashcardModalMode {
    DecksList,
    Front,
    Back,
    Closed,
}

export const routes = {
    bookList: "/notes/books",
    chapterList: "/notes/books/1/chapters",
    // specificChapter: "/notes/books/1/chapters/1",
    highlightList: "/notes/deck/chapters/1/highlights",
    // specificHighlight: "notes/books/1/chapters/1/highlights/1",
    flashcardsList: "/notes/deck/chapters/1/highlights/1/flashcards",
    flashcard: "/notes/deck/chapters/1/highlights/1/flashcards/:flashcardId",
    // createCard: "/notes/deck/chapters/1/highlights/1/flashcards/inter",
    createRegularCard: "/notes/deck/chapters/1/highlights/1/flashcards/new",
};



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
                            path: "/home/notes",
                            element: <Notes />,
                        },
                    ]
                },
                {
                    path: "/notes/deck",
                    element: <DeckLandingPage/>
                },
                {
                    path: "/deck/new",
                    element: <ChapterList/>
                },
                {
                    path: "/notes/deck/chapters",
                    element: <ChapterList/>
                },
                {
                    path: routes.highlightList,
                    element: true && <HighlightsList/>,
                    //todo: conditional logic for intermediate page where we display existing flashcards
                    loader: highlightLoader
                },
                {
                    path: routes.flashcardsList,
                    element: <PreviewExistingFlashcards/>,
                    loader: highlightLoader
                },
                // {
                //     path: routes.createCard,
                //     element: <ChooseCardType/>,
                //     loader: highlightLoader
                // },
                {
                    // TODO: this should be refactored into a single add with params for type of card
                    path: routes.flashcard,
                    element: <CreateCard/>,
                    action: creationAction,
                    loader: highlightLoader
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
