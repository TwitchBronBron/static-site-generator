import { expect } from 'chai';
import * as fsExtra from 'fs-extra';
import * as path from 'path';
import { assert } from 'sinon';
import { printDiagnostics } from './diagnosticUtils';
import { Options, StaticSiteGenerator } from './StaticSiteGenerator';
import { createRange } from './util';

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

    it('compiles ejs in ejs files', async () => {
        writeFiles({
            'index.ejs': `<title><%="Page title"%></title>`
        });
        await run();
        expectFileToEqual(`${outDir}/index.html`, `<title>Page title</title>`);
    });

    it('supports html as template', async () => {
        writeFiles({
            'file.md': `# header`,
            '_template.html': `<title><!--content--></title>`
        });
        await run();
        expectFileToEqual(`${outDir}/file.html`, `<title><h1 id="header">header</h1></title>`);
    });

    it('does not render files starting with underscore', async () => {
        writeFiles({
            '_file1.html': '',
            '_file2.ejs': '',
            '_file3.css': ''
        });
        await run();
        expect(fsExtra.pathExistsSync(`${outDir}/_file1.html`)).to.be.false;
        expect(fsExtra.pathExistsSync(`${outDir}/_file2.ejs`)).to.be.false;
        expect(fsExtra.pathExistsSync(`${outDir}/_file2.html`)).to.be.false;
        expect(fsExtra.pathExistsSync(`${outDir}/_file3.css`)).to.be.false;
    });

    it('supports html file with frontmatter', async () => {
        writeFiles({
            'file.html': trim`
                ---
                template: customTemplate.ejs
                title: File!!!
                ---
                <i>Hello world</i>
            `,
            '_template.html': `<title><!--content--></title>`,
            'customTemplate.ejs': `custom<%-data.content%>template`
        });
        await run();
        expectFileToEqual(`${outDir}/file.html`, `custom<i>Hello world</i>template`);
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
            '_template.ejs': `
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
            '_template.ejs': `
               <title><%=data.title%></title>
            `
        });
        await run();
        expectFileToEqual(`${outDir}/about.html`, `
            <title>Hello title</title>
        `);
    });

    it('does not crash on ejs syntax errors', async () => {
        writeFiles({
            'test.ejs': trim`<%=hello world%>`,
        });
        const generator = await run();
        expect(generator.project.getDiagnostics().map(x => x.message)).to.eql([
            'Unexpected token'
        ]);
    });

    it('parses ejs errors not handled by ejs-lint', async () => {
        writeFiles({
            'test.ejs': trim`
                <html>
                <%=hello%>
            `,
        });
        const generator = await run();
        const diagnostics = generator.project.getDiagnostics();
        expect(diagnostics.map(x => x.message)).to.eql([
            'hello is not defined'
        ]);
        expect(diagnostics.map(x => x.range)).to.eql([
            createRange(1, 0, 1, 0)
        ]);
    });

    it.skip('temp test', async () => {
        options.cwd = 'C:/projects/roku/vscode-brightscript-language';
        options.outDir = 'dist-docs';
        options.sourceDir = 'docs';
        options.files = ['**/*'];
        const generator = await run();
        printDiagnostics(generator.project.getDiagnostics());
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
    return generator;
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
