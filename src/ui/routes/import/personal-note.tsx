import React, { useEffect, useRef, useState } from "react";
import { useLoaderData, useLocation, useNavigate, useParams } from "react-router-dom";
import { getPluginContext } from "src/application/plugin-context";
import { resolveAnnotationCategories } from "src/config/annotation-categories";
import { HighlightBlock, NoteBlock } from "src/ui/components/display-blocks";
import { setIcon } from "src/infrastructure/obsidian-facade";
import { getAnnotationById, getBreadcrumbData, softDeleteAnnotation } from "src/api";
import { getNextAnnotationIdForSection, getPreviousAnnotationIdForSection } from "src/ui/routes/books/api";
import NavigationControl from "src/ui/components/NavigationControl";
import { pathGenerator } from "src/utils/path-generators";
import { integerToRGBA } from "src/utils/utils";
import { AnnotationEditorCard } from "src/ui/routes/import/AnnotationEditorCard";
import { CategoryEditorModal } from "src/ui/modals/CategoryEditorModal";
import type { Annotation } from "src/ui/routes/import/useAnnotationEditor";

export async function personalNoteLoader({ params }: any) {
    const { bookId, sectionId, annotationId } = params;
    const annotation = await getAnnotationById(annotationId, bookId);
    const { bookName, sectionName } = getBreadcrumbData(bookId, sectionId);
    return { annotation, bookId, bookName, sectionName };
}

export function PersonalNotePage() {
    const { annotation, bookId } = useLoaderData() as { annotation: Annotation, bookId: string };
    const plugin = getPluginContext() as any;
    const navigate = useNavigate();
    const location = useLocation();
    const params = useParams();
    const deleteButtonRef = useRef<HTMLDivElement>(null);
    const currentSaveRef = useRef<() => Promise<void>>(async () => {});
    const highlightColor = annotation.originalColor ? integerToRGBA(annotation.originalColor) : null;
    const [categories, setCategories] = useState(() =>
        resolveAnnotationCategories(plugin?.data?.settings?.annotationCategories)
    );

    const previousAnnotationId = getPreviousAnnotationIdForSection(bookId, params.sectionId, annotation.id);
    const nextAnnotationId = getNextAnnotationIdForSection(bookId, params.sectionId, annotation.id);

    const handleNavigate = async (targetAnnotationId: string | null) => {
        if (targetAnnotationId) {
            await currentSaveRef.current();
            // Re-using the same path generation logic, assuming the URL structure is compatible
            navigate(pathGenerator(location.pathname, params, targetAnnotationId), { replace: true });
        }
    };

    const handleDelete = async () => {
        if (confirm("Are you sure you want to delete this annotation?")) {
            await softDeleteAnnotation(bookId, annotation.id);
            navigate(-1);
        }
    };

    useEffect(() => {
        if (deleteButtonRef.current) {
            setIcon(deleteButtonRef.current, "trash");
        }
    }, []);

    const handleOpenCategoryEditor = () => {
        const getOrphanCount = (categoryName: string): number => {
            const books = plugin?.annotationsNoteIndex?.getAllAnnotationsNotes?.() ?? [];
            return books.reduce((count: number, book: any) => {
                const annotations = typeof book?.annotations === "function" ? book.annotations() : [];
                return count + annotations.filter((item: any) => item?.category === categoryName).length;
            }, 0);
        };

        const modal = new CategoryEditorModal(
            plugin?.app,
            categories,
            async (updatedCategories) => {
                if (plugin?.data?.settings) {
                    plugin.data.settings.annotationCategories = updatedCategories;
                }
                if (typeof plugin?.savePluginData === "function") {
                    await plugin.savePluginData();
                }
                setCategories(updatedCategories);
            },
            getOrphanCount
        );
        modal.open();
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

            <AnnotationEditorCard
                key={annotation.id}
                annotation={annotation}
                bookId={bookId}
                categories={categories}
                onManageCategories={handleOpenCategoryEditor}
                previousAnnotationId={previousAnnotationId}
                nextAnnotationId={nextAnnotationId}
                onSaveReady={(saveFn) => {
                    currentSaveRef.current = saveFn;
                }}
            />
        </div>
    );
}
