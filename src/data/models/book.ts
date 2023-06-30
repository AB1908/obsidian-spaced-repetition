export interface Book {
    id: string;
    name: string;
    sections: Section[];
}

interface Section {
    id: string;
    title: string;
    sections: (Section|Annot)[];
}

interface Annot {
    id: string;
    color: string;
    highlight: string;
    note: string;
    flashcards: string[]
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
export const deck: () => Book = () => {return {
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
