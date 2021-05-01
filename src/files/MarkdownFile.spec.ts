import { expect } from 'chai';
import { writeFiles, run, trim } from '../testHelpers.spec';
import type { TextFile } from '../files/TextFile';

describe('StaticSiteGenerator', () => {
    it('uses title from frontmatter', async () => {
        writeFiles({
            'index.md': trim`
                ---
                title: bob
                ---
                # title1
            `
        });
        const generator = await run();
        expect(generator.project.getFile<TextFile>('index.md').title).to.eql('bob');
    });

    it('computes title from h1', async () => {
        writeFiles({
            'index.md': `# title1`
        });
        const generator = await run();
        expect(generator.project.getFile<TextFile>('index.md').title).to.eql('title1');
    });

    it('computes title from h1 that has frontmatter', async () => {
        writeFiles({
            'index.md': trim`
                ---
                priority: 2
                ---
                # title1`
        });
        const generator = await run();
        expect(generator.project.getFile<TextFile>('index.md').title).to.eql('title1');
    });

    it('does not compute title from h1 lower in the page', async () => {
        writeFiles({
            'index.md': `Hello\n# title1`
        });
        const generator = await run();
        expect(generator.project.getFile<TextFile>('index.md').title).to.eql('index');
    });

    it('removes dashes from filename', async () => {
        writeFiles({
            'the-first-page.md': ``
        });
        const generator = await run();
        expect(generator.project.getFile<TextFile>('the-first-page.md').title).to.eql('the first page');
    });
});
