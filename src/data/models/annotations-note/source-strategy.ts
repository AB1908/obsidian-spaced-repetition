import { getSourceType } from "src/data/source-discovery";
import { MarkdownSourceStrategy } from "../strategies/MarkdownSourceStrategy";
import { MoonReaderStrategy } from "../strategies/MoonReaderStrategy";
import type { FlashcardSourceStrategy } from "../FlashcardSourceStrategy";

export function resolveSourceType(tags: string[], hasFrontmatter: boolean) {
    return getSourceType(tags, hasFrontmatter);
}

export function resolveSourceStrategy(path: string, tags: string[], hasFrontmatter: boolean): FlashcardSourceStrategy {
    const sourceType = resolveSourceType(tags, hasFrontmatter);
    return sourceType === "moonreader"
        ? new MoonReaderStrategy(path)
        : new MarkdownSourceStrategy(path);
}
