import { ProvideFileEvent, Plugin } from "./interfaces";
import * as path from 'path';
import { HtmlFile } from "./files/HtmlFile";
import { MarkdownFile } from "./files/MarkdownFile";
import { RawFile } from "./files/RawFile";

export class InternalPlugin implements Plugin {
    provideFile(event: ProvideFileEvent) {
        const extension = path.extname(event.srcPath).toLowerCase();
        if (extension === '.html') {
            return new HtmlFile(event.srcPath, event.outPath);
        } else if (extension === '.md') {
            return new MarkdownFile(event.srcPath, event.outPath);
        } else {
            //all other files are handled by this class. It doesn't load the file into memory, and simply copies the file to outDir on build
            return new RawFile(event.srcPath, event.outPath);
        }
    }
}
