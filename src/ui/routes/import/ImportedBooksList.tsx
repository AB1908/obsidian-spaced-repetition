import React from "react";
import { ImportedBook } from "src/ui/routes/import/import-export";

interface ImportedBooksListProps {
    reviewBooks: ImportedBook[];
    onAddClick: () => void;
    onBookClick: (bookId: string) => void;
}

export function ImportedBooksList({ reviewBooks, onAddClick, onBookClick }: ImportedBooksListProps) {
    return (
        <div className="sr-import-dashboard">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h2>Imported Books</h2>
                <button className="mod-cta" onClick={onAddClick}>Add new book</button>
            </div>
            
            {reviewBooks.length === 0 ? (
                <p>No books imported yet. Click "Add new book" to get started.</p>
            ) : (
                <div className="sr-book-list">
                    {reviewBooks.map(book => (
                        <div key={book.id} className="sr-book-list-item" style={{ borderBottom: "1px solid var(--background-modifier-border)"}}>
                            <div className="sr-book-summary" onClick={() => onBookClick(book.id)} style={{ padding: "10px 0", cursor: "pointer" }}>
                                <div className="sr-book-title">{book.name}</div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
