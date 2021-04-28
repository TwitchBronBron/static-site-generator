import { TextFile } from './TextFile';
import * as fsExtra from 'fs-extra';
import * as path from 'path';
import { File } from '../interfaces';

export class HtmlFile extends TextFile {
    public get skipPublish() {
        //don't publish the template files themselves
        return this.srcPath.toLowerCase().endsWith(`${path.sep}_template.html`);
    }

    public renderAsTemplate(file: File, content: string) {
        return this.text.replace(/<!--\s*content\s*-->/g, content);
    }

    public publish() {
        fsExtra.outputFileSync(
            this.outPath,
            this.project.generateWithTemplate(this, this.text)
        )
    }
}
