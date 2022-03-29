import * as parcelWatcher from '@parcel/watcher';
import * as fastGlob from 'fast-glob';
import * as path from 'path';
import * as debounce from 'debounce';
import * as liveServer from '@compodoc/live-server';
import * as chalk from 'chalk';
import { log } from './util';
import { Project } from './Project';
import { printDiagnostics } from './diagnosticUtils';

export class StaticSiteGenerator {
    public project: Project;

    public async run(options: Options) {
        this.createProject(options);
        this.build();
        const diagnostics = this.project.getDiagnostics();
        printDiagnostics(diagnostics);

        if (this.project.options.watch) {
            //return a promise that never resolves
            return new Promise(() => {
                // eslint-disable-next-line no-void
                void this.watch();
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
        const filePaths = fastGlob
            //find all the files
            .sync(this.project.options.files, {
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
        log('Building project...');
        this.project.validate();
        this.project.publish();
        log('Done!');
    }

    private watcher!: parcelWatcher.AsyncSubscription;

    /**
     * A handle for the watch mode interval that keeps the process alive.
     * We need this so we can clear it if the builder is disposed
     */
    private watchInterval: NodeJS.Timer;

    private async watch() {
        console.log('Starting watcher');
        if (this.watchInterval) {
            clearInterval(this.watchInterval);
        }
        //keep the process alive indefinitely by setting an interval that runs once every 12 days
        this.watchInterval = setInterval(() => { }, 1073741824);

        liveServer.start({
            root: this.project.options.outDir,
            open: true,
            logLevel: 0
        });
        const build = debounce(() => {
            try {
                this.build();
                printDiagnostics(this.project.getDiagnostics());
            } catch (e) {
                console.error(e);
            }
        });

        console.log('Watching dir: ', this.project.options.sourceDir);
        this.watcher = await parcelWatcher.subscribe(this.project.options.sourceDir, (err, events) => {
            for (const event of events ?? []) {
                if (event.type === 'create') {
                    log('File added', chalk.green(event.path));
                    this.project.setFile(event.path);
                } else if (event.type === 'update') {
                    log('File changed', chalk.green(event.path));
                    this.project.setFile(event.path);
                } else if (event.type === 'delete') {
                    log('File removed', chalk.green(event.path));
                    this.project.removeFile(event.path);
                }
            }
            build();
        });
    }

    public async destroy() {
        await this.watcher?.unsubscribe();
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
