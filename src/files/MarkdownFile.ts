import { TextFile } from './TextFile';
import { marked } from 'marked';
import * as fsExtra from 'fs-extra';
import { getTitleFromFilePath } from '../util';

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

    /**
     * Get the title of this file (generally used for html page title and tree view)
     */
    public get title(): string {
        //use the title from attributes if available
        if (this.attributes?.title) {
            return this.attributes.title;
        }
        return this.getH1Text() ?? getTitleFromFilePath(this.outPath);
    }

    /**
     * If the markdown code starts with a h1 header, return its text
     */
    private getH1Text() {
        const [, h1Text] = /^#\s+(.+)/.exec(this.text.trim()) ?? [];
        return h1Text;
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
