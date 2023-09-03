import React from "react";

export function CardCount({cardType, additionalClass, cardCount}: {cardType: string, additionalClass: string, cardCount: number}) {
    return (
        <span
            aria-label={cardType}
            className={`tree-item-flair sr-deck-counts ${additionalClass}`}
        >
                {cardCount.toString()}
            </span>
    );
}