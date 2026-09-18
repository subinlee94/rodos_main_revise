import React, { useEffect, useState } from 'react';
import { useRegistryModules } from '../../hooks/useRegistryModules';
import { registryService } from '../../services/registryService';
import { workspaceService } from '../../services/workspaceService';
import '../../styles/ide/RegistryModules.css';

function RegistryModules({ expanded, selectedKey, onToggle, onSelect, onContextMenu }) {
    const {
        registryModules,
        loading,
        draggedItem,
        loadRegistryModules,
        handleDragStart,
        handleDragEnd
    } = useRegistryModules();
    
    const [contextMenu, setContextMenu] = useState(null);

    // Registry 모듈 데이터 로드
    useEffect(() => {
        loadRegistryModules();
    }, [loadRegistryModules]);

    // Workspace에서 모듈 업로드 등 후 목록 갱신
    useEffect(() => {
        const onRegistryRefresh = () => loadRegistryModules();
        window.addEventListener('registry-refresh', onRegistryRefresh);
        return () => window.removeEventListener('registry-refresh', onRegistryRefresh);
    }, [loadRegistryModules]);

    // 드래그 오버 핸들러
    const handleDragOver = (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    // 드롭 핸들러
    const handleDrop = (e, targetNode) => {
        e.preventDefault();

        if (!draggedItem || draggedItem.key === targetNode.key) {
            return;
        }

        // 드래그 앤 드롭 로직 구현
        console.log(`드래그된 아이템: ${draggedItem.label} -> ${targetNode.label}`);

        // 여기에 실제 드래그 앤 드롭 로직을 구현할 수 있습니다
        // 예: 모듈 이동, 카테고리 변경 등
    };

    // context menu 핸들러
    const handleContextMenu = (e, node, parentKey) => {
        e.preventDefault();
        // 모듈 타입일 때만 컨텍스트 메뉴 표시
        if (node.type === 'module') {
            setContextMenu({ x: e.clientX, y: e.clientY, node, parentKey });
        }
        if (onContextMenu) onContextMenu(e, node, parentKey);
    };
    
    const handleCloseContextMenu = () => setContextMenu(null);

    // 메뉴 동작
    const handleMenuClick = async (action) => {
        if (!contextMenu) return;
        
        const node = contextMenu.node;
        
        try {
            if (action === 'open') {
                if (node.type === 'module') {
                    // Registry 모듈 정보를 새 탭에서 열기
                    window.open(`/api/registry/module/${node.key}`, '_blank');
                } else if (node.type === 'directory') {
                    // 디렉토리 토글
                    onToggle(node.key);
                }
            } else if (action === 'download') {
                if (node.type === 'module') {
                    try {
                        // Registry에서 모듈 정보 가져오기
                        const module = await registryService.getModule(node.key);
                        if (!module || !module.xmlString) {
                            alert('모듈 XML을 가져올 수 없습니다.');
                            return;
                        }
                        
                        // 파일명 생성 (모듈명.xml)
                        const fileName = `${node.label}.xml`;
                        
                        // Workspace의 Module Info에 저장
                        const formData = new FormData();
                        formData.append('filename', fileName);
                        formData.append('content', module.xmlString);
                        
                        const response = await fetch('/api/registry/workspace/save-file', {
                            method: 'POST',
                            body: formData
                        });
                        
                        if (response.ok) {
                            alert(`모듈이 성공적으로 다운로드되었습니다: ${fileName}`);
                            // Workspace 새로고침 (부모 컴포넌트에 알림)
                            if (window.dispatchEvent) {
                                window.dispatchEvent(new CustomEvent('workspace-refresh'));
                            }
                        } else {
                            const errorText = await response.text();
                            throw new Error(errorText || 'Failed to save file');
                        }
                    } catch (error) {
                        console.error('Download error:', error);
                        alert('다운로드 실패: ' + (error.message || 'Unknown error'));
                    }
                }
            } else if (action === 'edit') {
                if (node.type === 'module') {
                    // Registry 모듈 편집
                    window.open(`/api/registry/module/${node.key}/edit`, '_blank');
                }
            } else if (action === 'delete') {
                if (node.type === 'module') {
                    // Registry에서 모듈 삭제
                    if (window.confirm(`Are you sure you want to delete "${node.label}" from Registry?`)) {
                        try {
                            await registryService.deleteModule(node.key);
                            alert('Module deleted successfully from Registry: ' + node.label);
                            // 트리 새로고침
                            loadRegistryModules();
                        } catch (error) {
                            console.error('Delete error:', error);
                            alert('Delete failed');
                        }
                    }
                }
            }
        } catch (error) {
            console.error('Menu action error:', error);
            alert('Action failed');
        }
        
        handleCloseContextMenu();
    };

    // 재귀적으로 트리 렌더링
    const renderTree = (node, parentKey) => {
        const hasChildren = node.children && node.children.length > 0;
        const isSelected = selectedKey === node.key;
        const isExpanded = expanded[node.key];
        const isModule = node.type === 'module';

        return (
            <div key={node.key} className="tree-node">
                <div
                    className={`tree-label ${isSelected ? 'selected' : ''}`}
                    data-type={node.type}
                    data-draggable={isModule}
                    data-module-type={node.moduleType}
                    draggable={isModule}
                    onDragStart={isModule ? (e) => handleDragStart(e, node) : undefined}
                    onDragOver={isModule ? (e) => handleDragOver(e) : undefined}
                    onDrop={isModule ? (e) => handleDrop(e, node) : undefined}
                    onClick={e => {
                        e.stopPropagation();
                        if (hasChildren) onToggle(node.key);
                        else onSelect(node.key);
                    }}
                    onDragEnd={isModule ? handleDragEnd : undefined}
                    onContextMenu={e => handleContextMenu(e, node, parentKey)}
                >
                    {hasChildren && (
                        <span className={`tree-arrow ${isExpanded ? 'expanded' : ''}`}>
                            {isExpanded ? '▼' : '▶'}
                        </span>
                    )}
                    {isModule && <div className="drag-handle" title="드래그하여 이동"></div>}
                    <span className="tree-label-text">
                        {node.label}
                    </span>
                </div>
                {hasChildren && isExpanded && (
                    <div className="tree-children">
                        {node.children.map(child => renderTree(child, node.key))}
                    </div>
                )}
            </div>
        );
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                Loading registry modules...
            </div>
        );
    }

    return (
        <div className="registry-modules">
            <div className="registry-tree">
                {registryModules.map(node => renderTree(node, null))}
            </div>
            {contextMenu && (
                <div
                    className="context-menu"
                    style={{
                        position: 'fixed',
                        top: contextMenu.y,
                        left: contextMenu.x
                    }}
                    onMouseLeave={handleCloseContextMenu}
                >
                    <div className="context-menu-item" onClick={() => handleMenuClick('open')}>
                        열기
                    </div>
                    <div className="context-menu-item" onClick={() => handleMenuClick('download')}>
                        다운로드
                    </div>
                    <div className="context-menu-item delete" onClick={() => handleMenuClick('delete')}>
                        삭제
                    </div>
                </div>
            )}
        </div>
    );
}

export default RegistryModules;
