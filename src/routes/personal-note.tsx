import React, { useEffect, useRef, useState } from "react";
import { useLoaderData, useParams, useNavigate } from "react-router-dom";
import { getAnnotationById } from "src/api";
import { HighlightBlock, NoteBlock } from "src/ui/components/display-blocks";
import { setIcon } from "obsidian";
import { Icon } from "src/routes/root";

export async function personalNoteLoader({ params }: any) {
    const { bookId, annotationId } = params;
    const annotation = await getAnnotationById(annotationId, bookId);
    return { annotation };
}

export function PersonalNotePage() {
    const { annotation } = useLoaderData() as { annotation: any };
    const [personalNote, setPersonalNote] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
    const navigate = useNavigate();

    // Refs for the 5 placeholder icons
    const iconRefs = [
        useRef<HTMLDivElement>(null),
        useRef<HTMLDivElement>(null),
        useRef<HTMLDivElement>(null),
        useRef<HTMLDivElement>(null),
        useRef<HTMLDivElement>(null),
    ];

    useEffect(() => {
        // Placeholder icons from Obsidian's library
        const icons: Icon[] = ["info", "check-circle", "help-circle", "alert-circle", "star"];
        iconRefs.forEach((ref, i) => {
            if (ref.current) {
                setIcon(ref.current, icons[i]);
            }
        });
    }, []);

    const handleCategoryClick = (index: number) => {
        setSelectedCategory(index);
    };

    const handleSave = () => {
        console.log("Saving Personal Note:", {
            annotationId: annotation.id,
            content: personalNote,
            category: selectedCategory !== null ? selectedCategory + 1 : null
        });
        // Logic for backend persistence will be added next
        navigate(-1);
    };

    return (
        <div className="sr-personal-note-page">
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
