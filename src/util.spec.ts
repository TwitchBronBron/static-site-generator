import { expect } from 'chai';
import { getRelativeUrl, s } from './util';
import { outDir } from './testHelpers.spec';

describe('util', () => {
    describe('getRelativeUrl', () => {
        it('works for same-folder paths', () => {
            expect(
                getRelativeUrl('./style.css', s`${outDir}/_template.ejs`, s`${outDir}/index.html`)
            ).to.eql('style.css');
        });

        it('works for parent folder paths', () => {
            expect(
                getRelativeUrl('../style.css', s`${outDir}/_template.ejs`, s`${outDir}/index.html`)
            ).to.eql('../style.css');
        });

        it('works for child->parent folder paths', () => {
            expect(
                getRelativeUrl('./style.css', s`${outDir}/_template.ejs`, s`${outDir}/subdir/index.html`)
            ).to.eql('../style.css');
        });

        it('works for parent->child folder paths', () => {
            expect(
                getRelativeUrl('../style.css', s`${outDir}/subdir/_template.ejs`, s`${outDir}/index.html`)
            ).to.eql('style.css');
        });
    });
});
