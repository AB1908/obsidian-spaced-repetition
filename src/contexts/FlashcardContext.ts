import React from "react";
import {Card} from "src/Card";

interface FlashcardContextProps{
    handleShowAnswerButton: Function;
    handleFlashcardResponse: Function;
    isQuestion: boolean;
    card: Card;
}

export const FlashcardContext = React.createContext<FlashcardContextProps>(undefined);
