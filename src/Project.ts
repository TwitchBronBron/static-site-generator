import PluginManager from "./PluginManager";
import { File } from './interfaces';
import { InternalPlugin } from "./InternalPlugin";
import { printDiagnostic } from "./diagnosticUtils";
import * as path from 'path';
import { Options } from "./StaticSiteGenerator";
import { TextFile } from "./files/TextFile";
import { standardizePath } from "./util";
import { DiagnosticMessages } from "./DiagnosticMessages";
import * as ejs from 'ejs';

export class Project {
    constructor(
        options: Options
    ) {
        this.pluginManager.add(new InternalPlugin());
        this.setOptions(options);
    }

    public options: Options;

    private pluginManager = new PluginManager();

    /**
     * Map of all files in the project, indexed by absolute path
     */
    public files = new Map<string, File>();

    /**
     * Add or replace a file in the project
     */
    public setFile(srcPath: string);
    public setFile(fileEntry: { src: string; dest: string });
    public setFile(param: string | { src: string; dest: string }) {
        let srcPath: string;
        let outPath: string;
        if (typeof param === 'string') {
            srcPath = path.resolve(this.options.sourceDir, param);
            outPath = path.resolve(this.options.outDir, param);
        } else {
            srcPath = path.resolve(this.options.sourceDir, param.src);
            outPath = path.resolve(this.options.outDir, param.dest);
        }

        let file = this.files.get(srcPath);
        //add the file
        if (!file) {
            file = this.pluginManager.getFirst('provideFile', {
                project: this,
                srcPath: srcPath,
                outPath: outPath
            }) as File;
            //link this project to the file
            file.project = this;
            this.files.set(srcPath, file);
            this.pluginManager.emit('onFileAdd', { project: this, file: file });
        }

        this.pluginManager.emit('beforeFileLoad', { project: this, file: file });

        //if the file has a load function
        file.load?.();

        this.pluginManager.emit('afterFileLoad', { project: this, file: file });
    }

    /**
     * Remove a file from the project
     */
    public removeFile(srcPath: string) {
        const file = this.files.get(srcPath);
        if (file) {
            this.pluginManager.emit('onFileRemove', { project: this, file: file });
            this.files.delete(srcPath);
        }
    }

    /**
     * Validate the entire project
     */
    public validate() {
        for (const file of this.files.values()) {
            this.pluginManager.emit('beforeFileValidate', { project: this, file: file });

            file.validate?.();

            this.pluginManager.emit('afterFileValidate', { project: this, file: file });

            for (const diagnostic of file.diagnostics ?? []) {
                printDiagnostic(diagnostic);
            }
        }
    }

    /**
     * Determine if the given file exists somewhere within the sourceDir
     */
    private fileResidesInSourceDir(file: File) {
        return file.srcPath.startsWith(this.options.sourceDir);
    }

    /**
     * Get the template file for a given file
     */
    public getTemplateFile(file: TextFile): TextFile {
        //if the file specified a template, use that file (even if it doesn't exist...)
        if (file.attributes.template) {
            const templateSrcPath = standardizePath(path.dirname(file.srcPath), file.attributes.template);
            if (!this.files.has(templateSrcPath)) {
                file.diagnostics.push({
                    file: file,
                    ...DiagnosticMessages.missingTemplate(templateSrcPath)
                });
            }
            return this.files.get(templateSrcPath) as TextFile;

            //files outside of sourceDir
        } else if (!this.fileResidesInSourceDir(file)) {
            return this.files.get(
                standardizePath(path.dirname(file.srcPath), '_template.html')
            ) as TextFile;

            //files inside sourceDir
        } else {
            //walk up the directory tree and use the closest _template.{ejs,html} file

            let dir = file.srcPath.replace(this.options.sourceDir + path.sep, '');
            while (dir = path.dirname(dir)) {

                const templatePath = path.resolve(
                    this.options.sourceDir,
                    path.normalize(
                        path.join(dir, '_template.html')
                    )
                );
                if (this.files.has(templatePath)) {
                    return this.files.get(templatePath) as TextFile;
                }
                //quit the loop if we didn't find a template
                if (dir === '.') {
                    return;
                }
            }
        }
    }

    /**
     * Given a file, look up its template and then generate the output text
     * using the ejs templating engine.
     * If the template could not be found, the content is returned as-is
     */
    public generateWithTemplate(file: TextFile, content: string) {
        const templateFile = this.getTemplateFile(file);
        if (templateFile) {
            return ejs.render(templateFile.text, {
                //all the ejs data should be inside a `data` object so we don't have to deal with undefined variable errors in ejs
                data: {
                    ...(file.attributes ?? {}),
                    file: file,
                    project: this,
                    content: content
                }
            }
            );
        } else {
            //no template was found. return the content as-is
            return content;
        }
    }

    public publish() {
        for (const file of this.files.values()) {
            this.pluginManager.emit('beforeFilePublish', { project: this, file: file });

            if (file.skipPublish !== true) {
                file.publish?.();
            }

            this.pluginManager.emit('afterFilePublish', { project: this, file: file });
        }
    }

    /**
     * Sanitize the given options in-place
     */
    private setOptions(options: Options) {
        this.options = {} as Options;
        this.options.cwd = standardizePath(process.cwd(), options.cwd!).replace(/[\\\/]+$/, '');
        this.options.sourceDir = this.resolvePath(options.sourceDir, 'src').replace(/[\\\/]+$/, '');
        this.options.outDir = this.resolvePath(options.outDir, 'dist').replace(/[\\\/]+$/, '');
        this.options.files = options.files ?? ["**/*"]
        this.options.watch = options.watch === true;
        return options;
    }

    /**
     * Given a path, convert to an absolute path and use the current OS path.sep
     */
    private resolvePath(thePath?: string, defaultValue?: string) {
        return path.normalize(
            path.resolve(
                this.options.cwd!,
                thePath ?? defaultValue!
            )
        ).replace(/[\\\/]/g, path.sep);
    }

}
