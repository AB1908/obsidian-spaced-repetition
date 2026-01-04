import React from "react";
import { useLoaderData } from "react-router";
import { Link } from "react-router-dom";
import { USE_ACTUAL_BACKEND } from "src/ui/routes/books/review";
import { getBookChapters } from "src/api";

export interface ChapterLoaderParams {
    bookId: string;
}

export function chapterLoader({ params }: { params: ChapterLoaderParams }) {
    if (USE_ACTUAL_BACKEND) {
        return getBookChapters(params.bookId);
    } else {
        // This else block might need adjustment depending on the mock server setup
        return fetch(`http://localhost:3000/books/${params.bookId}/chapters`);
    }
}

export function ChapterList() {
    const chapters = useLoaderData() as { id: string, name: string }[];
    return (
        <>
            <p>Add flashcards from:</p>
            <div className={"chapter-tree"}>
                <ul className="sr-chapter-list">
                    {chapters.map((chapter: any) => (
                        <li key={chapter.id} className="tree-item-self is-clickable">
                            <Link to={`${chapter.id}/annotations`} className="tree-item-inner">
                                {chapter.name}
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>
        </>
    );
}