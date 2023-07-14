import type {} from "obsidian";

declare module "obsidian" {
    interface HeadingCache {
        display: string
    }
}