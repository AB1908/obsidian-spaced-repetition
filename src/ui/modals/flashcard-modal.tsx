import React from "react";
import { App, Modal } from "obsidian";
import { createRoot, Root as ReactDomRoot} from "react-dom/client";
import type SRPlugin from "src/main";
import { ModalElement } from "../views/modal";
import { AppContext } from "src/contexts/PluginContext";
import {createBrowserRouter, RouterProvider} from "react-router-dom";
import {FlashcardReview, Notes, Root, Tabs, Tags} from "../../routes/root";
import ErrorPage from "src/routes/errorPage";
import {createMemoryRouter} from "react-router-dom";
import {ChapterList} from "src/ui/components/chapters-list";
import {DeckLandingPage} from "src/routes/flashcard-review";

export enum FlashcardModalMode {
    DecksList,
    Front,
    Back,
    Closed,
}

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
                    path: "/notes/deck/1",
                    element: <DeckLandingPage/>
                },
                {
                    path: "/deck/new",
                    element: <ChapterList/>
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
