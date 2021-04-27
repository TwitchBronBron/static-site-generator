import { Diagnostic, File } from "../interfaces";
import * as fsExtra from 'fs-extra';
import * as ejs from 'ejs';
import { Project } from "../Project";
const frontMatter = require('front-matter');

export class TextFile implements File {
    constructor(
        public srcPath: string,
        public outPath: string
    ) { }

    public project: Project;

    /**
     * The text contents of the file (minus any frontmatter)
     */
    public text: string;

    /**
     * A collection of diagnostics for this file
     */
    public diagnostics = [] as Diagnostic[];

    public get lines() {
        if (!this._lines) {
            this._lines = this.text.split(/\r?\n/g);
        }
        return this._lines;
    }
    private _lines: string[];
    /**
     * The attributes found in the file's frontmatter (if present)
     */
    public attributes: Record<string, any>;

    /**
     * Load the file from disk and parse any frontmatter
     */
    public load() {
        const text = fsExtra.readFileSync(this.srcPath).toString();
        //parse any detected frontmatter
        const content = frontMatter(text);
        this.text = content.body;
        this.attributes = content.attributes;
    }

    /**
     * Get the line of source code at the specified line index, or null if the index is invalid or out of bounds
     */
    public getLine(index: number) {
        return this.lines[index];
    }

    /**
     * Generate the content based on
     */
    public generateContent(data: { content: string;[key: string]: any }) {
        //for all text-based files, this will use the ejs templating engine.
        return ejs.render(
            this.text,
            {
                data: {
                    ...data,
                    project: this.project,
                    file: this
                }
            }
        );
    }

    public publish() {
        fsExtra.outputFileSync(
            this.outPath,
            this.generateContent({ content: '' })
        );
    }
}
