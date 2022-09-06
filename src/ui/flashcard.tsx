import React, { Component, ReactNode } from "react";
import { Deck } from "src/flashcard-modal";
import { AllButtons, EditLaterButton, ResetButton, ShowAnswerButton } from "./buttons";

export interface QuestionProps {
    handleClick: Function;
    deck?: Deck;
    questionText?: string;
}

interface Props {
    children: React.ReactNode;
    // questionText: string;
    // answerText: string;
}

interface FlashcardProps {
    flashcardIndex?: number;
}

interface Questions {
    text: string;
}

class FlashcardQuestionText extends Component<Props> {
    render(): React.ReactNode {
        return <p>{this.props.children}</p>;
    }
}

class FlashcardAnswerText extends Component<Props> {
    render(): React.ReactNode {
        return <p>{this.props.children}</p>;
    }
}

class FlashcardContext extends Component {
    render(): React.ReactNode {
        return <div id="sr-context"></div>;
    }
}

class ResponseButtonsDiv extends Component {
    render(): React.ReactNode {
        return (
            <div className="sr-response" style={{ display: "grid" }}>
                <AllButtons />
            </div>
        );
    }
}

export class FlashcardQuestion extends Component<QuestionProps> {
    render(): ReactNode {
        return (
            <>
                <EditLaterButton />
                <FlashcardContext />
                <FlashcardView>
                    <FlashcardQuestionText>{this.props.questionText}</FlashcardQuestionText>
                </FlashcardView>
                <ShowAnswerButton handleClick={() => this.props.handleClick()} />
            </>
        );
    }
}

export class FlashcardAnswer extends Component<QuestionProps> {
    render(): ReactNode {
        return (
            <>
                <EditLaterButton />
                <ResetButton />
                <FlashcardContext />

                <FlashcardView>
                    <FlashcardQuestionText>{this.props.questionText}</FlashcardQuestionText>
                    <hr id="sr-hr-card-divide" />
                    <FlashcardAnswerText>{""}</FlashcardAnswerText>
                </FlashcardView>
                <ResponseButtonsDiv />
            </>
        );
    }
}

class ClozeQuestionText extends Component {
    render(): React.ReactNode {
        return (
            <p>
                new <span style={{ color: "#2196f3" }}>[...]</span>
            </p>
        );
    }
}

class ClozeAnswerText extends Component {
    render(): React.ReactNode {
        return (
            <p>
                new <span style={{ color: "#2196f3" }}>things</span>
            </p>
        );
    }
}

export class FlashcardCloze extends Component<QuestionProps> {
    render(): ReactNode {
        return (
            <>
                <EditLaterButton />
                <FlashcardContext />
                <FlashcardView>
                    <ClozeQuestionText />
                </FlashcardView>
                <ShowAnswerButton handleClick={() => this.props.handleClick()} />
            </>
        );
    }
}

export class FlashcardClozeAnswer extends Component {
    render(): ReactNode {
        return (
            <>
                <EditLaterButton />
                <ResetButton />
                <FlashcardContext />
                <FlashcardView>
                    <ClozeAnswerText />
                </FlashcardView>
                <ResponseButtonsDiv />
            </>
        );
    }
}

interface FlashcardState {
    flashcardQuestion: boolean;
    deck: Deck;
}

interface DefaultProps {
    deck?: Deck;
    flashcardIndex: number;
    question: string;
}

export class Flashcard extends Component<DefaultProps, FlashcardState> {
    constructor(props: any) {
        super(props);
        this.state = {
            flashcardQuestion: true,
            deck: null,
        };
    }

    handleClick(i: number) {
        console.log(this.state.flashcardQuestion, i);
    }

    render(): React.ReactNode {
        return (
            <>
                {this.state.flashcardQuestion ? (
                    <FlashcardQuestion
                        questionText={this.props.question}
                        deck={this.state.deck}
                        //TODO: reuse prior state
                        handleClick={(state: FlashcardState, props: DefaultProps) =>
                            this.setState(() => {
                                return { flashcardQuestion: false };
                            })
                        }
                    />
                ) : (
                    <FlashcardAnswer
                        questionText={"Question"}
                        deck={this.state.deck}
                        handleClick={(state: FlashcardState, props: DefaultProps) =>
                            this.setState(() => {
                                return { flashcardQuestion: false };
                            })
                        }
                    />
                )}
            </>
        );
    }
}

class FlashcardView extends Component<Props> {
    render(): React.ReactNode {
        return <div id="sr-flashcard-view">{this.props.children}</div>;
    }
}
