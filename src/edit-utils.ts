import {Card} from "src/scheduling";
import {escapeRegexString} from "src/utils";
import {generateSeparator, removeSchedTextFromCard} from "src/sched-utils";

export function replacedCardText(front: string, card: Card, cardText: string, questionText: string, back: string, answerText: string, isCardCommentOnSameLine: boolean) {
    const frontReplacementRegex = new RegExp(escapeRegexString(front), "gm");
    card.cardText = cardText.replace(frontReplacementRegex, questionText);
    const backReplacementRegex = new RegExp(escapeRegexString(removeSchedTextFromCard(back, generateSeparator(cardText, isCardCommentOnSameLine))), "gm");
    return card.cardText.replace(backReplacementRegex, answerText);
}