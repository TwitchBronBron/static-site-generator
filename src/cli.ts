#!/usr/bin/env node

import * as yargs from 'yargs';
import { StaticSiteGenerator } from "./StaticSiteGenerator";
yargs
    .usage('$0', 'A simple convention-based static site generator for markdown files')
    .help('help', 'View help information about this tool.')
    .option('sourceDir', {
        description: `Path to the directory containing your source files`,
        type: 'string',
        default: 'src'
    })
    .option('outDir', {
        description: `Path to the directory where the output file should be written.`,
        type: 'string',
        default: 'dist'
    })
    .option('watch', {
        description: `If true, the program will run in watch mode and rebuild on every source file change. This also starts a web server to host the generated site.`,
        type: 'boolean',
        default: false
    })
    .command('$0 [files..]', '', () => { }, async (argv: any) => {
        try {
            const generator = new StaticSiteGenerator(argv);
            await generator.run();
        } catch (e) {
            console.error(e?.message || e);
            process.exit(1);
        }
    })
    .argv;
