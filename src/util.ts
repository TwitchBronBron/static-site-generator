import * as path from 'path';
import * as moment from 'moment';
import chalk from 'chalk';

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


export function log(...messages: any[]) {
    console.log(
        '[' + chalk.grey(moment().format(`hh:mm:ss:SSSS A`)) + ']',
        ...messages
    );
}
