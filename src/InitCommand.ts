import * as fsExtra from 'fs-extra';
import * as path from 'path';
import * as isEmptyDir from 'empty-dir';
import latestVersion from 'latest-version';
import * as childProcess from 'child_process';

export class InitCommand {

    public async run(options: { path: string }) {
        let outDir: string;
        if (options.path) {
            outDir = path.resolve(process.cwd(), options.path);
        } else {
            outDir = process.cwd();
        }
        if (fsExtra.pathExistsSync(outDir) && !isEmptyDir.sync(outDir)) {
            throw new Error(`Directory is not empty: ${outDir}`);
        }

        //copy the files to `src`
        fsExtra.copySync(
            path.resolve(__dirname, '..', 'templates', 'default'),
            path.resolve(outDir, 'src')
        );

        //create the package.json
        fsExtra.outputFileSync(
            path.resolve(outDir, 'package.json'),
            JSON.stringify({
                name: 'statigen-site',
                version: '0.1.0',
                description: 'A static website built by statigen',
                scripts: {
                    build: 'statigen',
                    watch: 'statigen --watch'
                },
                dependencies: {
                    statigen: `^${await latestVersion('statigen')}`
                }
            }, null, 4)
        );

        //run npm install
        childProcess.spawnSync(
            process.platform.startsWith('win') ? 'npm.cmd' : 'npm',
            ['install'],
            {
                cwd: outDir,
                stdio: 'inherit'
            }
        );
    }
}
