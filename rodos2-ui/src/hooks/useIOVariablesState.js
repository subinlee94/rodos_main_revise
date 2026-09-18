import { useState, useEffect, useCallback } from 'react';
import { createTreeNode, getNodeAtPath, addNodeAtPath, removeNodeAtPath, getParentPath } from '../utils/tree/TreeUtils';

// 초기 트리 구조 생성
const createInitialTree = () => [
    createTreeNode({ name: 'inputs', direction: 'input', isRoot: true }),
    createTreeNode({ name: 'outputs', direction: 'output', isRoot: true }),
    createTreeNode({ name: 'inouts', direction: 'inout', isRoot: true }),
];

// ioVariables <-> tree 변환 유틸리티 (TreeNode 사용)
function ioVariablesToTree(ioVariables) {
    if (!ioVariables) return createInitialTree();

    const convertIOVariableToNode = (ioVar) => {
        const nodeData = {
            name: ioVar.name || '',
            type: ioVar.type || '',
            unit: ioVar.unit || '',
            value: ioVar.value || '',
            description: ioVar.description || '',
            complexType: ioVar.complexType || 'NONE',
            complexName: ioVar.complexName || '',
            inDataType: ioVar.inDataType || '',
            moduleID: ioVar.moduleID || null,
            direction: ioVar.direction || ''
        };

        const children = [];

        // 중첩된 요소들이 있는 경우 처리
        if (ioVar.nestedInputs && ioVar.nestedInputs.length > 0) {
            children.push(...ioVar.nestedInputs.map(convertIOVariableToNode));
        } else if (ioVar.nestedOutputs && ioVar.nestedOutputs.length > 0) {
            children.push(...ioVar.nestedOutputs.map(convertIOVariableToNode));
        } else if (ioVar.nestedInOuts && ioVar.nestedInOuts.length > 0) {
            children.push(...ioVar.nestedInOuts.map(convertIOVariableToNode));
        }

        return createTreeNode(nodeData, children);
    };

    // Backend expects inputs, outputs, inouts (uppercase)
    const inputs = (ioVariables.inputs || []).map(convertIOVariableToNode);
    const outputs = (ioVariables.outputs || []).map(convertIOVariableToNode);
    const inouts = (ioVariables.inouts || []).map(convertIOVariableToNode);

    return [
        createTreeNode({ name: 'inputs', direction: 'input', isRoot: true }, inputs),
        createTreeNode({ name: 'outputs', direction: 'output', isRoot: true }, outputs),
        createTreeNode({ name: 'inouts', direction: 'inout', isRoot: true }, inouts),
    ];
}

function treeToIoVariables(tree) {
    const convertNodeToIOVariable = (node) => {
        const nodeData = node.getValue();
        const result = {
            name: nodeData.name || '',
            type: nodeData.type || '',
            unit: nodeData.unit || '',
            value: nodeData.value || '',
            description: nodeData.description || '',
            complexType: nodeData.complexType || 'NONE',
            complexName: nodeData.complexName || '',
            inDataType: nodeData.inDataType || '',
            moduleID: nodeData.moduleID || null,
            direction: nodeData.direction || ''
        };

        // 중첩된 요소들이 있는 경우 처리
        if (node.hasChildren && node.hasChildren()) {
            const children = node.children;
            if (nodeData.direction === 'input') {
                result.nestedInputs = children.map(convertNodeToIOVariable);
            } else if (nodeData.direction === 'output') {
                result.nestedOutputs = children.map(convertNodeToIOVariable);
            } else if (nodeData.direction === 'inout') {
                result.nestedInOuts = children.map(convertNodeToIOVariable);
            }
        }

        return result;
    };

    return {
        // Use uppercase field names to match backend expectations
        inputs: tree[0]?.children?.map(convertNodeToIOVariable) || [],
        outputs: tree[1]?.children?.map(convertNodeToIOVariable) || [],
        inouts: tree[2]?.children?.map(convertNodeToIOVariable) || [],
    };
}

export function useIOVariablesState(ioVariables = {}, setIoVariables) {
    const [typeInput, setTypeInput] = useState('');
    const [unitInput, setUnitInput] = useState('');
    const [ioVar, setIoVar] = useState({
        complexType: '',
        name: '',
        type: '',
        unit: '',
        value: '',
        description: '',
    });

    // IOVariables 트리 상태 직접 관리
    const [tree, setTree] = useState(() => ioVariablesToTree(ioVariables));
    const [selectedNodePath, setSelectedNodePath] = useState([]);
    const [expandedNodes, setExpandedNodes] = useState(new Set(['0', '1', '2']));

    // 초기화 - ioVariables에서 데이터 로드 (한 번만 실행)
    useEffect(() => {
        if (ioVariables && Object.keys(ioVariables).length > 0) {
            console.log('IOVariablesPage - initializing from ioVariables:', ioVariables);
            const treeData = ioVariablesToTree(ioVariables);
            console.log('IOVariablesPage - tree data:', treeData);
            setTree(treeData);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // 빈 의존성 배열로 한 번만 실행

    // 입력값 변경
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setIoVar(prev => ({ ...prev, [name]: value }));
    };

    // 트리에서 노드 선택 (IOVariables 전용 로직)
    const handleSelectNode = useCallback((path) => {
        setSelectedNodePath(path);
        const selectedNode = getNodeAtPath(tree, path);
        if (selectedNode && !selectedNode.getValue().isRoot) {
            // 하위 노드 선택 시 - 기존 데이터로 폼 채우기
            const nodeData = selectedNode.getValue();
            setIoVar({
                complexType: nodeData.complexType || '',
                name: nodeData.name || '',
                type: nodeData.type || '',
                unit: nodeData.unit || '',
                value: nodeData.value || '',
                description: nodeData.description || '',
                complexName: nodeData.complexName || '',
                inDataType: nodeData.inDataType || '',
            });
        } else if (selectedNode && selectedNode.getValue().isRoot) {
            // 루트(inputs/outputs/inouts) 선택 시 - 새 항목 추가를 위한 폼 초기화
            setIoVar({
                complexType: 'NONE',
                name: '',
                type: '',
                unit: '',
                value: '',
                description: '',
                complexName: '',
                inDataType: ''
            });
        } else {
            // 아무것도 선택되지 않은 경우
            setIoVar({
                complexType: '', name: '', type: '', unit: '', value: '', description: '', complexName: '', inDataType: ''
            });
        }
    }, [tree]);



    // 추가 버튼 (IOVariables 전용 로직)
    const handleAdd = useCallback(() => {
        if (selectedNodePath.length === 0) return;

        const selectedNode = getNodeAtPath(tree, selectedNodePath);
        const nodeData = selectedNode.getValue();

        let targetPath;
        let direction;

        if (selectedNodePath.length === 1) {
            // 루트(inputs/outputs/inouts) 선택 시 - 루트 하위에 추가
            targetPath = selectedNodePath;
            direction = ['input', 'output', 'inout'][selectedNodePath[0]];
        } else {
            // 루트가 아닌 노드 선택 시 - 항상 자식으로 추가 (하위 항목으로)
            targetPath = selectedNodePath;
            direction = nodeData.direction || ['input', 'output', 'inout'][selectedNodePath[0]];
        }

        const newNodeData = {
            ...ioVar,
            direction,
        };

        // IOVariables 트리에 추가
        const newNode = createTreeNode(newNodeData);
        console.log('IOVariablesPage - adding new ioVar:', newNodeData);
        console.log('IOVariablesPage - created newNode:', newNode);
        const updatedTree = addNodeAtPath(tree, targetPath, newNode);
        console.log('IOVariablesPage - updatedTree:', updatedTree);
        setTree(updatedTree);

        // 즉시 ModuleState에 IOVariables 데이터 전송
        const ioVariablesData = treeToIoVariables(updatedTree);
        if (setIoVariables) {
            setIoVariables(ioVariablesData);
        }

        setIoVar({ complexType: '', name: '', type: '', unit: '', value: '', description: '', complexName: '', inDataType: '' });
        setTypeInput('');
        setUnitInput('');

        // 새로 추가된 노드의 경로 계산하여 선택
        const parentNode = getNodeAtPath(updatedTree, targetPath);
        const newPath = [...targetPath, parentNode.getChildCount()];
        setSelectedNodePath(newPath);
    }, [selectedNodePath, tree, ioVar, setIoVariables]);

    // 삭제 버튼 (IOVariables 전용 로직)
    const handleRemove = useCallback(() => {
        if (selectedNodePath.length <= 1) return;

        // IOVariables 트리에서 제거
        const updatedTree = removeNodeAtPath(tree, selectedNodePath);
        setTree(updatedTree);

        // 즉시 ModuleState에 IOVariables 데이터 전송

        const ioVariablesData = treeToIoVariables(updatedTree);
        console.log('=== 최종 IOVariables Output (handleRemove) ===');
        console.log(JSON.stringify(ioVariablesData, null, 2));
        
        if (setIoVariables) {
            setIoVariables(ioVariablesData);
        }

        // 부모 노드로 선택 이동
        const parentPath = getParentPath(selectedNodePath);
        setSelectedNodePath(parentPath);
        setIoVar({ complexType: '', name: '', type: '', unit: '', value: '', description: '', complexName: '', inDataType: '' });
    }, [selectedNodePath, tree, setIoVariables]);

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

    const replaceIoVariables = useCallback((nextIoVariables) => {
        setTree(ioVariablesToTree(nextIoVariables));
        if (setIoVariables) setIoVariables(nextIoVariables);
    }, [setIoVariables]);

    return {
        // 상태
        tree,
        selectedNodePath,
        typeInput,
        unitInput,
        expandedNodes,
        ioVar,

        // 상태 설정 함수
        setTypeInput,
        setUnitInput,
        setIoVar,

        // 이벤트 핸들러
        handleInputChange,
        handleSelectNode,
        toggleNodeExpansion,
        isNodeExpanded,
        handleAdd,
        handleRemove,
        replaceIoVariables
    };
}
