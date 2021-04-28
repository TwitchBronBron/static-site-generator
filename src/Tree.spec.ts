import { expect } from 'chai';
import type { File } from './interfaces';
import { Tree } from './Tree';

describe('Tree', () => {
    let tree: Tree<File>;

    beforeEach(() => {
        tree = new Tree<File>(undefined, undefined);
    });

    it('adds top-level file nodes', () => {
        tree.add('index.html');
        tree.add('zzz.html');
        tree.add('bbb.html');
        expect(
            getLeafKeys(tree.sort())
        ).to.eql([
            'bbb.html',
            'index.html',
            'zzz.html'
        ]);
    });

    it('adds child nodes', () => {
        tree.add('a/b/d');
        tree.add('a/b/c');
        tree.add('a/a');
        tree.add('a/e');
        expect(
            getLeafKeys(tree.sort())
        ).to.eql([
            'a/a',
            'a/e',
            'a/b/c',
            'a/b/d'
        ]);
    });
});

function getLeafKeys<T>(tree: Tree<T>, parentKey?: string) {
    const myKey = parentKey ? parentKey + '/' + tree.name : tree.name;
    const keys = [] as string[];
    //only keep the leaf keys
    if (!tree.hasChildren) {
        keys.push(myKey);
    }
    for (const child of tree.children ?? []) {
        keys.push(
            ...getLeafKeys(child, myKey)
        );
    }
    return keys;
}
