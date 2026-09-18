/**
 * ISO 22166-style composition helpers: link SW modules to parent HW (Controller/Robot)
 * via swAspects reference — parent identity (moduleID, GenInfo) is preserved.
 */

export function getHwModuleType(hwModule) {
    if (!hwModule) return '';
    return `${hwModule.moduleType || hwModule.type || hwModule.originalModuleType || ''}`.toLowerCase();
}

export function isControllerModule(hwModule) {
    return getHwModuleType(hwModule) === 'controller';
}

export function isRobotModule(hwModule) {
    return getHwModuleType(hwModule) === 'robot';
}

/** Parent that accepts SW via linked-only wizard (Controller rectangle or Robot hexagon). */
export function isSwLinkParentModule(hwModule) {
    return isControllerModule(hwModule) || isRobotModule(hwModule);
}

export function toModuleIDPair(fullModuleID = '') {
    if (!fullModuleID || typeof fullModuleID !== 'string') return { mID: '', iID: '' };
    const trimmed = fullModuleID.trim();
    if (!trimmed) return { mID: '', iID: '' };

    if (trimmed.includes('-')) {
        const [mID = '', iID = ''] = trimmed.split('-');
        return { mID, iID };
    }

    if (trimmed.length <= 2) {
        return { mID: '', iID: trimmed };
    }

    return {
        mID: trimmed.slice(0, -2),
        iID: trimmed.slice(-2)
    };
}

function toArray(value) {
    if (Array.isArray(value)) return value;
    if (value === null || value === undefined) return [];
    return [value];
}

function normalizeAspectList(value) {
    if (Array.isArray(value)) return value;
    if (Array.isArray(value?.moduleIDs)) {
        return value.moduleIDs.map(module => ({
            mID: module?.mID || '',
            iID: module?.iID || ''
        }));
    }
    return [];
}

/** Load parent (Robot/Controller) IM from registry — used when placing parent on canvas. */
export async function fetchParentInfoModelFromRegistry(moduleID, fallbackName, parentKind = 'Comp') {
    const defaultModel = {
        moduleName: fallbackName || '',
        manufacturer: '',
        description: '',
        examples: '',
        isSafety: false,
        isSecurity: false,
        idnType: {
            informationModelVersion: '1.0',
            idtype: parentKind,
            moduleID: toModuleIDPair(moduleID || ''),
            swAspects: [],
            hwAspects: []
        },
        properties: {},
        ioVariables: {},
        services: {},
        infrastructure: {},
        safeSecure: {},
        modelling: {},
        executableForm: {}
    };

    if (!moduleID) return defaultModel;

    try {
        const response = await fetch(`/api/registry/module/${encodeURIComponent(moduleID)}/model-data`);
        if (!response.ok) return defaultModel;

        const parsedModel = await response.json();
        return {
            moduleName: parsedModel?.moduleName || fallbackName || '',
            manufacturer: parsedModel?.manufacturer || '',
            description: parsedModel?.description || '',
            examples: parsedModel?.examples || '',
            isSafety: false,
            isSecurity: false,
            idnType: {
                informationModelVersion: parsedModel?.idnType?.informationModelVersion || '1.0',
                idtype: parsedModel?.idnType?.idtype || parentKind,
                moduleID: parsedModel?.idnType?.moduleID || toModuleIDPair(moduleID || ''),
                swAspects: normalizeAspectList(parsedModel?.idnType?.swAspects),
                hwAspects: normalizeAspectList(parsedModel?.idnType?.hwAspects)
            },
            properties: parsedModel?.properties || {},
            ioVariables: {
                inputs: toArray(parsedModel?.ioVariables?.inputs),
                outputs: toArray(parsedModel?.ioVariables?.outputs),
                inouts: toArray(parsedModel?.ioVariables?.inouts)
            },
            services: {
                noOfBasicService: parsedModel?.services?.noOfBasicService || 0,
                noOfOptionalService: parsedModel?.services?.noOfOptionalService || 0,
                serviceProfiles: toArray(parsedModel?.services?.serviceProfiles)
            },
            infrastructure: parsedModel?.infrastructure || {},
            safeSecure: parsedModel?.safeSecure || {},
            modelling: parsedModel?.modelling || {},
            executableForm: parsedModel?.executableForm || {}
        };
    } catch (error) {
        console.warn('Parent info model fetch failed, using defaults:', error);
        return defaultModel;
    }
}
