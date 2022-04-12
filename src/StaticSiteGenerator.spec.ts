import { expect } from 'chai';
import * as fsExtra from 'fs-extra';
import { assert } from 'sinon';
import { printDiagnostics } from './diagnosticUtils';
import { createRange, s } from './util';
import { trim, trimLeading, writeFiles, run, outDir, options, sourceDir } from './testHelpers.spec';

describe('StaticSiteGenerator', () => {
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

    it('reads folder name from children files', async () => {
        writeFiles({
            'some-folder/index.ejs': trim`
                ---
                template: customTemplate.ejs
                parentTitle: Overridden Title
                ---
                <title>Page title</title>
            `
        });
        const generator = await run();
        const tree = generator.project.getTree();
        expect(tree.children[0].title).to.eql('Overridden Title');
    });

    it('supports html as template', async () => {
        writeFiles({
            'file.md': `# header`,
            '_template.html': `<title><!--content--></title>`
        });
        await run();
        expectFileToEqual(`${outDir}/file.html`, `<title><a href="#header"><h1 id="header">header</h1></a></title>`);
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
            'customTemplate.ejs': `custom<%-content%>template`
        });
        await run();
        expectFileToEqual(`${outDir}/file.html`, `custom<i>Hello world</i>template`);
    });

    it('compiles simple markdown file', async () => {
        writeFiles({
            'about.md': '# Hello world'
        });
        await run();
        expectFileToEqual(`${outDir}/about.html`, '<a href="#hello-world"><h1 id="hello-world">Hello world</h1></a>');
    });

    it('transpiles markdown with default template', async () => {
        writeFiles({
            'about.md': '*italic*',
            '_template.ejs': `
                <div id="content">
                    <%-content%>
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
               <title><%=attributes.title%></title>
            `
        });
        await run();
        expectFileToEqual(`${outDir}/about.html`, `
            <title>Hello title</title>
        `);
    });

    it('does not crash on ejs syntax errors', async () => {
        writeFiles({
            'test.ejs': trim`<%=hello world%>`
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
            `
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

    it('computes tree title from markdown header', async () => {
        writeFiles({
            'SomeFolder/SomeFile.md': trim`
                # MyHeader
                some content
            `
        });
        const generator = await run();
        expect(generator.project.getTree().children[0].children[0].title).to.eql('MyHeader');
    });

    it('calculates outDir from absolute path', async () => {
        const generator = await run();
        const filePath = s`${sourceDir}/sub1\\sub2/index.md`;
        fsExtra.outputFileSync(filePath, '#stuff');
        const file = generator.project.setFile(filePath);
        expect(s`${file.outPath}`).to.eql(s`${outDir}/sub1/sub2/index.html`);
    });

    it.skip('temp test', async () => {
        options.cwd = 'C:/projects/roku/vscode-brightscript-language';
        options.outDir = 'dist-docs';
        options.sourceDir = 'docs';
        options.files = ['**/*'];
        options.watch = true;
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
