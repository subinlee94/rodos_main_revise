import React, { useEffect, useMemo, useState } from 'react';
import '../../styles/wizard/IOVariablesPage.css';
import { COMPLEX_TYPE_OPTIONS, TYPE_OPTIONS, UNIT_OPTIONS } from '../../utils/Options';
import { TreeNode } from '../../utils/tree/TreeNode';
import { getNodeLabel, getNodeTooltip } from '../../utils/tree/TreeNodeLabelUtils';
import { useIOVariablesState } from '../../hooks/useIOVariablesState';
import { registryService } from '../../services/registryService';
import { getLinkedSourceLabel, moduleIDKey, toModuleIDPair } from '../../utils/wizard/linkedModuleSource';

function IOVariablesPage({ ioVariables = {}, setIoVariables, wizardType = 'software', linkedModules = [], linkedHwModules = [] }) {
    const {
        tree,
        selectedNodePath,
        typeInput,
        unitInput,
        expandedNodes,
        ioVar,
        setTypeInput,
        setUnitInput,
        setIoVar,
        handleInputChange,
        handleSelectNode,
        toggleNodeExpansion,
        isNodeExpanded,
        handleAdd,
        handleRemove,
        replaceIoVariables
    } = useIOVariablesState(ioVariables, setIoVariables);
    const isControllerWizard = wizardType === 'controller' || wizardType === 'robot';
    const [linkedModuleData, setLinkedModuleData] = useState([]);
    const [loadingModules, setLoadingModules] = useState(false);
    const [loadingError, setLoadingError] = useState('');
    const [expandedModules, setExpandedModules] = useState({});

    useEffect(() => {
        if (!isControllerWizard) return;
        const hasSw = Array.isArray(linkedModules) && linkedModules.length > 0;
        const hasHw = Array.isArray(linkedHwModules) && linkedHwModules.length > 0;
        if (!hasSw && !hasHw) {
            setLinkedModuleData([]);
            setLoadingError('');
            return;
        }

        let isMounted = true;
        const loadLinkedModuleData = async () => {
            setLoadingModules(true);
            setLoadingError('');
            try {
                const response = await registryService.getLinkedModuleData(linkedModules, linkedHwModules);
                if (isMounted) setLinkedModuleData(Array.isArray(response?.modules) ? response.modules : []);
            } catch (error) {
                if (isMounted) {
                    setLinkedModuleData([]);
                    setLoadingError('연결된 모듈의 IOVariables 정보를 불러오지 못했습니다.');
                }
            } finally {
                if (isMounted) setLoadingModules(false);
            }
        };

        loadLinkedModuleData();
        return () => {
            isMounted = false;
        };
    }, [isControllerWizard, linkedModules, linkedHwModules]);

    // 모듈별로 그룹화된 IOVariables
    const groupedLinkedIOVariables = useMemo(() => {
        const grouped = {};
        linkedModuleData.forEach(moduleInfo => {
            const io = moduleInfo?.ioVariables || {};
            const moduleName = getLinkedSourceLabel(moduleInfo);
            const moduleID = moduleInfo?.moduleID || '';
            const inputs = Array.isArray(io?.inputs) ? io.inputs : [];
            const outputs = Array.isArray(io?.outputs) ? io.outputs : [];

            if (!grouped[moduleID]) {
                grouped[moduleID] = {
                    moduleName,
                    moduleID,
                    variables: []
                };
            }

            inputs.forEach(variable => {
                grouped[moduleID].variables.push({
                    direction: 'input',
                    moduleName,
                    moduleID,
                    variable
                });
            });

            outputs.forEach(variable => {
                grouped[moduleID].variables.push({
                    direction: 'output',
                    moduleName,
                    moduleID,
                    variable
                });
            });
        });
        return grouped;
    }, [linkedModuleData]);

    const toggleModuleExpansion = (moduleID) => {
        setExpandedModules(prev => ({
            ...prev,
            [moduleID]: !prev[moduleID]
        }));
    };

    const normalizeLinkedVariable = (variable, direction, sourceModuleID) => {
        const cloned = JSON.parse(JSON.stringify(variable || {}));
        return {
            ...cloned,
            name: cloned?.name || '',
            type: cloned?.type || '',
            unit: cloned?.unit || '',
            value: cloned?.value || '',
            description: cloned?.description || '',
            complexType: cloned?.complexType || 'NONE',
            complexName: cloned?.complexName || '',
            inDataType: cloned?.inDataType || '',
            moduleID: cloned?.moduleID || toModuleIDPair(sourceModuleID),
            direction
        };
    };

    const hasVariableInSection = (direction, variable, sourceModuleID) => {
        const section = direction === 'input' ? (ioVariables?.inputs || []) : (ioVariables?.outputs || []);
        const expectedModuleID = variable?.moduleID || toModuleIDPair(sourceModuleID);
        return section.some(existing =>
            (existing?.name || '') === (variable?.name || '') &&
            (existing?.type || '') === (variable?.type || '') &&
            (existing?.description || '') === (variable?.description || '') &&
            (existing?.direction || direction) === direction &&
            moduleIDKey(existing?.moduleID) === moduleIDKey(expectedModuleID)
        );
    };

    const handleToggleLinkedVariable = (item) => {
        if (!setIoVariables) return;
        const normalized = normalizeLinkedVariable(item.variable, item.direction, item.moduleID);
        const sectionKey = item.direction === 'input' ? 'inputs' : 'outputs';
        const currentSection = [...(ioVariables?.[sectionKey] || [])];
        const matchPredicate = existing =>
            (existing?.name || '') === (normalized?.name || '') &&
            (existing?.type || '') === (normalized?.type || '') &&
            (existing?.description || '') === (normalized?.description || '') &&
            (existing?.direction || item.direction) === item.direction &&
            moduleIDKey(existing?.moduleID) === moduleIDKey(normalized?.moduleID);

        const alreadyAdded = currentSection.some(matchPredicate);
        const next = {
            inputs: [...(ioVariables?.inputs || [])],
            outputs: [...(ioVariables?.outputs || [])],
            inouts: [...(ioVariables?.inouts || [])]
        };

        if (alreadyAdded) {
            next[sectionKey] = currentSection.filter(existing => !matchPredicate(existing));
        } else {
            next[sectionKey] = [...currentSection, normalized];
        }
        replaceIoVariables(next);
    };

    const renderLinkedVariables = () => (
            <div style={{ border: '1px solid #e1e5e9', borderRadius: 8, background: '#f8f9fa' }}>
                <div style={{ maxHeight: 280, overflowY: 'auto', padding: '14px 16px' }}>
                    <div className="io-group">
                        <label>Selectable I/O Variables by Controller / Module</label>
                        {loadingModules && <div>Loading IO variables...</div>}
                        {!loadingModules && loadingError && <div>{loadingError}</div>}
                        {!loadingModules && !loadingError && Object.keys(groupedLinkedIOVariables).length === 0 && (
                            <div style={{ color: '#666', fontSize: 13 }}>
                                연결된 모듈의 I/O가 없습니다. 가져오기는 선택 사항이며 아래에서 직접 입력할 수 있습니다.
                            </div>
                        )}
                    </div>

                    {!loadingModules && Object.keys(groupedLinkedIOVariables).length > 0 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {Object.values(groupedLinkedIOVariables).map((moduleGroup) => {
                                const isExpanded = expandedModules[moduleGroup.moduleID];
                                return (
                                    <div
                                        key={moduleGroup.moduleID}
                                        style={{
                                            border: '1px solid #e1e5e9',
                                            borderRadius: 8,
                                            background: '#fff',
                                            overflow: 'hidden'
                                        }}
                                    >
                                        {/* 모듈 이름 드롭다운 버튼 */}
                                        <button
                                            type="button"
                                            onClick={() => toggleModuleExpansion(moduleGroup.moduleID)}
                                            style={{
                                                width: '100%',
                                                padding: '12px',
                                                textAlign: 'left',
                                                background: '#f8f9fa',
                                                border: 'none',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                fontWeight: 600,
                                                fontSize: '14px'
                                            }}
                                        >
                                            <span>{moduleGroup.moduleName} ({moduleGroup.variables.length})</span>
                                            <span>{isExpanded ? '▼' : '▶'}</span>
                                        </button>
                                        
                                        {/* 드롭다운 내용 */}
                                        {isExpanded && (
                                            <div style={{ padding: '12px', borderTop: '1px solid #e1e5e9' }}>
                                                {moduleGroup.variables.map((item, idx) => {
                                                    const added = hasVariableInSection(item.direction, item.variable, item.moduleID);
                                                    return (
                                                        <div
                                                            key={`${item.moduleID}-${item.direction}-${item.variable?.name || idx}-${idx}`}
                                                            style={{
                                                                padding: '10px',
                                                                marginBottom: '8px',
                                                                background: '#f8f9fa',
                                                                borderRadius: '6px',
                                                                border: '1px solid #e1e5e9'
                                                            }}
                                                        >
                                                            <div
                                                                style={{
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    gap: '12px',
                                                                    flexWrap: 'wrap',
                                                                    marginBottom: '8px'
                                                                }}
                                                            >
                                                                <button
                                                                    type="button"
                                                                    className="io-btn"
                                                                    onClick={() => handleToggleLinkedVariable(item)}
                                                                    style={{
                                                                        padding: '6px 12px',
                                                                        background: added ? '#dc3545' : '#28a745',
                                                                        color: 'white',
                                                                        border: 'none',
                                                                        borderRadius: '4px',
                                                                        cursor: 'pointer',
                                                                        fontSize: '12px',
                                                                        flexShrink: 0
                                                                    }}
                                                                >
                                                                    {added ? 'Remove' : 'Add'}
                                                                </button>
                                                                <span style={{ fontWeight: 500, minWidth: 0 }}>
                                                                    [{item.direction.toUpperCase()}] {item.variable?.name || '(unnamed)'}
                                                                </span>
                                                                <span
                                                                    style={{
                                                                        fontSize: '11px',
                                                                        color: '#555',
                                                                        fontFamily: 'monospace',
                                                                        overflow: 'hidden',
                                                                        textOverflow: 'ellipsis',
                                                                        whiteSpace: 'nowrap',
                                                                        maxWidth: '240px'
                                                                    }}
                                                                    title={item.moduleID}
                                                                >
                                                                    {item.moduleID || '-'}
                                                                </span>
                                                            </div>
                                                            <div style={{ fontSize: '12px', color: '#555' }}>
                                                                Type: {item.variable?.type || '-'}
                                                                {item.variable?.unit && ` | Unit: ${item.variable.unit}`}
                                                                {item.variable?.description && ` | ${item.variable.description}`}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        );

    // ComplexType에 따른 입력 폼 렌더링
    const renderIoVarForm = () => {
        if (ioVar.complexType === '' || ioVar.complexType === 'NONE') {
            return (
                <>
                    <div className="io-group">
                        <label>Name</label>
                        <input type="text" name="name" value={ioVar.name} onChange={handleInputChange} placeholder="Enter variable name" />
                    </div>
                    <div className="io-group">
                        <label>Type</label>
                        <select
                            name="type"
                            value={ioVar.type}
                            onChange={e => {
                                handleInputChange(e);
                                setTypeInput('');
                            }}
                        >
                            {TYPE_OPTIONS.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                        {ioVar.type === 'custom' && (
                            <input
                                type="text"
                                name="type"
                                placeholder="직접입력"
                                value={typeInput}
                                onChange={e => {
                                    setTypeInput(e.target.value);
                                    setIoVar(prev => ({ ...prev, type: e.target.value }));
                                }}
                            />
                        )}
                    </div>
                    <div className="io-group">
                        <label>Unit</label>
                        <select
                            name="unit"
                            value={ioVar.unit}
                            onChange={e => {
                                handleInputChange(e);
                                setUnitInput('');
                            }}
                        >
                            {UNIT_OPTIONS.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                        {ioVar.unit === 'custom' && (
                            <input
                                type="text"
                                name="unit"
                                placeholder="직접입력"
                                value={unitInput}
                                onChange={e => {
                                    setUnitInput(e.target.value);
                                    setIoVar(prev => ({ ...prev, unit: e.target.value }));
                                }}
                            />
                        )}
                    </div>
                    <div className="io-group">
                        <label>Value</label>
                        <input type="text" name="value" value={ioVar.value} onChange={handleInputChange} placeholder="Enter value" />
                    </div>
                </>
            );
        } else if (ioVar.complexType === 'ARRAY') {
            return (
                <>
                    <div className="io-group">
                        <label>Name</label>
                        <input type="text" name="name" value={ioVar.name} onChange={handleInputChange} placeholder="Enter array name" />
                    </div>
                    <div className="io-group">
                        <label>Type</label>
                        <select
                            name="type"
                            value={ioVar.type}
                            onChange={e => {
                                handleInputChange(e);
                                setTypeInput('');
                            }}
                        >
                            <option value="">Select Type</option>
                            {TYPE_OPTIONS.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                        {ioVar.type === 'custom' && (
                            <input
                                type="text"
                                name="type"
                                placeholder="직접입력"
                                value={typeInput}
                                onChange={e => {
                                    setTypeInput(e.target.value);
                                    setIoVar(prev => ({ ...prev, type: e.target.value }));
                                }}
                            />
                        )}
                    </div>
                    <div className="io-group">
                        <label>Unit</label>
                        <select
                            name="unit"
                            value={ioVar.unit}
                            onChange={e => {
                                handleInputChange(e);
                                setUnitInput('');
                            }}
                        >
                            <option value="">Select Unit</option>
                            {UNIT_OPTIONS.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                        {ioVar.unit === 'custom' && (
                            <input
                                type="text"
                                name="unit"
                                placeholder="직접입력"
                                value={unitInput}
                                onChange={e => {
                                    setUnitInput(e.target.value);
                                    setIoVar(prev => ({ ...prev, unit: e.target.value }));
                                }}
                            />
                        )}
                    </div>
                    <div className="io-group">
                        <label>Value (Array)</label>
                        <textarea name="value" value={ioVar.value} onChange={handleInputChange} placeholder="예: [1,2,3] 또는 [[1,2],[3,4]]" />
                    </div>
                </>
            );
        } else if (ioVar.complexType === 'CLASS') {
            return (
                <>
                    <div className="io-group">
                        <label>Complex Name</label>
                        <input type="text" name="complexName" value={ioVar.complexName || ''} onChange={handleInputChange} placeholder="Enter complex class name" />
                    </div>
                    <div className="io-group">
                        <label>Name</label>
                        <input type="text" name="name" value={ioVar.name} onChange={handleInputChange} placeholder="Enter variable name" />
                    </div>
                    <div className="io-group">
                        <label>Type</label>
                        <select
                            name="type"
                            value={ioVar.type}
                            onChange={e => {
                                handleInputChange(e);
                                setTypeInput('');
                            }}
                        >
                            <option value="">Select Type</option>
                            {TYPE_OPTIONS.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                        {ioVar.type === 'custom' && (
                            <input
                                type="text"
                                name="type"
                                placeholder="직접입력"
                                value={typeInput}
                                onChange={e => {
                                    setTypeInput(e.target.value);
                                    setIoVar(prev => ({ ...prev, type: e.target.value }));
                                }}
                            />
                        )}
                    </div>
                    <div className="io-group">
                        <label>Unit</label>
                        <select
                            name="unit"
                            value={ioVar.unit}
                            onChange={e => {
                                handleInputChange(e);
                                setUnitInput('');
                            }}
                        >
                            <option value="">Select Unit</option>
                            {UNIT_OPTIONS.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                        {ioVar.unit === 'custom' && (
                            <input
                                type="text"
                                name="unit"
                                placeholder="직접입력"
                                value={unitInput}
                                onChange={e => {
                                    setUnitInput(e.target.value);
                                    setIoVar(prev => ({ ...prev, unit: e.target.value }));
                                }}
                            />
                        )}
                    </div>
                    <div className="io-group">
                        <label>Value</label>
                        <input type="text" name="value" value={ioVar.value} onChange={handleInputChange} placeholder="Enter value" />
                    </div>
                </>
            );
        } else if (ioVar.complexType === 'POINTER') {
            return (
                <>
                    <div className="io-group">
                        <label>Name</label>
                        <input type="text" name="name" value={ioVar.name} onChange={handleInputChange} placeholder="Enter pointer name" />
                    </div>
                    <div className="io-group">
                        <label>In Data Type</label>
                        <select name="inDataType" value={ioVar.inDataType || ''} onChange={handleInputChange}>
                            <option value="">Select Data Type</option>
                            {TYPE_OPTIONS.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                    </div>
                </>
            );
        }
        return null;
    };

    // 트리뷰 재귀 렌더링 (PropertiesPage와 동일한 UI)
    const renderTree = (nodes, path = []) => (
        <ul className="io-tree">
            {nodes.map((node, idx) => {
                const currentPath = [...path, idx];
                const hasChildren = node.hasChildren && node.hasChildren();
                const isExpanded = isNodeExpanded(currentPath);
                const isSelected = JSON.stringify(currentPath) === JSON.stringify(selectedNodePath);
                const nodeLabel = getNodeLabel(node);
                const nodeTooltip = getNodeTooltip(node);
                const nodeData = node instanceof TreeNode ? node.getValue() : node;
                const isRoot = nodeData.isRoot;

                return (
                    <li key={JSON.stringify(currentPath)}>
                        <div
                            className={`io-tree-node${isSelected ? ' selected' : ''}${hasChildren ? ' has-children' : ''}${isExpanded ? ' expanded' : ''}${isRoot ? ' root-node' : ''}`}
                            onClick={(e) => {
                                e.stopPropagation();
                                handleSelectNode(currentPath);
                            }}
                            title={nodeTooltip}
                        >
                            {hasChildren && (
                                <span
                                    className="io-tree-expand-icon"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        toggleNodeExpansion(currentPath);
                                    }}
                                />
                            )}
                            {isRoot ? (
                                <span className="root-label">
                                    {nodeData.name}
                                </span>
                            ) : (
                                <span className="io-tree-node-label">{nodeLabel}</span>
                            )}
                        </div>
                        {hasChildren && isExpanded && renderTree(node.children, currentPath)}
                    </li>
                );
            })}
        </ul>
    );

    // 현재 선택된 루트 표시
    const selectedRootLabel = selectedNodePath.length > 0 ? ['inputs', 'outputs', 'inouts'][selectedNodePath[0]] : 'inputs';

    return (
        <div className="io-page">
            {isControllerWizard && (
                <div style={{ marginBottom: 16 }}>
                    <h3 style={{ margin: '0 0 8px' }}>Import from linked Controller / Software <span style={{ color: '#777', fontSize: 13, fontWeight: 400 }}>(Optional)</span></h3>
                    <p style={{ margin: '0 0 10px', color: '#666', fontSize: 13 }}>
                        Imported variables retain their source moduleID. You can also define this module's I/O manually below.
                    </p>
                    {renderLinkedVariables()}
                </div>
            )}
            <h3 style={{ margin: '0 0 8px' }}>{wizardType === 'robot' ? 'Robot I/O Editor (Manual)' : 'Controller I/O Editor (Manual)'}</h3>
            <div className="io-flex">
                <div className="io-input-area">
                    <div className="io-group">
                        <label>Complex Type</label>
                        <select name="complexType" value={ioVar.complexType} onChange={handleInputChange}>
                            {COMPLEX_TYPE_OPTIONS.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                    </div>
                    {renderIoVarForm()}
                    <div className="io-group">
                        <label>Description</label>
                        <textarea name="description" value={ioVar.description} onChange={handleInputChange} placeholder="Enter description" />
                    </div>
                </div>
                <div className="io-tree-area" onClick={(e) => {
                    // 트리 노드가 아닌 영역 클릭 시에만 선택 해제
                    if (!e.target.closest('.io-tree-node')) {
                        handleSelectNode([]);
                    }
                }}>
                    {renderTree(tree)}
                </div>
            </div>
            <div className="io-actions-bar">
                <span className="io-actions-hint">오른쪽에서 inputs / outputs / inouts 중 추가할 위치를 선택하세요.</span>
                <div className="io-actions-buttons">
                    <button type="button" className="io-btn" onClick={handleAdd} disabled={selectedNodePath.length === 0}>Add</button>
                    <button type="button" className="io-btn" onClick={handleRemove} disabled={selectedNodePath.length <= 1}>Remove</button>
                </div>
            </div>
        </div>
    );
}

export default IOVariablesPage; 
