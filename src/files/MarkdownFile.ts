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
        marked.use({
            renderer: {
                heading: ((text, level, raw, slugger) => {
                    const id = slugger.slug(text);
                    return `<a href="#${id}"><h${level} id="${id}">${text}</h${level}></a>`;
                })
            }
        });
        let html = marked(this.text).trim();
        //remove trailing newline
        fsExtra.outputFileSync(
            this.outPath,
            this.project.generateWithTemplate(this, html)
        );
    }
}
