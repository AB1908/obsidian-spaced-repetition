/**
 * Content fingerprinting for drift detection.
 *
 * Uses djb2 hash to produce a short hex string from paragraph text.
 * Not cryptographic — just enough to detect when source content
 * has changed since a flashcard was created.
 */

export function generateFingerprint(text: string): string {
    let hash = 5381;
    for (let i = 0; i < text.length; i++) {
        hash = ((hash << 5) + hash + text.charCodeAt(i)) >>> 0;
    }
    return hash.toString(16).padStart(8, '0').slice(0, 6);
}

export function hasContentDrifted(storedFingerprint: string, currentText: string): boolean {
    return storedFingerprint !== generateFingerprint(currentText);
}
