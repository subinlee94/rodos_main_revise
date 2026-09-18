import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getOSVersionOptions } from '../utils/Options';
import { createTreeNode, getNodeAtPath, addNodeAtPath, removeNodeAtPath, updateNodeAtPath, treeToFlatArray } from '../utils/tree/TreeUtils';
import { TreeNode } from '../utils/tree/TreeNode';

// Properties 데이터를 트리로 변환
const propertiesToTree = (properties) => {
    if (!properties || !properties.properties || !Array.isArray(properties.properties)) return [];
    return properties.properties.map(prop => createTreeNode(prop));
};



// 전체 Properties 데이터를 ModuleState로 전송하는 함수
const createPropertiesData = (propertyNodes, osType, compilerType, executionTypes, libraries, organization) => {
    // TreeNode 배열을 평면 배열로 변환 (백엔드가 기대하는 형식)
    const flatProperties = treeToFlatArray(propertyNodes);
    return {
        properties: flatProperties,
        osType: osType,
        compilerType: compilerType,
        executionTypes: executionTypes,
        libraries: libraries,
        organization: organization
    };
};

const normalizeNoBit = (bitValue) => {
    if (!bitValue || typeof bitValue !== 'string') return bitValue || '';
    const map = {
        _16: 'BIT16',
        _32: 'BIT32',
        _64: 'BIT64'
    };
    return map[bitValue] || bitValue;
};

export function usePropertiesState(properties, onChange) {
    const [activeTab, setActiveTab] = useState('property');
    const [typeInput, setTypeInput] = useState('');
    const [unitInput, setUnitInput] = useState('');
    const [executionInput, setExecutionInput] = useState({});
    const [libraryInput, setLibraryInput] = useState({});
    const [additionalInfoInput, setAdditionalInfoInput] = useState({});
    const [osVersionOptions, setOsVersionOptions] = useState([{ value: '', label: 'Select Version' }]);
    const [property, setProperty] = useState({ complexType: 'NONE' });
    const [osType, setOsType] = useState({});
    const [compilerType, setCompilerType] = useState({});
    const [executionTypes, setExecutionTypes] = useState([]);
    const [libraries, setLibraries] = useState([]);
    const [organization, setOrganization] = useState({});

    // Property 트리 상태 직접 관리
    const [propertyNodes, setPropertyNodes] = useState(propertiesToTree(properties));
    const [selectedNodePath, setSelectedNodePath] = useState([]);
    const [expandedNodes, setExpandedNodes] = useState(new Set());

    // onChange 함수 참조
    const lastOnChangeRef = useRef(onChange);

    // properties를 useMemo로 초기화 - 한 번만 실행
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const initProperties = useMemo(() => properties || {}, []);

    // onChange 함수 업데이트
    useEffect(() => {
        lastOnChangeRef.current = onChange;
    }, [onChange]);

    // 초기화 - properties에서 데이터 로드 (한 번만 실행)
    useEffect(() => {
        if (properties && Object.keys(properties).length > 0) {
            console.log('PropertiesPage - initializing from properties:', properties);

            // Property 트리 초기화
            const treeData = propertiesToTree(properties);
            console.log('PropertiesPage - tree data:', treeData);
            setPropertyNodes(treeData);

            // 각 탭 데이터 초기화
            setOsType({
                ...(properties.osType || {}),
                bit: normalizeNoBit(properties?.osType?.bit || '')
            });
            setCompilerType(properties.compilerType || {});
            // ExecutionType 데이터 구조 정규화
            const normalizedExecutionTypes = (properties.executionTypes || []).map(et => ({
                optype: et.optype || et.opType || '',
                priority: et.priority || '',
                hardRT: et.hardRT || '',
                timeConstraint: et.timeConstraint || '',
                instanceType: et.instanceType || ''
            }));
            setExecutionTypes(normalizedExecutionTypes);
            setLibraries(properties.libraries || []);
            setOrganization(properties.organization || {});
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // 빈 의존성 배열로 한 번만 실행

    // OS 버전 옵션 업데이트
    useEffect(() => {
        if (osType?.type) {
            const versionOptions = getOSVersionOptions(osType.type);
            setOsVersionOptions(versionOptions);
        }
    }, [osType?.type]);

    // value 문자열을 Values 객체로 변환하는 헬퍼 함수
    // Values.java의 item 필드는 List<String>이며, Jackson이 각 String을 <item> 태그로 변환
    // 따라서 item 필드에 직접 문자열 배열을 전달해야 함
    const convertValueToValues = useCallback((value) => {
        if (!value || value.trim() === '') return null;
        
        // ARRAY 타입인 경우 JSON 파싱 시도
        const trimmedValue = value.trim();
        if (trimmedValue.startsWith('[')) {
            try {
                const parsed = JSON.parse(trimmedValue);
                if (Array.isArray(parsed)) {
                    // 2D 배열인 경우 평탄화
                    const flattened = parsed.flat(Infinity);
                    // item 필드에 직접 문자열 배열 전달 (Jackson이 각 항목을 <item> 태그로 변환)
                    return { item: flattened.map(String) };
                }
            } catch (e) {
                // 파싱 실패 시 문자열 그대로 처리
            }
        }
        
        // Jackson이 각 문자열을 <item> 태그로 변환하므로 중첩되지 않음
        return { item: [String(value)] };
    }, []);

    // 이벤트 핸들러들
    const handlePropertyChange = useCallback((e) => {
        const { name, value, type, checked } = e.target;
        setProperty(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    }, []);

    const handleSelectNode = useCallback((path) => {
        setSelectedNodePath(path);
        const node = getNodeAtPath(propertyNodes, path);
        if (node) {
            const nodeValue = node instanceof TreeNode ? node.getValue() : node;
            
            // values 객체에서 value 문자열 추출
            let valueStr = '';
            if (nodeValue.values) {
                if (typeof nodeValue.values === 'object' && nodeValue.values.item) {
                    // Values 객체인 경우: { item: [String, ...] }
                    if (Array.isArray(nodeValue.values.item)) {
                        valueStr = nodeValue.values.item.join(', ');
                    } else if (typeof nodeValue.values.item === 'string') {
                        valueStr = nodeValue.values.item;
                    }
                } else if (typeof nodeValue.values === 'string') {
                    // 문자열인 경우
                    valueStr = nodeValue.values;
                }
            } else if (nodeValue.value) {
                // value 필드가 있는 경우
                valueStr = nodeValue.value;
            }
            
            setProperty({
                complexType: nodeValue.complexType || nodeValue.complex || 'NONE',
                complex: nodeValue.complex || '',
                complexName: nodeValue.complexName || '',
                name: nodeValue.name || '',
                type: nodeValue.type || '',
                unit: nodeValue.unit || '',
                value: valueStr,  // UI에서 사용할 value 문자열
                values: nodeValue.values || null,  // 원본 values 객체 유지
                description: nodeValue.description || '',
            });
        } else {
            setProperty({ complexType: 'NONE' });
        }
    }, [propertyNodes]);

    const handleAdd = useCallback(() => {
        if (!property.name) return;

        // typeInput과 unitInput을 property에 병합
        // complexType이 빈 문자열이거나 없으면 'NONE'으로 설정
        // value를 Values 객체로 변환
        const finalProperty = {
            ...property,
            complexType: property.complexType || property.complex || 'NONE',
            ...(property.type === 'custom' && typeInput && { type: typeInput }),
            ...(property.unit === 'custom' && unitInput && { unit: unitInput }),
            // value를 Values 객체로 변환 (백엔드가 기대하는 형식)
            ...(property.value && { values: convertValueToValues(property.value) }),
            // value 필드는 제거 (백엔드가 기대하지 않음)
            value: undefined
        };

        console.log('PropertiesPage - adding new property:', finalProperty);
        console.log('PropertiesPage - selectedNodePath:', selectedNodePath);
        console.log('PropertiesPage - current propertyNodes:', propertyNodes);

        // Property 트리에 추가
        const newNode = createTreeNode(finalProperty);
        console.log('PropertiesPage - created newNode:', newNode);
        const updatedTree = addNodeAtPath(propertyNodes, selectedNodePath, newNode);
        console.log('PropertiesPage - updatedTree:', updatedTree);
        setPropertyNodes(updatedTree);

        // 즉시 ModuleState에 전체 Properties 데이터 전송
        const propertiesData = createPropertiesData(updatedTree, osType, compilerType, executionTypes, libraries, organization);
        if (lastOnChangeRef.current) {
            lastOnChangeRef.current(propertiesData);
        }

        // 입력 필드 초기화
        setProperty({ complexType: 'NONE' });
        setTypeInput('');
        setUnitInput('');
        setSelectedNodePath([]);
    }, [property, typeInput, unitInput, selectedNodePath, propertyNodes, osType, compilerType, executionTypes, libraries, organization, convertValueToValues]);

    const handleUpdate = useCallback(() => {
        if (selectedNodePath.length === 0 || !property.name) return;

        // complexType이 빈 문자열이거나 없으면 'NONE'으로 설정
        // value를 Values 객체로 변환
        const finalProperty = {
            ...property,
            complexType: property.complexType || property.complex || 'NONE',
            ...(property.type === 'custom' && typeInput && { type: typeInput }),
            ...(property.unit === 'custom' && unitInput && { unit: unitInput }),
            // value를 Values 객체로 변환 (백엔드가 기대하는 형식)
            ...(property.value && { values: convertValueToValues(property.value) }),
            // value 필드는 제거 (백엔드가 기대하지 않음)
            value: undefined
        };

        console.log('PropertiesPage - updating property:', finalProperty);

        // Property 트리 업데이트
        const updatedTree = updateNodeAtPath(propertyNodes, selectedNodePath, finalProperty);
        setPropertyNodes(updatedTree);

        // 즉시 ModuleState에 전체 Properties 데이터 전송
        const propertiesData = createPropertiesData(updatedTree, osType, compilerType, executionTypes, libraries, organization);
        if (lastOnChangeRef.current) {
            lastOnChangeRef.current(propertiesData);
        }

        // 입력 필드 초기화
        setProperty({ complexType: 'NONE' });
        setTypeInput('');
        setUnitInput('');
        setSelectedNodePath([]);
    }, [property, typeInput, unitInput, selectedNodePath, propertyNodes, osType, compilerType, executionTypes, libraries, organization, convertValueToValues]);

    const handleRemove = useCallback(() => {
        if (selectedNodePath.length === 0) return;

        console.log('PropertiesPage - removing property at path:', selectedNodePath);

        // Property 트리에서 제거
        const updatedTree = removeNodeAtPath(propertyNodes, selectedNodePath);
        setPropertyNodes(updatedTree);

        // 즉시 ModuleState에 전체 Properties 데이터 전송
        const propertiesData = createPropertiesData(updatedTree, osType, compilerType, executionTypes, libraries, organization);
        if (lastOnChangeRef.current) {
            lastOnChangeRef.current(propertiesData);
        }

        setProperty({ complexType: 'NONE' });
        setSelectedNodePath([]);
    }, [selectedNodePath, propertyNodes, osType, compilerType, executionTypes, libraries, organization]);

    const handleOsTypeChange = useCallback((e) => {
        const { name, value } = e.target;
        setOsType(prev => {
            const normalizedValue = name === 'bit' ? normalizeNoBit(value) : value;
            const newOsType = { ...prev, [name]: normalizedValue };
            // 즉시 ModuleState에 전체 Properties 데이터 전송
            const propertiesData = createPropertiesData(propertyNodes, newOsType, compilerType, executionTypes, libraries, organization);
            if (lastOnChangeRef.current) {
                lastOnChangeRef.current(propertiesData);
            }
            return newOsType;
        });
    }, [propertyNodes, compilerType, executionTypes, libraries, organization]);

    const handleCompilerTypeChange = useCallback((e) => {
        const { name, value } = e.target;
        setCompilerType(prev => {
            const newCompilerType = { ...prev, [name]: value };
            // 즉시 ModuleState에 전체 Properties 데이터 전송
            const propertiesData = createPropertiesData(propertyNodes, osType, newCompilerType, executionTypes, libraries, organization);
            if (lastOnChangeRef.current) {
                lastOnChangeRef.current(propertiesData);
            }
            return newCompilerType;
        });
    }, [propertyNodes, osType, executionTypes, libraries, organization]);

    const handleAddExecution = useCallback(() => {
        // 필수 필드 검증 강화
        if (!executionInput.priority || !executionInput.opType || !executionInput.instanceType) {
            return;
        }

        // 백엔드에서 기대하는 형식으로 데이터 구성
        const executionData = {
            optype: executionInput.opType, // optype으로 저장 (백엔드 기대값)
            priority: executionInput.priority,
            hardRT: executionInput.hardRT || '',
            timeConstraint: executionInput.timeConstraint || '',
            instanceType: executionInput.instanceType
        };

        setExecutionTypes(prev => {
            const newExecutionTypes = [...prev, executionData];
            console.log('Updated execution types:', newExecutionTypes);
            // 즉시 ModuleState에 전체 Properties 데이터 전송
            const propertiesData = createPropertiesData(propertyNodes, osType, compilerType, newExecutionTypes, libraries, organization);
            if (lastOnChangeRef.current) {
                lastOnChangeRef.current(propertiesData);
            }
            return newExecutionTypes;
        });
        setExecutionInput({});
    }, [executionInput, propertyNodes, osType, compilerType, libraries, organization]);

    const handleRemoveExecution = useCallback((idx) => {
        setExecutionTypes(prev => {
            const newExecutionTypes = prev.filter((_, i) => i !== idx);
            console.log('Updated execution types:', newExecutionTypes);
            // 즉시 ModuleState에 전체 Properties 데이터 전송
            const propertiesData = createPropertiesData(propertyNodes, osType, compilerType, newExecutionTypes, libraries, organization);
            if (lastOnChangeRef.current) {
                lastOnChangeRef.current(propertiesData);
            }
            return newExecutionTypes;
        });
    }, [propertyNodes, osType, compilerType, libraries, organization]);

    const handleExecutionInputChange = useCallback((e) => {
        const { name, value } = e.target;
        setExecutionInput(prev => ({ ...prev, [name]: value }));
    }, []);

    const handleAddLibrary = useCallback(() => {
        // 필수 필드 검증
        if (!libraryInput.name) {
            console.log('Library validation failed:', libraryInput);
            return;
        }

        // 백엔드에서 기대하는 형식으로 데이터 구성
        const libraryData = {
            name: libraryInput.name,
            version: libraryInput.version || { min: '', max: '' },
            url: libraryInput.url || ''
        };

        setLibraries(prev => {
            const newLibraries = [...prev, libraryData];
            console.log('Updated libraries:', newLibraries);
            // 즉시 ModuleState에 전체 Properties 데이터 전송
            const propertiesData = createPropertiesData(propertyNodes, osType, compilerType, executionTypes, newLibraries, organization);
            if (lastOnChangeRef.current) {
                lastOnChangeRef.current(propertiesData);
            }
            return newLibraries;
        });
        setLibraryInput({});
    }, [libraryInput, propertyNodes, osType, compilerType, executionTypes, organization]);

    const handleRemoveLibrary = useCallback((idx) => {
        setLibraries(prev => {
            const newLibraries = prev.filter((_, i) => i !== idx);
            console.log('Updated libraries:', newLibraries);
            // 즉시 ModuleState에 전체 Properties 데이터 전송
            const propertiesData = createPropertiesData(propertyNodes, osType, compilerType, executionTypes, newLibraries, organization);
            if (lastOnChangeRef.current) {
                lastOnChangeRef.current(propertiesData);
            }
            return newLibraries;
        });
    }, [propertyNodes, osType, compilerType, executionTypes, organization]);

    const handleLibraryInputChange = useCallback((e) => {
        const { name, value } = e.target;
        setLibraryInput(prev => ({ ...prev, [name]: value }));
    }, []);

    const handleOrganizationChange = useCallback((e) => {
        const { name, value } = e.target;
        setOrganization(prev => {
            const newOrganization = { ...prev, [name]: value };
            // 즉시 ModuleState에 전체 Properties 데이터 전송
            const propertiesData = createPropertiesData(propertyNodes, osType, compilerType, executionTypes, libraries, newOrganization);
            if (lastOnChangeRef.current) {
                lastOnChangeRef.current(propertiesData);
            }
            return newOrganization;
        });
    }, [propertyNodes, osType, compilerType, executionTypes, libraries]);

    const handleOrgMemberTypeChange = useCallback((e) => {
        const { name, value } = e.target;
        setOrganization(prev => {
            const newOrganization = {
                ...prev,
                orgMemberType: {
                    ...prev.orgMemberType,
                    [name]: value
                }
            };
            // 즉시 ModuleState에 전체 Properties 데이터 전송
            const propertiesData = createPropertiesData(propertyNodes, osType, compilerType, executionTypes, libraries, newOrganization);
            if (lastOnChangeRef.current) {
                lastOnChangeRef.current(propertiesData);
            }
            return newOrganization;
        });
    }, [propertyNodes, osType, compilerType, executionTypes, libraries]);

    const handleAddAdditionalInfo = useCallback(() => {
        if (additionalInfoInput.name && additionalInfoInput.value) {
            setOrganization(prev => {
                const newOrganization = {
                    ...prev,
                    additionalInfo: [...(prev.additionalInfo || []), additionalInfoInput]
                };
                // 즉시 ModuleState에 전체 Properties 데이터 전송
                const propertiesData = createPropertiesData(propertyNodes, osType, compilerType, executionTypes, libraries, newOrganization);
                if (lastOnChangeRef.current) {
                    lastOnChangeRef.current(propertiesData);
                }
                return newOrganization;
            });
            setAdditionalInfoInput({ name: '', value: '' });
        }
    }, [additionalInfoInput, propertyNodes, osType, compilerType, executionTypes, libraries]);

    const handleRemoveAdditionalInfo = useCallback((idx) => {
        setOrganization(prev => {
            const newOrganization = {
                ...prev,
                additionalInfo: prev.additionalInfo.filter((_, i) => i !== idx)
            };
            // 즉시 ModuleState에 전체 Properties 데이터 전송
            const propertiesData = createPropertiesData(propertyNodes, osType, compilerType, executionTypes, libraries, newOrganization);
            if (lastOnChangeRef.current) {
                lastOnChangeRef.current(propertiesData);
            }
            return newOrganization;
        });
    }, [propertyNodes, osType, compilerType, executionTypes, libraries]);

    const handleAdditionalInfoInputChange = useCallback((e) => {
        const { name, value } = e.target;
        setAdditionalInfoInput(prev => ({ ...prev, [name]: value }));
    }, []);

    const handleTabChange = useCallback((tab) => {
        setActiveTab(tab);
    }, []);

    // TreeViewer 영역 클릭 시 선택 해제 (Properties 전용)
    const handleTreeAreaClick = useCallback((e) => {
        // 클릭된 요소가 property-tree-node가 아닌 경우에만 선택 해제`
        if (!e.target.closest('.property-tree-node')) {
            setSelectedNodePath([]);
            setProperty({ complexType: 'NONE' });
        }
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

    /** 외부(SW linked-data)에서 가져온 properties 블록을 모든 탭에 반영 */
    const importPropertiesBundle = useCallback((bundle) => {
        if (!bundle) return;

        const treeData = propertiesToTree(bundle);
        setPropertyNodes(treeData);

        const nextOs = {
            ...(bundle.osType || {}),
            bit: normalizeNoBit(bundle?.osType?.bit || '')
        };
        setOsType(nextOs);
        setCompilerType(bundle.compilerType || {});

        const normalizedExecutionTypes = (bundle.executionTypes || []).map((et) => ({
            optype: et?.optype || et?.opType || '',
            priority: et?.priority || '',
            hardRT: et?.hardRT || '',
            timeConstraint: et?.timeConstraint || '',
            instanceType: et?.instanceType || ''
        }));
        setExecutionTypes(normalizedExecutionTypes);
        setLibraries(bundle.libraries || []);
        setOrganization(bundle.organization || {});

        if (lastOnChangeRef.current) {
            lastOnChangeRef.current(createPropertiesData(
                treeData,
                nextOs,
                bundle.compilerType || {},
                normalizedExecutionTypes,
                bundle.libraries || [],
                bundle.organization || {}
            ));
        }
    }, []);

    // 트리 구조 디버깅 함수
    const debugTreeStructure = useCallback(() => {
        console.log('=== Current Tree Structure ===');
        const debugTree = (nodes, level = 0) => {
            nodes.forEach((node, idx) => {
                const indent = '  '.repeat(level);
                const nodeValue = node instanceof TreeNode ? node.getValue() : node;
                console.log(`${indent}${idx}: ${nodeValue.name || 'unnamed'} (${nodeValue.complexType || 'NONE'})`);
                if (node instanceof TreeNode && node.hasChildren()) {
                    debugTree(node.children, level + 1);
                }
            });
        };
        debugTree(propertyNodes);
        console.log('=== End Tree Structure ===');
    }, [propertyNodes]);

    return {
        // 상태
        activeTab,
        propertyNodes,
        selectedNodePath,
        property,
        typeInput,
        unitInput,
        executionInput,
        libraryInput,
        additionalInfoInput,
        osVersionOptions,
        osType,
        compilerType,
        executionTypes,
        libraries,

        // 이벤트 핸들러
        handlePropertyChange,
        handleSelectNode,
        handleAdd,
        handleUpdate,
        handleRemove,
        handleOsTypeChange,
        handleCompilerTypeChange,
        handleAddExecution,
        handleRemoveExecution,
        handleExecutionInputChange,
        handleAddLibrary,
        handleRemoveLibrary,
        handleLibraryInputChange,
        handleOrganizationChange,
        handleOrgMemberTypeChange,
        handleAddAdditionalInfo,
        handleRemoveAdditionalInfo,
        handleAdditionalInfoInputChange,
        handleTabChange,
        toggleNodeExpansion,
        isNodeExpanded,
        handleTreeAreaClick,

        // SW 계승 — 전체 properties 블록 반영
        importPropertiesBundle,

        // 상태 설정 함수
        setTypeInput,
        setUnitInput,
        setCompilerType,

        // 디버깅 함수
        debugTreeStructure
    };
} 