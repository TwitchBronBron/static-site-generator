import type { Diagnostic, File } from '../interfaces';
import * as fsExtra from 'fs-extra';
import type { Project } from '../Project';
import * as frontMatter from 'front-matter';
import { getTitleFromFilePath } from '../util';

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
     * Get the title of this file (generally used for html page title and tree view)
     */
    public get title() {
        //use the title from attributes if available
        if (this.attributes?.title) {
            return this.attributes.title;
        }
        return getTitleFromFilePath(this.outPath);
    }

    /**
     * Load the file from disk and parse any frontmatter
     */
    public load() {
        const text = fsExtra.readFileSync(this.srcPath).toString();
        //parse any detected frontmatter
        const content = (frontMatter as any)(text);
        this.text = content.body;
        this.attributes = content.attributes;
    }

    /**
     * Get the line of source code at the specified line index, or null if the index is invalid or out of bounds
     */
    public getLine(index: number) {
        return this.lines[index];
    }

    public publish() {
        fsExtra.outputFileSync(
            this.outPath,
            this.project.generateWithTemplate(this, this.text) ?? ''
        );
    }
}
