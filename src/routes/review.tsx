import React, {useState} from "react";
import {useLoaderData} from "react-router";
import {Flashcard} from "src/data/models/flashcard";
import {ResponseButtons, ShowAnswerButton} from "src/ui/components/buttons";
import {FlashcardContext} from "src/contexts/FlashcardContext";
import {ReviewResponse, schedule} from "src/scheduling";
import {plugin, PluginData} from "src/main";
import {moment} from "obsidian";

export function reviewLoader({params}: {params: any}) {
    return fetch(`http://localhost:3000/review/${params.bookId}`)
}

function Question(props: { questionText: string }) {
    return <p>
        {props.questionText}
    </p>;
}

function Answer(props: { answerText: string }) {
    return <p>
        {props.answerText}
    </p>;
}

export function ReviewDeck() {
    const flashcards: Flashcard[] = (useLoaderData() as any).flashcards;
    const [flashcardIndex, setFlashcardIndex] = useState(0);
    const [isQuestion, setIsQuestion] = useState(true);
    const currentCard = flashcards[flashcardIndex];

    async function handleResponseButtons(clickedResponse: ReviewResponse) {
        // todo: move to useEffect?
        await processReview(clickedResponse, flashcards[flashcardIndex], plugin.data);
        moveToNextFlashcard();
    }

    function moveToNextFlashcard() {
        if (flashcardIndex + 1 < flashcards.length) {
            setFlashcardIndex(flashcardIndex + 1);
            setIsQuestion(true);
        } else {
            // props.changeModalStatus(ModalStates.DECK_NOT_IN_REVIEW);
        }
    }

    return (<>
        <FlashcardContext.Provider
            value={{
                handleShowAnswerButton: () => setIsQuestion(false),
                handleFlashcardResponse: (t: ReviewResponse) => handleResponseButtons(t),
                isQuestion: isQuestion,
                card: currentCard
            }}
        >
            <Question questionText={currentCard.questionText}/>
            <hr/>
            <Answer answerText={currentCard.answerText}/>
            <FlashcardFooter isQuestion={isQuestion} showAnswerHandler={() => setIsQuestion(false)}
                         card={currentCard}/>
        </FlashcardContext.Provider>
    </>);
}

function FlashcardFooter({isQuestion, showAnswerHandler, card}: {isQuestion: boolean, showAnswerHandler: () => void, card: Flashcard}) {
    if (isQuestion)
        return <ShowAnswerButton handleShowAnswerButton={() => showAnswerHandler()}/>;
    else
        return <ResponseButtons card={card} handleFlashcardResponse={(response: any) => console.log("Clicked!")}/>;
}

// todo: move into controller?
// todo: rename to update card?
async function processReview(clickedResponse: ReviewResponse, flashcard: Flashcard, data: PluginData) {
    // take the response received
    // use that to update flashcard internal state
    // that will take care of writing to disk
    // so this should be a relatively lean method
    // don't forget to update siblings?
    let schedObj;
    // is new card
    if (flashcard.delayBeforeReview === null) {
        // todo: move default settings down into schedule()?
        schedObj = schedule(
            clickedResponse,
            1.0,
            plugin.data.settings.baseEase,
            0,
            data.settings,
        );
    } else {
        schedObj = schedule(
            clickedResponse,
            flashcard.interval,
            flashcard.ease,
            flashcard.delayBeforeReview,
            data.settings,
        );
    }
    const {interval, ease} = schedObj;
    const due = moment(Date.now() + interval * 24 * 3600 * 1000);
    const schedulingMetadata = {interval, ease, due};
    // generate metadata string
    // write to disk
}