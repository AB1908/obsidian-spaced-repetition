// Polyfill for structuredClone for Jest environment
if (typeof global.structuredClone === 'undefined') {
    global.structuredClone = (val) => {
        if (val === undefined) {
            return undefined;
        }
        try {
            return JSON.parse(JSON.stringify(val));
        } catch (e) {
            if (typeof val === 'object' && val !== null) {
                return Array.isArray(val) ? [...val] : { ...val };
            }
            return val;
        }
    };
}

