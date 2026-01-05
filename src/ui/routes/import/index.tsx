import { useLoaderData, Link } from "react-router-dom";
import React from "react";
import { getBookChapters, getSourceNoteById } from "src/api";

export async function bookDetailsLoader({ params }: any) {
    const { bookId } = params;
    if (!bookId) {
        throw new Error("Book ID is required.");
    }
    const bookDetails = await getSourceNoteById(bookId);
    const chapters = await getBookChapters(bookId);

    return { bookDetails, chapters, bookId };
}

export function BookDetailsPage() {
    const { bookDetails, chapters, bookId } = useLoaderData() as { bookDetails: any, chapters: any[], bookId: string };

    // const calculateProgress = () => {
    //     if (!bookDetails || !bookDetails.counts) return "N/A";
    //     const { annotations } = bookDetails.counts;
    //     const totalAnnotations = annotations.withFlashcards + annotations.withoutFlashcards;
    //     if (totalAnnotations === 0) return "No annotations yet.";
    //     const progress = (annotations.withFlashcards / totalAnnotations) * 100;
    //     return `${progress.toFixed(0)}% of annotations processed (${annotations.withFlashcards}/${totalAnnotations})`;
    // };

    return (
        <div className="sr-book-details-page">
            {/* <p><strong>Progress:</strong> {calculateProgress()}</p> */}

            <h3>Chapters</h3>
            {chapters && chapters.length > 0 ? (
                <ul className="sr-chapter-list">
                    {chapters.map((chapter: any) => (
                        <li key={chapter.id} className="tree-item-self is-clickable">
                            <Link to={`../chapters/${chapter.id}/annotations`} className="tree-item-inner">
                                {chapter.name}
                            </Link>
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No chapters found.</p>
            )}
        </div>
    );
}
