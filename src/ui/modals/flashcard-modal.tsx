import React from "react";
import { Modal, Notice } from "obsidian";
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
            element: <Root handleCloseButton={() => this.close()} />,
            errorElement: <ErrorPage />,
            children: children
        }
    ]);

    constructor(plugin: SRPlugin) {
        super(plugin.app);
        this.plugin = plugin;
        this.modalEl.addClass("sr-modal");
    }

    async onOpen(): Promise<void> {
        // todo: refactor to move business logic out of modal creation
        // todo: refactor tag into a plugin setting
        this.plugin.bookNotesPaths = listOfNotePaths("review/book");
        this.plugin.notesWithFlashcards = await init();
        this.modalElReactRoot = createRoot(this.modalEl);
        this.modalElReactRoot.render(
            <>
                <React.StrictMode>
                    <RouterProvider router={this.router} />
                </React.StrictMode>
            </>
        );
    }

    onClose(): void {
        this.modalElReactRoot.unmount();
    }
}

// todo: move elsewhere
export async function init() {
    const filePaths = listOfNotePaths("flashcards");
    // done: fix
    const notesWithFlashcards = filePaths.map((t: string) => new Book(t));
    for (const t of notesWithFlashcards) {
        try {
            await t.initialize();
        } catch (e) {
            // WARNING! this is dangerous, I am catching other errors and just assuming that these are this error
            console.error(e);
            console.error(`init: unable to initialize book ${t.annotationPath}`);
            new Notice("Error: Unable to parse legacy SRS flashcards. Try removing the #flashcards tag from files with SRS flashcards.");
        }
    }
    return notesWithFlashcards;
}