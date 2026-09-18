import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useModellingState } from '../../hooks/useModellingState';
import '../../styles/wizard/ModellingPage.css';

function ModellingPage({ modelling, onChange }) {
    const {
        modelCases,
        addModelCase,
        removeModelCase,
        addModelFile,
        removeModelFile,
        addDynamicSW,
        removeDynamicSW,
        addAdditionalInfo,
        removeAdditionalInfo,
        loadModelling
    } = useModellingState();

    // 이전 modelling 값을 추적하기 위한 ref
    const prevModellingRef = useRef();
    const isInitialLoad = useRef(true);

    // modelling prop이 변경될 때 로드 (초기 로드가 아닐 때만)
    useEffect(() => {
        if (modelling && (isInitialLoad.current || JSON.stringify(modelling) !== JSON.stringify(prevModellingRef.current))) {
            loadModelling(modelling);
            prevModellingRef.current = modelling;
            isInitialLoad.current = false;
        }
    }, [modelling, loadModelling]);

    // modelCases가 변경될 때 onChange 호출 (debounce 적용)
    useEffect(() => {
        if (!isInitialLoad.current && onChange) {
            const timeoutId = setTimeout(() => {
                const updatedModelling = {
                    list_simulationModel: modelCases
                };
                onChange(updatedModelling);
            }, 100); // 100ms debounce

            return () => clearTimeout(timeoutId);
        }
    }, [modelCases, onChange]);

    const [selectedModelCase, setSelectedModelCase] = useState(null);
    const [newModelCase, setNewModelCase] = useState({
        simulator: '',
        modelFiles: [],
        dynamicSWs: [],
        additionalInfo: []
    });

    const [newModelFile, setNewModelFile] = useState({
        type: '',
        fileName: '',
        filePath: ''
    });

    const [newDynamicSW, setNewDynamicSW] = useState({
        name: '',
        type: '',
        parameters: []
    });

    const [newAdditionalInfo, setNewAdditionalInfo] = useState({
        name: '',
        value: ''
    });

    const [showAddModelFile, setShowAddModelFile] = useState(false);
    const [showAddDynamicSW, setShowAddDynamicSW] = useState(false);
    const [showAddAdditionalInfo, setShowAddAdditionalInfo] = useState(false);

    const handleAddModelCase = () => {
        if (newModelCase.simulator.trim()) {
            addModelCase(newModelCase);
            setNewModelCase({
                simulator: '',
                modelFiles: [],
                dynamicSWs: [],
                additionalInfo: []
            });
        }
    };

    const handleAddModelFile = () => {
        if (newModelFile.type.trim() && newModelFile.fileName.trim()) {
            addModelFile(selectedModelCase, newModelFile);
            setNewModelFile({ type: '', fileName: '', filePath: '' });
            setShowAddModelFile(false);
        }
    };

    const handleAddDynamicSW = () => {
        if (newDynamicSW.name.trim() && newDynamicSW.type.trim()) {
            addDynamicSW(selectedModelCase, newDynamicSW);
            setNewDynamicSW({ name: '', type: '', parameters: [] });
            setShowAddDynamicSW(false);
        }
    };

    const handleAddAdditionalInfo = () => {
        if (newAdditionalInfo.name.trim() && newAdditionalInfo.value.trim()) {
            addAdditionalInfo(selectedModelCase, newAdditionalInfo);
            setNewAdditionalInfo({ name: '', value: '' });
            setShowAddAdditionalInfo(false);
        }
    };


    return (
        <div className="modelling-page">
            <div className="modelling-content">
                {/* Model Cases Section */}
                <div className="section">
                    <div className="section-header">
                        <h3>Model Cases</h3>
                        <button
                            className="add-button"
                            onClick={handleAddModelCase}
                        >
                            Add Model Case
                        </button>
                    </div>

                    <div className="model-case-form">
                        <div className="form-group">
                            <label>Simulator</label>
                            <input
                                type="text"
                                value={newModelCase.simulator}
                                onChange={(e) => setNewModelCase({
                                    ...newModelCase,
                                    simulator: e.target.value
                                })}
                                placeholder="Enter simulator name"
                            />
                        </div>
                    </div>

                    <div className="model-cases-list">
                        {modelCases.map((modelCase, index) => (
                            <div
                                key={index}
                                className={`model-case-item ${selectedModelCase === index ? 'selected' : ''}`}
                                onClick={() => setSelectedModelCase(index)}
                            >
                                <div className="model-case-header">
                                    <span className="simulator-name">{modelCase.simulator}</span>
                                    <div className="model-case-actions">
                                        <button
                                            className="edit-button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                // Edit functionality
                                            }}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            className="remove-button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                removeModelCase(index);
                                                if (selectedModelCase === index) {
                                                    setSelectedModelCase(null);
                                                }
                                            }}
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </div>
                                <div className="model-case-details">
                                    <span>Model Files: {modelCase.modelFiles?.length || 0}</span>
                                    <span>Dynamic SWs: {modelCase.dynamicSWs?.length || 0}</span>
                                    <span>Additional Info: {modelCase.additionalInfo?.length || 0}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Selected Model Case Details */}
                {selectedModelCase !== null && (
                    <div className="section">
                        <div className="section-header">
                            <h3>Model Case Details: {modelCases[selectedModelCase]?.simulator}</h3>
                        </div>

                        {/* Model Files */}
                        <div className="subsection">
                            <div className="subsection-header">
                                <h4>Model Files</h4>
                                <button
                                    className="add-button small"
                                    onClick={() => setShowAddModelFile(!showAddModelFile)}
                                >
                                    {showAddModelFile ? 'Cancel' : 'Add Model File'}
                                </button>
                            </div>

                            {showAddModelFile && (
                                <div className="add-form">
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Type</label>
                                            <input
                                                type="text"
                                                value={newModelFile.type}
                                                onChange={(e) => setNewModelFile({
                                                    ...newModelFile,
                                                    type: e.target.value
                                                })}
                                                placeholder="File type"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>File Name</label>
                                            <input
                                                type="text"
                                                value={newModelFile.fileName}
                                                onChange={(e) => setNewModelFile({
                                                    ...newModelFile,
                                                    fileName: e.target.value
                                                })}
                                                placeholder="File name"
                                            />
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label>File Path</label>
                                        <input
                                            type="text"
                                            value={newModelFile.filePath}
                                            onChange={(e) => setNewModelFile({
                                                ...newModelFile,
                                                filePath: e.target.value
                                            })}
                                            placeholder="File path"
                                        />
                                    </div>
                                    <div className="form-actions">
                                        <button
                                            className="add-button"
                                            onClick={handleAddModelFile}
                                        >
                                            Add
                                        </button>
                                        <button
                                            className="cancel-button"
                                            onClick={() => setShowAddModelFile(false)}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            )}

                            <div className="items-list">
                                {modelCases[selectedModelCase]?.modelFiles?.map((file, index) => (
                                    <div key={index} className="item">
                                        <div className="item-content">
                                            <span className="item-name">{file.fileName}</span>
                                            <span className="item-type">{file.type}</span>
                                            <span className="item-path">{file.filePath}</span>
                                        </div>
                                        <button
                                            className="remove-button small"
                                            onClick={() => removeModelFile(selectedModelCase, index)}
                                        >
                                            Remove
                                        </button>
                                    </div>
                                )) || <div className="empty-state">No model files added</div>}
                            </div>
                        </div>

                        {/* Dynamic SWs */}
                        <div className="subsection">
                            <div className="subsection-header">
                                <h4>Dynamic Software Components</h4>
                                <button
                                    className="add-button small"
                                    onClick={() => setShowAddDynamicSW(!showAddDynamicSW)}
                                >
                                    {showAddDynamicSW ? 'Cancel' : 'Add Dynamic SW'}
                                </button>
                            </div>

                            {showAddDynamicSW && (
                                <div className="add-form">
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Name</label>
                                            <input
                                                type="text"
                                                value={newDynamicSW.name}
                                                onChange={(e) => setNewDynamicSW({
                                                    ...newDynamicSW,
                                                    name: e.target.value
                                                })}
                                                placeholder="Component name"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Type</label>
                                            <input
                                                type="text"
                                                value={newDynamicSW.type}
                                                onChange={(e) => setNewDynamicSW({
                                                    ...newDynamicSW,
                                                    type: e.target.value
                                                })}
                                                placeholder="Component type"
                                            />
                                        </div>
                                    </div>
                                    <div className="form-actions">
                                        <button
                                            className="add-button"
                                            onClick={handleAddDynamicSW}
                                        >
                                            Add
                                        </button>
                                        <button
                                            className="cancel-button"
                                            onClick={() => setShowAddDynamicSW(false)}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            )}

                            <div className="items-list">
                                {modelCases[selectedModelCase]?.dynamicSWs?.map((sw, index) => (
                                    <div key={index} className="item">
                                        <div className="item-content">
                                            <span className="item-name">{sw.name}</span>
                                            <span className="item-type">{sw.type}</span>
                                        </div>
                                        <button
                                            className="remove-button small"
                                            onClick={() => removeDynamicSW(selectedModelCase, index)}
                                        >
                                            Remove
                                        </button>
                                    </div>
                                )) || <div className="empty-state">No dynamic SW components added</div>}
                            </div>
                        </div>

                        {/* Additional Info */}
                        <div className="subsection">
                            <div className="subsection-header">
                                <h4>Additional Information</h4>
                                <button
                                    className="add-button small"
                                    onClick={() => setShowAddAdditionalInfo(!showAddAdditionalInfo)}
                                >
                                    {showAddAdditionalInfo ? 'Cancel' : 'Add Info'}
                                </button>
                            </div>

                            {showAddAdditionalInfo && (
                                <div className="add-form">
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Name</label>
                                            <input
                                                type="text"
                                                value={newAdditionalInfo.name}
                                                onChange={(e) => setNewAdditionalInfo({
                                                    ...newAdditionalInfo,
                                                    name: e.target.value
                                                })}
                                                placeholder="Info name"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Value</label>
                                            <input
                                                type="text"
                                                value={newAdditionalInfo.value}
                                                onChange={(e) => setNewAdditionalInfo({
                                                    ...newAdditionalInfo,
                                                    value: e.target.value
                                                })}
                                                placeholder="Info value"
                                            />
                                        </div>
                                    </div>
                                    <div className="form-actions">
                                        <button
                                            className="add-button"
                                            onClick={handleAddAdditionalInfo}
                                        >
                                            Add
                                        </button>
                                        <button
                                            className="cancel-button"
                                            onClick={() => setShowAddAdditionalInfo(false)}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            )}

                            <div className="items-list">
                                {modelCases[selectedModelCase]?.additionalInfo?.map((info, index) => (
                                    <div key={index} className="item">
                                        <div className="item-content">
                                            <span className="item-name">{info.name}</span>
                                            <span className="item-value">{info.value}</span>
                                        </div>
                                        <button
                                            className="remove-button small"
                                            onClick={() => removeAdditionalInfo(selectedModelCase, index)}
                                        >
                                            Remove
                                        </button>
                                    </div>
                                )) || <div className="empty-state">No additional information added</div>}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ModellingPage;
