import * as chokidar from 'chokidar';
import * as serveStatic from 'serve-static';
import * as http from 'http';
import * as fsExtra from 'fs-extra';
import * as globby from 'globby';
import * as path from 'path';
import * as finalhandler from 'finalhandler';
import * as debounce from 'debounce';
import { Http2Server } from 'node:http2';
import * as ejs from 'ejs';
import * as marked from 'marked';
var frontMatter = require('front-matter');
import { AddressInfo } from 'net';

export class StaticSiteGenerator {
    constructor(
        public options: Options
    ) {
        sanitizeOptions(options);
    }

    /**
     * An array of file paths found during the build (relative to options.sourceDir).
     */
    private files!: string[];

    public run() {
        if (this.options.watch) {
            this.watch();
        } else {
            this.build();
        }
    }

    /**
     * Build the site. This scans the sourceDir, and generates the site into the outDir
     */
    public async build() {
        //create and empty out the destination folder
        fsExtra.emptyDirSync(this.options.outDir!);

        this.files = globby
            //find all the files
            .sync(this.options.files!, {
                cwd: this.options.sourceDir,
                absolute: false
            })
            //use the platform-specific path separator
            .map(x => x.replace(/[\\\/]/g, path.sep));

        //build all file asynchronously
        await Promise.all(
            this.files.map(this.processFile.bind(this))
        );
    }

    /**
     * Called during `build` for each file.
     * @param filePath the relative path to the file (relative teo options.sourceDir)
     */
    private async processFile(filePath: string) {
        //the absolute path to the file
        const srcPath = path.resolve(this.options.sourceDir, filePath);
        const fileExtension = path.extname(filePath).toLowerCase();

        //don't compile template files
        if (filePath === '_template.html') {
            return;

            //pipe html and ejs files through the ejs parser
        } else if (fileExtension === '.html') {
            const outPath = path.resolve(this.options.outDir!, filePath);
            const html = await this.compileEjsFile(srcPath, {});
            await fsExtra.outputFile(outPath, html);

            //compile markdown files
        } else if (fileExtension === '.md') {
            const outPath = path.resolve(this.options.outDir!, filePath).replace(/\.md$/i, '.html');
            const html = await this.compileMarkdownFile(filePath);
            await fsExtra.outputFile(outPath, html);

            //direct file copy
        } else {
            fsExtra.copySync(
                srcPath,
                path.join(this.options.outDir!, filePath)
            );
        }
    }

    /**
     * Compute the path to the template file.
     * @param filePath the relative path to the file referencing the template (relative to options.sourceDir)
     * @returns the absolute path to the template file
     */
    private getTemplatePath(filePath: string, templateFrontmatter?: string) {
        //if the file specified a template, use that file (even if it doesn't exist...)
        if (templateFrontmatter) {
            return standardizePath(this.options.sourceDir, path.dirname(filePath), templateFrontmatter);
        } else {
            //walk up the directory tree and use the closest _template.{ejs,html} file
            let dir = filePath;

            while (dir = path.dirname(dir)) {

                const templatePath = path.normalize(path.join(dir, '_template.html'));
                if (this.files.includes(templatePath)) {
                    return standardizePath(this.options.sourceDir, templatePath);
                }
                //quit the loop if we didn't find a template
                if (dir === '.') {
                    return;
                }
            }
        }
        // no template exists
    }

    /**
     * Get the text contents for the specified file.
     * This is just shorthand around
     */
    private async readFile(filePath: string) {
        return (await fsExtra.readFile(
            path.resolve(this.options.sourceDir,
                filePath
            )
        )).toString();
    }

    /**
     * Build a markdown file
     * @param filePath the relative path to the file (relative to options.sourceDir)
     */
    private async compileMarkdownFile(filePath: string) {
        //get frontmatter and contents from file
        const content = frontMatter(
            await this.readFile(filePath)
        );
        //build html from the markdown file
        const mdHtml = marked(content.body);

        //find the template path
        const templatePath = this.getTemplatePath(filePath, content.attributes.template);
        if (templatePath) {
            if (!fsExtra.pathExists(templatePath)) {
                throw new Error(`Cannot find template '${templatePath}' for file '${path.join(this.options.sourceDir, filePath)}'`);
            }
            return this.compileEjsFile(templatePath, {
                slots: {
                    //pass the markdown html in with its slot name
                    [content.attributes.slot ?? 'content']: mdHtml
                }
            });
        } else {
            return mdHtml;
        }
    }

    /**
     * Compile an ejs template
     */
    private compileEjsFile(filePath: string, data: Record<string, any>) {
        return ejs.renderFile(
            filePath,
            {
                ...data,
                //pass the options for this generator
                options: this.options,
                //pass the array of files
                files: this.files,
            }
        );

    }

    private server!: Http2Server;
    private watcher!: chokidar.FSWatcher;

    public async watch() {
        var serve = serveStatic('dist/docs', { 'index': ['index.html'] });
        var host = 'localhost';
        this.server = http.createServer((req, res) => {
            serve(req, res, finalhandler(req, res) as any)
        }).listen(8000, host, () => {
            var address = this.server.address() as AddressInfo;
            console.log(`Serving docs at http://${address.address}:${address.port}`);
        });
        this.watcher = chokidar.watch('**/*', {
            cwd: this.options.sourceDir,
            ignoreInitial: false
        });
        //watch the docs folder for any changes
        this.watcher.on('all', debounce(() => {
            console.log('Building site...');
            this.build()
        }, 200));
    }

}

/**
 * Sanitize the given options in-place
 */
function sanitizeOptions(options: Options) {
    options.sourceDir = resolvePath(options.sourceDir, 'src');
    options.outDir = resolvePath(options.outDir, 'dist');
    options.files = options.files ?? ["**/*"]
    return options;
}

/**
 * Given a path, convert to an absolute path and use the current OS path.sep
 */
function resolvePath(thePath?: string, defaultValue?: string) {
    return path.normalize(
        path.resolve(
            process.cwd(),
            thePath ?? defaultValue ?? process.cwd()
        )
    ).replace(/[\\\/]/g, path.sep);
}

/**
 * Normalize, resolve, and standardize path.sep for a chunk of path parts
 */
function standardizePath(...parts: string[]) {
    return path.normalize(
        path.resolve(...parts)
    ).replace(/[\\\/]/g, path.sep);
}

export interface Options {
    /**
     * The path to the directory containing the source files
     */
    sourceDir: string;
    /**
     * The path to the directory where the output files should be written
     */
    outDir?: string;
    /**
     * An array of file paths or globs of the files that should be included in the build.
     * These must be relative to sourceDir
     */
    files?: string[];
    /**
     * If true, the program will run in watch mode and re-build on every change. This also starts a web server and links livereload to the served pages.
     */
    watch?: boolean;
}
