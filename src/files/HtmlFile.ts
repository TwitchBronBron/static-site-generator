import { TextFile } from './TextFile';
import * as fsExtra from 'fs-extra';
import * as path from 'path';

export class HtmlFile extends TextFile {
    public get skipPublish() {
        //don't publish the template files themselves
        return this.srcPath.toLowerCase().endsWith(`${path.sep}_template.html`);
    }
    public publish() {
        fsExtra.outputFileSync(
            this.outPath,
            this.project.renderEjs(this, this.text, '') ?? ''
        )
    }
}
