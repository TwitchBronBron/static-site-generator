import * as path from 'path';
import * as moment from 'moment';
import * as chalk from 'chalk';
import type { Range } from './interfaces';
import { execSync } from 'child_process';
import * as semver from 'semver';

/**
 *
 */
export function standardizePath(...parts: string[]) {
    //remove null or empty parts
    parts = parts.filter(x => !!x);

    return path.normalize(
        path.resolve(...parts)
    ).replace(/[\\\/]/g, path.sep);
}


/**
 *  Normalize, resolve, and standardize path.sep for a chunk of path parts.A tagged template literal function for standardizing the path. This has to be defined as standalone function since it's a tagged template literal function,
 * we can't use `object.tag` syntax.
 */
export function s(stringParts, ...expressions: any[]) {
    let parts = [];
    for (let i = 0; i < stringParts.length; i++) {
        parts.push(stringParts[i], expressions[i]);
    }
    return path.normalize(
        parts.filter(x => !!x).join(path.sep)
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

/**
 * Get a relative url based on the position of the template file and the host file
 * @param url the URL relative to the `templateOutPath`
 * @param templateOutPath the output path of the template
 * @param hostOutPath the outPath of the host file (the file being published)
 */
export function getRelativeUrl(url: string, templateOutPath: string, hostOutPath: string) {
    const relativePath = path.relative(
        path.dirname(hostOutPath),
        path.join(path.dirname(templateOutPath), url)
    );
    return relativePath.replace(/[\\\/]/g, '/');
}

export function toUnixPath(thePath: string) {
    return thePath.replace(/[\/\\]/g, '/');
}

export function replacePath(subject: string, search: string, replace: string) {
    const idx = toUnixPath(subject).indexOf(toUnixPath(search));
    if (idx > -1) {
        return replace + subject.substring(idx + search.length);
    } else {
        return subject;
    }
}

/**
 *
 * @param packageName Find the latest-published version of an npm package
 */
export function getLatestVersion(packageName: string) {
    const versions = JSON.parse(
        execSync(`npm view ${packageName} versions --json`).toString()
    ) as string[];
    return semver.maxSatisfying(versions, '*');
}
