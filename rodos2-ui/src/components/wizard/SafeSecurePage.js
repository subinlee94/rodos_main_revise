import React, { useState, useEffect, useRef } from 'react';
import '../../styles/wizard/SafeSecurePage.css';
import { TreeNode } from '../../utils/tree/TreeNode';
import { addNodeAtPath, removeNodeAtPath, createTreeNode, getNodeAtPath, getParentPath } from '../../utils/tree/TreeUtils';
import { getSafeSecureNodeLabel, getSafeSecureNodeTooltip } from '../../utils/tree/TreeNodeLabelUtils';
import {
    PL_SIL_TYPE_OPTIONS,
    SAFETY_LEVEL_PL_OPTIONS,
    SAFETY_LEVEL_SIL_OPTIONS,
    PHY_SECURITY_LEVEL_OPTIONS,
    CYB_SECURITY_LEVEL_OPTIONS,
    SAFETY_TYPE_OPTIONS,
    SECURITY_TYPE_OPTIONS
} from '../../utils/Options';

function SafeSecurePage({ safeSecure = {}, onChange, isSafety = false, isSecurity = false }) {
    const [safeSecureState, setSafeSecureState] = useState({
        overallValidSafetyLevelType: '',
        overallSafetyLevelPL: '',
        overallSafetyLevelSIL: '',
        overallPhySecurityLevel: '',
        overallCybSecurityLevel: '',
        safetyFunction: [],
        inCybSecurityLevel: [],
        additionalInfo: []
    });
    const [selectedNodePath, setSelectedNodePath] = useState([]);
    const isInitialized = useRef(false);

    // Safety Function 입력
    const [safetyFunction, setSafetyFunction] = useState({
        safetyFunctionType: '',
        validSafetyLevelType: '',
        eachSafetyLevelPL: '',
        eachSafetyLevelSIL: ''
    });
    const [selectedSafetyIdx, setSelectedSafetyIdx] = useState(null);

    // Security 입력
    const [security, setSecurity] = useState({
        type: '',
        value: ''
    });
    const [selectedSecurityIdx, setSelectedSecurityIdx] = useState(null);

    // 입력폼 활성/비활성 제어
    const [enableSafetyPL, setEnableSafetyPL] = useState(true);
    const [enableSafetySIL, setEnableSafetySIL] = useState(false);
    const [enableSafetyBoth, setEnableSafetyBoth] = useState(false);
    const [enableSafetyDetail, setEnableSafetyDetail] = useState(true);
    const [enableSecurityDetail, setEnableSecurityDetail] = useState(false);

    // props로 받은 safeSecure가 바뀔 때만 동기화 (초기 로드 시에만)
    useEffect(() => {
        if (!isInitialized.current) {
            const mergedSafeSecure = {
                overallValidSafetyLevelType: '',
                overallSafetyLevelPL: '',
                overallSafetyLevelSIL: '',
                overallPhySecurityLevel: '',
                overallCybSecurityLevel: '',
                safetyFunction: [],
                inCybSecurityLevel: [],
                additionalInfo: [],
                ...safeSecure
            };
            setSafeSecureState(mergedSafeSecure);
            isInitialized.current = true;
        }
    }, [safeSecure]);

    // 트리 상태가 변경될 때마다 부모 컴포넌트에 동기화
    useEffect(() => {
        if (isInitialized.current) {
            onChange(safeSecureState);
        }
    }, [safeSecureState, onChange]);

    // Safety Overall 입력 변경
    const handleOverallChange = (e) => {
        const { name, value } = e.target;
        setSafeSecureState(s => ({ ...s, [name]: value }));
    };

    // Safety Function 입력 변경
    const handleSafetyFunctionChange = (e) => {
        const { name, value } = e.target;
        setSafetyFunction(prev => ({ ...prev, [name]: value }));
    };

    // Security 입력 변경
    const handleSecurityChange = (e) => {
        const { name, value } = e.target;
        setSecurity(prev => ({ ...prev, [name]: value }));
    };

    // Safety Overall Type에 따라 하위 입력 활성/비활성
    useEffect(() => {
        const type = safeSecureState.overallValidSafetyLevelType;
        if (type === 'PL') {
            setEnableSafetyPL(true); setEnableSafetySIL(false); setEnableSafetyBoth(false); setEnableSafetyDetail(true);
        } else if (type === 'SIL') {
            setEnableSafetyPL(false); setEnableSafetySIL(true); setEnableSafetyBoth(false); setEnableSafetyDetail(true);
        } else if (type === 'BOTH') {
            setEnableSafetyPL(true); setEnableSafetySIL(true); setEnableSafetyBoth(true); setEnableSafetyDetail(true);
        } else {
            setEnableSafetyPL(false); setEnableSafetySIL(false); setEnableSafetyBoth(false); setEnableSafetyDetail(false);
        }
    }, [safeSecureState.overallValidSafetyLevelType]);

    // Cyber Level에 따라 Security 입력 활성/비활성
    useEffect(() => {
        setEnableSecurityDetail(safeSecureState.overallCybSecurityLevel && safeSecureState.overallCybSecurityLevel !== '_0');
    }, [safeSecureState.overallCybSecurityLevel]);

    // SafetyFunction 테이블 선택 시 입력폼에 값 반영
    const handleSelectSafety = (idx) => {
        setSelectedSafetyIdx(idx);
        const node = safeSecureState.safetyFunction[idx];
        if (node) {
            const data = node instanceof TreeNode ? node.getValue() : node;
            setSafetyFunction({
                safetyFunctionType: data.safetyFunctionType || '',
                validSafetyLevelType: data.validSafetyLevelType || '',
                eachSafetyLevelPL: data.eachSafetyLevelPL || '',
                eachSafetyLevelSIL: data.eachSafetyLevelSIL || ''
            });
        }
    };

    // Security 테이블 선택 시 입력폼에 값 반영
    const handleSelectSecurity = (idx) => {
        setSelectedSecurityIdx(idx);
        const node = safeSecureState.inCybSecurityLevel[idx];
        if (node) {
            const data = node instanceof TreeNode ? node.getValue() : node;
            setSecurity({
                type: data.type || '',
                value: data.value || ''
            });
        }
    };

    // SafetyFunction 추가
    const handleAddSafetyFunction = () => {
        if (!safetyFunction.safetyFunctionType || !safetyFunction.validSafetyLevelType) return;
        const newNode = createTreeNode({ ...safetyFunction });
        setSafeSecureState(s => ({
            ...s,
            safetyFunction: [...(s.safetyFunction || []), newNode]
        }));
        setSafetyFunction({ safetyFunctionType: '', validSafetyLevelType: '', eachSafetyLevelPL: '', eachSafetyLevelSIL: '' });
        setSelectedSafetyIdx(null);
    };

    // SafetyFunction 삭제
    const handleRemoveSafetyFunction = () => {
        if (selectedSafetyIdx == null) return;
        setSafeSecureState(s => ({
            ...s,
            safetyFunction: s.safetyFunction.filter((_, i) => i !== selectedSafetyIdx)
        }));
        setSafetyFunction({ safetyFunctionType: '', validSafetyLevelType: '', eachSafetyLevelPL: '', eachSafetyLevelSIL: '' });
        setSelectedSafetyIdx(null);
    };

    // Security 추가
    const handleAddSecurity = () => {
        if (!security.type || !security.value) return;
        const newNode = createTreeNode({ ...security });
        setSafeSecureState(s => ({
            ...s,
            inCybSecurityLevel: [...(s.inCybSecurityLevel || []), newNode]
        }));
        setSecurity({ type: '', value: '' });
        setSelectedSecurityIdx(null);
    };

    // Security 삭제
    const handleRemoveSecurity = () => {
        if (selectedSecurityIdx == null) return;
        setSafeSecureState(s => ({
            ...s,
            inCybSecurityLevel: s.inCybSecurityLevel.filter((_, i) => i !== selectedSecurityIdx)
        }));
        setSecurity({ type: '', value: '' });
        setSelectedSecurityIdx(null);
    };

    // isSafety, isSecurity가 false인 경우 비활성화된 상태 표시
    if (!isSafety && !isSecurity) {
        return (
            <div className="safesecure-page">
                <div className="safesecure-disabled">
                    <p>Safety & Security 기능이 비활성화되어 있습니다.</p>
                    <p>GenInfo 페이지에서 Safety 또는 Security를 활성화해주세요.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="safesecure-page">
            <div className="safesecure-content">
                {/* Safety 영역 */}
                {isSafety && (
                    <div className="safesecure-section">
                        <div className="safesecure-section-title">Safety</div>

                        <div className="safesecure-group">
                            <label>PL/SIL Type</label>
                            <select name="overallValidSafetyLevelType" value={safeSecureState.overallValidSafetyLevelType} onChange={handleOverallChange}>
                                {PL_SIL_TYPE_OPTIONS.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </div>

                        <div className="safesecure-row">
                            <div className="safesecure-group">
                                <label>PL Level</label>
                                <select name="overallSafetyLevelPL" value={safeSecureState.overallSafetyLevelPL} onChange={handleOverallChange} disabled={!enableSafetyPL && !enableSafetyBoth}>
                                    {SAFETY_LEVEL_PL_OPTIONS.map(opt => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="safesecure-group">
                                <label>SIL Level</label>
                                <select name="overallSafetyLevelSIL" value={safeSecureState.overallSafetyLevelSIL} onChange={handleOverallChange} disabled={!enableSafetySIL && !enableSafetyBoth}>
                                    {SAFETY_LEVEL_SIL_OPTIONS.map(opt => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="safesecure-subsection">
                            <div className="safesecure-subsection-title">Safety Functions</div>

                            <div className="safesecure-row">
                                <div className="safesecure-group">
                                    <label>Function Type</label>
                                    <select name="safetyFunctionType" value={safetyFunction.safetyFunctionType} onChange={handleSafetyFunctionChange} disabled={!enableSafetyDetail}>
                                        {SAFETY_TYPE_OPTIONS.map(opt => (
                                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="safesecure-group">
                                    <label>PL/SIL Type</label>
                                    <select name="validSafetyLevelType" value={safetyFunction.validSafetyLevelType} onChange={handleSafetyFunctionChange} disabled={!enableSafetyDetail}>
                                        {PL_SIL_TYPE_OPTIONS.map(opt => (
                                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="safesecure-row">
                                <div className="safesecure-group">
                                    <label>PL Level</label>
                                    <select name="eachSafetyLevelPL" value={safetyFunction.eachSafetyLevelPL} onChange={handleSafetyFunctionChange} disabled={!(safetyFunction.validSafetyLevelType === 'PL' || safetyFunction.validSafetyLevelType === 'BOTH')}>
                                        {SAFETY_LEVEL_PL_OPTIONS.map(opt => (
                                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="safesecure-group">
                                    <label>SIL Level</label>
                                    <select name="eachSafetyLevelSIL" value={safetyFunction.eachSafetyLevelSIL} onChange={handleSafetyFunctionChange} disabled={!(safetyFunction.validSafetyLevelType === 'SIL' || safetyFunction.validSafetyLevelType === 'BOTH')}>
                                        {SAFETY_LEVEL_SIL_OPTIONS.map(opt => (
                                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="safesecure-actions">
                                <button type="button" className="safesecure-btn" onClick={handleAddSafetyFunction} disabled={!enableSafetyDetail}>Add</button>
                                <button type="button" className="safesecure-btn danger" onClick={handleRemoveSafetyFunction} disabled={selectedSafetyIdx == null}>Delete</button>
                            </div>

                            <div className="safesecure-table-container">
                                <table className="safesecure-table">
                                    <thead>
                                        <tr>
                                            <th>Type</th>
                                            <th>PL/SIL Type</th>
                                            <th>PL</th>
                                            <th>SIL</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(safeSecureState.safetyFunction || []).map((node, idx) => {
                                            const data = node instanceof TreeNode ? node.getValue() : node;
                                            return (
                                                <tr key={idx} className={selectedSafetyIdx === idx ? 'selected' : ''} onClick={() => handleSelectSafety(idx)}>
                                                    <td>{data.safetyFunctionType}</td>
                                                    <td>{data.validSafetyLevelType}</td>
                                                    <td>{data.eachSafetyLevelPL}</td>
                                                    <td>{data.eachSafetyLevelSIL}</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* Security 영역 */}
                {isSecurity && (
                    <div className="safesecure-section">
                        <div className="safesecure-section-title">Security</div>

                        <div className="safesecure-row">
                            <div className="safesecure-group">
                                <label>Physical Level</label>
                                <select name="overallPhySecurityLevel" value={safeSecureState.overallPhySecurityLevel} onChange={handleOverallChange}>
                                    {PHY_SECURITY_LEVEL_OPTIONS.map(opt => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="safesecure-group">
                                <label>Cyber Level</label>
                                <select name="overallCybSecurityLevel" value={safeSecureState.overallCybSecurityLevel} onChange={handleOverallChange}>
                                    {CYB_SECURITY_LEVEL_OPTIONS.map(opt => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="safesecure-subsection">
                            <div className="safesecure-subsection-title">Cyber Security</div>

                            <div className="safesecure-row">
                                <div className="safesecure-group">
                                    <label>Type</label>
                                    <select name="type" value={security.type} onChange={handleSecurityChange} disabled={!enableSecurityDetail}>
                                        {SECURITY_TYPE_OPTIONS.map(opt => (
                                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="safesecure-group">
                                    <label>Level</label>
                                    <select name="value" value={security.value} onChange={handleSecurityChange} disabled={!enableSecurityDetail}>
                                        {CYB_SECURITY_LEVEL_OPTIONS.map(opt => (
                                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="safesecure-actions">
                                <button type="button" className="safesecure-btn" onClick={handleAddSecurity} disabled={!enableSecurityDetail}>Add</button>
                                <button type="button" className="safesecure-btn danger" onClick={handleRemoveSecurity} disabled={selectedSecurityIdx == null}>Delete</button>
                            </div>

                            <div className="safesecure-table-container">
                                <table className="safesecure-table">
                                    <thead>
                                        <tr>
                                            <th>Type</th>
                                            <th>Level</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(safeSecureState.inCybSecurityLevel || []).map((node, idx) => {
                                            const data = node instanceof TreeNode ? node.getValue() : node;
                                            return (
                                                <tr key={idx} className={selectedSecurityIdx === idx ? 'selected' : ''} onClick={() => handleSelectSecurity(idx)}>
                                                    <td>{data.type}</td>
                                                    <td>{data.value}</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default SafeSecurePage; 