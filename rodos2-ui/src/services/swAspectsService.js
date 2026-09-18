// SWAspects 관련 API 서비스
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

async function getCanvasSWModules() {
    try {
        const response = await fetch('/api/hw-modules');
        if (!response.ok) return [];
        const hwList = await response.json();
        const swList = [];
        (Array.isArray(hwList) ? hwList : []).forEach((hw) => {
            const children = Array.isArray(hw?.swModules) ? hw.swModules : [];
            children.forEach((sw) => {
                const moduleID = sw?.moduleID || sw?.ref || '';
                if (!moduleID) return;
                swList.push(normalizeModuleEntry({
                    moduleID,
                    moduleName: sw?.name || moduleID,
                    moduleType: 'software',
                    source: 'canvas'
                }));
            });
        });
        return swList;
    } catch (error) {
        console.warn('Canvas SW modules load failed:', error);
        return [];
    }
}

export const swAspectsService = {
    // Registry + WorkSpace(Module Info) + 캔버스 SW 목록
    async getSWModules() {
        try {
            const data = await fetchRegistryJson('/api/registry/all');
            const registrySw = (data.software || []).map((module) =>
                normalizeModuleEntry({ ...module, moduleType: 'software', source: 'registry' })
            );
            const canvasSw = await getCanvasSWModules();
            return dedupeByModuleId([...registrySw, ...canvasSw]);
        } catch (error) {
            console.error('Error fetching SW modules:', error);
            const canvasSw = await getCanvasSWModules();
            return dedupeByModuleId(canvasSw);
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
