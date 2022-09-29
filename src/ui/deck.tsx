import React, { Component, ReactNode } from "react";
import { Deck, Deck as DeckObj } from "src/flashcard-modal";
import { AllCardCounts } from "./deckList";

interface CollapsibleState {
    isDeckTreeOpen: boolean;
}

interface StateChanger extends CollapsibleState {
    handleTriangleClick: Function;
}

export interface DeckModalProps {
    deckName: string;
    subdecksArray: DeckObj[];
    handleClick?: Function;
}

interface SubDeckProps {
    deck: DeckObj;
    startReviewingDeck?: Function;
    children?: Function;
}

class InnerTreeItem extends Component<SubDeckProps> {
    render(): ReactNode {
        return (
            <div
                className="tree-item-inner"
                onClick={() => {
                    this.props.startReviewingDeck(this.props.deck);
                }}
            >
                {this.props.deck.deckName}
            </div>
        );
    }
}

class CollapseIcon extends Component<StateChanger> {
    constructor(props: StateChanger) {
        super(props);
    }

    render(): React.ReactNode {
        return (
            <div
                className="tree-item-icon collapse-icon"
                onClick={(e) => this.props.handleTriangleClick(e)}
            >
                <svg
                    viewBox="0 0 100 100"
                    width={10}
                    height={10}
                    className="right-triangle"
                    style={this.props.isDeckTreeOpen ? {} : { transform: "rotate(-90deg)" }}
                >
                    <path
                        fill="currentColor"
                        stroke="currentColor"
                        d="M94.9,20.8c-1.4-2.5-4.1-4.1-7.1-4.1H12.2c-3,0-5.7,1.6-7.1,4.1c-1.3,2.4-1.2,5.2,0.2,7.6L43.1,88c1.5,2.3,4,3.7,6.9,3.7 s5.4-1.4,6.9-3.7l37.8-59.6C96.1,26,96.2,23.2,94.9,20.8L94.9,20.8z"
                    />
                </svg>
            </div>
        );
    }
}

class CollapsibleDeckTreeEntry extends Component<SubDeckProps, CollapsibleState> {
    constructor(props: SubDeckProps) {
        super(props);
        this.state = {
            isDeckTreeOpen: false,
        };
    }

    handleTriangleClick(e: React.MouseEvent): void {
        e.preventDefault();
        this.setState(() => {
            return { isDeckTreeOpen: !this.state.isDeckTreeOpen };
        });
    }

    render(): ReactNode {
        return (
            <div className="tree-item">
                <details open={this.state.isDeckTreeOpen}>
                    <summary
                        className="tree-item-self tag-pane-tag is-clickable"
                        onClick={(e) => e.preventDefault()}
                    >
                        {" "}
                        {/* tree-item-self*/}
                        <CollapseIcon
                            {...this.state}
                            handleTriangleClick={(e: React.MouseEvent) =>
                                this.handleTriangleClick(e)
                            }
                        />
                        <InnerTreeItem
                            deck={this.props.deck}
                            startReviewingDeck={(d: Deck) => this.props.startReviewingDeck(d)}
                        />
                        <AllCardCounts deck={this.props.deck} />
                    </summary>
                    <div className="tree-item-children">
                        <DeckTree
                            subdecksArray={this.props.deck.subdecks}
                            deckName={this.props.deck.deckName}
                            handleClick={(d: Deck) => this.props.startReviewingDeck(d)}
                        />
                    </div>
                </details>
            </div>
        );
    }
}

class NonCollapsibleDeckTreeEntry extends Component<SubDeckProps> {
    render(): ReactNode {
        return (
            <div className="tree-item">
                <li style={{ display: "contents" }}>
                    <div className="tree-item-self tag-pane-tag is-clickable">
                        <InnerTreeItem
                            deck={this.props.deck}
                            startReviewingDeck={(d: Deck) => this.props.startReviewingDeck(d)}
                        />
                        <AllCardCounts deck={this.props.deck} />
                    </div>
                </li>
            </div>
        );
    }
}

class DeckTreeEntry extends Component<SubDeckProps> {
    render(): ReactNode {
        if (this.props.deck.subdecks.length) {
            return (
                <CollapsibleDeckTreeEntry
                    deck={this.props.deck}
                    startReviewingDeck={(d: Deck) => this.props.startReviewingDeck(d)}
                />
            );
        } else {
            return (
                <NonCollapsibleDeckTreeEntry
                    deck={this.props.deck}
                    startReviewingDeck={(d: Deck) => this.props.startReviewingDeck(d)}
                    children={() => this.props.children()}
                />
            );
        }
    }
}

export function DeckTree(props: DeckModalProps) {
    const listItems = props.subdecksArray.map((deck: Deck, i: number) => (
        <DeckTreeEntry key={i} deck={deck} startReviewingDeck={(d: Deck) => props.handleClick(d)} />
    ));
    return <>{listItems}</>;
}