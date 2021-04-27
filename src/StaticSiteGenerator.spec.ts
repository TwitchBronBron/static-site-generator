import { expect } from 'chai';
import * as fsExtra from 'fs-extra';
import * as path from 'path';
import { assert } from 'sinon';
import { Options, StaticSiteGenerator } from './StaticSiteGenerator';

const tempDir = path.resolve(path.join(__dirname, '..', '.tmp'));
const sourceDir = path.join(tempDir, 'src');
const outDir = path.join(tempDir, 'dest');
let options: Options;

describe('StaticSiteGenerator', () => {
    beforeEach(() => {
        options = {
            sourceDir: sourceDir,
            outDir: outDir
        } as Options;
        fsExtra.emptydirSync(tempDir);
    });
    afterEach(() => {
        fsExtra.removeSync(tempDir);
    });

    it('copies static files', async () => {
        writeFiles({
            'app.css': '/*css*/',
            'scripts/script.js': '//js'
        });

        await run();
        expectFileToEqual(
            `${outDir}/app.css`,
            '/*css*/'
        );
        expectFileToEqual(
            `${outDir}/scripts/script.js`,
            '//js'
        );
    });

    it('compiles ejs in html files', async () => {
        writeFiles({
            'index.html': `<title><%="Page title"%></title>`
        });
        await run();
        expectFileToEqual(`${outDir}/index.html`, `<title>Page title</title>`);
    });

    it('compiles simple markdown file', async () => {
        writeFiles({
            'about.md': '# Hello world'
        });
        await run();
        expectFileToEqual(`${outDir}/about.html`, '<h1 id="hello-world">Hello world</h1>');
    });

    it('transpiles markdown with default template and slot', async () => {
        writeFiles({
            'about.md': '*italic*',
            '_template.html': `
                <div id="content">
                    <%-data.content%>
                </div>
            `
        });
        await run();
        expectFileToEqual(`${outDir}/about.html`, `
            <div id="content">
                <p><em>italic</em></p>
            </div>
        `);
    });

    it('passes custom frontmatter props to template', async () => {
        writeFiles({
            'about.md': trim`
                ---
                title: Hello title
                ---
                *italic*
            `,
            '_template.html': `
               <title><%=data.title%></title>
            `
        });
        await run();
        expectFileToEqual(`${outDir}/about.html`, `
            <title>Hello title</title>
        `);
    });
});

function expectFileToEqual(filePath: string, expectedText: string, trim = true) {
    if (!fsExtra.pathExistsSync(filePath)) {
        assert.fail(`Expected file to exist at "${filePath}"`);
    }
    let actualText = fsExtra.readFileSync(filePath).toString();
    if (trim) {
        actualText = trimLeading(actualText);
        expectedText = trimLeading(expectedText);
    }
    expect(actualText).to.eql(expectedText);
}

/**
 * Write a set of files to sourceDir
 */
function writeFiles(files: Record<string, string>) {
    for (const filePath in files) {
        fsExtra.outputFileSync(
            path.join(sourceDir, filePath),
            files[filePath]
        );
    }
}

async function run() {
    const generator = new StaticSiteGenerator();
    await generator.run(options);
}

/**
 * Trim leading whitespace for every line (to make test writing cleaner).
 * Also removes empty lines for consistency
 */
function trimLeading(text: string) {
    if (!text) {
        return text;
    }
    const lines = text.split(/\r?\n/);
    let minIndent = Number.MAX_SAFE_INTEGER;

    //skip leading empty lines
    while (lines[0]?.trim().length === 0) {
        lines.splice(0, 1);
    }

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const trimmedLine = line.trimLeft();
        //skip empty lines
        if (trimmedLine.length === 0) {
            lines.splice(i, 1);
            i--;
            continue;
        }
        const leadingSpaceCount = line.length - trimmedLine.length;
        if (leadingSpaceCount < minIndent) {
            minIndent = leadingSpaceCount;
        }
    }

    //apply the trim to each line
    for (let i = 0; i < lines.length; i++) {
        lines[i] = lines[i].substring(minIndent);
    }
    return lines.join('\n');
}

/**
 * Remove leading white space and remove excess indentation
 */
export function trim(strings: TemplateStringsArray, ...args: any[]) {
    let text = '';
    for (let i = 0; i < strings.length; i++) {
        text += strings[i];
        if (args[i]) {
            text += args[i];
        }
    }
    return trimLeading(text);
}
