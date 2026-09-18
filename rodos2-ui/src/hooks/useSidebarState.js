import { useState, useEffect, useCallback } from 'react';

export function useSidebarState() {
    const [expanded, setExpanded] = useState({
        workspace: true,
        'module-info': true,        // Workspace Module Info 폴더
        'app-configuration': true,  // Workspace App Configuration 폴더
        'ai-modules': true,
        'software-modules': true,
        'robot-modules': true,
        'edge-modules': true,
        'cloud-modules': true,
        'controller-modules': true
    });
    const [selectedKey, setSelectedKey] = useState(null);
    const [loading, setLoading] = useState(false);
    const [contextMenu, setContextMenu] = useState(null);

    const fetchWorkspaceStructure = useCallback(async () => {
        // Workspace와 Registry Modules는 각각의 컴포넌트에서 자체적으로 데이터를 로드
        console.log('Refreshing sidebar components...');
    }, []);

    const handleToggle = useCallback((key) => {
        setExpanded(prev => ({ ...prev, [key]: !prev[key] }));
    }, []);

    const handleSelect = useCallback((key) => {
        setSelectedKey(key);
    }, []);

    const handleFileSelect = useCallback((fileNode) => {
        console.log('File selected:', fileNode);
        // 파일 선택 시 처리 (예: 파일 내용 로드, 편집기에서 열기 등)
        // TODO: 파일 내용을 가져와서 편집기에서 표시하는 로직 추가
    }, []);

    useEffect(() => {
        fetchWorkspaceStructure();
    }, [fetchWorkspaceStructure]);

    return {
        expanded,
        selectedKey,
        loading,
        contextMenu,
        setContextMenu,
        fetchWorkspaceStructure,
        handleToggle,
        handleSelect,
        handleFileSelect
    };
} 