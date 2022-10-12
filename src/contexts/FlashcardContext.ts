import React from "react";

interface FlaschardContextProps{
    handleShowAnswerButton: Function;
    handleFlashcardResponse: Function
}

export const FlashcardContext = React.createContext<FlaschardContextProps>(undefined);
