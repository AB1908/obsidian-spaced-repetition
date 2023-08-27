import {schedule, ReviewResponse, textInterval} from "src/scheduler/scheduling";
import {DEFAULT_SETTINGS} from "src/settings";

jest.mock('../src/main', () => {
        return {
            plugin: {
                data: {
                    settings: {
                        "baseEase": 250,
                        "lapsesIntervalChange": 0.5,
                        "easyBonus": 1.3,
                        "maximumInterval": 36525,
                    }
                }
            }
        }
    }
)

test("Test reviewing with default settings", () => {
    expect(
        schedule(ReviewResponse.Easy, 1, DEFAULT_SETTINGS.baseEase, 0)
    ).toEqual({
        ease: DEFAULT_SETTINGS.baseEase + 20,
        interval: 4,
    });

    expect(() =>
        schedule(ReviewResponse.Easy, undefined, DEFAULT_SETTINGS.baseEase, 0)).toThrow("invalid interval");

    expect(
        schedule(ReviewResponse.Good, 1, DEFAULT_SETTINGS.baseEase, 0)
    ).toEqual({
        ease: DEFAULT_SETTINGS.baseEase,
        interval: 3,
    });

    expect(
        schedule(ReviewResponse.Hard, 1, DEFAULT_SETTINGS.baseEase, 0)
    ).toEqual({
        ease: DEFAULT_SETTINGS.baseEase - 20,
        interval: 1,
    });
});

test("Test reviewing with default settings & delay", () => {
    const delay = 2 * 24 * 3600 * 1000; // two day delay
    expect(
        schedule(ReviewResponse.Easy, 10, DEFAULT_SETTINGS.baseEase, delay)
    ).toEqual({
        ease: DEFAULT_SETTINGS.baseEase + 20,
        interval: 42,
    });

    expect(
        schedule(ReviewResponse.Good, 10, DEFAULT_SETTINGS.baseEase, delay)
    ).toEqual({
        ease: DEFAULT_SETTINGS.baseEase,
        interval: 28,
    });

    expect(
        schedule(ReviewResponse.Hard, 10, DEFAULT_SETTINGS.baseEase, delay)
    ).toEqual({
        ease: DEFAULT_SETTINGS.baseEase - 20,
        interval: 5,
    });
});

test("Test load balancing, small interval (load balancing disabled)", () => {
    const dueDates = {
        0: 1,
        1: 1,
        2: 1,
        3: 4,
    };
    expect(
        schedule(ReviewResponse.Good, 1, DEFAULT_SETTINGS.baseEase, 0)
    ).toEqual({
        ease: DEFAULT_SETTINGS.baseEase,
        interval: 3,
    });
    expect(dueDates).toEqual({
        0: 1,
        1: 1,
        2: 1,
        3: 5,
    });
});

test("Test load balancing", () => {
    // interval < 7
    let dueDates: Record<number, number> = {
        5: 2,
    };
    expect(
        schedule(ReviewResponse.Good, 2, DEFAULT_SETTINGS.baseEase, 0)
    ).toEqual({
        ease: DEFAULT_SETTINGS.baseEase,
        interval: 4,
    });
    expect(dueDates).toEqual({
        4: 1,
        5: 2,
    });

    // 7 <= interval < 30
    dueDates = {
        25: 2,
    };
    expect(
        schedule(ReviewResponse.Good, 10, DEFAULT_SETTINGS.baseEase, 0)
    ).toEqual({
        ease: DEFAULT_SETTINGS.baseEase,
        interval: 24,
    });
    expect(dueDates).toEqual({
        24: 1,
        25: 2,
    });

    // interval >= 30
    dueDates = {
        2: 5,
        59: 8,
        60: 9,
        61: 3,
        62: 5,
        63: 4,
        64: 4,
        65: 8,
        66: 2,
        67: 10,
    };
    expect(
        schedule(ReviewResponse.Good, 25, DEFAULT_SETTINGS.baseEase, 0)
    ).toEqual({
        ease: DEFAULT_SETTINGS.baseEase,
        interval: 66,
    });
    expect(dueDates).toEqual({
        2: 5,
        59: 8,
        60: 9,
        61: 3,
        62: 5,
        63: 4,
        64: 4,
        65: 8,
        66: 3,
        67: 10,
    });
});

test("Test textInterval - desktop", () => {
    expect(textInterval(2, false)).toEqual("2 days");
    expect(textInterval(1, false)).toEqual("1 day");
    expect(textInterval(31, false)).toEqual("1 month");
    expect(textInterval(41, false)).toEqual("1.3 months");
    expect(textInterval(730, false)).toEqual("2 years");
    expect(textInterval(365, false)).toEqual("1 year");
    expect(textInterval(1000, false)).toEqual("2.7 years");
});

test("Test textInterval - mobile", () => {
    expect(textInterval(1, true)).toEqual("1d");
    expect(textInterval(41, true)).toEqual("1.3m");
    expect(textInterval(366, true)).toEqual("1y");
    expect(textInterval(1000, true)).toEqual("2.7y");
});
