import { useState, useCallback } from 'react';

export function useRegistryModules() {
    const [registryModules, setRegistryModules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [draggedItem, setDraggedItem] = useState(null);

    // Registry 모듈 데이터 로드
    const loadRegistryModules = useCallback(async () => {
        try {
            setLoading(true);

            // Registry에서 모든 모듈을 가져와서 자동으로 분류
            const response = await fetch('/api/registry/all');
            if (response.ok) {
                const data = await response.json();

                const tree = [
                    {
                        key: 'ai-modules',
                        label: 'AI Modules',
                        type: 'directory',
                        moduleType: 'ai',
                        children: (data.ai || []).map(module => ({
                            key: module.moduleID,
                            label: module.moduleName,
                            type: 'module',
                            moduleType: 'ai',
                            classification: module.classification,
                            status: module.status,
                            lastModified: module.lastModified
                        }))
                    },
                    {
                        key: 'software-modules',
                        label: 'Software Modules',
                        type: 'directory',
                        moduleType: 'software',
                        children: (data.software || []).map(module => ({
                            key: module.moduleID,
                            label: module.moduleName,
                            type: 'module',
                            moduleType: 'software',
                            classification: module.classification,
                            status: module.status,
                            lastModified: module.lastModified
                        }))
                    },
                    {
                        key: 'robot-modules',
                        label: 'Robot Modules',
                        type: 'directory',
                        moduleType: 'robot',
                        children: (data.robot || []).map(module => ({
                            key: module.moduleID,
                            label: module.moduleName,
                            type: 'module',
                            moduleType: 'robot',
                            classification: module.classification,
                            status: module.status,
                            lastModified: module.lastModified
                        }))
                    },
                    {
                        key: 'edge-modules',
                        label: 'Edge',
                        type: 'directory',
                        moduleType: 'edge',
                        children: (data.edge || []).map(module => ({
                            key: module.moduleID,
                            label: module.moduleName,
                            type: 'module',
                            moduleType: 'edge',
                            classification: module.classification,
                            status: module.status,
                            lastModified: module.lastModified
                        }))
                    },
                    {
                        key: 'cloud-modules',
                        label: 'Cloud',
                        type: 'directory',
                        moduleType: 'cloud',
                        children: (data.cloud || []).map(module => ({
                            key: module.moduleID,
                            label: module.moduleName,
                            type: 'module',
                            moduleType: 'cloud',
                            classification: module.classification,
                            status: module.status,
                            lastModified: module.lastModified
                        }))
                    },
                    {
                        key: 'controller-modules',
                        label: 'Controller',
                        type: 'directory',
                        moduleType: 'controller',
                        children: (data.controller || []).map(module => ({
                            key: module.moduleID,
                            label: module.moduleName,
                            type: 'module',
                            moduleType: 'controller',
                            classification: module.classification,
                            status: module.status,
                            lastModified: module.lastModified
                        }))
                    }
                ];

                setRegistryModules(tree);
            } else {
                console.error('Failed to load registry modules');
                setRegistryModules([]);
            }
        } catch (error) {
            console.error('Error loading registry modules:', error);
            setRegistryModules([]);
        } finally {
            setLoading(false);
        }
    }, []);

    // 드래그 시작 핸들러
    const handleDragStart = useCallback((e, node) => {
        setDraggedItem(node);

        // 모듈 타입에 따라 드래그 데이터 설정
        if (node.moduleType === 'ai' || node.moduleType === 'software') {
            // AI Modules, Robot Modules -> SW 모듈 (원형)
            e.dataTransfer.setData('text/plain', JSON.stringify({
                type: 'sw',
                name: node.label,
                moduleType: node.moduleType,
                moduleID: node.key || ''
            }));
            e.dataTransfer.effectAllowed = 'copy';
        } else if (node.moduleType === 'controller') {
            // Controller Modules -> Controller 모듈 (직사각형)
            e.dataTransfer.setData('text/plain', JSON.stringify({
                type: 'controller',
                name: node.label,
                moduleType: node.moduleType,
                moduleID: node.key || ''
            }));
            e.dataTransfer.effectAllowed = 'copy';
        } else {
            // Edge, Cloud -> HW 모듈 (육각형)
            e.dataTransfer.setData('text/plain', JSON.stringify({
                type: 'hw',
                name: node.label,
                moduleType: node.moduleType
            }));
            e.dataTransfer.effectAllowed = 'copy';
        }

        // 드래그 중인 아이템 스타일 적용
        e.target.setAttribute('data-dragging', 'true');
    }, []);

    // 드래그 종료 시 스타일 제거
    const handleDragEnd = useCallback((e) => {
        e.target.removeAttribute('data-dragging');
        setDraggedItem(null);
    }, []);

    return {
        registryModules,
        loading,
        draggedItem,
        loadRegistryModules,
        handleDragStart,
        handleDragEnd
    };
}
