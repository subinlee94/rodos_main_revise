import React from 'react';
import '../../styles/wizard/IDnTypePage.css';
import { AvailableModulesGrid } from './AvailableModulesGrid';

function SWModuleSelector({
    title = 'Software Modules',
    selectedModules = [],
    availableModules = [],
    loading = false,
    onToggleModule
}) {
    return (
        <div className="sw-aspects-section">
            <h3>{title}</h3>
            <div className="sw-management-container">
                <div className="selected-modules">
                    <h4>Selected ({selectedModules.length})</h4>
                    {selectedModules.length === 0 ? (
                        <p className="no-modules">No modules selected</p>
                    ) : (
                        <div className="modules-list">
                            {selectedModules.map((module) => (
                                <div key={module.moduleID} className="module-item">
                                    <span className="module-info">
                                        <span className="module-name">{module.moduleName}</span>
                                        <span className="module-id">{module.moduleID}</span>
                                    </span>
                                    <button
                                        type="button"
                                        className="remove-btn"
                                        onClick={() => onToggleModule(module)}
                                        title="Remove module"
                                    >
                                        ✕
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="available-modules">
                    <h4>Available Modules</h4>
                    {loading ? (
                        <div className="loading">Loading modules...</div>
                    ) : (
                        <AvailableModulesGrid
                            modules={availableModules}
                            isSelected={(m) => selectedModules.some(x => x.moduleID === m.moduleID)}
                            onToggle={onToggleModule}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}

export default SWModuleSelector;
