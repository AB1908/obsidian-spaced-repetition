import { generateCardAsStorageFormat } from "src/data/utils/TextGenerator";
import { updateCardOnDisk, deleteCardOnDisk, writeCardToDisk } from "src/infrastructure/disk";
import type { ParsedCard } from "src/data/models/parsedCard";

/** Targeted find-and-replace for an existing card on disk. */
export async function replaceCardOnDisk(original: ParsedCard, updated: ParsedCard): Promise<boolean> {
    const originalText = generateCardAsStorageFormat(original);
    const updatedText = generateCardAsStorageFormat(updated);
    return updateCardOnDisk(original.notePath, originalText, updatedText);
}

/** Targeted removal of a card from disk. */
export async function removeCardFromDisk(card: ParsedCard): Promise<boolean> {
    const text = generateCardAsStorageFormat(card);
    return deleteCardOnDisk(card.notePath, text);
}

/** Append a new card to the end of a file on disk. */
export async function appendCardToDisk(card: ParsedCard): Promise<void> {
    const text = generateCardAsStorageFormat(card);
    await writeCardToDisk(card.notePath, text);
}
