import React, { useEffect, useRef, useState } from "react";
import { useLoaderData, useLocation, useNavigate, useParams } from "react-router-dom";
import { HighlightBlock, NoteBlock } from "src/ui/components/display-blocks";
import { setIcon } from "src/infrastructure/obsidian-facade";
import { useAnnotationEditor } from "src/ui/routes/import/useAnnotationEditor";
import { getAnnotationById } from "src/api";
import { getNextAnnotationIdForSection, getPreviousAnnotationIdForSection } from "src/ui/routes/books/api";
import NavigationControl from "src/ui/components/NavigationControl";
import { pathGenerator } from "src/utils/path-generators";
import {
    type CategoryConfig,
    resolveAnnotationCategories,
} from "src/config/annotation-categories";
import { getPluginContext } from "src/application/plugin-context";

export async function personalNoteLoader({ params }: any) {
    const { bookId, annotationId } = params;
    const annotation = await getAnnotationById(annotationId, bookId);
    return { annotation, bookId };
}

export function PersonalNotePage() {
    const { annotation, bookId } = useLoaderData() as { annotation: any, bookId: string };
    const navigate = useNavigate();
    const location = useLocation();
    const params = useParams();
    const {
        personalNote,
        setPersonalNote,
        selectedCategory,
        handleCategoryClick,
        highlightColor,
        handleSave,
        save,
        handleDelete,
        navigateBack,
    } = useAnnotationEditor(annotation, bookId);

    const plugin = getPluginContext() as any;
    const [categories, setCategories] = useState<CategoryConfig[]>(() =>
        resolveAnnotationCategories(plugin?.data?.settings?.annotationCategories)
    );
    const [newCategoryName, setNewCategoryName] = useState("");
    const [newCategoryError, setNewCategoryError] = useState("");

    const deleteButtonRef = useRef<HTMLDivElement>(null);
    const iconRefs = useRef<Array<HTMLDivElement | null>>([]);

    const previousAnnotationId = getPreviousAnnotationIdForSection(bookId, params.sectionId, annotation.id);
    const nextAnnotationId = getNextAnnotationIdForSection(bookId, params.sectionId, annotation.id);

    const handleNavigate = async (targetAnnotationId: string | null) => {
        if (targetAnnotationId) {
            await save();
            // Re-using the same path generation logic, assuming the URL structure is compatible
            navigate(pathGenerator(location.pathname, params, targetAnnotationId), { replace: true });
        }
    };


    useEffect(() => {
        categories.forEach((category, i) => {
            const iconRef = iconRefs.current[i];
            if (iconRef) {
                setIcon(iconRef, category.icon);
            }
        });
        if (deleteButtonRef.current) {
            setIcon(deleteButtonRef.current, "trash");
        }
    }, [categories]);

    const handleAddCategory = async () => {
        const trimmed = newCategoryName.trim();
        if (!trimmed) {
            setNewCategoryError("Category name is required.");
            return;
        }
        if (categories.some((category) => category.name.toLowerCase() === trimmed.toLowerCase())) {
            setNewCategoryError("Category already exists.");
            return;
        }

        const createdCategory = { name: trimmed, icon: "asterisk" as const };
        const nextCategories = [...categories, createdCategory];
        setCategories(nextCategories);
        setNewCategoryName("");
        setNewCategoryError("");

        if (plugin?.data?.settings) {
            plugin.data.settings.annotationCategories = nextCategories;
            if (typeof plugin.savePluginData === "function") {
                await plugin.savePluginData();
            }
        }
    };

    return (
        <div className="sr-personal-note-page">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    {highlightColor && (
                        <div
                            style={{
                                width: "20px",
                                height: "20px",
                                backgroundColor: highlightColor,
                                border: "1px solid var(--background-modifier-border)",
                                borderRadius: "4px"
                            }}
                            title={`Original highlight color: ${highlightColor}`}
                        />
                    )}
                    <h2>Edit Personal Note</h2>
                </div>
                <div>
                    <button className="mod-warning" onClick={handleDelete} title="Delete Annotation">
                        <div ref={deleteButtonRef} />
                    </button>
                </div>
            </div>

            <div className={"sr-annotation"}>
                <NavigationControl
                    onClick={() => handleNavigate(previousAnnotationId)}
                    isDisabled={!previousAnnotationId}
                    direction="previous"
                    navigationKey={annotation.id}
                />
                <div style={{ width: '100%' }}>
                    <HighlightBlock text={annotation.highlight} />
                    {annotation.note && <NoteBlock text={annotation.note} />}
                </div>
                <NavigationControl
                    onClick={() => handleNavigate(nextAnnotationId)}
                    isDisabled={!nextAnnotationId}
                    direction="next"
                    navigationKey={annotation.id}
                />
            </div>

            <div className="sr-personal-note-input-container" style={{ marginTop: "20px" }}>
                <textarea
                    style={{ width: "100%", minHeight: "100px", padding: "10px", borderRadius: "4px", border: "1px solid var(--background-modifier-border)" }}
                    placeholder="Enter your own note here..."
                    value={personalNote}
                    onChange={(e) => setPersonalNote(e.target.value)}
                />
            </div>

            <div className="sr-category-buttons" style={{ display: "flex", justifyContent: "space-around", marginTop: "20px" }}>
                {categories.map((category, i) => (
                    <div
                        key={category.name}
                        className={`sr-category-button is-clickable ${selectedCategory === category.name ? "is-active" : ""}`}
                        onClick={() => handleCategoryClick(category.name)}
                        style={{
                            padding: "10px",
                            border: "2px solid",
                            borderColor: selectedCategory === category.name ? "var(--interactive-accent)" : "var(--background-modifier-border)",
                            borderRadius: "4px",
                            backgroundColor: selectedCategory === category.name ? "var(--background-modifier-hover)" : "transparent"
                        }}
                    >
                        <div ref={(element) => { iconRefs.current[i] = element; }} />
                    </div>
                ))}
            </div>

            <div style={{ marginTop: "12px", display: "flex", gap: "8px", alignItems: "center" }}>
                <input
                    type="text"
                    placeholder="New category name"
                    value={newCategoryName}
                    onChange={(event) => setNewCategoryName(event.target.value)}
                />
                <button onClick={handleAddCategory}>Add category</button>
            </div>
            {newCategoryError && (
                <div style={{ marginTop: "8px", color: "var(--text-error)" }}>{newCategoryError}</div>
            )}

            <div style={{ marginTop: "20px", display: "flex", gap: "10px" }}>
                <button className="mod-cta" onClick={handleSave}>Save</button>
                <button onClick={navigateBack}>Back</button>
            </div>
        </div>
    );
}
