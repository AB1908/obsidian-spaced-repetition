import type {CachedMetadata} from "obsidian";

declare module "obsidian" {
    interface HeadingCache {
        display: string
    }

    interface MetadataCache {
        metadataCache: Record<string, CachedMetadata>;
        fileCache: Record<string, InternalFileInfo>;
    }

    interface InternalFileInfo {
        mtime: number;
        hash: string;
        size: number;
    }
}