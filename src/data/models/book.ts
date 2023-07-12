import {getFileContents} from "src/disk";
import {parseAnnotations} from "src/data/import/annotations";
import {CachedMetadata, HeadingCache, SectionCache} from "obsidian";

export interface book {
    id: string;
    name: string;
    sections: Section[];
}

interface Section {
    id: string;
    title: string;
    sections: (Section|Annot)[];
}

export interface Annot {
    id: string;
    color: string;
    highlight: string;
    note: string;
    flashcards: string[]
}

function isSection(sections: any) {
    return sections.hasOwnProperty("sections");
}

function isAnnotation(sections: any) {
    return sections.hasOwnProperty("highlight");
}

// This is terrible. Save me.
function writeCountToObj(mem: any, sectionId: string, count: number, key: string) {
    Object.assign(mem, {[`${sectionId}`]: {...mem[sectionId], [key]: count}});
}

/*
This function is invoked twice to do a section tree walk, to figure out how many annotations have flashcards associated
with them and how many don't. I couldn't find a cleaner way of doing it without being too clever for myself.
 */
function countAnnotations(sections: any, mem: any, injectedCondition: (sections: any) => boolean, key: string) {
    let count = 0;
    if (isSection(sections)) {
        for (let section of sections.sections) {
            count += countAnnotations(section, mem, injectedCondition, key);
        }
        writeCountToObj(mem, sections.id, count, key);
    } else if (isAnnotation(sections)) {
        if (injectedCondition(sections)) {
            count += 1
        }
    }
    return count;
}

// TODO: switch to DFS/BFS?
export function AnnotationCount(sections: any) {
    let mem = {};
    // @ts-ignore
    mem[sections.id] = {
        "without": countAnnotations(sections, mem, (sections: any) => sections.flashcards.length == 0, "without"),
        "with": countAnnotations(sections, mem, (sections: any) => sections.flashcards.length != 0, "with")
    }
    return mem;
}

// export const deck: () => Book = () => {return {
//     id: "ad9fm31s",
//     name: "Book 1",
//     sections: [
//         {
//             id: "d01812ba",
//             title: "Chapter 1",
//             sections: [
//                 {
//                     id: "d91maa3h",
//                     color: "#339122",
//                     highlight: "Onen i-Estel Edain, ú-chebin estel anim.",
//                     note: "What a beautiful line by Tolkien",
//                     flashcards: [
//                         "ks991kna",
//                     ]
//                 },
//                 {
//                     id: "d91ms7d",
//                     color: "#338122",
//                     highlight: "This is a sample highlight but without a note",
//                     //TODO: think about whether this should be a null or an empty string on the backend
//                     note: "",
//                     flashcards: []
//                 },
//                 {
//                     id: 'sadf89u',
//                     title: "Section 1",
//                     sections: [
//                         {
//                             id: "9dk1m3jg",
//                             color: "#338122",
//                             highlight: "This is a sample highlight but without a note but also in chapter 1",
//                             //TODO: think about whether this should be a null or an empty string on the backend
//                             note: "",
//                             flashcards: []
//                         }
//                     ]
//                 },
//                 {
//                     id: "9dk1m3jg",
//                     color: "#338122",
//                     highlight: "This is a sample highlight but without a note but also in chapter 1",
//                     //TODO: think about whether this should be a null or an empty string on the backend
//                     note: "",
//                     flashcards: []
//                 }
//             ],
//         },
//         {
//             id: "nw81ng73",
//             title: "Chapter 2",
//             sections: [
//             ],
//         },
//     ]
// }};
export const deck: () => book = () => {return {
    id: "ad9fm31s",
    name: "Book 1",
    sections: [
        {
            id: "d01812ba",
            title: "Chapter 1",
            with: 1,
            without: 3,
            sections: [
                {
                    id: 'sadf89u',
                    title: "Section 1",
                    with: 0,
                    without: 1,
                    sections: [
                    ]
                },
            ],
        },
        {
            id: "nw81ng73",
            title: "Chapter 2",
            with: 0,
            without: 0,
            sections: [
            ],
        },
    ]
}};