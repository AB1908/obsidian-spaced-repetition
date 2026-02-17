import { type annotation } from "../annotations";
import { ISourceStrategy } from "../ISourceStrategy";
import { getFileContents } from "src/infrastructure/disk";
import { parseMoonReaderExport } from "src/data/import/moonreader";
import { type BookMetadataSections, type Heading, isChapter } from "../AnnotationsNote";

export class MoonReaderStrategy implements ISourceStrategy {
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
