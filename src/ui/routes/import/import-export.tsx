import { useNavigate, useLoaderData } from "react-router-dom";
import React, { useState } from "react";
import { getImportedBooks, getUnimportedMrExptFiles, getSourcesForReview, ReviewBook } from "src/api";
import { ImportedBooksList } from "src/ui/routes/import/ImportedBooksList";
import { AddNewBook } from "src/ui/routes/import/AddNewBook";
import { useImportManager } from "src/ui/routes/import/useImportManager";

export async function importDashboardLoader() {
    const importedBooks = await getImportedBooks();
    const unimportedFiles = await getUnimportedMrExptFiles();
    return { importedBooks, unimportedFiles };
}

export interface ImportedBook {
    id: string;
    name: string;
    path: string;
    
}

export function ImportDashboard() {
    const { unimportedFiles, importedBooks } = useLoaderData() as { importedBooks: ImportedBook[], unimportedFiles: string[] };
    const [view, setView] = useState<"list" | "add">("list");
    const { isImporting, handleImportNewBook, handleSyncBook } = useImportManager();
    const navigate = useNavigate();

    // todo: refactor into route so we don't need a click handler
    // the book view is a separate page anyway
    const handleBookClick = (bookId: string) => {
        navigate(`books/${bookId}/details`);
    };

    if (view === "add") {
        return (
            <AddNewBook
                unimportedFiles={unimportedFiles}
                isImporting={isImporting}
                onBackClick={() => setView("list")}
                onImportNewBook={handleImportNewBook}
            />
        );
    }

    return (
        <ImportedBooksList
            reviewBooks={importedBooks}
            onAddClick={() => setView("add")}
            onBookClick={handleBookClick}
        />
    );
}
