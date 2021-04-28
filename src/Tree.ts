export class Tree<T> {
    constructor(
        public name: string,
        public path: string,
        public data?: T,
        public children: Array<Tree<T>> = []
    ) {

    }

    public get hasChildren() {
        return this.children?.length > 0;
    }

    public add(path: string, data?: T) {
        const parts = path.split(/[\\\/]/);
        let node = this as any as Tree<T>;
        const filename = parts.pop();
        for (const part of parts) {
            const search = node.children.find(x => x.name === part);
            if (search) {
                node = search;
            } else {
                const newNode = new Tree<T>(part, path);
                node.children.push(newNode);
                node = newNode;
            }
        }
        //now that we have the parent node, push the file
        node.children.push(
            new Tree<T>(filename, path, data)
        );
    }

    /**
     * Sort the tree recursively. Leafs are sorted to the top and then alphabetized, then branches are alphatized next (at the bottom)
     */
    public sort() {
        const nodes = [this] as Tree<T>[];
        while (nodes.length > 0) {
            const node = nodes.pop();
            nodes.push(...node.children ?? []);

            //sort the children of this node
            node.children.sort((a, b) => {
                //sort leafs to the top
                if (a.hasChildren && !b.hasChildren) {
                    return 1;
                } else if (b.hasChildren && !a.hasChildren) {
                    return -1;
                }

                //now sort by name
                return a.name.localeCompare(b.name);
            });
        }
        return this;
    }
}

export enum SortMode {

}
