import { SRSettings } from "src/settings";
import { t } from "src/lang/helpers";

export enum ReviewResponse {
    Easy,
    Good,
    Hard,
    Reset,
}

// Flashcards
export enum CardType {
    SingleLineBasic,
    SingleLineReversed,
    MultiLineBasic,
    MultiLineReversed,
    Cloze,
}

export function schedule(
    response: ReviewResponse,
    interval: number,
    ease: number,
    delayBeforeReview: number,
    settingsObj: SRSettings,
): { ease: number; interval: number } {
    delayBeforeReview = Math.max(0, Math.floor(delayBeforeReview / (24 * 3600 * 1000)));
    if (isNaN(interval)) {
        throw Error("invalid interval");
    }

    if (response === ReviewResponse.Easy) {
        ease += 20;
        interval = ((interval + delayBeforeReview) * ease) / 100;
        interval *= settingsObj.easyBonus;
    } else if (response === ReviewResponse.Good) {
        interval = ((interval + delayBeforeReview / 2) * ease) / 100;
    } else if (response === ReviewResponse.Hard) {
        ease = Math.max(130, ease - 20);
        interval = Math.max(
            1,
            (interval + delayBeforeReview / 4) * settingsObj.lapsesIntervalChange
        );
    }

    // replaces random fuzz with load balancing over the fuzz interval
    // if (dueDates !== undefined) {
    //     interval = Math.round(interval);
    //     if (!Object.prototype.hasOwnProperty.call(dueDates, interval)) {
    //         dueDates[interval] = 0;
    //     } else {
    //         // disable fuzzing for small intervals
    //         if (interval > 4) {
    //             let fuzz: number;
    //             if (interval < 7) fuzz = 1;
    //             else if (interval < 30) fuzz = Math.max(2, Math.floor(interval * 0.15));
    //             else fuzz = Math.max(4, Math.floor(interval * 0.05));
    //
    //             const originalInterval = interval;
    //             outer: for (let i = 1; i <= fuzz; i++) {
    //                 for (const ivl of [originalInterval - i, originalInterval + i]) {
    //                     if (!Object.prototype.hasOwnProperty.call(dueDates, ivl)) {
    //                         dueDates[ivl] = 0;
    //                         interval = ivl;
    //                         break outer;
    //                     }
    //                     if (dueDates[ivl] < dueDates[interval]) interval = ivl;
    //                 }
    //             }
    //         }
    //     }
    //     dueDates[interval]++;
    // }

    interval = Math.min(interval, settingsObj.maximumInterval);

    return { interval: Math.round(interval * 10) / 10, ease };
}

export function textInterval(interval: number, isMobile: boolean): string {
    const month: number = Math.round(interval / 3.04375) / 10,
        year: number = Math.round(interval / 36.525) / 10;

    if (isMobile) {
        if (month < 1.0) return t("DAYS_STR_IVL_MOBILE", { interval });
        else if (year < 1.0) return t("MONTHS_STR_IVL_MOBILE", { interval: month });
        else return t("YEARS_STR_IVL_MOBILE", { interval: year });
    } else {
        if (interval <= 1.0) return t("DAY_STR_IVL", { interval });
        else if (month < 1.0) return t("DAYS_STR_IVL", { interval });
        else if (month == 1.0) return t("MONTH_STR_IVL", { interval: month});
        else if (year < 1.0) return t("MONTHS_STR_IVL", { interval: month });
        else if (year == 1.0) return t("YEAR_STR_IVL", { interval: year});
        else return t("YEARS_STR_IVL", { interval: year });
    }
}
