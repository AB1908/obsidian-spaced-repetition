import { useNavigate } from "react-router-dom";
import React, { useState, useEffect } from "react";
import { getImportedBooks, getUnimportedMrExptFiles, importMoonReaderExport, updateBookAnnotationsAndFrontmatter, getSourcesForReview, ReviewBook, BookFrontmatter } from "src/api";
import { ObsidianNotice } from "src/obsidian-facade";

export function ImportDashboard() {
    const [importedBooks, setImportedBooks] = useState<BookFrontmatter[]>([]);
    const [unimportedFiles, setUnimportedFiles] = useState<string[]>([]);
    const [view, setView] = useState<"list" | "add">("list");
    const [isLoading, setIsLoading] = useState(true);
    const [isImporting, setIsImporting] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (view === "list") {
            loadImportedBooks();
        } else {
            loadUnimportedFiles();
        }
    }, [view]);

    async function loadImportedBooks() {
        setIsLoading(true);
        try {
            const books = await getImportedBooks();
            setImportedBooks(books);
        } catch (e) {
            console.error(e);
            new ObsidianNotice("Failed to load imported books.");
        } finally {
            setIsLoading(false);
        }
    }

    async function loadUnimportedFiles() {
        setIsLoading(true);
        try {
            const files = await getUnimportedMrExptFiles();
            setUnimportedFiles(files);
        } catch (e) {
            console.error(e);
            new ObsidianNotice("Failed to load unimported files.");
        } finally {
            setIsLoading(false);
        }
    }

    const handleImportNewBook = async (mrexptPath: string) => {
        setIsImporting(true);
        try {
            const annotationsPath = await importMoonReaderExport(mrexptPath);
            new ObsidianNotice(`Successfully imported annotations from ${mrexptPath}`);
            setView("list"); // Switch back to the list view
        } catch (e) {
            console.error(e);
            new ObsidianNotice(`Import failed: ${e.message}`);
        } finally {
            setIsImporting(false);
        }
    };
    
    // Placeholder for the sync functionality
    const handleSyncBook = async (book: BookFrontmatter) => {
        setIsImporting(true); // Re-using isImporting for sync operation visual feedback
        try {
            await updateBookAnnotationsAndFrontmatter(
                book.annotationsPath, // Assuming book.annotationsPath will be available
                book.path,
                book.lastExportedID.toString()
            );
            await loadImportedBooks(); // Reload the list to show updated status
            new ObsidianNotice(`Successfully synced new annotations for ${book.title}.`);
        } catch (e) {
            console.error(e);
            new ObsidianNotice("Sync failed. Check console for details.");
        } finally {
            setIsImporting(false);
        }
    };

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (view === "add") {
        return (
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
            
            {importedBooks.length === 0 ? (
                <p>No books imported yet. Click "Add new book" to get started.</p>
            ) : (
                <div className="sr-book-list">
                    {importedBooks.map(book => (
                        <div key={book.path} className="sr-book-list-item" style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid var(--background-modifier-border)"}}>
                            <div>
                                <div className="sr-book-title">{book.title}</div>
                                <div className="sr-book-author" style={{ fontSize: "0.9em", color: "var(--text-muted)"}}>{book.author || "Unknown Author"}</div>
                                <div className="sr-book-path" style={{ fontSize: "0.8em", color: "var(--text-faint)"}}>{book.path}</div>
                            </div>
                            <button onClick={() => handleSyncBook(book)}>Sync</button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
