import * as fsExtra from 'fs-extra';
import * as path from 'path';
import type { Options } from './StaticSiteGenerator';
import { StaticSiteGenerator } from './StaticSiteGenerator';

export const tempDir = path.resolve(path.join(__dirname, '..', '.tmp'));
export const sourceDir = path.join(tempDir, 'src');
export const outDir = path.join(tempDir, 'dest');
export const options = {} as Options;

beforeEach(() => {
    for (const key in options) {
        delete options[key];
    }
    options.sourceDir = sourceDir;
    options.outDir = outDir;
    fsExtra.emptydirSync(tempDir);
});
afterEach(() => {
    fsExtra.removeSync(tempDir);
});

/**
 * Write a set of files to sourceDir
 */
export function writeFiles(files: Record<string, string>) {
    for (const filePath in files) {
        fsExtra.outputFileSync(
            path.join(sourceDir, filePath),
            files[filePath]
        );
    }
}

export async function run(opts = options) {
    const generator = new StaticSiteGenerator();
    try {
        await generator.run(opts);
    } catch (e) {
        console.error(e);
    }
    return generator;
}

/**
 * Trim leading whitespace for every line (to make test writing cleaner).
 * Also removes empty lines for consistency
 */
export function trimLeading(text: string) {
    if (!text) {
        return text;
    }
    const lines = text.split(/\r?\n/);
    let minIndent = Number.MAX_SAFE_INTEGER;

    //skip leading empty lines
    while (lines[0]?.trim().length === 0) {
        lines.splice(0, 1);
    }

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const trimmedLine = line.trimLeft();
        //skip empty lines
        if (trimmedLine.length === 0) {
            lines.splice(i, 1);
            i--;
            continue;
        }
        const leadingSpaceCount = line.length - trimmedLine.length;
        if (leadingSpaceCount < minIndent) {
            minIndent = leadingSpaceCount;
        }
    }

    //apply the trim to each line
    for (let i = 0; i < lines.length; i++) {
        lines[i] = lines[i].substring(minIndent);
    }
    return lines.join('\n');
}

/**
 * Remove leading white space and remove excess indentation
 */
export function trim(strings: TemplateStringsArray, ...args: any[]) {
    let text = '';
    for (let i = 0; i < strings.length; i++) {
        text += strings[i];
        if (args[i]) {
            text += args[i];
        }
    }
    return trimLeading(text);
}
