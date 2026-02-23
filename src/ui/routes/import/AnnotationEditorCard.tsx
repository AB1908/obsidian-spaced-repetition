import React, { useEffect } from "react";
import { CategoryFilter } from "src/ui/components/category-filter";
import { getPluginContext } from "src/application/plugin-context";
import { resolveAnnotationCategories } from "src/config/annotation-categories";
import { useAnnotationEditor, type Annotation } from "src/ui/routes/import/useAnnotationEditor";

interface AnnotationEditorCardProps {
    annotation: Annotation;
    bookId: string;
    previousAnnotationId: string | null;
    nextAnnotationId: string | null;
    onSaveReady?: (saveFn: () => Promise<void>) => void;
}

export function AnnotationEditorCard({
    annotation,
    bookId,
    previousAnnotationId,
    nextAnnotationId,
    onSaveReady,
}: AnnotationEditorCardProps) {
    const {
        personalNote,
        setPersonalNote,
        selectedCategory,
        setSelectedCategory,
        handleSave,
        navigateBack,
        save,
    } = useAnnotationEditor(annotation, bookId);
    void previousAnnotationId;
    void nextAnnotationId;

    const plugin = getPluginContext() as any;
    const categories = resolveAnnotationCategories(plugin?.data?.settings?.annotationCategories);

    useEffect(() => {
        onSaveReady?.(save);
    }, [onSaveReady, save]);

    return (
        <>
            <div className="sr-personal-note-input-container" style={{ marginTop: "20px" }}>
                <textarea
                    style={{ width: "100%", minHeight: "100px", padding: "10px", borderRadius: "4px", border: "1px solid var(--background-modifier-border)" }}
                    placeholder="Enter your own note here..."
                    value={personalNote}
                    onChange={(e) => setPersonalNote(e.target.value)}
                />
            </div>

            <div style={{ marginTop: "20px" }}>
                <CategoryFilter
                    categories={categories}
                    selectedCategory={selectedCategory}
                    onCategorySelect={setSelectedCategory}
                />
            </div>

            <div style={{ marginTop: "12px" }}>
                <button type="button" disabled>
                    Manage categories (coming soon)
                </button>
            </div>

            <div style={{ marginTop: "20px", display: "flex", gap: "10px" }}>
                <button className="mod-cta" onClick={handleSave}>Save</button>
                <button onClick={navigateBack}>Back</button>
            </div>
        </>
    );
}
