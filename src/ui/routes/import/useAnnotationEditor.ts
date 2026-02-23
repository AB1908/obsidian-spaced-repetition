import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { updateAnnotationMetadata, softDeleteAnnotation } from "src/api";
import { integerToRGBA } from "src/utils/utils";

export interface Annotation {
    id: string;
    highlight: string;
    note: string;
    personalNote?: string;
    category?: string | null;
    originalColor?: number;
}

export function useAnnotationEditor(initialAnnotation: Annotation, bookId: string) {
    const [personalNote, setPersonalNote] = useState(initialAnnotation.personalNote || "");
    const [selectedCategory, setSelectedCategory] = useState<string | null>(
        initialAnnotation.category !== undefined ? initialAnnotation.category : null
    );
    const navigate = useNavigate();

    const highlightColor = useMemo(() => {
        if (initialAnnotation.originalColor) {
            return integerToRGBA(initialAnnotation.originalColor);
        }
        return null;
    }, [initialAnnotation.originalColor]);

    const handleCategoryClick = (categoryName: string) => {
        setSelectedCategory(selectedCategory === categoryName ? null : categoryName);
    };

    const save = async () => {
        await updateAnnotationMetadata(bookId, initialAnnotation.id, {
            personalNote: personalNote,
            category: selectedCategory !== null ? selectedCategory : undefined,
        });
    }

    const handleSave = async () => {
        await save();
        navigate(-1);
    };

    const handleDelete = async () => {
        if (confirm("Are you sure you want to delete this annotation?")) {
            await softDeleteAnnotation(bookId, initialAnnotation.id);
            navigate(-1);
        }
    };

    return {
        personalNote,
        setPersonalNote,
        selectedCategory,
        setSelectedCategory,
        handleCategoryClick,
        highlightColor,
        handleSave,
        save,
        handleDelete,
        navigateBack: () => navigate(-1),
    };
}
