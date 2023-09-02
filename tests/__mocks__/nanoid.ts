/*
 * Module mock inspired by https://stackoverflow.com/a/54948644
 */
let value = 0;

export function nanoid(size?: number): string {
    return value++;
}