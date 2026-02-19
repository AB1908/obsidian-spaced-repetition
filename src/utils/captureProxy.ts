/**
 * Capture proxy for disk.ts — records all disk function calls as JSON fixtures.
 *
 * When capture mode is on (CAPTURE_FIXTURES_DIR env var set at build time),
 * an esbuild plugin redirects all `src/infrastructure/disk` imports here.
 * We import the real disk module, wrap it with a Proxy that logs calls to
 * JSON files, and re-export all functions.
 *
 * When capture mode is off, this file is never imported (the plugin is inactive
 * and all imports resolve to the real disk.ts as normal).
 */
import * as fs from 'fs';
import * as path from 'path';
import * as realDisk from '../infrastructure/disk';

// Build-time constants injected by esbuild's `define` option.
declare const __CAPTURE_MODE__: boolean;
declare const __CAPTURE_FIXTURES_DIR__: string;

const CAPTURE_MODE = typeof __CAPTURE_MODE__ !== 'undefined' && __CAPTURE_MODE__;
const FIXTURES_DIR = typeof __CAPTURE_FIXTURES_DIR__ !== 'undefined' ? __CAPTURE_FIXTURES_DIR__ : '';

let dirCreated = false;

function ensureDir(dir: string): void {
    if (!dirCreated && dir) {
        fs.mkdirSync(dir, { recursive: true });
        dirCreated = true;
    }
}

function getTimestamp(): string {
    return new Date().toISOString().replace(/[:.]/g, '-');
}

// Keys that cause circular references in Obsidian objects (TFile, TFolder, etc.)
const CIRCULAR_KEYS = new Set(['vault', 'children', 'app', 'metadataCache', 'fileManager']);

/**
 * JSON replacer that strips known circular-reference keys and detects
 * any remaining cycles. Belt-and-suspenders: known keys are stripped
 * for clean output, WeakSet catches anything we missed.
 */
function safeReplacer(): (key: string, value: any) => any {
    const seen = new WeakSet();
    return (key: string, value: any) => {
        if (CIRCULAR_KEYS.has(key)) return undefined;
        if (typeof value === 'object' && value !== null) {
            if (seen.has(value)) return '[Circular]';
            seen.add(value);
        }
        return value;
    };
}

/**
 * Derive a filename slug from the first string argument.
 * "Atomic Habits/Annotations.md" → "Atomic-Habits_Annotations"
 * Falls back to timestamp_random for non-string or empty args.
 */
function inputSlug(args: any[]): string {
    const first = args[0];
    if (typeof first === 'string' && first.length > 0) {
        return first
            .replace(/\.\w+$/, '')          // strip file extension
            .replace(/[\/\\]/g, '_')        // path separators → underscore
            .replace(/[^a-zA-Z0-9_-]/g, '-') // special chars → dash
            .replace(/-{2,}/g, '-')         // collapse dashes
            .replace(/^-|-$/g, '');         // trim leading/trailing dashes
    }
    const random = Math.random().toString(36).substring(2, 8);
    return `${getTimestamp()}_${random}`;
}

function captureToFile(methodName: string, args: any[], output: any): void {
    if (!CAPTURE_MODE || !FIXTURES_DIR) return;

    try {
        ensureDir(FIXTURES_DIR);

        const slug = inputSlug(args);
        const filename = `${methodName}_${slug}.json`;
        const filepath = path.join(FIXTURES_DIR, filename);

        const normalizedInput = args.length === 1 ? args[0] : args;

        const testCase = {
            method: methodName,
            capturedAt: new Date().toISOString(),
            capturedFrom: typeof normalizedInput === 'string' ? normalizedInput : undefined,
            input: normalizedInput,
            output: output,
        };

        fs.writeFileSync(filepath, JSON.stringify(testCase, safeReplacer(), 2), 'utf-8');
        console.log(`[capture] ${filepath}`);
    } catch (error) {
        console.error(`[capture] Failed ${methodName}:`, error);
    }
}

function createCaptureProxy<T extends object>(target: T): T {
    return new Proxy(target, {
        get(obj, prop: string | symbol) {
            if (typeof prop !== 'string') {
                return obj[prop as keyof T];
            }

            const original = obj[prop as keyof T];

            if (typeof original !== 'function') {
                return original;
            }

            return function (this: any, ...args: any[]) {
                try {
                    const result = original.apply(this, args);

                    if (result instanceof Promise) {
                        return result
                            .then((resolved: any) => {
                                captureToFile(prop, args, resolved);
                                return resolved;
                            })
                            .catch((error: any) => {
                                console.error(`[capture] Error in ${prop}:`, error);
                                throw error;
                            });
                    }

                    captureToFile(prop, args, result);
                    return result;
                } catch (error) {
                    console.error(`[capture] Error calling ${prop}:`, error);
                    throw error;
                }
            };
        }
    });
}

// Wrap the real disk module and re-export all functions through the proxy.
const proxied = createCaptureProxy(realDisk as any) as typeof realDisk;

export const writeCardToDisk = proxied.writeCardToDisk;
export const getTFileForPath = proxied.getTFileForPath;
export const updateCardOnDisk = proxied.updateCardOnDisk;
export const deleteCardOnDisk = proxied.deleteCardOnDisk;
export const fileTags = proxied.fileTags;
export const filePathsWithTag = proxied.filePathsWithTag;
export const getFileContents = proxied.getFileContents;
export const getMetadataForFile = proxied.getMetadataForFile;
export const getFolderNameFromPath = proxied.getFolderNameFromPath;
export const createFlashcardsFileForBook = proxied.createFlashcardsFileForBook;
export const getParentFolderPathAndName = proxied.getParentFolderPathAndName;
export const getAnnotationFilePath = proxied.getAnnotationFilePath;
export const generateFlashcardsFileNameAndPath = proxied.generateFlashcardsFileNameAndPath;
export const getAllFolders = proxied.getAllFolders;
export const moveFile = proxied.moveFile;
export const findFilesByExtension = proxied.findFilesByExtension;
export const renameFile = proxied.renameFile;
export const createFile = proxied.createFile;
export const overwriteFile = proxied.overwriteFile;
export const ensureFolder = proxied.ensureFolder;
export const updateFrontmatter = proxied.updateFrontmatter;
