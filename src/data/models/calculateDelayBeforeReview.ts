import {moment} from "src/obsidian-facade";

// todo: move into controller?

export function calculateDelayBeforeReview(due: string) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return Math.abs(moment().valueOf() - moment(due).valueOf());
}