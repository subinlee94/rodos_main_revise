import React, { useEffect, useMemo, useState } from 'react';
import '../../styles/wizard/ServicesPage.css';
import { SERVICE_TYPE_OPTIONS, PV_TYPE_OPTIONS, MO_TYPE_OPTIONS, REQ_PROV_TYPE_OPTIONS, IN_OUT_TYPE_OPTIONS } from '../../utils/Options';
import { useServicesState } from '../../hooks/useServicesState';
import { registryService } from '../../services/registryService';
import { getLinkedSourceLabel, moduleIDKey, toModuleIDPair } from '../../utils/wizard/linkedModuleSource';

function ServicesPage({ services = {}, onChange, wizardType = 'software', linkedModules = [], linkedHwModules = [] }) {
    const normalizeMethodCandidates = (methodListItem) => {
        if (!methodListItem) return [];
        if (Array.isArray(methodListItem?.method)) return methodListItem.method;
        if (methodListItem?.method) return [methodListItem.method];
        return [methodListItem];
    };

    const {
        servicesState,
        setServicesState,
        tree,
        selectedNodePath,
        serviceProfile,
        serviceMethod,
        argSpecInput,
        additionalInfoInput,
        selectedType,
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
    } = useServicesState(services, onChange);
    const isControllerWizard = wizardType === 'controller' || wizardType === 'robot';
    const [linkedModuleData, setLinkedModuleData] = useState([]);
    const [loadingModules, setLoadingModules] = useState(false);
    const [loadingError, setLoadingError] = useState('');
    const [expandedModules, setExpandedModules] = useState({});

    useEffect(() => {
        console.log('[ServicesPage] effect start', {
            wizardType,
            isControllerWizard,
            linkedModulesLength: Array.isArray(linkedModules) ? linkedModules.length : 'not-array',
            linkedModules
        });

        if (!isControllerWizard) {
            console.log('[ServicesPage] skip API call: not controller wizard');
            return;
        }
        const hasSw = Array.isArray(linkedModules) && linkedModules.length > 0;
        const hasHw = Array.isArray(linkedHwModules) && linkedHwModules.length > 0;
        if (!hasSw && !hasHw) {
            console.log('[ServicesPage] skip API call: linked aspects empty');
            setLinkedModuleData([]);
            setLoadingError('');
            return;
        }

        let isMounted = true;
        const loadSWModules = async () => {
            console.log('[ServicesPage] calling getLinkedModuleData...');
            setLoadingModules(true);
            setLoadingError('');
            try {
                const response = await registryService.getLinkedModuleData(linkedModules, linkedHwModules);
                console.log('[ServicesPage] getLinkedModuleData success', {
                    modulesCount: Array.isArray(response?.modules) ? response.modules.length : 0
                });
                if (isMounted) setLinkedModuleData(Array.isArray(response?.modules) ? response.modules : []);
            } catch (error) {
                console.error('[ServicesPage] getLinkedModuleData failed', error);
                if (isMounted) {
                    setLinkedModuleData([]);
                    setLoadingError('연결된 모듈의 services 정보를 불러오지 못했습니다.');
                }
            } finally {
                if (isMounted) setLoadingModules(false);
            }
        };

        loadSWModules();
        return () => {
            isMounted = false;
        };
    }, [isControllerWizard, linkedModules, linkedHwModules, wizardType]);

    // 모듈별로 그룹화된 Service Methods
    const groupedLinkedMethods = useMemo(() => {
        const grouped = {};
        linkedModuleData.forEach(moduleInfo => {
            const moduleID = moduleInfo.moduleID || '';
            const moduleName = getLinkedSourceLabel(moduleInfo);
            
            if (!grouped[moduleID]) {
                grouped[moduleID] = {
                    moduleName,
                    moduleID,
                    methods: []
                };
            }

            const profiles = moduleInfo?.services?.serviceProfiles || [];
            profiles.forEach(profile => {
                const methodLists = profile?.methodLists || [];
                if (methodLists.length > 0) {
                    methodLists.forEach(methodList => {
                        normalizeMethodCandidates(methodList).forEach(method => {
                            if (method?.methodName) {
                                grouped[moduleID].methods.push({
                                    moduleID,
                                    moduleName,
                                    profile,
                                    method
                                });
                            }
                        });
                    });
                } else {
                    (profile?.serviceMethods || []).forEach(method => {
                        if (method?.methodName) {
                            grouped[moduleID].methods.push({
                                moduleID,
                                moduleName,
                                profile,
                                method
                            });
                        }
                    });
                }
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

    const hasMethodInServices = (methodName, profileID, sourceModuleID) => {
        const profiles = services?.serviceProfiles || [];
        const profile = profiles.find(p => (p?.ID || '') === (profileID || ''));
        if (!profile) return false;
        const methods = (profile?.methodLists || []).flatMap(item => normalizeMethodCandidates(item));
        const fallbackMethods = methods.length > 0 ? methods : (profile?.serviceMethods || []);
        return fallbackMethods.some(method =>
            method?.methodName === methodName &&
            moduleIDKey(method?.moduleID) === moduleIDKey(sourceModuleID)
        );
    };

    const handleToggleLinkedMethod = (item) => {
        const updatedServices = {
            noOfBasicService: services?.noOfBasicService || '',
            noOfOptionalService: services?.noOfOptionalService || '',
            serviceProfiles: [...(services?.serviceProfiles || [])]
        };

        const sourceProfile = item.profile || {};
        const profileID = sourceProfile.ID || item.moduleID || 'linked-profile';
        const profileType = sourceProfile.type || 'linked';

        let profile = updatedServices.serviceProfiles.find(p => (p?.ID || '') === profileID && (p?.type || '') === profileType);
        if (!profile) {
            profile = {
                type: profileType,
                ID: profileID,
                PVType: sourceProfile.PVType || '',
                MOType: sourceProfile.MOType || '',
                path: sourceProfile.path || '',
                additionalInfo: sourceProfile.additionalInfo || [],
                methodLists: [],
                serviceMethods: []
            };
            updatedServices.serviceProfiles.push(profile);
        }

        const existingMethods = (profile.methodLists || []).flatMap(m => normalizeMethodCandidates(m));
        const sourceModuleID = item.method.moduleID || toModuleIDPair(item.moduleID);
        const alreadyAdded = existingMethods.some(m =>
            m?.methodName === item.method.methodName &&
            moduleIDKey(m?.moduleID) === moduleIDKey(sourceModuleID)
        );

        if (alreadyAdded) {
            profile.methodLists = (profile.methodLists || []).flatMap(methodItem => {
                const filtered = normalizeMethodCandidates(methodItem).filter(
                    method => !(method?.methodName === item.method.methodName &&
                        moduleIDKey(method?.moduleID) === moduleIDKey(sourceModuleID))
                );
                return filtered.length > 0 ? [{ method: filtered }] : [];
            });
            profile.serviceMethods = (profile.serviceMethods || []).filter(
                method => !(method?.methodName === item.method.methodName &&
                    moduleIDKey(method?.moduleID) === moduleIDKey(sourceModuleID))
            );
            if (onChange) onChange(updatedServices);
            return;
        }

        const normalized = {
            methodName: item.method.methodName,
            description: item.method.description || '',
            retType: item.method.retType || '',
            MOType: item.method.MOType || '',
            reqProvType: item.method.reqProvType || '',
            moduleID: sourceModuleID,
            argSpecs: item.method.argSpecs || []
        };
        profile.methodLists = [...(profile.methodLists || []), { method: [normalized] }];
        profile.serviceMethods = [...(profile.serviceMethods || []), normalized];

        if (onChange) onChange(updatedServices);
    };

    const linkedServicesPanel = (
            <div style={{ marginBottom: 14, border: '1px solid #e1e5e9', borderRadius: 8, background: '#f8f9fa' }}>
                <div style={{ maxHeight: 260, overflowY: 'auto', padding: '14px 16px' }}>
                    <div className="input-block">
                        <div className="input-title">Selectable Services by Controller / Module <span style={{ color: '#777', fontSize: 12, fontWeight: 400 }}>(Optional)</span></div>
                        {loadingModules && <div>Loading service methods...</div>}
                        {!loadingModules && loadingError && <div>{loadingError}</div>}
                        {!loadingModules && !loadingError && Object.keys(groupedLinkedMethods).length === 0 && (
                            <div style={{ color: '#666', fontSize: 13 }}>
                                연결된 모듈의 서비스가 없습니다. 가져오기는 선택 사항이며 아래에서 직접 입력할 수 있습니다.
                            </div>
                        )}
                        {!loadingModules && Object.keys(groupedLinkedMethods).length > 0 && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                {Object.values(groupedLinkedMethods).map((moduleGroup) => {
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
                                                <span>{moduleGroup.moduleName} ({moduleGroup.methods.length})</span>
                                                <span>{isExpanded ? '▼' : '▶'}</span>
                                            </button>
                                            
                                            {/* 드롭다운 내용 */}
                                            {isExpanded && (
                                                <div style={{ padding: '12px', borderTop: '1px solid #e1e5e9' }}>
                                                    {moduleGroup.methods.map((item, idx) => {
                                                        const profileID = item?.profile?.ID || item?.moduleID || 'linked-profile';
                                                        const added = hasMethodInServices(
                                                            item.method.methodName,
                                                            profileID,
                                                            item.method.moduleID || toModuleIDPair(item.moduleID)
                                                        );
                                                        return (
                                                            <div
                                                                key={`${item.moduleID}-${item.method.methodName}-${idx}`}
                                                                style={{
                                                                    padding: '10px',
                                                                    marginBottom: '8px',
                                                                    background: '#f8f9fa',
                                                                    borderRadius: '6px',
                                                                    border: '1px solid #e1e5e9'
                                                                }}
                                                            >
                                                                <div style={{ fontWeight: 500, marginBottom: '4px' }}>
                                                                    Service Method: {item.method.methodName}
                                                                </div>
                                                                <div style={{ fontSize: '12px', color: '#555', marginBottom: '8px' }}>
                                                                    {item.method.description && `Description: ${item.method.description}`}
                                                                    {item.method.retType && ` | Return Type: ${item.method.retType}`}
                                                                    {item.profile?.ID && ` | Profile ID: ${item.profile.ID}`}
                                                                </div>
                                                                <button
                                                                    type="button"
                                                                    className="service-btn"
                                                                    onClick={() => handleToggleLinkedMethod(item)}
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
                </div>
            </div>
        );



    return (
        <div className="services-page" style={{ height: '100%', minHeight: 0, overflow: 'hidden' }}>
            {isControllerWizard && linkedServicesPanel}
            {isControllerWizard && (
                <div className="input-title" style={{ margin: '0 0 8px 4px' }}>
                    {wizardType === 'robot' ? 'Robot Service Editor (Manual)' : 'Controller Service Editor (Manual)'}
                </div>
            )}
            {/* 상단 서비스 개수 입력 */}
            <div className="services-header-compact">
                <div className="service-group-compact">
                    <label>Number of Basic Services</label>
                    <input type="text" value={servicesState.noOfBasicService || ''} onChange={e => setServicesState(s => ({ ...s, noOfBasicService: e.target.value }))} placeholder="Enter number" />
                </div>
                <div className="service-group-compact">
                    <label>Number of Optional Services</label>
                    <input type="text" value={servicesState.noOfOptionalService || ''} onChange={e => setServicesState(s => ({ ...s, noOfOptionalService: e.target.value }))} placeholder="Enter number" />
                </div>
            </div>
            <div className="services-content-flex-compact" style={{ height: '100%', minHeight: 0, overflow: 'hidden' }}>
                {/* 좌측 입력폼 */}
                <div className="service-input-area-compact" style={{ flex: '1 1 0', minWidth: 0, maxHeight: '70vh', overflowY: 'auto' }}>
                    {/* ServiceProfile 입력 영역 */}
                    <div className="input-block">
                        <div className="input-title">Service Profile</div>
                        <div className="service-row">
                            <div className="service-group">
                                <label>Type</label>
                                <select name="type" value={serviceProfile.type} onChange={handleServiceProfileChange}>
                                    {SERVICE_TYPE_OPTIONS.map(opt => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="service-group">
                                <label>ID</label>
                                <input name="ID" value={serviceProfile.ID} onChange={handleServiceProfileChange} placeholder="Enter ID" />
                            </div>
                        </div>
                        <div className="service-row">
                            <div className="service-group">
                                <label>PV Type</label>
                                <select name="PVType" value={serviceProfile.PVType} onChange={handleServiceProfileChange}>
                                    {PV_TYPE_OPTIONS.map(opt => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="service-group">
                                <label>MO Type</label>
                                <select name="MOType" value={serviceProfile.MOType} onChange={handleServiceProfileChange}>
                                    {MO_TYPE_OPTIONS.map(opt => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="service-group">
                            <label>Path</label>
                            <input name="path" value={serviceProfile.path} onChange={handleServiceProfileChange} placeholder="Enter path" />
                        </div>
                        <div className="service-group">
                            <label>Additional Info</label>
                            <div className="service-row">
                                <input type="text" name="name" placeholder="Name" value={additionalInfoInput.name} onChange={handleAdditionalInfoInputChange} />
                                <input type="text" name="value" placeholder="Value" value={additionalInfoInput.value} onChange={handleAdditionalInfoInputChange} />
                                <button type="button" className="service-btn" onClick={handleAddAdditionalInfo}>Add</button>
                            </div>
                            {serviceProfile.additionalInfo.length > 0 && (
                                <div className="additional-info-list">
                                    {serviceProfile.additionalInfo.map((info, idx) => (
                                        <div key={idx} className="info-item">
                                            <span>{info.name}: {info.value}</span>
                                            <button type="button" className="service-btn small" onClick={() => handleRemoveAdditionalInfo(idx)}>Remove</button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="service-actions">
                            <button type="button" className="service-btn" onClick={handleAddServiceProfile}>Add</button>
                            <button type="button" className="service-btn danger" onClick={handleRemoveServiceProfile} disabled={selectedNodePath.length === 0}>Remove</button>
                        </div>
                    </div>
                    {/* Method 입력 영역 (ServiceProfile 선택 시만 활성화) */}
                    <div className="input-block" style={{ opacity: selectedNodePath.length > 0 ? 1 : 0.5, pointerEvents: selectedNodePath.length > 0 ? 'auto' : 'none' }}>
                        <div className="input-title">Method</div>
                        <div className="service-row">
                            <div className="service-group">
                                <label>Method Name</label>
                                <input name="methodName" value={serviceMethod.methodName} onChange={handleServiceMethodChange} placeholder="Enter method name" />
                            </div>
                            <div className="service-group">
                                <label>Description</label>
                                <input name="description" value={serviceMethod.description || ''} onChange={handleServiceMethodChange} placeholder="Enter description" />
                            </div>
                        </div>
                        <div className="service-row">
                            <div className="service-group">
                                <label>Return Type</label>
                                <input name="retType" value={serviceMethod.retType} onChange={handleServiceMethodChange} placeholder="Enter return type" />
                            </div>
                            <div className="service-group">
                                <label>MO Type</label>
                                <select name="MOType" value={serviceMethod.MOType} onChange={handleServiceMethodChange}>
                                    {MO_TYPE_OPTIONS.map(opt => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="service-row">
                            <div className="service-group">
                                <label>Req/Prov Type</label>
                                <select name="reqProvType" value={serviceMethod.reqProvType} onChange={handleServiceMethodChange}>
                                    {REQ_PROV_TYPE_OPTIONS.map(opt => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="service-group">
                            <label>Module ID (Optional)</label>
                            <div className="service-row">
                                <input 
                                    name="moduleID_mID" 
                                    value={serviceMethod.moduleID?.mID || ''} 
                                    onChange={(e) => {
                                        handleServiceMethodChange({
                                            target: {
                                                name: 'moduleID',
                                                value: {
                                                    ...(serviceMethod.moduleID || {}),
                                                    mID: e.target.value
                                                }
                                            }
                                        });
                                    }}
                                    placeholder="mID" 
                                />
                                <input 
                                    name="moduleID_iID" 
                                    value={serviceMethod.moduleID?.iID || ''} 
                                    onChange={(e) => {
                                        handleServiceMethodChange({
                                            target: {
                                                name: 'moduleID',
                                                value: {
                                                    ...(serviceMethod.moduleID || {}),
                                                    iID: e.target.value
                                                }
                                            }
                                        });
                                    }}
                                    placeholder="iID" 
                                />
                            </div>
                        </div>
                        <div className="service-actions">
                            <button type="button" className="service-btn" onClick={handleAddServiceMethod}>Add</button>
                            <button type="button" className="service-btn danger" onClick={handleRemoveServiceMethod} disabled={selectedNodePath.length < 2}>Remove</button>
                        </div>
                    </div>
                    {/* ArgSpec 입력 영역 (Method 또는 ArgSpec 선택 시 활성화) */}
                    <div className="input-block" style={{ opacity: selectedNodePath.length > 1 ? 1 : 0.5, pointerEvents: selectedNodePath.length > 1 ? 'auto' : 'none' }}>
                        <div className="input-title">ArgSpec</div>
                        <div className="service-row">
                            <div className="service-group">
                                <label>Argument Type</label>
                                <input type="text" name="argType" placeholder="Argument Type" value={argSpecInput.argType || ''} onChange={handleArgSpecInputChange} />
                            </div>
                            <div className="service-group">
                                <label>Value Name</label>
                                <input type="text" name="argName" placeholder="Value Name" value={argSpecInput.argName || ''} onChange={handleArgSpecInputChange} />
                            </div>
                        </div>
                        <div className="service-row">
                            <div className="service-group">
                                <label>In/Out Type</label>
                                <select name="argIO" value={argSpecInput.argIO || ''} onChange={handleArgSpecInputChange}>
                                    {IN_OUT_TYPE_OPTIONS.map(opt => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="service-actions">
                            <button type="button" className="service-btn" onClick={handleAddArgSpec}>Add</button>
                            <button type="button" className="service-btn danger" onClick={handleRemoveArgSpec} disabled={selectedNodePath.length < 3}>Remove</button>
                        </div>
                    </div>
                </div>
                {/* 우측 트리뷰 */}
                <div className="service-tree-area-compact" style={{ flex: '1 1 0', minWidth: 0, maxHeight: '70vh', overflowY: 'auto' }}>
                    {renderTree(tree)}
                </div>
            </div>
        </div>
    );
}

export default ServicesPage; 
