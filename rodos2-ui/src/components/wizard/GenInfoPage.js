import React from 'react';
import '../../styles/wizard/GenInfoPage.css';
import { CATEGORY_OPTIONS } from '../../utils/module/Category';
import { useGenInfoState } from '../../hooks/useGenInfoState';

function GenInfoPage({ genInfo, onChange, onModuleIdChange, wizardType }) {
    const {
        initGenInfo,
        selectedCategory1,
        selectedCategory2,
        moduleID,
        moduleIDString,
        category2Options,
        handleInputChange,
        handleToggleChange,
        handleCompositeTypeChange,
        handleCategory1Change,
        handleCategory2Change,
        handleHex2Input,
        handleHex4Input,
        handleSerialInput,
        handleInstanceIdInput,
        handleSegmentChange
    } = useGenInfoState(genInfo, onChange, onModuleIdChange, wizardType);

    return (
        <form className="form" onSubmit={e => e.preventDefault()}>
            <div className="form-row">
                <div className="input-group full-width">
                    <label htmlFor="moduleName">Module Name</label>
                    <input
                        type="text"
                        id="moduleName"
                        name="moduleName"
                        placeholder="Enter module name"
                        value={initGenInfo.moduleName || ''}
                        onChange={handleInputChange}
                    />
                </div>
            </div>
            <div className="form-row">
                <div className="input-group full-width">
                    <label htmlFor="manufacturer">Manufacturer</label>
                    <input
                        type="text"
                        id="manufacturer"
                        name="manufacturer"
                        placeholder="Enter manufactures"
                        value={initGenInfo.manufacturer || ''}
                        onChange={handleInputChange}
                    />
                </div>
            </div>
            <div className="form-row">
                <div className="input-group half-width">
                    <label htmlFor="description">Description</label>
                    <input
                        type="text"
                        id="description"
                        name="description"
                        value={initGenInfo.description || ''}
                        onChange={handleInputChange}
                    />
                </div>
                <div className="input-group half-width">
                    <label htmlFor="examples">Examples</label>
                    <input
                        type="text"
                        id="examples"
                        name="examples"
                        value={initGenInfo.examples || ''}
                        onChange={handleInputChange}
                    />
                </div>
            </div>
            <div className="form-row">
                <div className="input-group third-width">
                    <label>Vendor Specific PID (Hexa)</label>
                    <input type="text" name="vendorPid1" value={initGenInfo.vendorPid1 || ''} maxLength={2} onChange={handleHex2Input} />
                </div>
                <div className="input-group third-width">
                    <label style={{ visibility: 'hidden' }}>.</label>
                    <input type="text" name="vendorPid2" value={initGenInfo.vendorPid2 || ''} maxLength={2} onChange={handleHex2Input} />
                </div>
                <div className="input-group third-width">
                    <label style={{ visibility: 'hidden' }}>.</label>
                    <input type="text" name="vendorPid3" value={initGenInfo.vendorPid3 || ''} maxLength={2} onChange={handleHex2Input} />
                </div>
            </div>
            <div className="form-row">
                <div className="input-group half-width">
                    <label>Revision Number Major (Hexa, 4자리)</label>
                    <input type="text" name="revisionNumber1" value={initGenInfo.revisionNumber1 || ''} maxLength={4} onChange={handleHex4Input} />
                </div>
                <div className="input-group half-width">
                    <label>Revision Number Minor (Hexa, 4자리)</label>
                    <input type="text" name="revisionNumber2" value={initGenInfo.revisionNumber2 || ''} maxLength={4} onChange={handleHex4Input} />
                </div>
            </div>
            <div className="form-row">
                <div className="input-group half-width">
                    <label>Serial Number (Decimal)</label>
                    <input type="text" name="serialNumber" value={initGenInfo.serialNumber || ''} inputMode="numeric" onChange={handleSerialInput} />
                </div>
                <div className="input-group half-width">
                    <label>Instance ID (0~255)</label>
                    <input type="text" name="instanceId" value={initGenInfo.instanceId || ''} inputMode="numeric" onChange={handleInstanceIdInput} />
                </div>
            </div>
            <div className="form-row" style={{ alignItems: 'center' }}>
                <div className="input-group" style={{ flex: 1 }}>
                    <label>Composite Type</label>
                    <div className="segmented-button">
                        <button
                            type="button"
                            className={initGenInfo.idType === 'Bas' ? 'active' : ''}
                            onClick={() => handleCompositeTypeChange('basic')}
                            disabled={wizardType === 'controller' || wizardType === 'robot'}
                            style={{ 
                                opacity: (wizardType === 'controller' || wizardType === 'robot') ? 0.5 : 1,
                                cursor: (wizardType === 'controller' || wizardType === 'robot') ? 'not-allowed' : 'pointer'
                            }}
                        >
                            {initGenInfo.idType === 'Bas' && <span className="check-icon">✓</span>}
                            Basic
                        </button>
                        <button
                            type="button"
                            className={initGenInfo.idType === 'Comp' ? 'active' : ''}
                            onClick={() => handleCompositeTypeChange('composite')}
                            disabled={wizardType === 'controller' || wizardType === 'robot'}
                            style={{ 
                                opacity: (wizardType === 'controller' || wizardType === 'robot') ? 0.5 : 1,
                                cursor: (wizardType === 'controller' || wizardType === 'robot') ? 'not-allowed' : 'pointer'
                            }}
                        >
                            {initGenInfo.idType === 'Comp' && <span className="check-icon">✓</span>}
                            Composite
                        </button>
                    </div>
                </div>
                <div className="input-group" style={{ flex: 1, marginLeft: 32 }}>
                    <label>Safety / Security</label>
                    <div className="toggle-switch-group">
                        <label className="toggle-switch">
                            <div className="switch">
                                <input type="checkbox" name="safety" checked={!!initGenInfo.safety} onChange={() => handleToggleChange('safety')} />
                                <span className="slider"></span>
                            </div>
                            <span>Safety</span>
                        </label>
                        <label className="toggle-switch">
                            <div className="switch">
                                <input type="checkbox" name="security" checked={!!initGenInfo.security} onChange={() => handleToggleChange('security')} />
                                <span className="slider"></span>
                            </div>
                            <span>Security</span>
                        </label>
                    </div>
                </div>
            </div>
            <div className="form-row" style={{ alignItems: 'center', justifyContent: 'space-between', gap: '2vw' }}>
                <div className="input-group" style={{ flex: '0 0 auto' }}>
                    <label>White Box/Black Box</label>
                    <div className="segmented-button" style={{ minWidth: '156px' }}>
                        <button
                            type="button"
                            className={initGenInfo.boxType === 'white' ? 'active' : ''}
                            onClick={() => handleSegmentChange('boxType', 'white')}
                            style={{ minWidth: '78px' }}
                        >
                            {initGenInfo.boxType === 'white' && <span className="check-icon">✓</span>}
                            white
                        </button>
                        <button
                            type="button"
                            className={initGenInfo.boxType === 'black' ? 'active' : ''}
                            onClick={() => handleSegmentChange('boxType', 'black')}
                            style={{ minWidth: '78px' }}
                        >
                            {initGenInfo.boxType === 'black' && <span className="check-icon">✓</span>}
                            black
                        </button>
                    </div>
                </div>
                <div className="input-group" style={{ flex: '0 0 auto' }}>
                    <label>Simulation</label>
                    <div className="segmented-button" style={{ minWidth: '156px' }}>
                        <button
                            type="button"
                            className={initGenInfo.simulation === true ? 'active' : ''}
                            onClick={() => handleSegmentChange('simulation', true)}
                            style={{ minWidth: '78px' }}
                        >
                            {initGenInfo.simulation === true && <span className="check-icon">✓</span>}
                            true
                        </button>
                        <button
                            type="button"
                            className={initGenInfo.simulation === false ? 'active' : ''}
                            onClick={() => handleSegmentChange('simulation', false)}
                            style={{ minWidth: '78px' }}
                        >
                            {initGenInfo.simulation === false && <span className="check-icon">✓</span>}
                            false
                        </button>
                    </div>
                </div>
            </div>
            <div className="form-row">
                <div className="input-group half-width dropdown">
                    <label>Category (1st)</label>
                    <select value={selectedCategory1} onChange={handleCategory1Change}>
                        <option value="">Select First Level</option>
                        {CATEGORY_OPTIONS.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                </div>
                <div className="input-group half-width dropdown">
                    <label>Category (2nd)</label>
                    <select value={selectedCategory2} onChange={handleCategory2Change} disabled={!selectedCategory1}>
                        <option value="">Select Second Level</option>
                        {category2Options.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                </div>
            </div>
            <div style={{ marginTop: 16, fontFamily: 'monospace', color: moduleID ? '#1976d2' : '#EB5757', background: '#f5f7fa', padding: 8, borderRadius: 4 }}>
                <strong>Module ID Preview:</strong>
                <div>
                    {moduleIDString ? moduleIDString : 'Error: 필수 입력값을 모두 입력하세요.'}
                </div>
            </div>
        </form>
    );
}

export default GenInfoPage;