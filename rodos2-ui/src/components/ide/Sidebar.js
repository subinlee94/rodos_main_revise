import React, { forwardRef, useImperativeHandle, useState } from 'react';

import { useSidebarState } from '../../hooks/useSidebarState';
import '../../styles/ide/Sidebar.css';
import RegistryModules from './RegistryModules';
import Workspace from './Workspace';

function TreeNode({ node, expanded, onToggle, selectedKey, onSelect, onFileSelect, parentKey }) {
    const hasChildren = node.children && node.children.length > 0;
    const isSelected = selectedKey === node.key;
    // 아이콘 없이
    return (
        <div className="tree-node">
            <div
                className={`tree-label${expanded[node.key] ? ' expanded' : ''}${isSelected ? ' selected' : ''}`}
                onClick={e => {
                    e.stopPropagation();
                    if (hasChildren) onToggle(node.key);
                    else onFileSelect(node);
                    onSelect(node.key);
                }}
            >
                {hasChildren && (
                    <span className="tree-arrow">{expanded[node.key] ? '▼' : '▶'}</span>
                )}
                <span className="tree-label-text">{typeof node.label === 'string' ? node.label : node.label}</span>
            </div>
            {hasChildren && expanded[node.key] && (
                <div className="tree-children">
                    {node.children.map(child => (
                        <TreeNode
                            key={child.key}
                            node={child}
                            expanded={expanded}
                            onToggle={onToggle}
                            selectedKey={selectedKey}
                            onSelect={onSelect}
                            onFileSelect={onFileSelect}
                            parentKey={node.key}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

const Sidebar = forwardRef((props, ref) => {
    const {
        expanded,
        selectedKey,
        loading,
        contextMenu,
        setContextMenu,
        fetchWorkspaceStructure,
        handleToggle,
        handleSelect,
        handleFileSelect
    } = useSidebarState();

    // 패널 토글 상태
    const [workspaceExpanded, setWorkspaceExpanded] = useState(true);
    const [registryExpanded, setRegistryExpanded] = useState(true);

    // 부모 컴포넌트에서 호출할 수 있도록 함수 노출
    useImperativeHandle(ref, () => ({
        refreshWorkspace: fetchWorkspaceStructure
    }));

    if (loading) {
        return (
            <div className="sidebar">
                <div className="sidebar-header">
                    <button className="sidebar-refresh-btn" onClick={fetchWorkspaceStructure}>
                        Refresh
                    </button>
                </div>
                <div className="sidebar-loading">Loading workspace...</div>
            </div>
        );
    }

    return (
        <div className="sidebar">
            <div className="sidebar-panels">
                {/* Workspace - 로컬 파일 관리 */}
                <div className="sidebar-panel workspace-panel">
                    <div className="panel-header" onClick={() => setWorkspaceExpanded(!workspaceExpanded)}>
                        <span className="panel-title">Workspace</span>
                        <span className="panel-toggle">{workspaceExpanded ? '▼' : '▶'}</span>
                    </div>
                    {workspaceExpanded && (
                        <Workspace
                            expanded={expanded}
                            selectedKey={selectedKey}
                            onToggle={handleToggle}
                            onSelect={handleSelect}
                            onFileSelect={handleFileSelect}
                        />
                    )}
                </div>

                {/* Registry Modules - AI, Software, Controller 모듈 */}
                <div className="sidebar-panel registry-panel">
                    <div className="panel-header" onClick={() => setRegistryExpanded(!registryExpanded)}>
                        <span className="panel-title">Registry Modules</span>
                        <span className="panel-toggle">{registryExpanded ? '▼' : '▶'}</span>
                    </div>
                    {registryExpanded && (
                        <RegistryModules
                            expanded={expanded}
                            selectedKey={selectedKey}
                            onToggle={handleToggle}
                            onSelect={handleSelect}
                            onContextMenu={() => { }}
                        />
                    )}
                </div>
            </div>
        </div>
    );
});

Sidebar.displayName = 'Sidebar';

export default Sidebar;