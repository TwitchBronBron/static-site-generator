import { expect } from 'chai';
import type { TextFile } from './files/TextFile';
import { Tree } from './Tree';

describe('Tree', () => {
    let tree: Tree;

    beforeEach(() => {
        tree = new Tree(undefined, undefined, undefined);
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
            'a/b/c',
            'a/b/d',
            'a/e'
        ]);
    });

    it('honors file-specified priority', () => {
        tree.add('a', priority(1));
        tree.add('b', priority(3));
        tree.add('c', priority(2));

        expect(
            getLeafKeys(tree.sort())
        ).to.eql([
            'a',
            'c',
            'b'
        ]);
    });

    it('sorts unprioritized items alphabetically at the bottom', () => {
        tree.add('z', priority(1));
        tree.add('d', priority(1));
        tree.add('a');
        tree.add('c');
        tree.add('b');

        expect(
            getLeafKeys(tree.sort())
        ).to.eql([
            'd',
            'z',
            'a',
            'b',
            'c'
        ]);
    });

    it('sorts branches based on direct child parentPriority values', () => {
        tree.add('a/aa', parentPriority(2));
        tree.add('b/bb', parentPriority(1));
        tree.add('c/cc', parentPriority(3));
        tree.add('d/dd', parentPriority(5));
        tree.add('e/ee', parentPriority(4));

        expect(
            getLeafKeys(tree.sort())
        ).to.eql([
            'b/bb',
            'a/aa',
            'c/cc',
            'e/ee',
            'd/dd'
        ]);
    });

    it('picks the correct child for calculating path in the parent node', () => {
        tree.add('introduction.html');
        tree.add('Debugging/ComponentLibraries.html', parentPriority(1));
        tree.add('Debugging/index.html', priority(1));
        tree.sort();
        const debuggingNode = tree.children[0];
        expect(debuggingNode.name).to.eql('Debugging');
        expect(debuggingNode.path).to.eql('Debugging');
    });
});

function priority(value: number) {
    return {
        attributes: {
            priority: value
        }
    } as any as TextFile;
}

function parentPriority(value: number) {
    return {
        attributes: {
            parentPriority: value
        }
    } as any as TextFile;
}

function getLeafKeys(tree: Tree, parentKey?: string) {
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
