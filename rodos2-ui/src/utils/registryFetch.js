/** Registry API fetch — 원격 IIC 지연 시 무한 로딩 방지 */
export const REGISTRY_FETCH_TIMEOUT_MS = 28000;

export async function fetchRegistryJson(url, options = {}) {
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), REGISTRY_FETCH_TIMEOUT_MS);
    try {
        const response = await fetch(url, { ...options, signal: controller.signal });
        if (!response.ok) {
            throw new Error(`Registry request failed: ${response.status}`);
        }
        return await response.json();
    } finally {
        window.clearTimeout(timer);
    }
}

export function normalizeModuleEntry(module) {
    if (!module || typeof module !== 'object') {
        return { moduleID: '', moduleName: '', moduleType: '', source: 'registry' };
    }
    return {
        moduleID: module.moduleID ?? module.module_id ?? '',
        moduleName: module.moduleName ?? module.module_name ?? '',
        moduleType: module.moduleType ?? module.module_type ?? '',
        classification: module.classification ?? '',
        source: module.source ?? 'registry'
    };
}
