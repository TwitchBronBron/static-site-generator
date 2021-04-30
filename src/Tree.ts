import type { TextFile } from './files/TextFile';

export class Tree {
    constructor(
        public name: string,
        public path: string,
        public title?: string,
        public file?: TextFile,
        public children: Tree[] = []
    ) {
        this.title = this.title ?? this.name;
    }

    public get hasChildren() {
        return this.children?.length > 0;
    }

    public add(path: string, file?: TextFile) {
        const parts = path.split(/[\\\/]/);
        let node = this as any as Tree;
        const filename = parts.pop();
        for (const part of parts) {
            const search = node.children.find(x => x.name === part);
            if (search) {
                node = search;
            } else {
                const newNode = new Tree(part, path, part);
                node.children.push(newNode);
                node = newNode;
            }
        }
        //now that we have the parent node, push the file
        node.children.push(
            new Tree(filename, path, file?.title ?? filename, file)
        );
    }

    /**
     * Sort the tree recursively. Leafs are sorted to the top and then alphabetized, then branches are alphatized next (at the bottom)
     */
    public sort() {
        const nodes = [this] as Tree[];
        while (nodes.length > 0) {
            const node = nodes.pop();
            nodes.push(...node.children ?? []);

            //sort the children of this node
            node.children.sort((a, b) => {
                let aPriority = this.getPriority(a) ?? Number.MAX_SAFE_INTEGER;
                let bPriority = this.getPriority(b) ?? Number.MAX_SAFE_INTEGER;

                //sort by file priority
                if (aPriority > bPriority) {
                    return 1;
                } else if (bPriority > aPriority) {
                    return -1;
                }

                //now sort by name
                return a.name.localeCompare(b.name);
            });
        }
        return this;
    }

    /**
     * Given a node, find its priority. If the node doesn't have a priority, look through its direct children for a `parentPriority` attribute
     */
    private getPriority(node: Tree) {
        if (!node.hasChildren) {
            return node.file?.attributes.priority;
        }
        for (const child of node.children) {
            const childPriority = child.file?.attributes.parentPriority;
            if (childPriority) {
                return childPriority;
            }
        }
    }
}

export enum SortMode {

}
