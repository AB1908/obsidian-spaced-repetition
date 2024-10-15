/*
 * Module mock inspired by https://stackoverflow.com/a/54948644
 */

export const nanoid = jest.fn(() => {
    return {nanoid: jest.fn()};
});