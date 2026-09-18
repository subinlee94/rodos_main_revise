import { useState, useEffect, useRef, useCallback } from 'react';
import { addNodeAtPath, removeNodeAtPath, createTreeNode, getNodeAtPath, getParentPath } from '../utils/tree/TreeUtils';

/**
 * 공통 TreeViewer 훅 - Properties, IOVariables, Services에서 공통으로 사용
 * @param {Object} initialData - 초기 데이터
 * @param {Function} dataToTree - 데이터를 트리로 변환하는 함수
 * @param {Function} treeToData - 트리를 데이터로 변환하는 함수
 * @param {Function} onChange - 변경 시 호출되는 콜백
 * @param {Array} initialExpandedPaths - 초기에 확장할 경로들
 */
export function useTreeViewer(initialData, dataToTree, treeToData, onChange, initialExpandedPaths = []) {
    const [tree, setTree] = useState(dataToTree(initialData));
    const [selectedNodePath, setSelectedNodePath] = useState([]);
    const [expandedNodes, setExpandedNodes] = useState(new Set(initialExpandedPaths));
    const isInitialized = useRef(false);

    // 초기화 - 한 번만 실행
    useEffect(() => {
        if (!isInitialized.current) {
            setTree(dataToTree(initialData));
            setExpandedNodes(new Set(initialExpandedPaths));
            isInitialized.current = true;
        }
    }, [initialData, dataToTree, initialExpandedPaths]);

    // 노드 추가
    const addNode = useCallback((targetPath, nodeData) => {
        const newNode = createTreeNode(nodeData);

        setTree(prev => {
            const newTree = addNodeAtPath(prev, targetPath, newNode);
            // 즉시 부모 컴포넌트에 동기화
            const data = treeToData(newTree);
            onChange(data);
            return newTree;
        });

        // 부모 노드 확장
        if (targetPath.length > 0) {
            const parentPathKey = JSON.stringify(targetPath);
            setExpandedNodes(prev => new Set([...prev, parentPathKey]));
        }

        return newNode;
    }, [treeToData, onChange]);

    // 노드 삭제
    const removeNode = useCallback((targetPath) => {
        setTree(prev => {
            const newTree = removeNodeAtPath(prev, targetPath);
            // 즉시 부모 컴포넌트에 동기화
            const data = treeToData(newTree);
            onChange(data);
            return newTree;
        });

        // 부모 노드로 선택 이동
        const parentPath = getParentPath(targetPath);
        setSelectedNodePath(parentPath);
    }, [treeToData, onChange]);

    // 노드 업데이트
    const updateNode = useCallback((targetPath, updatedData) => {
        setTree(prev => {
            const newTree = [...prev];
            const targetNode = getNodeAtPath(newTree, targetPath);
            if (targetNode) {
                targetNode.setValue(updatedData);
            }
            // 즉시 부모 컴포넌트에 동기화
            const data = treeToData(newTree);
            onChange(data);
            return newTree;
        });
    }, [treeToData, onChange]);

    // 노드 선택
    const selectNode = useCallback((path) => {
        setSelectedNodePath(path);
    }, []);

    // 노드 확장/축소 토글
    const toggleNodeExpansion = useCallback((path) => {
        const pathKey = JSON.stringify(path);
        setExpandedNodes(prev => {
            const newSet = new Set(prev);
            if (newSet.has(pathKey)) {
                newSet.delete(pathKey);
            } else {
                newSet.add(pathKey);
            }
            return newSet;
        });
    }, []);

    // 노드 확장 상태 확인
    const isNodeExpanded = useCallback((path) => {
        const pathKey = JSON.stringify(path);
        return expandedNodes.has(pathKey);
    }, [expandedNodes]);

    return {
        // 상태
        tree,
        selectedNodePath,
        expandedNodes,

        // 트리 조작 함수
        addNode,
        removeNode,
        updateNode,
        selectNode,

        // UI 함수
        toggleNodeExpansion,
        isNodeExpanded,

        // 상태 설정 함수
        setTree,
        setSelectedNodePath,
        setExpandedNodes
    };
}
