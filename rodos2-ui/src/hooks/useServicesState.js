import { useState, useEffect, useCallback } from 'react';
import { TreeNode } from '../utils/tree/TreeNode';
import { createTreeNode, getNodeAtPath, addNodeAtPath, removeNodeAtPath } from '../utils/tree/TreeUtils';
import { getServiceNodeLabel, getServiceNodeTooltip } from '../utils/tree/TreeNodeLabelUtils';

// services <-> tree 변환 유틸리티
function servicesToTree(services) {
    if (!services || !services.serviceProfiles) return [];

    return services.serviceProfiles.map(profile => {
        const profileData = profile instanceof TreeNode ? profile.getValue() : profile;
        // methodLists 또는 serviceMethods 지원 (호환성)
        const methodLists = profileData.methodLists || [];
        const serviceMethods = profileData.serviceMethods || [];
        
        // methodLists가 있으면 사용, 없으면 serviceMethods 사용
        const methods = methodLists.length > 0
            ? methodLists.flatMap(methodList => {
                const methodCandidates = Array.isArray(methodList?.method)
                    ? methodList.method
                    : (methodList?.method ? [methodList.method] : [methodList]);

                return methodCandidates.map(method => {
                    const methodData = method instanceof TreeNode ? method.getValue() : method;
                    // ArgSpec을 재귀적으로 변환하는 함수
                    const convertArgSpecToNode = (argSpec) => {
                        const argSpecData = argSpec instanceof TreeNode ? argSpec.getValue() : argSpec;
                        const argSpecNode = createTreeNode({
                            argType: argSpecData.argType || argSpecData.type || '',
                            argName: argSpecData.argName || argSpecData.name || '',
                            argIO: argSpecData.argIO || argSpecData.inout || ''
                        });

                        // 중첩된 argSpecs가 있는 경우 재귀적으로 처리
                        if (argSpecData.argSpecs && Array.isArray(argSpecData.argSpecs)) {
                            const nestedArgSpecs = argSpecData.argSpecs.map(convertArgSpecToNode);
                            nestedArgSpecs.forEach(nested => argSpecNode.addChild(nested));
                        }

                        return argSpecNode;
                    };

                    const argSpecs = (methodData.argSpecs || []).map(convertArgSpecToNode);
                    return createTreeNode(methodData, argSpecs);
                });
            })
            : serviceMethods.map(method => {
                const methodData = method instanceof TreeNode ? method.getValue() : method;
                // ArgSpec을 재귀적으로 변환하는 함수
                const convertArgSpecToNode = (argSpec) => {
                    const argSpecData = argSpec instanceof TreeNode ? argSpec.getValue() : argSpec;
                    const argSpecNode = createTreeNode({
                        argType: argSpecData.argType || argSpecData.type || '',
                        argName: argSpecData.argName || argSpecData.name || '',
                        argIO: argSpecData.argIO || argSpecData.inout || ''
                    });
                    
                    // 중첩된 argSpecs가 있는 경우 재귀적으로 처리
                    if (argSpecData.argSpecs && Array.isArray(argSpecData.argSpecs)) {
                        const nestedArgSpecs = argSpecData.argSpecs.map(convertArgSpecToNode);
                        nestedArgSpecs.forEach(nested => argSpecNode.addChild(nested));
                    }
                    
                    return argSpecNode;
                };
                
                const argSpecs = (methodData.argSpecs || []).map(convertArgSpecToNode);
                return createTreeNode(methodData, argSpecs);
            });
        return createTreeNode(profileData, methods);
    });
}

function treeToServices(tree, noOfBasicService = '', noOfOptionalService = '') {
    return {
        noOfBasicService: noOfBasicService,
        noOfOptionalService: noOfOptionalService,
        serviceProfiles: tree.map(node => {
            const nodeData = node instanceof TreeNode ? node.getValue() : node;
            // methodLists 구조로 변환 (각 Method를 methodList로 감싸기)
            const methodLists = node.hasChildren ? node.children.map(methodNode => {
                const methodData = methodNode instanceof TreeNode ? methodNode.getValue() : methodNode;
                return {
                    method: [{
                        ...methodData,
                        argSpecs: methodNode.hasChildren ? (() => {
                            // ArgSpec을 재귀적으로 변환하는 함수
                            const convertArgSpecNode = (argNode) => {
                                const argSpecData = argNode instanceof TreeNode ? argNode.getValue() : argNode;
                                const result = {
                                    argType: argSpecData.argType || argSpecData.type || '',
                                    argName: argSpecData.argName || argSpecData.name || '',
                                    argIO: argSpecData.argIO || argSpecData.inout || ''
                                };
                                
                                // 중첩된 argSpecs가 있는 경우 재귀적으로 처리
                                if (argNode.hasChildren && argNode.hasChildren()) {
                                    result.argSpecs = argNode.children.map(convertArgSpecNode);
                                }
                                
                                return result;
                            };
                            
                            return methodNode.children.map(convertArgSpecNode);
                        })() : []
                    }]
                };
            }) : [];
            
            return {
                ...nodeData,
                methodLists: methodLists,
                // 호환성을 위해 serviceMethods도 유지
                serviceMethods: node.hasChildren ? node.children.map(methodNode => {
                    const methodData = methodNode instanceof TreeNode ? methodNode.getValue() : methodNode;
                    return {
                        ...methodData,
                        argSpecs: methodNode.hasChildren ? methodNode.children.map(argNode => {
                            const argSpecData = argNode instanceof TreeNode ? argNode.getValue() : argNode;
                            return {
                                argType: argSpecData.argType || argSpecData.type || '',
                                argName: argSpecData.argName || argSpecData.name || '',
                                argIO: argSpecData.argIO || argSpecData.inout || ''
                            };
                        }) : []
                    };
                }) : []
            };
        })
    };
}

export function useServicesState(services = {}, onChange) {
    const [servicesState, setServicesState] = useState({
        noOfBasicService: services.noOfBasicService || '',
        noOfOptionalService: services.noOfOptionalService || '',
        serviceProfiles: []
    });

    // Services 트리 상태 직접 관리
    const [tree, setTree] = useState(() => servicesToTree(services));
    const [selectedNodePath, setSelectedNodePath] = useState([]);

    // Service Profile 입력
    const [serviceProfile, setServiceProfile] = useState({
        type: '',
        ID: '',
        PVType: '',
        MOType: '',
        path: '',
        additionalInfo: []
    });

    // Service Method 입력
    const [serviceMethod, setServiceMethod] = useState({
        methodName: '',
        description: '',
        retType: '',
        MOType: '',
        reqProvType: '',
        moduleID: null, // { mID: '', iID: '' }
        argSpecs: []
    });

    // ArgSpec 입력
    const [argSpecInput, setArgSpecInput] = useState({ argType: '', argName: '', argIO: '' });

    // Additional Info 입력
    const [additionalInfoInput, setAdditionalInfoInput] = useState({ name: '', value: '' });

    // props로 받은 services가 바뀔 때만 동기화 (초기 로드 시에만)
    useEffect(() => {
        if (services && Object.keys(services).length > 0) {
            console.log('ServicesPage - initializing from services:', services);
            setServicesState({
                noOfBasicService: services.noOfBasicService || '',
                noOfOptionalService: services.noOfOptionalService || '',
                serviceProfiles: services.serviceProfiles || []
            });
            const treeData = servicesToTree(services);
            console.log('ServicesPage - tree data:', treeData);
            setTree(treeData);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // 빈 의존성 배열로 한 번만 실행

    // 선택 타입 판별
    const getSelectedType = useCallback(() => {
        if (selectedNodePath.length === 0) return 'profile';
        const node = getNodeAtPath(servicesState.serviceProfiles || [], selectedNodePath);
        if (!node) return 'profile';
        const data = node instanceof TreeNode ? node.getValue() : node;
        if (data.type) return 'profile';
        if (data.methodName) return 'method';
        if (data.name && data.type) return 'argspec';
        return 'profile';
    }, [selectedNodePath, servicesState.serviceProfiles]);

    const selectedType = getSelectedType();

    // 트리에서 노드 선택 (Services 전용 로직)
    const handleSelectNode = useCallback((path) => {
        setSelectedNodePath(path);

        if (path.length === 0) {
            // Root level - clear all forms
            setServiceProfile({ type: '', ID: '', PVType: '', MOType: '', path: '', additionalInfo: [] });
            setServiceMethod({ methodName: '', description: '', retType: '', MOType: '', reqProvType: '', moduleID: null, argSpecs: [] });
            setArgSpecInput({ argType: '', argName: '', argIO: '' });
            return;
        }

        // tree에서 직접 가져오기
        const node = getNodeAtPath(tree, path);
        if (!node) return;

        if (path.length === 1) {
            // Service Profile level
            const profileData = node instanceof TreeNode ? node.getValue() : node;
            setServiceProfile({
                type: profileData.type || '',
                ID: profileData.ID || '',
                PVType: profileData.PVType || '',
                MOType: profileData.MOType || '',
                path: profileData.path || '',
                additionalInfo: profileData.additionalInfo || []
            });
            setServiceMethod({ methodName: '', description: '', retType: '', MOType: '', reqProvType: '', moduleID: null, argSpecs: [] });
            setArgSpecInput({ argType: '', argName: '', argIO: '' });
        } else if (path.length === 2) {
            // Service Method level
            const profileNode = getNodeAtPath(tree, [path[0]]);
            if (profileNode && profileNode.hasChildren && profileNode.hasChildren()) {
                const methodNode = profileNode.children[path[1]];
                if (methodNode) {
                    const methodData = methodNode instanceof TreeNode ? methodNode.getValue() : methodNode;
                    setServiceMethod({
                        methodName: methodData.methodName || '',
                        description: methodData.description || '',
                        retType: methodData.retType || '',
                        MOType: methodData.MOType || '',
                        reqProvType: methodData.reqProvType || '',
                        moduleID: methodData.moduleID || null,
                        argSpecs: methodData.argSpecs || []
                    });
                    setArgSpecInput({ argType: '', argName: '', argIO: '' });
                }
            }
        } else if (path.length >= 3) {
            // ArgSpec level (중첩 지원)
            const profileNode = getNodeAtPath(tree, [path[0]]);
            if (profileNode && profileNode.hasChildren && profileNode.hasChildren()) {
                const methodNode = profileNode.children[path[1]];
                if (methodNode && methodNode.hasChildren && methodNode.hasChildren()) {
                    // 재귀적으로 ArgSpec 노드 찾기
                    let argSpecNode = methodNode.children[path[2]];
                    for (let i = 3; i < path.length && argSpecNode; i++) {
                        if (argSpecNode.hasChildren && argSpecNode.hasChildren()) {
                            argSpecNode = argSpecNode.children[path[i]];
                        } else {
                            argSpecNode = null;
                            break;
                        }
                    }
                    
                    if (argSpecNode) {
                        const argSpecData = argSpecNode instanceof TreeNode ? argSpecNode.getValue() : argSpecNode;
                        setArgSpecInput({
                            argType: argSpecData.argType || argSpecData.type || '',
                            argName: argSpecData.argName || argSpecData.name || '',
                            argIO: argSpecData.argIO || argSpecData.inout || ''
                        });
                    }
                }
            }
        }
    }, [tree]);

    // Service Profile 입력 핸들러
    const handleServiceProfileChange = useCallback((e) => {
        const { name, value } = e.target;
        setServiceProfile(prev => ({ ...prev, [name]: value }));
    }, []);

    // Service Method 입력 핸들러
    const handleServiceMethodChange = useCallback((e) => {
        const { name, value } = e.target;
        if (name === 'moduleID') {
            // moduleID는 객체이므로 직접 처리
            setServiceMethod(prev => ({ ...prev, moduleID: value }));
        } else {
            setServiceMethod(prev => ({ ...prev, [name]: value }));
        }
    }, []);

    // ArgSpec 입력 핸들러
    const handleArgSpecInputChange = useCallback((e) => {
        const { name, value } = e.target;
        setArgSpecInput(prev => ({ ...prev, [name]: value }));
    }, []);

    // Additional Info 입력 핸들러
    const handleAdditionalInfoInputChange = useCallback((e) => {
        const { name, value } = e.target;
        setAdditionalInfoInput(prev => ({ ...prev, [name]: value }));
    }, []);

    // Service Profile 추가 (Services 전용 로직)
    const handleAddServiceProfile = useCallback(() => {
        if (!serviceProfile.type || !serviceProfile.ID) {
            alert('Type and ID are required for Service Profile');
            return;
        }

        const newServiceProfileData = {
            type: serviceProfile.type,
            ID: serviceProfile.ID,
            PVType: serviceProfile.PVType,
            MOType: serviceProfile.MOType,
            path: serviceProfile.path,
            additionalInfo: serviceProfile.additionalInfo
        };

        // Services 트리에 추가 (루트 레벨에 추가)
        const newNode = createTreeNode(newServiceProfileData);
        console.log('ServicesPage - adding new serviceProfile:', newServiceProfileData);
        console.log('ServicesPage - created newNode:', newNode);
        const updatedTree = [...tree, newNode];
        console.log('ServicesPage - updatedTree:', updatedTree);
        setTree(updatedTree);

        // 즉시 ModuleState에 Services 데이터 전송
        const servicesData = treeToServices(updatedTree, servicesState.noOfBasicService, servicesState.noOfOptionalService);
        if (onChange) {
            onChange(servicesData);
        }

        setServiceProfile({ type: '', ID: '', PVType: '', MOType: '', path: '', additionalInfo: [] });
        setSelectedNodePath([tree.length]);
    }, [serviceProfile, tree, servicesState.noOfBasicService, servicesState.noOfOptionalService, onChange]);

    // Service Profile 삭제 (Services 전용 로직)
    const handleRemoveServiceProfile = useCallback(() => {
        if (selectedNodePath.length === 0) return;

        // Services 트리에서 제거
        const updatedTree = removeNodeAtPath(tree, selectedNodePath);
        setTree(updatedTree);

        // 즉시 ModuleState에 Services 데이터 전송
        const servicesData = treeToServices(updatedTree, servicesState.noOfBasicService, servicesState.noOfOptionalService);
        if (onChange) {
            onChange(servicesData);
        }

        setServiceProfile({ type: '', ID: '', PVType: '', MOType: '', path: '', additionalInfo: [] });
    }, [selectedNodePath, tree, servicesState.noOfBasicService, servicesState.noOfOptionalService, onChange]);

    // Service Method 추가 (Services 전용 로직)
    const handleAddServiceMethod = useCallback(() => {
        if (selectedNodePath.length === 0) {
            alert('Please select a Service Profile first');
            return;
        }
        if (!serviceMethod.methodName) {
            alert('Method Name is required');
            return;
        }

        const newServiceMethodData = {
            methodName: serviceMethod.methodName,
            description: serviceMethod.description || '',
            retType: serviceMethod.retType,
            MOType: serviceMethod.MOType,
            reqProvType: serviceMethod.reqProvType,
            moduleID: serviceMethod.moduleID || null
        };

        // Services 트리에 추가
        const newNode = createTreeNode(newServiceMethodData);
        const updatedTree = addNodeAtPath(tree, selectedNodePath, newNode);
        setTree(updatedTree);

        // 즉시 ModuleState에 Services 데이터 전송
        const servicesData = treeToServices(updatedTree, servicesState.noOfBasicService, servicesState.noOfOptionalService);
        if (onChange) {
            onChange(servicesData);
        }

        setServiceMethod({ methodName: '', description: '', retType: '', MOType: '', reqProvType: '', moduleID: null, argSpecs: [] });
    }, [selectedNodePath, serviceMethod, tree, servicesState.noOfBasicService, servicesState.noOfOptionalService, onChange]);

    // Service Method 삭제
    const handleRemoveServiceMethod = useCallback(() => {
        if (selectedNodePath.length < 2) return;

        // tree에서 제거
        const updatedTree = removeNodeAtPath(tree, selectedNodePath);
        setTree(updatedTree);

        // 즉시 ModuleState에 Services 데이터 전송
        const servicesData = treeToServices(updatedTree, servicesState.noOfBasicService, servicesState.noOfOptionalService);
        if (onChange) {
            onChange(servicesData);
        }

        setSelectedNodePath([selectedNodePath[0]]);
        setServiceMethod({ methodName: '', description: '', retType: '', MOType: '', reqProvType: '', moduleID: null, argSpecs: [] });
    }, [selectedNodePath, tree, servicesState.noOfBasicService, servicesState.noOfOptionalService, onChange]);

    // ArgSpec 추가 (Method 또는 ArgSpec 선택 시 모두 가능)
    const handleAddArgSpec = useCallback(() => {
        // Method (path.length === 2) 또는 ArgSpec (path.length >= 3) 선택 시 가능
        if (selectedNodePath.length < 2) {
            alert('Please select a Method or ArgSpec first');
            return;
        }
        if (!argSpecInput.argType) {
            alert('Argument Type is required');
            return;
        }

        // tree에 ArgSpec 추가
        const newArgSpecData = {
            argType: argSpecInput.argType,
            argName: argSpecInput.argName || '',
            argIO: argSpecInput.argIO || ''
        };
        const newNode = createTreeNode(newArgSpecData);
        const updatedTree = addNodeAtPath(tree, selectedNodePath, newNode);
        setTree(updatedTree);

        // 즉시 ModuleState에 Services 데이터 전송
        const servicesData = treeToServices(updatedTree, servicesState.noOfBasicService, servicesState.noOfOptionalService);
        if (onChange) {
            onChange(servicesData);
        }

        setArgSpecInput({ argType: '', argName: '', argIO: '' });
    }, [selectedNodePath, argSpecInput, tree, servicesState.noOfBasicService, servicesState.noOfOptionalService, onChange]);

    // ArgSpec 삭제 (path.length >= 3일 때 가능)
    const handleRemoveArgSpec = useCallback(() => {
        if (selectedNodePath.length < 3) return;

        // tree에서 제거
        const updatedTree = removeNodeAtPath(tree, selectedNodePath);
        setTree(updatedTree);

        // 즉시 ModuleState에 Services 데이터 전송
        const servicesData = treeToServices(updatedTree, servicesState.noOfBasicService, servicesState.noOfOptionalService);
        if (onChange) {
            onChange(servicesData);
        }

        // 부모 노드로 선택 경로 변경 (Method 또는 상위 ArgSpec)
        const parentPath = selectedNodePath.slice(0, -1);
        setSelectedNodePath(parentPath);
        setArgSpecInput({ argType: '', argName: '', argIO: '' });
    }, [selectedNodePath, tree, servicesState.noOfBasicService, servicesState.noOfOptionalService, onChange]);

    // Additional Info 추가/삭제
    const handleAddAdditionalInfo = useCallback(() => {
        if (additionalInfoInput.name && additionalInfoInput.value) {
            setServiceProfile(prev => ({
                ...prev,
                additionalInfo: [...prev.additionalInfo, additionalInfoInput]
            }));
            setAdditionalInfoInput({ name: '', value: '' });
        }
    }, [additionalInfoInput]);

    const handleRemoveAdditionalInfo = useCallback((idx) => {
        setServiceProfile(prev => ({
            ...prev,
            additionalInfo: prev.additionalInfo.filter((_, i) => i !== idx)
        }));
    }, []);

    // 트리뷰 재귀 렌더링
    const renderTree = useCallback((nodes, path = []) => (
        <ul className="service-tree">
            {nodes.map((node, idx) => {
                const currentPath = [...path, idx];
                const isSelected = JSON.stringify(currentPath) === JSON.stringify(selectedNodePath);
                const nodeLabel = getServiceNodeLabel(node);
                const nodeTooltip = getServiceNodeTooltip(node);
                const nodeData = node instanceof TreeNode ? node.getValue() : node;
                const dataType = nodeData.type ? 'service-profile' : nodeData.methodName ? 'service-method' : (nodeData.argType || nodeData.type) ? 'service-argspec' : 'service-profile';

                return (
                    <li key={idx}>
                        <div
                            className={`service-tree-node${isSelected ? ' selected' : ''}`}
                            onClick={(e) => {
                                e.stopPropagation();
                                handleSelectNode(currentPath);
                            }}
                            title={nodeTooltip}
                            data-type={dataType}
                        >
                            {nodeLabel}
                        </div>
                        {node.hasChildren && node.hasChildren() && renderTree(node.children, currentPath)}
                    </li>
                );
            })}
        </ul>
    ), [selectedNodePath, handleSelectNode]);

    return {
        // 상태
        servicesState,
        setServicesState,
        tree,
        selectedNodePath,
        serviceProfile,
        serviceMethod,
        argSpecInput,
        additionalInfoInput,
        selectedType,

        // 이벤트 핸들러
        handleSelectNode,
        handleServiceProfileChange,
        handleServiceMethodChange,
        handleArgSpecInputChange,
        handleAdditionalInfoInputChange,
        handleAddServiceProfile,
        handleRemoveServiceProfile,
        handleAddServiceMethod,
        handleRemoveServiceMethod,
        handleAddArgSpec,
        handleRemoveArgSpec,
        handleAddAdditionalInfo,
        handleRemoveAdditionalInfo,
        renderTree
    };
}
