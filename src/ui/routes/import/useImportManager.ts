import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { importMoonReaderExport, updateBookAnnotationsAndFrontmatter } from "src/api";
import { ObsidianNotice } from "src/infrastructure/obsidian-facade";
import { BookFrontmatter } from "src/data/models/AnnotationsNote";

export function useImportManager() {
    const [isImporting, setIsImporting] = useState(false);
    const navigate = useNavigate();

    const handleImportNewBook = async (mrexptPath: string) => {
        setIsImporting(true);
        try {
            const folderPath = mrexptPath.split('/').slice(0, -1).join('/') || "/";
            const annotationsPath = await importMoonReaderExport(mrexptPath, folderPath);
            new ObsidianNotice(`Successfully imported annotations to ${annotationsPath}`);
            navigate(0);
        } catch (e: any) {
            console.error(e);
            new ObsidianNotice(`Import failed: ${e.message}`);
        } finally {
            setIsImporting(false);
        }
    };

    const handleSyncBook = async (book: BookFrontmatter) => {
        setIsImporting(true);
        try {
            await updateBookAnnotationsAndFrontmatter(
                book.annotationsPath,
                book.path,
                book.lastExportedID.toString()
            );
            navigate(0);
            new ObsidianNotice(`Successfully synced new annotations for ${book.title}.`);
        } catch (e: any) {
            console.error(e);
            new ObsidianNotice("Sync failed. Check console for details.");
        } finally {
            setIsImporting(false);
        }
    };

    return {
        isImporting,
        handleImportNewBook,
        handleSyncBook,
    };
}
