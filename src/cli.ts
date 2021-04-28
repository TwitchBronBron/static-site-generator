#!/usr/bin/env node

import * as yargs from 'yargs';
import { StaticSiteGenerator } from "./StaticSiteGenerator";
yargs
    .usage('$0', 'A simple convention-based static site generator for markdown files')
    .help('help', 'View help information about this tool.')
    .option('sourceDir', {
        description: `Path to the directory containing your source files`,
        alias: 's',
        type: 'string',
        default: 'src'
    })
    .option('outDir', {
        description: `Path to the directory where the output file should be written.`,
        alias: 'o',
        type: 'string',
        default: 'dist'
    })
    .option('cwd', {
        description: `Path to the current working directory where the tool should run.`,
        type: 'string'
    })
    .option('watch', {
        description: `If true, the program will run in watch mode and rebuild on every source file change. This also starts a web server to host the generated site.`,
        type: 'boolean',
        default: false
    })
    .command('$0 [files..]', '', () => { }, async (argv: any) => {
        try {
            const generator = new StaticSiteGenerator();
            await generator.run(argv);
        } catch (e) {
            console.error(e);
            process.exit(1);
        }
    })
    .argv;
