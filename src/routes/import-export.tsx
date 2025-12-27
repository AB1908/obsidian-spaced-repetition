import { useLoaderData, useNavigate } from "react-router-dom";
import React, { useState } from "react";
import { Notice } from "obsidian";
import { getImportableExports, getDestinationFolders, importMoonReaderExport } from "src/api";

export function importLoader() {
    return {
        exports: getImportableExports(),
        folders: getDestinationFolders()
    };
}

export function ImportDashboard() {
    const { exports, folders } = useLoaderData() as { exports: string[], folders: string[] };
    const [selectedExport, setSelectedExport] = useState<string | null>(null);
    const [targetFolder, setTargetFolder] = useState<string>("/");
    const [isImporting, setIsImporting] = useState(false);
    const navigate = useNavigate();

    const handleImport = async () => {
        if (!selectedExport) return;

        setIsImporting(true);
        try {
            const annotationsPath = await importMoonReaderExport(selectedExport, targetFolder);
            new Notice(`Imported to ${annotationsPath}`);
            // TODO: In the future, we should probably redirect to a view that processes these annotations
            // For now, let's just go back to the books list or stay here
            navigate("/books");
        } catch (e) {
            console.error(e);
            new Notice("Import failed. Check console for details.");
        } finally {
            setIsImporting(false);
        }
    };

    return (
        <div className="sr-import-dashboard">
            <h2>Import Annotations</h2>
            
            <div className="sr-import-layout" style={{ display: 'flex', gap: '20px' }}>
                <div className="sr-export-list" style={{ flex: 1 }}>
                    <h3>Available Exports (.mrexpt)</h3>
                    <ul className="sr-deck-tree">
                        {exports.length === 0 && <li>No exports found in vault.</li>}
                        {exports.map((path) => (
                            <li 
                                key={path} 
                                className={`sr-deck tree-item-self is-clickable ${selectedExport === path ? 'is-selected' : ''}`}
                                onClick={() => setSelectedExport(path)}
                                style={selectedExport === path ? { backgroundColor: 'var(--background-modifier-hover)' } : {}}
                            >
                                <div className="tree-item-inner">{path.split('/').pop()}</div>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="sr-import-details" style={{ flex: 1, padding: '10px', border: '1px solid var(--background-modifier-border)' }}>
                    {selectedExport ? (
                        <>
                            <h3>Import Settings</h3>
                            <p><strong>File:</strong> {selectedExport.split('/').pop()}</p>
                            
                            <div className="sr-setting">
                                <label>Destination Folder:</label>
                                <select 
                                    value={targetFolder} 
                                    onChange={(e) => setTargetFolder(e.target.value)}
                                    style={{ width: '100%', marginTop: '5px' }}
                                >
                                    {folders.map(f => (
                                        <option key={f} value={f}>{f}</option>
                                    ))}
                                </select>
                            </div>

                            <button 
                                className="mod-cta" 
                                style={{ marginTop: '20px', width: '100%' }}
                                onClick={handleImport}
                                disabled={isImporting}
                            >
                                {isImporting ? "Importing..." : "Import & Process"}
                            </button>
                        </>
                    ) : (
                        <p>Select an export file from the list to begin.</p>
                    )}
                </div>
            </div>
        </div>
    );
}
