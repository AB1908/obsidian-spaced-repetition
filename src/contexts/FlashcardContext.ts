import React from "react";
import {Card} from "src/Card";
import {Flashcard} from "src/data/models/flashcard";

interface FlashcardContextProps{
    handleShowAnswerButton: Function;
    handleFlashcardResponse: Function;
    isQuestion: boolean;
    card: Card|Flashcard;
}

export const FlashcardContext = React.createContext<FlashcardContextProps>(undefined);
