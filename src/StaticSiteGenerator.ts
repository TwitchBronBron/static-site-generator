import * as chokidar from 'chokidar';
import * as globby from 'globby';
import * as path from 'path';
import * as debounce from 'debounce';
import * as liveServer from 'live-server';
import * as chalk from 'chalk';
import { log } from './util';
import { Project } from './Project';
import { printDiagnostics } from './diagnosticUtils';

export class StaticSiteGenerator {
    constructor() {
    }

    public project: Project;

    public run(options: Options) {
        this.createProject(options);
        this.build();
        const diagnostics = this.project.getDiagnostics();
        printDiagnostics(diagnostics);

        if (this.project.options.watch) {
            //return a promise that never resolves
            return new Promise(() => {
                this.watch();
            });
        } else {
            if (diagnostics.length > 0) {
                throw new Error(`Found ${diagnostics.length} errors during publish`);
            }
        }
    }

    private createProject(options: Options) {
        this.project = new Project(options);
        //load all the files into the project
        const filePaths = globby
            //find all the files
            .sync(this.project.options.files!, {
                cwd: this.project.options.sourceDir,
                absolute: false
            })
            //use the platform-specific path separator
            .map(x => x.replace(/[\\\/]/g, path.sep));

        //add all files to the project
        for (const filePathRelative of filePaths) {
            this.project.setFile(filePathRelative);
        }
    }

    private build() {
        this.project.validate();
        this.project.publish();
    }

    private watcher!: chokidar.FSWatcher;

    /**
     * A handle for the watch mode interval that keeps the process alive.
     * We need this so we can clear it if the builder is disposed
     */
    private watchInterval: NodeJS.Timer;

    private async watch() {
        if (this.watchInterval) {
            clearInterval(this.watchInterval);
        }
        //keep the process alive indefinitely by setting an interval that runs once every 12 days
        this.watchInterval = setInterval(() => { }, 1073741824);

        liveServer.start({
            root: this.project.options.outDir!,
            open: true
        });
        this.watcher = chokidar.watch('**/*', {
            cwd: this.project.options.sourceDir,
            ignoreInitial: true
        });
        const build = debounce(() => {
            try {
                this.build();
                printDiagnostics(this.project.getDiagnostics());
            } catch (e) {
                console.error(e);
            }
        });

        this.watcher.on('add', (file) => {
            log('File added', chalk.green(file));
            this.project.setFile(file);
            build();
        });
        this.watcher.on('change', (file) => {
            log('File changed', chalk.green(file));
            this.project.setFile(file);
            build();
        });
        this.watcher.on('unlink', (file) => {
            log('File removed', chalk.green(file));
            this.project.removeFile(file);
            build();
        });
    }
}

export interface Options {
    /**
     * The directory where the tool should run
     */
    cwd?: string;
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
