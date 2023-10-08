import { nanoid } from "nanoid";
import { getFileContents, getMetadataForFile } from "../disk";
import { Flashcard } from "./flashcard";
import { Heading } from "./book";

interface paragraph {
    id: string,
    text: string,
    wasIdPresent: boolean,
    hasFlashcards: boolean
}

// todo: edge case where there are no headings
export async function extractParagraphs(filePath: string, flashcards: Flashcard[]): Promise<paragraph[]> {
    const metadata = getMetadataForFile(filePath);
    // get blocks with blockid if present
    const paragraphsOrHeadings = metadata?.sections?.filter(t => t.type == "paragraph" || t.type == "heading");
    if (!paragraphsOrHeadings) {
        throw new Error(`getParagraphsFromFile: no paragraphs found in file ${filePath}`)
    }
    let headingIndex = 0;
    const headings = metadata?.headings;
    const fileContents = await getFileContents(filePath);
    const fileContentsArray = fileContents.split("\n");
    const processedData: paragraph[] = [];
    const paragraphsWithFlashcards = new Set(flashcards.map(t => t.annotationId));
    for (let section of paragraphsOrHeadings) {
        if (section.type == "paragraph") {
            const start = section.position.start.line;
            const end = section.position.end.line + 1;
            const paragraph = {
                id: section.id || nanoid(8),
                text: fileContentsArray.slice(start,end).join("\n"),
                wasIdPresent: section.id ? true : false,
            }
            processedData.push({
                ...paragraph,
                hasFlashcards: paragraphsWithFlashcards.has(paragraph.id), ...paragraph,
            })
        } else if (section.type == "heading") {
            // todo: this is an interesting type problem
            // whenever section.type is heading
            // we are guaranteed that headings is not null
            // therefore, we shouldn't have to worry about headings being undefined
            // and won't need to catch errors for that scenario
            // @ts-ignore
            processedData.push(new Heading(headings[headingIndex++]));
        }
    }
    return processedData;
    // still need header info
    // create interface from these attribs
}