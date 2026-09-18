// Registry 관련 API 서비스
export const registryService = {
    // 모든 모듈 조회
    async getAllModules() {
        try {
            const response = await fetch('/api/registry/all');
            if (response.ok) {
                return await response.json();
            } else {
                throw new Error('Failed to load registry modules');
            }
        } catch (error) {
            console.error('Error loading registry modules:', error);
            throw error;
        }
    },

    // 특정 모듈 조회
    async getModule(moduleId) {
        try {
            const response = await fetch(`/api/registry/module/${moduleId}`);
            if (response.ok) {
                return await response.json();
            } else {
                throw new Error('Module not found');
            }
        } catch (error) {
            console.error('Error loading module:', error);
            throw error;
        }
    },

    // IDnType의 swAspects 기준으로 연결 모듈의 services/ioVariables 조회
    async getLinkedModuleData(swAspects = []) {
        try {
            console.log('[registryService] request /api/registry/module/linked-data', {
                swAspectsLength: Array.isArray(swAspects) ? swAspects.length : 'not-array',
                swAspects
            });
            const response = await fetch('/api/registry/module/linked-data', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ swAspects })
            });
            console.log('[registryService] response /api/registry/module/linked-data', {
                ok: response.ok,
                status: response.status
            });
            if (response.ok) {
                const data = await response.json();
                console.log('[registryService] parsed response /api/registry/module/linked-data', {
                    modulesCount: Array.isArray(data?.modules) ? data.modules.length : 0
                });
                return data;
            } else {
                throw new Error('Failed to load linked module data');
            }
        } catch (error) {
            console.error('Error loading linked module data:', error);
            throw error;
        }
    },

    // 모듈 삭제
    async deleteModule(moduleId) {
        try {
            const response = await fetch('/api/registry/module/delete', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ moduleId })
            });

            if (response.ok) {
                return true;
            } else {
                throw new Error('Delete failed');
            }
        } catch (error) {
            console.error('Error deleting module:', error);
            throw error;
        }
    },

    // 모듈 데이터를 트리 구조로 변환
    transformModulesToTree(data) {
        return [
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
                label: 'Robot Modules',
                type: 'directory',
                moduleType: 'software',
                children: (data.robot || []).map(module => ({
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
                label: 'Robot',
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
    }
};
