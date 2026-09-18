import React, { useState, useEffect, useMemo } from 'react';
import { usePropertiesState } from '../../hooks/usePropertiesState';
import { registryService } from '../../services/registryService';
import '../../styles/wizard/PropertiesPage.css';
import {
    BIT_OPTIONS,
    COMPILER_NAME_OPTIONS,
    COMPLEX_TYPE_OPTIONS,
    CPU_ARCH_OPTIONS,
    DEPENDENCY_TYPE_OPTIONS,
    INSTANCE_TYPES_OPTIONS,
    OP_TYPES_OPTIONS,
    OS_NAME_OPTIONS,
    PROPERTY_TABS,
    TYPE_OPTIONS, UNIT_OPTIONS,
    getCompilerVersionOptions,
    getOSVersionOptions
} from '../../utils/Options';
import { getNodeLabel, getNodeTooltip } from '../../utils/tree/TreeNodeLabelUtils';
import { TreeNode } from '../../utils/tree/TreeNode';

function PropertiesPage({ properties = {}, onChange, wizardType = 'software', linkedModules = [] }) {
    const {
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
        organization,
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
        setTypeInput,
        setUnitInput,
        setCompilerType,
        debugTreeStructure
    } = usePropertiesState(properties, onChange);

    const isControllerWizard = wizardType === 'controller' || wizardType === 'robot';
    const [showSoftwareProperties, setShowSoftwareProperties] = useState(false);
    const [linkedModuleData, setLinkedModuleData] = useState([]);
    const [loadingModules, setLoadingModules] = useState(false);
    const [loadingError, setLoadingError] = useState('');
    const [expandedModules, setExpandedModules] = useState({});

    useEffect(() => {
        if (!isControllerWizard) return;
        if (!Array.isArray(linkedModules) || linkedModules.length === 0) {
            setLinkedModuleData([]);
            setLoadingError('');
            return;
        }

        let isMounted = true;
        const loadLinkedModuleData = async () => {
            setLoadingModules(true);
            setLoadingError('');
            try {
                const response = await registryService.getLinkedModuleData(linkedModules);
                if (isMounted) setLinkedModuleData(Array.isArray(response?.modules) ? response.modules : []);
            } catch (error) {
                if (isMounted) {
                    setLinkedModuleData([]);
                    setLoadingError('연결된 모듈의 Properties 정보를 불러오지 못했습니다.');
                }
            } finally {
                if (isMounted) setLoadingModules(false);
            }
        };

        loadLinkedModuleData();
        return () => {
            isMounted = false;
        };
    }, [isControllerWizard, linkedModules]);

    // 모듈별로 그룹화된 Properties
    const groupedLinkedProperties = useMemo(() => {
        const grouped = {};
        linkedModuleData.forEach(moduleInfo => {
            const moduleName = moduleInfo?.moduleName || moduleInfo?.moduleID || '';
            const moduleID = moduleInfo?.moduleID || '';
            const props = moduleInfo?.properties || {};
            const propertiesList = Array.isArray(props.properties) ? props.properties : [];

            if (!grouped[moduleID] && propertiesList.length > 0) {
                grouped[moduleID] = {
                    moduleName,
                    moduleID,
                    properties: propertiesList
                };
            }
        });
        return grouped;
    }, [linkedModuleData]);

    const toggleModuleExpansion = (moduleID) => {
        setExpandedModules(prev => ({
            ...prev,
            [moduleID]: !prev[moduleID]
        }));
    };

    const hasPropertyInProperties = (property) => {
        const existingProperties = properties?.properties || [];
        return existingProperties.some(existing =>
            (existing?.name || '') === (property?.name || '') &&
            (existing?.type || '') === (property?.type || '') &&
            (existing?.description || '') === (property?.description || '')
        );
    };

    const handleToggleLinkedProperty = (moduleID, property) => {
        if (!onChange) return;
        const currentProperties = [...(properties?.properties || [])];
        const matchPredicate = existing =>
            (existing?.name || '') === (property?.name || '') &&
            (existing?.type || '') === (property?.type || '') &&
            (existing?.description || '') === (property?.description || '');

        const alreadyAdded = currentProperties.some(matchPredicate);
        const next = {
            ...properties,
            properties: alreadyAdded
                ? currentProperties.filter(existing => !matchPredicate(existing))
                : [...currentProperties, { ...property }]
        };
        onChange(next);
    };

    // TreeViewer 재귀 렌더링
    const renderTree = (nodes, path = []) => (
        <ul className="property-tree">
            {nodes.map((node, idx) => {
                const currentPath = [...path, idx];
                const isSelected = JSON.stringify(currentPath) === JSON.stringify(selectedNodePath);
                const isExpanded = isNodeExpanded(currentPath);
                const hasChildren = node.hasChildren && node.hasChildren();
                const nodeLabel = getNodeLabel(node);
                const nodeTooltip = getNodeTooltip(node);
                const nodeProperty = node instanceof TreeNode ? node.getValue() : node;
                const complexType = nodeProperty.complexType || nodeProperty.complex || 'NONE';
                const dataType = complexType.toLowerCase();

                return (
                    <li key={idx}>
                        <div
                            className={`property-tree-node${isSelected ? ' selected' : ''}${hasChildren ? ' has-children' : ''}${isExpanded ? ' expanded' : ''}`}
                            title={nodeTooltip}
                            data-type={dataType}
                            onClick={(e) => {
                                e.stopPropagation(); // 항상 이벤트 전파 중단

                                // 확장 아이콘 영역 클릭인지 확인
                                const rect = e.currentTarget.getBoundingClientRect();
                                const clickX = e.clientX - rect.left;

                                if (hasChildren && clickX <= 20) {
                                    // 확장 아이콘 영역 클릭
                                    toggleNodeExpansion(currentPath);
                                } else {
                                    // 노드 라벨 영역 클릭
                                    handleSelectNode(currentPath);
                                }
                            }}
                        >
                            {nodeLabel}
                        </div>
                        {hasChildren && isExpanded && renderTree(node.children, currentPath)}
                    </li>
                );
            })}
        </ul>
    );

    // Property 입력폼 렌더링 (ComplexType에 따라 다르게)
    const renderPropertyForm = () => {
        if (property.complexType === '' || property.complexType === 'NONE') {
            return <>
                <div className="property-group"><label>Name</label><input name="name" value={property.name} onChange={handlePropertyChange} /></div>
                <div className="property-group"><label>Type</label><select name="type" value={property.type} onChange={handlePropertyChange}>{TYPE_OPTIONS.map(opt => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}</select>{property.type === 'custom' && (<input type="text" name="typeInput" placeholder="직접입력" value={typeInput} onChange={e => setTypeInput(e.target.value)} />)}</div>
                <div className="property-group"><label>Unit</label><select name="unit" value={property.unit} onChange={handlePropertyChange}>{UNIT_OPTIONS.map(opt => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}</select>{property.unit === 'custom' && (<input type="text" name="unitInput" placeholder="직접입력" value={unitInput} onChange={e => setUnitInput(e.target.value)} />)}</div>
                <div className="property-group"><label>Value</label><input name="value" value={property.value} onChange={handlePropertyChange} /></div>
            </>;
        } else if (property.complexType === 'ARRAY') {
            return <>
                <div className="property-group"><label>Name</label><input name="name" value={property.name} onChange={handlePropertyChange} /></div>
                <div className="property-group"><label>Type</label><select name="type" value={property.type} onChange={handlePropertyChange}>{TYPE_OPTIONS.map(opt => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}</select>{property.type === 'custom' && (<input type="text" name="typeInput" placeholder="직접입력" value={typeInput} onChange={e => setTypeInput(e.target.value)} />)}</div>
                <div className="property-group"><label>Unit</label><select name="unit" value={property.unit} onChange={handlePropertyChange}>{UNIT_OPTIONS.map(opt => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}</select>{property.unit === 'custom' && (<input type="text" name="unitInput" placeholder="직접입력" value={unitInput} onChange={e => setUnitInput(e.target.value)} />)}</div>
                <div className="property-group"><label>Value (2D Array)</label><textarea name="value" value={property.value} onChange={handlePropertyChange} placeholder="예: [[1,2],[3,4]]" /></div>
            </>;
        } else if (property.complexType === 'CLASS') {
            return <>
                <div className="property-group"><label>Complex Name</label><input name="complexName" value={property.complexName} onChange={handlePropertyChange} /></div>
                <div className="property-group"><label>Name</label><input name="name" value={property.name} onChange={handlePropertyChange} /></div>
                <div className="property-group"><label>Type</label><select name="type" value={property.type} onChange={handlePropertyChange}>{TYPE_OPTIONS.map(opt => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}</select>{property.type === 'custom' && (<input type="text" name="typeInput" placeholder="직접입력" value={typeInput} onChange={e => setTypeInput(e.target.value)} />)}</div>
                <div className="property-group"><label>Unit</label><select name="unit" value={property.unit} onChange={handlePropertyChange}>{UNIT_OPTIONS.map(opt => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}</select>{property.unit === 'custom' && (<input type="text" name="unitInput" placeholder="직접입력" value={unitInput} onChange={e => setUnitInput(e.target.value)} />)}</div>
                <div className="property-group"><label>Value</label><input name="value" value={property.value} onChange={handlePropertyChange} /></div>
            </>;
        } else if (property.complexType === 'POINTER') {
            return <>
                <div className="property-group"><label>Name</label><input name="name" value={property.name} onChange={handlePropertyChange} /></div>
                <div className="property-group"><label>In Data Type</label><select name="inDataType" value={property.inDataType} onChange={handlePropertyChange}>{TYPE_OPTIONS.map(opt => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}</select></div>
            </>;
        }
        return null;
    };

    return (
        <div className="properties-page">
            <div className="properties-tabs">
                {PROPERTY_TABS.map(tab => (
                    <button
                        key={tab.key}
                        className={`properties-tab${activeTab === tab.key ? ' active' : ''}`}
                        onClick={() => handleTabChange(tab.key)}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>
            {activeTab === 'property' && (
                <div className="properties-page-flex">
                    <div className="property-input-area">
                        {isControllerWizard && (
                            <div style={{ marginBottom: 16 }}>
                                <button
                                    type="button"
                                    onClick={() => setShowSoftwareProperties(!showSoftwareProperties)}
                                    style={{
                                        padding: '10px 20px',
                                        background: showSoftwareProperties ? '#28a745' : '#007bff',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        fontWeight: 500,
                                        fontSize: '14px'
                                    }}
                                >
                                    {showSoftwareProperties ? 'Hide Software Properties' : 'Add Software Property'}
                                </button>
                            </div>
                        )}
                        {isControllerWizard && showSoftwareProperties && (
                            <div style={{ marginBottom: 16, padding: '16px', background: '#f8f9fa', borderRadius: '8px', border: '1px solid #e1e5e9' }}>
                                <div className="property-group">
                                    <label>Linked Properties (from IDnType Add)</label>
                                    {loadingModules && <div style={{ padding: '12px', color: '#666' }}>Loading Properties...</div>}
                                    {!loadingModules && loadingError && <div style={{ padding: '12px', color: '#dc3545' }}>{loadingError}</div>}
                                    {!loadingModules && !loadingError && Object.keys(groupedLinkedProperties).length === 0 && (
                                        <div style={{ padding: '12px', color: '#666' }}>표시할 Properties가 없습니다. IDnType에서 모듈을 Add 해주세요.</div>
                                    )}
                                </div>

                                {!loadingModules && Object.keys(groupedLinkedProperties).length > 0 && (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 16 }}>
                                        {Object.values(groupedLinkedProperties).map((moduleGroup) => {
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
                                                        <span>{moduleGroup.moduleName} ({moduleGroup.properties.length})</span>
                                                        <span>{isExpanded ? '▼' : '▶'}</span>
                                                    </button>
                                                    
                                                    {/* 드롭다운 내용 */}
                                                    {isExpanded && (
                                                        <div style={{ padding: '12px', borderTop: '1px solid #e1e5e9' }}>
                                                            {moduleGroup.properties.map((property, idx) => {
                                                                const added = hasPropertyInProperties(property);
                                                                return (
                                                                    <div
                                                                        key={`${moduleGroup.moduleID}-${property?.name || idx}-${idx}`}
                                                                        style={{
                                                                            padding: '10px',
                                                                            marginBottom: '8px',
                                                                            background: '#f8f9fa',
                                                                            borderRadius: '6px',
                                                                            border: '1px solid #e1e5e9'
                                                                        }}
                                                                    >
                                                                        <div style={{ fontWeight: 500, marginBottom: '4px' }}>
                                                                            {property?.name || '(unnamed)'}
                                                                        </div>
                                                                        <div style={{ fontSize: '12px', color: '#555', marginBottom: '8px' }}>
                                                                            Type: {property?.type || '-'}
                                                                            {property?.unit && ` | Unit: ${property.unit}`}
                                                                            {property?.value && ` | Value: ${property.value}`}
                                                                            {property?.description && ` | ${property.description}`}
                                                                        </div>
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => handleToggleLinkedProperty(moduleGroup.moduleID, property)}
                                                                            style={{
                                                                                padding: '6px 12px',
                                                                                background: added ? '#dc3545' : '#28a745',
                                                                                color: 'white',
                                                                                border: 'none',
                                                                                borderRadius: '4px',
                                                                                cursor: 'pointer',
                                                                                fontSize: '12px'
                                                                            }}
                                                                        >
                                                                            {added ? 'Remove' : 'Add'}
                                                                        </button>
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
                        )}
                        <div className="property-group">
                            <label>Complex Type</label>
                            <select name="complexType" value={property.complexType} onChange={handlePropertyChange}>
                                {COMPLEX_TYPE_OPTIONS.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </div>
                        {renderPropertyForm()}
                        <div className="property-group"><label>Description</label><textarea name="description" value={property.description} onChange={handlePropertyChange} /></div>
                        <div style={{ marginTop: 18, display: 'flex', gap: 12 }}>
                            <button type="button" className="property-btn" onClick={handleAdd}>Add</button>
                            {selectedNodePath.length > 0 && (
                                <>
                                    <button type="button" className="property-btn" onClick={handleUpdate}>Update</button>
                                    <button type="button" className="property-btn" onClick={handleRemove}>Remove</button>
                                </>
                            )}
                        </div>
                    </div>
                    <div className="property-tree-area" onClick={handleTreeAreaClick}>
                        {renderTree(propertyNodes)}
                    </div>
                </div>
            )}
            {activeTab === 'os' && (
                <div className="properties-page-flex">
                    <div className="property-input-area property-input-area--fullwidth">
                        <div className="property-row property-row--threecol">
                            <div className="property-group">
                                <label>OS Type</label>
                                <select name="type" value={osType.type || ''} onChange={handleOsTypeChange}>
                                    {OS_NAME_OPTIONS.map(opt => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="property-group">
                                <label>Bit</label>
                                <select name="bit" value={osType.bit || ''} onChange={handleOsTypeChange}>
                                    {BIT_OPTIONS.map(opt => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="property-group">
                                <label>Version</label>
                                <select name="version" value={osType.version || ''} onChange={handleOsTypeChange}>
                                    {osVersionOptions.map(opt => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {activeTab === 'compiler' && (
                <div className="properties-page-flex">
                    <div className="property-input-area">
                        <div className="property-row property-row--twocol">
                            <div className="property-group">
                                <label>OS Name</label>
                                <select name="osname" value={compilerType.osname || ''} onChange={handleCompilerTypeChange}>
                                    {OS_NAME_OPTIONS.map(opt => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="property-group">
                                <label>VerRangeOS (min/max)</label>
                                <div style={{ display: 'flex', gap: 6 }}>
                                    <select name="verRangeOS_min" value={compilerType.verRangeOS?.min || ''} onChange={e => setCompilerType(prev => ({ ...prev, verRangeOS: { ...prev.verRangeOS, min: e.target.value } }))} style={{ width: '50%' }}>
                                        {getOSVersionOptions(compilerType.osname).map(opt => (
                                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                                        ))}
                                    </select>
                                    <select name="verRangeOS_max" value={compilerType.verRangeOS?.max || ''} onChange={e => setCompilerType(prev => ({ ...prev, verRangeOS: { ...prev.verRangeOS, max: e.target.value } }))} style={{ width: '50%' }}>
                                        {getOSVersionOptions(compilerType.osname).map(opt => (
                                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="property-row property-row--twocol">
                            <div className="property-group">
                                <label>Compiler Name</label>
                                <select name="compilerName" value={compilerType.compilerName || ''} onChange={handleCompilerTypeChange}>
                                    {COMPILER_NAME_OPTIONS.map(opt => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="property-group">
                                <label>VerRangeCompiler (min/max)</label>
                                <div style={{ display: 'flex', gap: 6 }}>
                                    <select name="verRangeCompiler_min" value={compilerType.verRangeCompiler?.min || ''} onChange={e => setCompilerType(prev => ({ ...prev, verRangeCompiler: { ...prev.verRangeCompiler, min: e.target.value } }))} style={{ width: '50%' }}>
                                        {getCompilerVersionOptions(compilerType.compilerName).map(opt => (
                                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                                        ))}
                                    </select>
                                    <select name="verRangeCompiler_max" value={compilerType.verRangeCompiler?.max || ''} onChange={e => setCompilerType(prev => ({ ...prev, verRangeCompiler: { ...prev.verRangeCompiler, max: e.target.value } }))} style={{ width: '50%' }}>
                                        {getCompilerVersionOptions(compilerType.compilerName).map(opt => (
                                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="property-group">
                            <label>BitsnCPUarch</label>
                            <select name="bitsnCPUarch" value={compilerType.bitsnCPUarch || ''} onChange={handleCompilerTypeChange}>
                                {CPU_ARCH_OPTIONS.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </div>
                        <div className="property-group">
                            <label>Execution Types</label>
                        </div>
                        <div className="property-row property-row--compact">
                            <input type="text" name="priority" placeholder="Priority" value={executionInput.priority} onChange={handleExecutionInputChange} />
                            <select name="opType" value={executionInput.opType} onChange={handleExecutionInputChange}>
                                {OP_TYPES_OPTIONS.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                            <input type="text" name="hardRT" placeholder="HardRT" value={executionInput.hardRT} onChange={handleExecutionInputChange} />
                            <input type="text" name="timeConstraint" placeholder="TimeConstraint" value={executionInput.timeConstraint} onChange={handleExecutionInputChange} />
                            <select name="instanceType" value={executionInput.instanceType} onChange={handleExecutionInputChange}>
                                {INSTANCE_TYPES_OPTIONS.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                            <button type="button" className="property-btn" onClick={handleAddExecution} style={{ minWidth: 40, padding: '4px 8px' }}>Add</button>
                        </div>
                        {executionTypes.length > 0 && (
                            <div className="execution-list-viewer">
                                {executionTypes.map((et, idx) => (
                                    <div key={idx} className="property-row property-row--compact execution-list-row">
                                        <span className="execution-list-item">{et.priority}</span>
                                        <span className="execution-list-item">{et.optype}</span>
                                        <span className="execution-list-item">{et.hardRT}</span>
                                        <span className="execution-list-item">{et.timeConstraint}</span>
                                        <span className="execution-list-item">{et.instanceType}</span>
                                        <button type="button" className="property-btn" onClick={() => handleRemoveExecution(idx)} style={{ minWidth: 40, padding: '8px' }}>Remove</button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
            {activeTab === 'libraries' && (
                <div className="properties-page-flex">
                    <div className="property-input-area property-input-area--fullwidth">
                        <div className="property-group">
                            <label>Libraries</label>
                        </div>
                        <div className="property-row property-row--fullwidth">
                            <input type="text" name="name" placeholder="Name" value={libraryInput.name} onChange={handleLibraryInputChange} />
                            <input type="text" name="version" placeholder="Version" value={libraryInput.version} onChange={handleLibraryInputChange} />
                            <div style={{ flex: '0 0 auto', display: 'flex', justifyContent: 'flex-end', width: '80px' }}>
                                <button type="button" className="property-btn" onClick={handleAddLibrary} style={{ minWidth: 60, width: '100%' }}>Add</button>
                            </div>
                        </div>
                        {libraries.length > 0 && (
                            <div className="library-list-viewer">
                                {libraries.map((lib, idx) => (
                                    <div key={idx} className="property-row property-row--fullwidth library-list-row">
                                        <span className="library-list-item">{lib.name}</span>
                                        <span className="library-list-item">{lib.version}</span>
                                        <div style={{ flex: '0 0 auto', display: 'flex', justifyContent: 'flex-end', width: '80px' }}>
                                            <button type="button" className="property-btn" onClick={() => handleRemoveLibrary(idx)} style={{ minWidth: 60, width: '100%' }}>Remove</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
            {activeTab === 'organization' && (
                <div className="properties-page-flex">
                    <div className="property-input-area property-input-area--fullwidth">
                        <div className="property-row property-row--twocol">
                            <div className="property-group">
                                <label>Owner</label>
                                <input type="text" name="owner" value={organization?.owner || ''} onChange={handleOrganizationChange} placeholder="Enter owner name" />
                            </div>
                            <div className="property-group">
                                <label>Dependency Type</label>
                                <select name="dependency" value={organization?.dependency || ''} onChange={handleOrganizationChange}>
                                    {DEPENDENCY_TYPE_OPTIONS.map(opt => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="property-row property-row--twocol">
                            <div className="property-group">
                                <label>OrgMember Type - Module ID</label>
                                <input type="text" name="moduleID" value={organization?.orgMemberType?.moduleID || ''} onChange={handleOrgMemberTypeChange} placeholder="Enter Module ID" />
                            </div>
                            <div className="property-group">
                                <label>OrgMember Type - Dependency</label>
                                <select name="dependency" value={organization?.orgMemberType?.dependency || ''} onChange={handleOrgMemberTypeChange}>
                                    {DEPENDENCY_TYPE_OPTIONS.map(opt => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="property-group">
                            <label>Additional Info</label>
                        </div>
                        <div className="property-row property-row--fullwidth">
                            <input type="text" name="name" placeholder="Name" value={additionalInfoInput.name} onChange={handleAdditionalInfoInputChange} />
                            <input type="text" name="value" placeholder="Value" value={additionalInfoInput.value} onChange={handleAdditionalInfoInputChange} />
                            <div style={{ flex: '0 0 auto', display: 'flex', justifyContent: 'flex-end', width: '80px' }}>
                                <button type="button" className="property-btn" onClick={handleAddAdditionalInfo} style={{ minWidth: 60, width: '100%' }}>Add</button>
                            </div>
                        </div>
                        {organization?.additionalInfo?.length > 0 && (
                            <div className="orginfo-list-viewer">
                                {organization.additionalInfo.map((info, idx) => (
                                    <div key={idx} className="property-row property-row--fullwidth orginfo-list-row">
                                        <span className="orginfo-list-item">{info.name}</span>
                                        <span className="orginfo-list-item">{info.value}</span>
                                        <div style={{ flex: '0 0 auto', display: 'flex', justifyContent: 'flex-end', width: '80px' }}>
                                            <button type="button" className="property-btn" onClick={() => handleRemoveAdditionalInfo(idx)} style={{ minWidth: 60, width: '100%' }}>Remove</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
            {/* 다른 탭 영역은 추후 구현 */}
        </div>
    );
}

export default PropertiesPage; 