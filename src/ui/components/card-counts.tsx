import React from "react";
import { t } from "src/lang/helpers";

// FIX: types
interface CardCountProps {
    cardType: any;
    backgroundColor?: string;
    cardCount: number;
    additionalClass: string;
}

export class CardCount extends React.Component<CardCountProps> {
    render(): React.ReactNode {
        return (
            <span
                aria-label={t(this.props.cardType)}
                className={`tree-item-flair sr-deck-counts ${this.props.additionalClass}`}
            >
                {this.props.cardCount.toString()}
            </span>
        );
    }
}