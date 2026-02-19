import { type annotation } from "../annotations";
import type { FlashcardSourceStrategy } from "../FlashcardSourceStrategy";
import { getFileContents } from "src/infrastructure/disk";
import { parseMoonReaderExport } from "src/data/import/moonreader";
import type { BookMetadataSections, Heading } from "../sections/types";
import { isChapter } from "../sections/guards";

export class MoonReaderStrategy implements FlashcardSourceStrategy {
  constructor(private moonReaderPath: string) {}

  async sync(sinceId?: string): Promise<annotation[]> {
    const content = await getFileContents(this.moonReaderPath);
    return parseMoonReaderExport(content, sinceId);
  }

  async extract(): Promise<annotation[]> {
    const content = await getFileContents(this.moonReaderPath);
    return parseMoonReaderExport(content);
  }

  getNavigableSections(sections: BookMetadataSections): Heading[] {
    return sections.filter((section): section is Heading => isChapter(section));
  }
}
