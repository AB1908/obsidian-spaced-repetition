import { generateFingerprint, hasContentDrifted } from "src/data/utils/fingerprint";

describe("generateFingerprint", () => {
    test("returns deterministic output for same input", () => {
        const text = "What is episodic memory?";
        expect(generateFingerprint(text)).toBe(generateFingerprint(text));
    });

    test("returns different output for different input", () => {
        const a = generateFingerprint("What is episodic memory?");
        const b = generateFingerprint("What is semantic memory?");
        expect(a).not.toBe(b);
    });

    test("returns a 6-char hex string", () => {
        const fp = generateFingerprint("test content");
        expect(fp).toMatch(/^[0-9a-f]{6}$/);
    });

    test("handles empty string", () => {
        const fp = generateFingerprint("");
        expect(fp).toMatch(/^[0-9a-f]{6}$/);
    });

    test("is sensitive to whitespace", () => {
        const a = generateFingerprint("hello world");
        const b = generateFingerprint("hello  world");
        expect(a).not.toBe(b);
    });

    test("handles multiline text", () => {
        const text = "Line one\nLine two\nLine three";
        const fp = generateFingerprint(text);
        expect(fp).toMatch(/^[0-9a-f]{6}$/);
    });
});

describe("hasContentDrifted", () => {
    test("returns false when content matches stored fingerprint", () => {
        const text = "What is episodic memory?";
        const stored = generateFingerprint(text);
        expect(hasContentDrifted(stored, text)).toBe(false);
    });

    test("returns true when content differs from stored fingerprint", () => {
        const original = "What is episodic memory?";
        const stored = generateFingerprint(original);
        const modified = "What is episodic memory? (updated)";
        expect(hasContentDrifted(stored, modified)).toBe(true);
    });

    test("detects single character change", () => {
        const original = "The quick brown fox";
        const stored = generateFingerprint(original);
        const modified = "The quick brown Fox";
        expect(hasContentDrifted(stored, modified)).toBe(true);
    });
});
