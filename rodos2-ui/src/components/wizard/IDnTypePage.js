import React, { useMemo, useState } from 'react';
import '../../styles/wizard/IDnTypePage.css';
import { useIDnTypeState } from '../../hooks/useIDnTypeState';
import { AvailableModulesGrid } from './AvailableModulesGrid';

const CATEGORY_BY_UPPER4 = {
    '0000': 'Planning',
    '0001': 'Communication',
    '0010': 'Interaction',
    '0011': 'GeneralComputing',
    '0100': 'Orchestration',
    '0101': 'Sensing',
    '0110': 'Actuation'
};

const CATEGORY_ORDER = [
    'Planning',
    'Communication',
    'Interaction',
    'GeneralComputing',
    'Orchestration',
    'Sensing',
    'Actuation',
    'Other',
    'Unknown'
];

function extractMID(moduleID) {
    if (!moduleID || typeof moduleID !== 'string') return '';
    const parts = moduleID.split('-');
    if (parts.length >= 2) return parts.slice(0, -1).join('-');
    return moduleID;
}

function getCategoryByMID(moduleID) {
    try {
        const mID = extractMID(moduleID).replace(/[^0-9A-Fa-f]/g, '');
        if (!mID) return 'Unknown';

        // mID(hex) -> binary 문자열 변환
        const binary = mID
            .toUpperCase()
            .split('')
            .map(ch => parseInt(ch, 16).toString(2).padStart(4, '0'))
            .join('');

        // 요구사항:
        // 1) 뒤 12비트(reserved) 무시
        // 2) 그 앞 10비트 추출
        // 3) 해당 10비트의 상위 4비트로 분류
        const withoutReserved = binary.slice(0, -12);
        const target10 = withoutReserved.slice(-10).padStart(10, '0');
        const upper4 = target10.slice(0, 4);
        return CATEGORY_BY_UPPER4[upper4] || 'Other';
    } catch (error) {
        return 'Unknown';
    }
}

function IDnTypePage({ idnType, onChange, genInfo, moduleID, moduleIDString, swAspects, hwAspects, wizardType = 'software' }) {
    const {
        initIdnType,
        initGenInfo,
        handleInputChange,
        swModules,
        selectedSWModules,
        loading,
        handleSWModuleToggle,
        hwModules,
        selectedHWModules,
        hwLoading,
        handleHWModuleToggle
    } = useIDnTypeState(idnType, onChange, genInfo, moduleID, moduleIDString);
    const isCompParentWizard = wizardType === 'controller' || wizardType === 'robot';
    const showSwAspectsSection = initGenInfo.idType === 'Comp' && (
        wizardType === 'software' || wizardType === 'controller' || wizardType === 'composite' || wizardType === 'robot'
    );
    const showHwAspectsSection = initGenInfo.idType === 'Comp' && (wizardType === 'robot' || wizardType === 'composite');
    const [openCategories, setOpenCategories] = useState({});

    const groupedSWModules = useMemo(() => {
        const grouped = {};
        swModules.forEach(module => {
            const category = getCategoryByMID(module.moduleID);
            if (!grouped[category]) grouped[category] = [];
            grouped[category].push(module);
        });
        return CATEGORY_ORDER.reduce((acc, category) => {
            acc[category] = grouped[category] || [];
            return acc;
        }, {});
    }, [swModules]);

    // A Robot composite selects its constituent controller instances here.
    // Other composite types retain the broader HW module list.
    const availableHWModules = useMemo(() => (
        wizardType === 'robot'
            ? hwModules.filter(module => module.moduleType === 'controller' || module.type === 'controller')
            : hwModules
    ), [hwModules, wizardType]);

    const toggleCategory = (category) => {
        setOpenCategories(prev => ({ ...prev, [category]: !prev[category] }));
    };

    return (
        <div className="idntype-page">
            <form className="form" onSubmit={e => e.preventDefault()}>
                <div className="form-row">
                    <div className="input-group full-width">
                        <label htmlFor="moduleName">Module Name</label>
                        <input
                            id="moduleName"
                            type="text"
                            value={initGenInfo.moduleName || ''}
                            disabled
                        />
                    </div>
                </div>
                <div className="form-row">
                    <div className="input-group full-width">
                        <label htmlFor="idType">ID Type</label>
                        <input
                            id="idType"
                            type="text"
                            value={initGenInfo.idType || initIdnType.idtype || ''}
                            disabled
                        />
                    </div>
                </div>
                <div className="form-row">
                    <div className="input-group full-width">
                        <label htmlFor="moduleId">Module ID</label>
                        <input
                            id="moduleId"
                            type="text"
                            value={moduleIDString || ''}
                            disabled
                        />
                    </div>
                </div>
                <div className="form-row">
                    <div className="input-group full-width">
                        <label htmlFor="manufacturer">Manufacturer</label>
                        <input
                            id="manufacturer"
                            type="text"
                            value={initGenInfo.manufacturer || ''}
                            disabled
                        />
                    </div>
                </div>
                <div className="form-row">
                    <div className="input-group full-width">
                        <label htmlFor="infoModelVersion">InfoModelVersion</label>
                        <input
                            id="infoModelVersion"
                            name="informationModelVersion"
                            type="text"
                            value={initIdnType.informationModelVersion || '1.0'}
                            onChange={handleInputChange}
                            placeholder="Enter info model version"
                        />
                    </div>
                </div>

                {/* SWAspects — Comp + Robot/Controller(카테고리 그리드) / Software / Composite */}
                {showSwAspectsSection && (
                    <div className="sw-aspects-section">
                        <h3>Software Modules</h3>
                        <p className="section-hint">
                            Properties / IOVariables / Services 계승에 사용할 <strong>Software</strong>를 선택합니다.
                            WorkSpace(Module Info) XML과 캔버스에 연결된 SW도 표시됩니다.
                        </p>

                        {/* 사전 설정된 SW Modules 표시 */}
                        {swAspects && swAspects.length > 0 && (
                            <div className="pre-configured-modules">
                                <h4>Pre-configured ({swAspects.length})</h4>
                                <div className="modules-list">
                                    {swAspects.map((module, index) => (
                                        <div key={index} className="module-item pre-configured">
                                            <span className="module-info">
                                                <span className="module-name">{module.name}</span>
                                                <span className="module-id">{module.moduleID}</span>
                                            </span>
                                            <span className="pre-configured-badge">Pre-configured</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="sw-management-container">
                            {/* 선택된 모듈 목록 */}
                            <div className="selected-modules">
                                <h4>Selected ({selectedSWModules.length})</h4>
                                {selectedSWModules.length === 0 ? (
                                    <p className="no-modules">No modules selected</p>
                                ) : (
                                    <div className="modules-list">
                                        {selectedSWModules.map((module) => (
                                            <div key={module.moduleID} className="module-item">
                                                <span className="module-info">
                                                    <span className="module-name">{module.moduleName}</span>
                                                    <span className="module-id">{module.moduleID}</span>
                                                </span>
                                                <button
                                                    type="button"
                                                    className="remove-btn"
                                                    onClick={() => handleSWModuleToggle(module)}
                                                    title="모듈 제거"
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* 사용 가능한 모듈 목록 */}
                            <div className="available-modules">
                                <h4>Available Modules</h4>
                                {loading ? (
                                    <div className="loading">Loading modules...</div>
                                ) : isCompParentWizard ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                        {Object.entries(groupedSWModules).map(([category, modules]) => {
                                            const isOpen = !!openCategories[category];
                                            return (
                                                <div key={category} style={{ border: '1px solid #e1e5e9', borderRadius: 6, overflow: 'hidden' }}>
                                                    <button
                                                        type="button"
                                                        onClick={() => toggleCategory(category)}
                                                        style={{
                                                            width: '100%',
                                                            textAlign: 'left',
                                                            padding: '10px 12px',
                                                            border: 'none',
                                                            background: '#f8f9fa',
                                                            cursor: 'pointer',
                                                            fontWeight: 600
                                                        }}
                                                    >
                                                        {isOpen ? '▼' : '▶'} {category} ({modules.length})
                                                    </button>
                                                    {isOpen && (
                                                        modules.length === 0 ? (
                                                            <div style={{ padding: '10px 12px', color: '#666' }}>
                                                                No modules in this category
                                                            </div>
                                                        ) : (
                                                            <AvailableModulesGrid
                                                                modules={modules}
                                                                isSelected={(m) => selectedSWModules.some(x => x.moduleID === m.moduleID)}
                                                                onToggle={handleSWModuleToggle}
                                                            />
                                                        )
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <AvailableModulesGrid
                                        modules={swModules}
                                        isSelected={(m) => selectedSWModules.some(x => x.moduleID === m.moduleID)}
                                        onToggle={handleSWModuleToggle}
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* HWAspects — Robot / Composite */}
                {showHwAspectsSection && (
                    <div className="hw-aspects-section">
                        <h3>{wizardType === 'robot' ? 'Linked Controllers' : 'Hardware Modules'}</h3>
                        <p className="section-hint">
                            Robot에 연결할 <strong>Edge / Controller / Robot(HW)</strong> 참조입니다.
                            Controller만 선택한 경우, 해당 Controller의 <strong>swAspects</strong>에 등록된 SW가 다음 단계에서 불러와집니다.
                        </p>

                        {/* 사전 설정된 HW Module 표시 */}
                        {hwAspects && hwAspects.length > 0 && (
                            <div className="pre-configured-modules">
                                <h4>Pre-configured ({hwAspects.length})</h4>
                                <div className="modules-list">
                                    {hwAspects.map((module, index) => (
                                        <div key={index} className="module-item pre-configured">
                                            <span className="module-info">
                                                <span className="module-name">{module.name}</span>
                                                <span className="module-type">{module.moduleType}</span>
                                                {module.classifier && (
                                                    <span className="module-classifier">({module.classifier})</span>
                                                )}
                                            </span>
                                            <span className="pre-configured-badge">Pre-configured</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="sw-management-container">
                            {/* 선택된 HW 모듈 목록 */}
                            <div className="selected-modules">
                                <h4>Selected ({selectedHWModules.length})</h4>
                                {wizardType === 'robot' && selectedHWModules.length > 1 && (
                                    <p className="section-hint">
                                        Properties, IOVariables and Services can be selected per controller in the next steps.
                                    </p>
                                )}
                                {selectedHWModules.length === 0 ? (
                                    <p className="no-modules">No modules selected</p>
                                ) : (
                                    <div className="modules-list">
                                        {selectedHWModules.map((module) => (
                                            <div key={module.moduleID} className="module-item">
                                                <span className="module-info">
                                                    <span className="module-name">{module.moduleName}</span>
                                                    <span className="module-id">{module.moduleID}</span>
                                                </span>
                                                <button
                                                    type="button"
                                                    className="remove-btn"
                                                    onClick={() => handleHWModuleToggle(module)}
                                                    title="Remove module"
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* 사용 가능한 HW 모듈 목록 */}
                            <div className="available-modules">
                                <h4>Available Modules</h4>
                                {hwLoading ? (
                                    <div className="loading">Loading modules...</div>
                                ) : (
                                    <AvailableModulesGrid
                                        modules={availableHWModules}
                                        isSelected={(m) => selectedHWModules.some(x => x.moduleID === m.moduleID)}
                                        onToggle={handleHWModuleToggle}
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </form>
        </div>
    );
}

export default IDnTypePage;
