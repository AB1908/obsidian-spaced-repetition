import React, { useEffect, useRef } from "react";
import { useLoaderData, useNavigate } from "react-router-dom";
import { HighlightBlock, NoteBlock } from "src/ui/components/display-blocks";
import { setIcon } from "src/infrastructure/obsidian-facade";
import { type Icon } from "src/types/obsidian-icons";
import { useAnnotationEditor } from "src/ui/routes/import/useAnnotationEditor";
import { getAnnotationById } from "src/api";
import { getNextAnnotationIdForSection, getPreviousAnnotationIdForSection } from "src/ui/routes/books/api";
import NavigationControl from "src/ui/components/NavigationControl";
import { pathGenerator } from "src/utils/path-generators";

export async function personalNoteLoader({ params }: any) {
    const { bookId, annotationId } = params;
    const annotation = await getAnnotationById(annotationId, bookId);
    return { annotation, bookId, sectionId: annotation.sectionId };
}

export function PersonalNotePage() {
    const { annotation, bookId, sectionId } = useLoaderData() as { annotation: any, bookId: string, sectionId: string };
    const navigate = useNavigate();
    const {
        personalNote,
        setPersonalNote,
        selectedCategory,
        handleCategoryClick,
        highlightColor,
        handleSave,
        handleDelete,
        navigateBack,
    } = useAnnotationEditor(annotation, bookId);

    const deleteButtonRef = useRef<HTMLDivElement>(null);
    const iconRefs = [
        useRef<HTMLDivElement>(null),
        useRef<HTMLDivElement>(null),
        useRef<HTMLDivElement>(null),
        useRef<HTMLDivElement>(null),
        useRef<HTMLDivElement>(null),
        useRef<HTMLDivElement>(null),
    ];

    const previousAnnotationId = getPreviousAnnotationIdForSection(bookId, sectionId, annotation.id);
    const nextAnnotationId = getNextAnnotationIdForSection(bookId, sectionId, annotation.id);

    const handleNavigate = (targetAnnotationId: string | null) => {
        if (targetAnnotationId) {
            // Re-using the same path generation logic, assuming the URL structure is compatible
            navigate(pathGenerator(window.location.pathname, { bookId, sectionId, annotationId: targetAnnotationId }, targetAnnotationId), { replace: true });
        }
    };

    useEffect(() => {
        const icons: Icon[] = ["lightbulb", "quote", "whole-word", "sticky-note", "star", "asterisk"];
        iconRefs.forEach((ref, i) => {
            if (ref.current) {
                setIcon(ref.current, icons[i]);
            }
        });
        if (deleteButtonRef.current) {
            setIcon(deleteButtonRef.current, "trash");
        }
    }, []);

    return (
        <div className="sr-personal-note-page">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
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
                <div style={{display: "flex", gap: "10px"}}>
                    <NavigationControl
                        onClick={() => handleNavigate(previousAnnotationId)}
                        isDisabled={!previousAnnotationId}
                        direction="previous"
                        navigationKey={annotation.id}
                    />
                    <NavigationControl
                        onClick={() => handleNavigate(nextAnnotationId)}
                        isDisabled={!nextAnnotationId}
                        direction="next"
                        navigationKey={annotation.id}
                    />
                    <button className="mod-warning" onClick={handleDelete} title="Delete Annotation">
                        <div ref={deleteButtonRef} />
                    </button>
                </div>
            </div>

            <HighlightBlock text={annotation.highlight} />
            <NoteBlock text={annotation.note} />

            <div className="sr-personal-note-input-container" style={{ marginTop: "20px" }}>
                <textarea
                    style={{ width: "100%", minHeight: "100px", padding: "10px", borderRadius: "4px", border: "1px solid var(--background-modifier-border)" }}
                    placeholder="Enter your own note here..."
                    value={personalNote}
                    onChange={(e) => setPersonalNote(e.target.value)}
                />
            </div>

            <div className="sr-category-buttons" style={{ display: "flex", justifyContent: "space-around", marginTop: "20px" }}>
                {iconRefs.map((ref, i) => (
                    <div
                        key={i}
                        className={`sr-category-button is-clickable ${selectedCategory === i ? "is-active" : ""}`}
                        onClick={() => handleCategoryClick(i)}
                        style={{
                            padding: "10px",
                            border: "2px solid",
                            borderColor: selectedCategory === i ? "var(--interactive-accent)" : "var(--background-modifier-border)",
                            borderRadius: "4px",
                            backgroundColor: selectedCategory === i ? "var(--background-modifier-hover)" : "transparent"
                        }}
                    >
                        <div ref={ref} />
                    </div>
                ))}
            </div>

            <div style={{ marginTop: "20px", display: "flex", gap: "10px" }}>
                <button className="mod-cta" onClick={handleSave}>Save</button>
                <button onClick={navigateBack}>Back</button>
            </div>
        </div>
    );
}
