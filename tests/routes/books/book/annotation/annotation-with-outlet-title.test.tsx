import { annotationBreadcrumbTitle } from "src/ui/routes/books/book/annotation/annotation-with-outlet";

describe("AnnotationWithOutlet title handle", () => {
    test("AnnotationWithOutlet route handle returns book and section name as breadcrumb title", () => {
        const title = annotationBreadcrumbTitle({
            data: {
                bookName: "Atomic Habits",
                sectionName: "Chapter 1",
            },
        });

        expect(title).toBe("Atomic Habits / Chapter 1");
    });
});
