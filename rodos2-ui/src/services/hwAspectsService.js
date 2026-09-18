// HWAspects 관련 API 서비스
import { fetchRegistryJson, normalizeModuleEntry } from '../utils/registryFetch';

function dedupeByModuleId(modules) {
    const seen = new Set();
    return modules.filter((module) => {
        const id = (module.moduleID || '').replace(/-/g, '').toLowerCase();
        if (!id || seen.has(id)) return false;
        seen.add(id);
        return true;
    });
}

export const hwAspectsService = {
    // Registry + WorkSpace(Module Info): edge, cloud, controller, robot
    async getHWModules() {
        try {
            const data = await fetchRegistryJson('/api/registry/all');
            const hwModules = [];

            if (Array.isArray(data.edge)) {
                hwModules.push(...data.edge.map(module => normalizeModuleEntry({
                    ...module,
                    moduleType: 'edge',
                    type: 'edge',
                    source: 'registry'
                })));
            }

            if (Array.isArray(data.cloud)) {
                hwModules.push(...data.cloud.map(module => normalizeModuleEntry({
                    ...module,
                    moduleType: 'cloud',
                    type: 'cloud',
                    source: 'registry'
                })));
            }

            if (Array.isArray(data.controller)) {
                hwModules.push(...data.controller.map(module => normalizeModuleEntry({
                    ...module,
                    moduleType: 'controller',
                    type: 'controller',
                    source: 'registry'
                })));
            }

            if (Array.isArray(data.robot)) {
                hwModules.push(...data.robot.map(module => normalizeModuleEntry({
                    ...module,
                    moduleType: 'robot',
                    type: 'robot',
                    source: 'registry'
                })));
            }

            return dedupeByModuleId(hwModules);
        } catch (error) {
            console.error('Error fetching HW modules:', error);
            return [];
        }
    },

    transformToModuleIDs(selectedModules) {
        return selectedModules.map(module => {
            const moduleID = module.moduleID || '';
            const parts = moduleID.split('-');
            let mID, iID;

            if (parts.length >= 5) {
                mID = parts.slice(0, 4).join('-');
                iID = parts[4];
            } else if (parts.length === 2) {
                mID = parts[0];
                iID = parts[1];
            } else {
                mID = moduleID;
                iID = '00';
            }

            return { mID, iID };
        });
    }
};
