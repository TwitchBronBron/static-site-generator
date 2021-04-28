import { TextFile } from './TextFile';
import * as fsExtra from 'fs-extra';
import type { File } from '../interfaces';

export class HtmlFile extends TextFile {
    public renderAsTemplate(file: File, content: string) {
        return this.text.replace(/<!--\s*content\s*-->/g, content);
    }

    public publish() {
        fsExtra.outputFileSync(
            this.outPath,
            this.project.generateWithTemplate(this, this.text)
        );
    }
}
