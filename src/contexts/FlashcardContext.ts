import React from "react";
import { CardInterface } from "src/scheduling";

interface FlaschardContextProps{
    handleShowAnswerButton: Function;
    handleFlashcardResponse: Function;
    isQuestion: boolean;
    card: CardInterface;
}

export const FlashcardContext = React.createContext<FlaschardContextProps>(undefined);
