import * as path from 'path';
import * as moment from 'moment';
import * as chalk from 'chalk';
import type { Range } from './interfaces';

/**
 * Normalize, resolve, and standardize path.sep for a chunk of path parts
 */
export function standardizePath(...parts: string[]) {
    //remove null or empty parts
    parts = parts.filter(x => !!x);

    return path.normalize(
        path.resolve(...parts)
    ).replace(/[\\\/]/g, path.sep);
}


export function log<T>(...messages: T[]) {
    console.log(
        '[' + chalk.grey(moment().format(`hh:mm:ss:SSSS A`)) + ']',
        ...messages
    );
}

export function createRange(startLine: number, startCharacter: number, endLine: number, endCharacter: number): Range {
    return {
        start: {
            line: startLine,
            character: startCharacter
        },
        end: {
            line: endLine,
            character: endCharacter
        }
    };
}

/**
 * Given an ejs error message, parse it and find the actual error information
 */
export function getEjsError(error: Error) {
    const [, lineMatch] = />>\s*(\d+)\s*\|/g.exec(error.message) ?? [];
    const lineNumber = parseInt(lineMatch);
    return {
        message: error.message.split(/\r?\n/).pop(),
        line: isNaN(lineNumber) ? undefined : lineNumber
    };
}

/**
 * Given a path to a file, convert it into a title
 * (remove extension, replace dashes with spaces, upper case first letter of each word)
 */
export function getTitleFromFilePath(filePath: string) {
    //derive a title from the filename
    const filename = path.basename(filePath).replace(/\.html$/i, '');
    //remove dashes
    return filename.split('-').join(' ');
}
