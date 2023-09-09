import React from "react";
import { Modal } from "obsidian";
import type SRPlugin from "src/main";
import { createRoot, Root as ReactDomRoot } from "react-dom/client";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { Root } from "src/routes/root";
import { children } from "src/routes/routes";
import ErrorPage from "src/routes/errorPage";
import { listOfNotePaths } from "src/data/disk";
import { Book } from "src/data/models/book";

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

    // todo: remove ts-ignore and use logic in https://stackoverflow.com/a/75327283/13285428
    private router = createMemoryRouter([
        {
            path: "",
            element: <Root handleCloseButton={()=>this.close()}/>,
            errorElement: <ErrorPage />,
            children: children
        }
    ]);

    constructor(plugin: SRPlugin) {
        super(plugin.app);
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

    async onOpen(): Promise<void> {
        this.plugin.bookNotesPaths = listOfNotePaths("review/book");
        // done: fix
        this.plugin.notesWithFlashcards = await init();
        this.modalElReactRoot = createRoot(this.modalEl);
        this.modalElReactRoot.render(
            <>
                <React.StrictMode>
                    <RouterProvider router={this.router}/>
                </React.StrictMode>
            </>
        );
    }

    onClose(): void {
        this.modalElReactRoot.unmount();
    }
}

export async function init() {
    const filePaths = listOfNotePaths("flashcards");
    // done: fix
    const notesWithFlashcards = filePaths.map((t: string) => new Book(t));
    for (const t of notesWithFlashcards) {
        await t.initialize();
    }
    return notesWithFlashcards;
}