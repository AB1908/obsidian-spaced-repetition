/*
 * Module mock inspired by https://stackoverflow.com/a/54948644
 */
let value = 0;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function nanoid(size?: number): string {
    const retval = value.toString();
    value++;
    return retval;
}