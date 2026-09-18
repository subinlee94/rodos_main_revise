import React from 'react';
import '../../styles/wizard/AvailableModulesGrid.css';

/** 열 순서: Action → Name → Module ID (인라인 grid로 레이아웃 고정, LTR 강제) */
const GRID_TEMPLATE = 'minmax(96px, 0.22fr) minmax(120px, 1fr) minmax(160px, 2fr)';

const rowBase = {
    display: 'grid',
    gridTemplateColumns: GRID_TEMPLATE,
    columnGap: 14,
    alignItems: 'center',
    padding: '10px 14px',
    boxSizing: 'border-box'
};

export function AvailableModulesGrid({ modules, isSelected, onToggle }) {
    const list = Array.isArray(modules) ? modules : [];

    return (
        <div className="rodos2-am-wrap sw-modules-table" dir="ltr">
            <div className="rodos2-am-inner">
                <div className="rodos2-am-header" style={rowBase}>
                    <span>Action</span>
                    <span>Name</span>
                    <span>Module ID</span>
                </div>
                {list.map((module) => {
                    const selected = isSelected(module);
                    return (
                        <div
                            key={module.moduleID}
                            className={`rodos2-am-row${selected ? ' rodos2-am-row--selected' : ''}`}
                            style={rowBase}
                        >
                            <div className="rodos2-am-cell rodos2-am-cell--action">
                                <button
                                    type="button"
                                    className={`add-btn ${selected ? 'disabled' : ''}`}
                                    onClick={() => !selected && onToggle(module)}
                                    disabled={selected}
                                    title={selected ? 'Already selected' : 'Add module'}
                                >
                                    {selected ? 'Selected' : '+ Add'}
                                </button>
                            </div>
                            <div className="rodos2-am-cell">{module.moduleName}</div>
                            <div className="rodos2-am-cell rodos2-am-cell--id" title={module.moduleID}>
                                {module.moduleID}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default AvailableModulesGrid;
