import React from "react";
import { t } from "src/lang/helpers";
import { Deck } from "src/Deck";

interface Props {
    deck: Deck;
    localizedModalTitle: string;
}

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
                className={"tag-pane-tag-count tree-item-flair sr-deck-counts "+this.props.additionalClass}
            >
                {this.props.cardCount.toString()}
            </span>
        );
    }
}

interface AllCountsProps {
    deck: Deck;
}

export class AllCardCounts extends React.Component<AllCountsProps> {
    render(): React.ReactNode {
        return (
            <div className="tree-item-flair-outer">
                <span>
                    <CardCount
                        cardType="DUE_CARDS"
                        backgroundColor="#4caf50"
                        cardCount={this.props.deck.dueFlashcardsCount}
                        additionalClass={"due-cards"}
                    />
                    <CardCount
                        cardType="NEW_CARDS"
                        backgroundColor="#2196f3"
                        cardCount={this.props.deck.newFlashcardsCount}
                        additionalClass={"new-cards"}
                    />
                    <CardCount
                        cardType="TOTAL_CARDS"
                        backgroundColor="#ff7043"
                        cardCount={this.props.deck.totalFlashcards}
                        additionalClass={"total-cards"}
                    />
                </span>
            </div>
        );
    }
}

export class AllDecks extends React.Component<Props> {
    render(): React.ReactNode {
        return (
            <>
                {this.props.localizedModalTitle}
                <AllCardCounts deck={this.props.deck} />
            </>
        );
    }
}
