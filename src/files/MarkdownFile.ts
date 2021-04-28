import { TextFile } from './TextFile';
import * as marked from 'marked';
import * as fsExtra from 'fs-extra';

export class MarkdownFile extends TextFile {
    constructor(
        srcPath: string,
        outPath: string
    ) {
        super(
            srcPath,
            outPath.replace(/\.md$/i, '.html')
        );
    }

    public publish() {
        let html = marked(this.text).trim();
        //remove trailing newline
        fsExtra.outputFileSync(
            this.outPath,
            this.project.generateWithTemplate(this, html)
        );
    }
}
