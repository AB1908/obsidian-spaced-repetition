import React, { Component, ReactNode } from "react";
import { Flashcard } from "./flashcard";
import { DeckModalProps, DeckTree } from "./deck";
import { Deck } from "src/flashcard-modal";

export interface ModalState {
    deckInReview: boolean;
    currentDeck: Deck;
}

export class ModalContainer extends Component<DeckModalProps, ModalState> {
    constructor(props: DeckModalProps) {
        super(props);
        this.state = {
            deckInReview: false,
            currentDeck: null,
        };
    }

    componentDidUpdate(
        prevProps: Readonly<DeckModalProps>,
        prevState: Readonly<ModalState>,
        snapshot?: any
    ): void {
        console.log(this.state.currentDeck);
    }

    render(): ReactNode {
        if (this.state.deckInReview) {
            return <Flashcard flashcardIndex={0} question={"text"} />;
        } else {
            return (
                <DeckTree
                    subdecksArray={this.props.subdecksArray}
                    deckName={this.props.deckName}
                    handleClick={(deck: Deck) => {
                        this.setState({ deckInReview: true, currentDeck: deck });
                    }}
                />
            );
        }
    }
}
