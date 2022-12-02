import {escapeRegexString} from "src/utils";
import {generateSeparator, removeSchedTextFromCard} from "src/sched-utils";
import {Card} from "src/Card";

export function replacedCardText(front: string, card: Card, cardText: string, questionText: string, back: string, answerText: string, isCardCommentOnSameLine: boolean) {
    const frontReplacementRegex = new RegExp(escapeRegexString(front), "gm");
    card.cardText = cardText.replace(frontReplacementRegex, questionText);
    const backReplacementRegex = new RegExp(escapeRegexString(removeSchedTextFromCard(back, generateSeparator(cardText, isCardCommentOnSameLine))), "gm");
    return card.cardText.replace(backReplacementRegex, answerText);
}