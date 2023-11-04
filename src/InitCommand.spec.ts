import { expect } from 'chai';
import { InitCommand } from './InitCommand';
import { tempDir } from './testHelpers.spec';
import * as fsExtra from 'fs-extra';
import * as semver from 'semver';

describe('init command', () => {
    it('initializes with the very latest version of statigen', function test() {
        this.timeout(10_000);
        const cmd = new InitCommand();
        cmd.run({ path: tempDir });
        const statigenVersion = fsExtra.readJsonSync(`${tempDir}/package.json`).dependencies['statigen'].replace('^', '') as string;

        // our test can't really know what the latest version of statigen is, so just make sure we put in a valid semantic version in the package.json
        expect(semver.valid(statigenVersion)).to.eql(statigenVersion);
    });
});
