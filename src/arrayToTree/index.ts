interface IArrayNode {
  id: string | number;
  parentId: string | number | null;
  name: string;
}

interface ITreeNode {
  id: string | number;
  name: string;
  children?: ITreeNode[];
}

export function arrayToTree(arrayList: IArrayNode[] = []) {
  if (arrayList.length === 0) {
    return {};
  }

  const tree: Record<string | number, ITreeNode> = {};
  const nodeMap = new Map<number | string, ITreeNode>();

  arrayList.forEach((item) => {
    const node: ITreeNode = { id: item.id, name: item.name, children: [] };
    nodeMap.set(item.id, node);

    if (item.parentId === null) {
      tree[item.id] = node;
    } else {
        const parent = nodeMap.get(item.parentId);
        if (parent) {
        parent.children = parent.children || [];
        parent.children.push(node);
      }else {
        // 如果父节点还未创建，则创建空父节点并加入
        const newParent: ITreeNode = { id: item.parentId, name: '', children: [node] };
        nodeMap.set(item.parentId, newParent);
      }
    }
  });

  return tree;
}
