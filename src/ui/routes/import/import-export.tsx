import { useNavigate, useLoaderData } from "react-router-dom";
import React, { useState, useEffect } from "react";
import { getImportedBooks, getUnimportedMrExptFiles, importMoonReaderExport, updateBookAnnotationsAndFrontmatter, getSourcesForReview, ReviewBook, BookFrontmatter } from "src/api";
import { ObsidianNotice } from "src/infrastructure/obsidian-facade";

export async function importDashboardLoader() {
    const reviewBooks = getSourcesForReview();
    const importedBooks = await getImportedBooks();
    const unimportedFiles = await getUnimportedMrExptFiles();
    return { reviewBooks, importedBooks, unimportedFiles };
}

export function ImportDashboard() {
        const { reviewBooks, importedBooks, unimportedFiles } = useLoaderData() as { reviewBooks: ReviewBook[], importedBooks: BookFrontmatter[], unimportedFiles: string[] };
        const [view, setView] = useState<"list" | "add">("list");
        const [isImporting, setIsImporting] = useState(false);
        const navigate = useNavigate();
    
        const handleBookClick = (bookId: string) => {
            navigate(`books/${bookId}/details`);
        };
        
        const handleImportNewBook = async (mrexptPath: string) => {
            setIsImporting(true);
            try {
                // For now, use the same folder as the .mrexpt file as destination
                const folderPath = mrexptPath.split('/').slice(0, -1).join('/') || "/";
                const annotationsPath = await importMoonReaderExport(mrexptPath, folderPath);
                new ObsidianNotice(`Successfully imported annotations to ${annotationsPath}`);
                navigate(0); // Re-run loader to update book list
            } catch (e) {
                console.error(e);
                new ObsidianNotice(`Import failed: ${e.message}`);
            } finally {
                setIsImporting(false);
            }
        };
        
        const handleSyncBook = async (book: BookFrontmatter) => {
            setIsImporting(true); // Re-using isImporting for sync operation visual feedback
            try {
                await updateBookAnnotationsAndFrontmatter(
                    book.annotationsPath,
                    book.path,
                    book.lastExportedID.toString()
                );
                navigate(0); // Re-run loader to update book list
                new ObsidianNotice(`Successfully synced new annotations for ${book.title}.`);
            } catch (e) {
                console.error(e);
                new ObsidianNotice("Sync failed. Check console for details.");
            } finally {
                setIsImporting(false);
            }
        };
    
        if (view === "add") {        return (
            <div className="sr-import-add-view">
                <button onClick={() => setView("list")}>&larr; Back to Imported Books</button>
                <h2>Add New Book</h2>
                <p>Select a `.mrexpt` file to import.</p>
                {unimportedFiles.length === 0 ? (
                    <p>No new export files found.</p>
                ) : (
                    <ul className="sr-deck-tree">
                        {unimportedFiles.map(path => (
                            <li key={path} className="tree-item-self is-clickable" onClick={() => handleImportNewBook(path)}>
                                <div className="tree-item-inner">{path.split('/').pop()}</div>
                            </li>
                        ))}
                    </ul>
                )}
                {isImporting && <div className="sr-importing-spinner">Importing...</div>}
            </div>
        );
    }

    return (
        <div className="sr-import-dashboard">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h2>Imported Books</h2>
                <button className="mod-cta" onClick={() => setView("add")}>Add new book</button>
            </div>
            
            {reviewBooks.length === 0 ? (
                <p>No books imported yet. Click "Add new book" to get started.</p>
            ) : (
                <div className="sr-book-list">
                    {reviewBooks.map(book => (
                        <div key={book.id} className="sr-book-list-item" style={{ borderBottom: "1px solid var(--background-modifier-border)"}}>
                            <div className="sr-book-summary" onClick={() => handleBookClick(book.id)} style={{ padding: "10px 0", cursor: "pointer" }}>
                                <div className="sr-book-title">{book.name}</div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
