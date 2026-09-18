// 트리 구조 공통 유틸리티 (Property, IOVariable, Service 등에서 사용)

import { TreeNode } from './TreeNode';

/**
 * Add a node at a specific path in the tree
 * @param {Array} tree - Array of TreeNode objects
 * @param {Array} path - Array of indices representing the path
 * @param {TreeNode} newNode - The node to add
 * @returns {Array} New tree with the node added
 */
export function addNodeAtPath(tree, path, newNode) {
    if (!Array.isArray(tree)) {
        return [newNode];
    }

    if (path.length === 0) {
        return [...tree, newNode];
    }

    const newTree = [...tree];
    const [firstIndex, ...remainingPath] = path;

    if (firstIndex >= 0 && firstIndex < newTree.length) {
        const targetNode = newTree[firstIndex];
        if (targetNode instanceof TreeNode) {
            if (remainingPath.length === 0) {
                // Add as direct child - 이 부분이 문제였음
                targetNode.addChild(newNode);
                // children을 다시 설정하지 않음 (addChild가 이미 처리함)
            } else {
                // Recursively add to child
                const updatedChildren = addNodeAtPath(targetNode.children || [], remainingPath, newNode);
                targetNode.children = updatedChildren;
            }
        } else {
            // Convert plain object to TreeNode if needed
            const treeNode = new TreeNode(targetNode);
            if (remainingPath.length === 0) {
                treeNode.addChild(newNode);
                // children을 다시 설정하지 않음
            } else {
                const updatedChildren = addNodeAtPath(treeNode.children || [], remainingPath, newNode);
                treeNode.children = updatedChildren;
            }
            newTree[firstIndex] = treeNode;
        }
    }

    return newTree;
}

/**
 * Remove a node at a specific path in the tree
 * @param {Array} tree - Array of TreeNode objects
 * @param {Array} path - Array of indices representing the path
 * @returns {Array} New tree with the node removed
 */
export function removeNodeAtPath(tree, path) {
    if (!Array.isArray(tree) || path.length === 0) {
        return tree;
    }

    const newTree = [...tree];
    const [firstIndex, ...remainingPath] = path;

    if (firstIndex >= 0 && firstIndex < newTree.length) {
        if (remainingPath.length === 0) {
            // Remove this node
            newTree.splice(firstIndex, 1);
        } else {
            // Recursively remove from child
            const targetNode = newTree[firstIndex];
            if (targetNode instanceof TreeNode) {
                const updatedChildren = removeNodeAtPath(targetNode.children || [], remainingPath);
                targetNode.children = updatedChildren;
            } else {
                // Convert plain object to TreeNode if needed
                const node = new TreeNode(targetNode);
                const updatedChildren = removeNodeAtPath(node.children || [], remainingPath);
                node.children = updatedChildren;
                newTree[firstIndex] = node;
            }
        }
    }

    return newTree;
}

/**
 * Get a node at a specific path in the tree
 * @param {Array} tree - Array of TreeNode objects
 * @param {Array} path - Array of indices representing the path
 * @returns {TreeNode|null} The node at the path or null if not found
 */
export function getNodeAtPath(tree, path) {
    if (!Array.isArray(tree) || path.length === 0) {
        return null;
    }

    const [firstIndex, ...remainingPath] = path;

    if (firstIndex >= 0 && firstIndex < tree.length) {
        const targetNode = tree[firstIndex];

        if (remainingPath.length === 0) {
            return targetNode instanceof TreeNode ? targetNode : new TreeNode(targetNode);
        } else {
            if (targetNode instanceof TreeNode) {
                return getNodeAtPath(targetNode.children || [], remainingPath);
            } else {
                const node = new TreeNode(targetNode);
                return getNodeAtPath(node.children || [], remainingPath);
            }
        }
    }

    return null;
}

/**
 * Update a node at a specific path in the tree
 * @param {Array} tree - Array of TreeNode objects
 * @param {Array} path - Array of indices representing the path
 * @param {Object} updatedNode - Updated node data
 * @returns {Array} New tree with the node updated
 */
export function updateNodeAtPath(tree, path, updatedNode) {
    if (!Array.isArray(tree) || path.length === 0) {
        return tree;
    }

    const newTree = [...tree];
    const [firstIndex, ...remainingPath] = path;

    if (firstIndex >= 0 && firstIndex < newTree.length) {
        const targetNode = newTree[firstIndex];

        if (remainingPath.length === 0) {
            // Update this node
            if (targetNode instanceof TreeNode) {
                targetNode.setValue(updatedNode);
            } else {
                newTree[firstIndex] = new TreeNode(updatedNode);
            }
        } else {
            // Recursively update child
            if (targetNode instanceof TreeNode) {
                const updatedChildren = updateNodeAtPath(targetNode.children || [], remainingPath, updatedNode);
                targetNode.children = updatedChildren;
            } else {
                const node = new TreeNode(targetNode);
                const updatedChildren = updateNodeAtPath(node.children || [], remainingPath, updatedNode);
                node.children = updatedChildren;
                newTree[firstIndex] = node;
            }
        }
    }

    return newTree;
}

/**
 * Convert a tree of TreeNode objects to a flat array of properties
 * @param {Array} tree - Array of TreeNode objects
 * @returns {Array} Flat array of node objects
 */
export function treeToFlatArray(tree) {
    if (!Array.isArray(tree)) {
        return [];
    }

    const result = [];

    for (const node of tree) {
        if (node instanceof TreeNode) {
            result.push(node.getValue());
            if (node.hasChildren()) {
                result.push(...treeToFlatArray(node.children));
            }
        } else {
            result.push(node);
        }
    }

    return result;
}

/**
 * Convert a flat array of properties to a tree of TreeNode objects
 * @param {Array} properties - Array of node objects
 * @returns {Array} Tree of TreeNode objects
 */
export function flatArrayToTree(properties) {
    if (!Array.isArray(properties)) {
        return [];
    }

    return properties.map(node => {
        if (node instanceof TreeNode) {
            return node;
        }
        return new TreeNode(node);
    });
}

/**
 * Create a tree node from node data
 * @param {Object} nodeData - node data object
 * @returns {TreeNode} New node instance
 */
export function createTreeNode(nodeData) {
    return new TreeNode(nodeData);
}

/**
 * Get the parent path of a given path
 * @param {Array} path - Current path
 * @returns {Array} Parent path
 */
export function getParentPath(path) {
    if (!Array.isArray(path) || path.length === 0) {
        return [];
    }
    return path.slice(0, -1);
}

/**
 * Check if a path is valid in the given tree
 * @param {Array} tree - Array of node objects
 * @param {Array} path - Array of indices representing the path
 * @returns {boolean} True if path is valid
 */
export function isValidPath(tree, path) {
    if (!Array.isArray(tree) || path.length === 0) {
        return false;
    }

    const [firstIndex, ...remainingPath] = path;

    if (firstIndex < 0 || firstIndex >= tree.length) {
        return false;
    }

    if (remainingPath.length === 0) {
        return true;
    }

    const targetNode = tree[firstIndex];
    if (targetNode instanceof TreeNode) {
        return isValidPath(targetNode.children || [], remainingPath);
    } else {
        return isValidPath([], remainingPath);
    }
} 