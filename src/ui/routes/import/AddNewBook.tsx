import React from "react";

interface AddNewBookProps {
    unimportedFiles: string[];
    isImporting: boolean;
    onBackClick: () => void;
    onImportNewBook: (mrexptPath: string) => void;
}

export function AddNewBook({ unimportedFiles, isImporting, onBackClick, onImportNewBook }: AddNewBookProps) {
    return (
        <div className="sr-import-add-view">
            <button onClick={onBackClick}>&larr; Back to Imported Books</button>
            <h2>Add New Book</h2>
            <p>Select a `.mrexpt` file to import.</p>
            {unimportedFiles.length === 0 ? (
                <p>No new export files found.</p>
            ) : (
                <ul className="sr-deck-tree">
                    {unimportedFiles.map(path => (
                        <li key={path} className="tree-item-self is-clickable" onClick={() => onImportNewBook(path)}>
                            <div className="tree-item-inner">{path.split('/').pop()}</div>
                        </li>
                    ))}
                </ul>
            )}
            {isImporting && <div className="sr-importing-spinner">Importing...</div>}
        </div>
    );
}
