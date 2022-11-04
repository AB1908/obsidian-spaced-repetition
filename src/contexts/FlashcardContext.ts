import React from "react";
import { Card } from "src/scheduling";

interface FlaschardContextProps{
    handleShowAnswerButton: Function;
    handleFlashcardResponse: Function;
    isQuestion: boolean;
    card: Card;
}

export const FlashcardContext = React.createContext<FlaschardContextProps>(undefined);