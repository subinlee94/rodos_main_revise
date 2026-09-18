import { useState, useCallback } from 'react';

/** 원격 레지스트리가 느리거나 멈추면 fetch가 무한 대기하므로 상한을 둔다. */
const REGISTRY_ALL_TIMEOUT_MS = 28000;

async function fetchRegistryAll() {
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), REGISTRY_ALL_TIMEOUT_MS);
    try {
        return await fetch('/api/registry/all', { signal: controller.signal });
    } finally {
        window.clearTimeout(timer);
    }
}

/** Spring IM JSON은 snake_case(module_id, module_name) — wizard 쪽은 camelCase 혼용 */
function normalizeRegistryModule(module) {
    if (!module || typeof module !== 'object') {
        return { moduleID: '', moduleName: '', classification: '', status: undefined, lastModified: undefined };
    }
    const moduleID = module.moduleID ?? module.module_id ?? '';
    const moduleName = module.moduleName ?? module.module_name ?? '';
    return {
        moduleID,
        moduleName,
        classification: module.classification ?? '',
        status: module.status,
        lastModified: module.lastModified ?? module.last_modified
    };
}

export function useRegistryModules() {
    const [registryModules, setRegistryModules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [draggedItem, setDraggedItem] = useState(null);

    // Registry 모듈 데이터 로드
    const loadRegistryModules = useCallback(async () => {
        try {
            setLoading(true);

            // Registry에서 모든 모듈을 가져와서 자동으로 분류
            const response = await fetchRegistryAll();
            if (response.ok) {
                const data = await response.json();

                const tree = [
                    {
                        key: 'ai-modules',
                        label: 'AI Modules',
                        type: 'directory',
                        moduleType: 'ai',
                        children: (data.ai || []).map(module => {
                            const m = normalizeRegistryModule(module);
                            return {
                                key: m.moduleID,
                                label: m.moduleName,
                                type: 'module',
                                moduleType: 'ai',
                                classification: m.classification,
                                status: m.status,
                                lastModified: m.lastModified
                            };
                        })
                    },
                    {
                        key: 'software-modules',
                        label: 'Software Modules',
                        type: 'directory',
                        moduleType: 'software',
                        children: (data.software || []).map(module => {
                            const m = normalizeRegistryModule(module);
                            return {
                                key: m.moduleID,
                                label: m.moduleName,
                                type: 'module',
                                moduleType: 'software',
                                classification: m.classification,
                                status: m.status,
                                lastModified: m.lastModified
                            };
                        })
                    },
                    {
                        key: 'robot-modules',
                        label: 'Robot Modules',
                        type: 'directory',
                        moduleType: 'robot',
                        children: (data.robot || []).map(module => {
                            const m = normalizeRegistryModule(module);
                            return {
                                key: m.moduleID,
                                label: m.moduleName,
                                type: 'module',
                                moduleType: 'robot',
                                classification: m.classification,
                                status: m.status,
                                lastModified: m.lastModified
                            };
                        })
                    },
                    {
                        key: 'edge-modules',
                        label: 'Edge',
                        type: 'directory',
                        moduleType: 'edge',
                        children: (data.edge || []).map(module => {
                            const m = normalizeRegistryModule(module);
                            return {
                                key: m.moduleID,
                                label: m.moduleName,
                                type: 'module',
                                moduleType: 'edge',
                                classification: m.classification,
                                status: m.status,
                                lastModified: m.lastModified
                            };
                        })
                    },
                    {
                        key: 'cloud-modules',
                        label: 'Cloud',
                        type: 'directory',
                        moduleType: 'cloud',
                        children: (data.cloud || []).map(module => {
                            const m = normalizeRegistryModule(module);
                            return {
                                key: m.moduleID,
                                label: m.moduleName,
                                type: 'module',
                                moduleType: 'cloud',
                                classification: m.classification,
                                status: m.status,
                                lastModified: m.lastModified
                            };
                        })
                    },
                    {
                        key: 'controller-modules',
                        label: 'Controller',
                        type: 'directory',
                        moduleType: 'controller',
                        children: (data.controller || []).map(module => {
                            const m = normalizeRegistryModule(module);
                            return {
                                key: m.moduleID,
                                label: m.moduleName,
                                type: 'module',
                                moduleType: 'controller',
                                classification: m.classification,
                                status: m.status,
                                lastModified: m.lastModified
                            };
                        })
                    }
                ];

                setRegistryModules(tree);
            } else {
                console.error('Failed to load registry modules');
                setRegistryModules([]);
            }
        } catch (error) {
            if (error.name === 'AbortError') {
                console.warn(
                    `Registry /api/registry/all timed out after ${REGISTRY_ALL_TIMEOUT_MS}ms — showing empty lists. Check network or IIC registry.`
                );
            } else {
                console.error('Error loading registry modules:', error);
            }
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
        } else if (node.moduleType === 'robot') {
            // Robot Modules -> Robot 모듈 (육각형 + linked SW wizard)
            e.dataTransfer.setData('text/plain', JSON.stringify({
                type: 'robot',
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
                moduleType: node.moduleType,
                moduleID: node.key || ''
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
