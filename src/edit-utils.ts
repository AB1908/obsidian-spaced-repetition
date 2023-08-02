import {escapeRegexString} from "src/utils";
import {generateSeparator, removeSchedTextFromCard} from "src/scheduler/sched-utils";
import {Card} from "src/Card";
import {MULTI_SCHEDULING_EXTRACTOR} from "src/constants";

export function replacedCardText(card: Card, updatedCard: { front: string, back: string }, isCardCommentOnSameLine: boolean) {
    if (!updatedCard.front || !updatedCard.back ) {
        throw Error("replacedCardText: Inputs cannot be null/undefined/empty string");
    }
    const schedulingMatches = updatedCard.back.match(MULTI_SCHEDULING_EXTRACTOR)?.length;
    if (schedulingMatches) {
        throw Error("replacedCardText: updatedCard.back contains scheduling information")
    }
    const frontReplacementRegex = new RegExp(escapeRegexString(card.front), "gm");
    card.cardText = card.cardText.replace(frontReplacementRegex, updatedCard.front);
    const backReplacementRegex = new RegExp(escapeRegexString(removeSchedTextFromCard(card.back, generateSeparator(card.cardText, isCardCommentOnSameLine))), "gm");
    return card.cardText.replace(backReplacementRegex, updatedCard.back);
}