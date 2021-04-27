import { Diagnostic, File } from "../interfaces";
import * as fsExtra from 'fs-extra';

export class RawFile implements File {
    constructor(
        public srcPath: string,
        public outPath: string
    ) { }

    public diagnostics = [] as Diagnostic[];

    public publish() {
        //copy the file from the source to the outDir
        fsExtra.copySync(
            this.srcPath,
            this.outPath
        );
    }
}
