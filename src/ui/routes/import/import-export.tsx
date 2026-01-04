import { useNavigate, useLoaderData } from "react-router-dom";
import React, { useState } from "react";
import { getImportedBooks, getUnimportedMrExptFiles, getSourcesForReview, ReviewBook } from "src/api";
import { BookFrontmatter } from "src/data/models/sourceNote";
import { ImportedBooksList } from "src/ui/routes/import/ImportedBooksList";
import { AddNewBook } from "src/ui/routes/import/AddNewBook";
import { useImportManager } from "src/ui/routes/import/useImportManager";

export async function importDashboardLoader() {
    const reviewBooks = getSourcesForReview();
    const importedBooks = await getImportedBooks();
    const unimportedFiles = await getUnimportedMrExptFiles();
    return { reviewBooks, importedBooks, unimportedFiles };
}

export function ImportDashboard() {
    const { reviewBooks, unimportedFiles } = useLoaderData() as { reviewBooks: ReviewBook[], importedBooks: BookFrontmatter[], unimportedFiles: string[] };
    const [view, setView] = useState<"list" | "add">("list");
    const { isImporting, handleImportNewBook, handleSyncBook } = useImportManager();
    const navigate = useNavigate();

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
            reviewBooks={reviewBooks}
            onAddClick={() => setView("add")}
            onBookClick={handleBookClick}
        />
    );
}
