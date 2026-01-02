import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLoaderData, useParams, useNavigate } from "react-router-dom";
import { getAnnotationById, updateAnnotationMetadata, softDeleteAnnotation } from "src/api";
import { HighlightBlock, NoteBlock } from "src/ui/components/display-blocks";
import { setIcon } from "src/infrastructure/obsidian-facade";
import { type Icon } from "src/types/obsidian-icons";
import { integerToRGBA } from "src/utils/utils";

export async function personalNoteLoader({ params }: any) {
    const { bookId, annotationId } = params;
    const annotation = await getAnnotationById(annotationId, bookId);
    return { annotation, bookId };
}

export function PersonalNotePage() {
    const { annotation, bookId } = useLoaderData() as { annotation: any, bookId: string };
    const [personalNote, setPersonalNote] = useState(annotation.personalNote || "");
    const [selectedCategory, setSelectedCategory] = useState<number | null>(annotation.category !== undefined ? annotation.category : null);
    const navigate = useNavigate();
    const deleteButtonRef = useRef<HTMLDivElement>(null);
    const highlightColor = useMemo(() => {
        if (annotation.originalColor) {
            return integerToRGBA(annotation.originalColor);
        }
        return null;
    }, [annotation.originalColor]);

    // Refs for the 5 placeholder icons
    const iconRefs = [
        useRef<HTMLDivElement>(null),
        useRef<HTMLDivElement>(null),
        useRef<HTMLDivElement>(null),
        useRef<HTMLDivElement>(null),
        useRef<HTMLDivElement>(null),
        useRef<HTMLDivElement>(null),
    ];

    useEffect(() => {
        // Placeholder icons from Obsidian's library
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

    const handleCategoryClick = (index: number) => {
        setSelectedCategory(index);
    };

    const handleSave = async () => {
        await updateAnnotationMetadata(bookId, annotation.id, {
            personalNote: personalNote,
            category: selectedCategory !== null ? selectedCategory : undefined
        });
        navigate(-1);
    };

    const handleDelete = async () => {
        if (confirm("Are you sure you want to delete this annotation?")) {
            await softDeleteAnnotation(bookId, annotation.id);
            navigate(-1);
        }
    };

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
                <button className="mod-warning" onClick={handleDelete} title="Delete Annotation">
                    <div ref={deleteButtonRef} />
                </button>
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
                <button onClick={() => navigate(-1)}>Back</button>
            </div>
        </div>
    );
}
