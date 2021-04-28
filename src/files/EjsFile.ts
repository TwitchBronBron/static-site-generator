import { TextFile } from './TextFile';
import * as fsExtra from 'fs-extra';
import * as ejs from 'ejs';
import * as ejsLint from 'ejs-lint';
import { createRange, getEjsError } from "../util";
import { DiagnosticMessages } from '../DiagnosticMessages';

export class EjsFile extends TextFile {
    constructor(
        srcPath: string,
        outPath: string
    ) {
        super(
            srcPath,
            outPath.replace(/\.ejs$/i, '.html')
        );
    }

    public renderAsTemplate(file: TextFile, content: string) {
        const data = {
            //all the ejs data should be inside a `data` object so we don't have to deal with undefined variable errors in ejs
            data: {
                ...(file.attributes ?? {}),
                file: file,
                project: this,
                content: content,
                require: require
            }
        };
        try {
            return ejs.render(this.text, data);
        } catch (e: unknown) {
            const error = e as Error;
            //scan the file with ejs-lint to figure out the actual syntax errors
            const lintError = ejsLint(this.text, data);
            if (lintError) {
                //add diagnostic for syntax error
                file.diagnostics.push({
                    file: this,
                    range: createRange(lintError.line - 1, lintError.column - 1, lintError.line - 1, lintError.column),
                    ...DiagnosticMessages.genericError(lintError.message),
                    relatedInformation: [{
                        file: file,
                        message: 'Source file'
                    }]
                });

                //if this looks like an ejs error, try to extract the line and message information
            } else if (error.message?.includes('>>')) {
                const ejsError = getEjsError(error);
                //push the underlying error...better than nothing
                file.diagnostics.push({
                    file: this,
                    ...DiagnosticMessages.genericError(ejsError.message),
                    range: ejsError.line !== undefined ? createRange(ejsError.line - 1, 0, ejsError.line - 1, 0) : undefined,
                    relatedInformation: [{
                        file: file,
                        message: 'Source file'
                    }]
                });

                //push the underlying error...better than nothing
            } else {
                file.diagnostics.push({
                    file: this,
                    ...DiagnosticMessages.genericError(error.message),
                    relatedInformation: [{
                        file: file,
                        message: 'Source file'
                    }]
                });
            }
        }
    }

    public publish() {
        fsExtra.outputFileSync(
            this.outPath,
            this.renderAsTemplate(this, '') ?? ''
        )
    }
}
