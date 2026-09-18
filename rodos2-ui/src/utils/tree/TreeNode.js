export class TreeNode {
    constructor(data = {}, children = []) {
        this.data = data;
        this.children = children;
    }

    getValue() {
        return this.data;
    }

    setValue(data) {
        this.data = data;
    }

    /**
     * Add a child node to this node
     * @param {TreeNode} child - The child node to add
     * @returns {TreeNode} The added child node
     */
    addChild(child) {
        if (!this.children) {
            this.children = [];
        }
        this.children.push(child);
        return child;
    }

    /**
     * Remove a child node by name
     * @param {string} name - The name of the child to remove
     * @returns {boolean} True if child was removed, false if not found
     */
    removeChildByName(name) {
        if (!this.children) {
            return false;
        }

        const index = this.children.findIndex(child =>
            child.data.name === name
        );

        if (index === -1) {
            return false;
        }

        this.children.splice(index, 1);
        return true;
    }

    /**
     * Remove a child node by index
     * @param {number} index - The index of the child to remove
     * @returns {boolean} True if child was removed, false if index invalid
     */
    removeChildByIndex(index) {
        if (!this.children || index < 0 || index >= this.children.length) {
            return false;
        }

        this.children.splice(index, 1);
        return true;
    }

    /**
     * Get child node by index
     * @param {number} index - The index of the child
     * @returns {TreeNode|null} The child node or null if not found
     */
    getChildByIndex(index) {
        if (!this.children || index < 0 || index >= this.children.length) {
            return null;
        }
        return this.children[index];
    }

    /**
     * Get child node by name
     * @param {string} name - The name of the child
     * @returns {TreeNode|null} The child node or null if not found
     */
    getChildByName(name) {
        if (!this.children) {
            return null;
        }
        return this.children.find(child => child.data.name === name) || null;
    }

    /**
     * Check if this node has children
     * @returns {boolean} True if node has children
     */
    hasChildren() {
        return this.children && this.children.length > 0;
    }

    /**
     * Get the number of children
     * @returns {number} Number of children
     */
    getChildCount() {
        return this.children ? this.children.length : 0;
    }

    /**
     * Convert this node and its children to a plain object
     * @returns {Object} Plain object representation
     */
    toObject() {
        return {
            data: this.data,
            children: this.children ? this.children.map(child => child.toObject()) : []
        };
    }

    /**
     * Create a TreeNode from a plain object
     * @param {Object} obj - Plain object representation
     * @returns {TreeNode} New TreeNode instance
     */
    static fromObject(obj) {
        const node = new TreeNode(obj.data);
        if (obj.children && Array.isArray(obj.children)) {
            node.children = obj.children.map(child => TreeNode.fromObject(child));
        }
        return node;
    }

    /**
     * Create a TreeNode from data
     * @param {Object} data - Data object
     * @returns {TreeNode} New TreeNode instance
     */
    static createFromData(data) {
        return new TreeNode(data);
    }
} 