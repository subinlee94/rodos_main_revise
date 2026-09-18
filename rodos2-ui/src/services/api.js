import { API_ENDPOINTS } from '../constants/index';

// API 호출을 담당하는 서비스 함수들

// 안전한 API 호출을 위한 래퍼 함수
const safeApiCall = async (apiFunction, fallbackValue = null, retries = 3) => {
    for (let i = 0; i < retries; i++) {
        try {
            return await apiFunction();
        } catch (error) {
            console.warn(`API call failed (attempt ${i + 1}/${retries}):`, error);
            if (i === retries - 1) {
                console.error('All API retry attempts failed, using fallback value');
                return fallbackValue;
            }
            // 지수 백오프로 재시도 간격 증가
            await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
        }
    }
    return fallbackValue;
};

// 네트워크 상태 확인
const isOnline = () => navigator.onLine;

// API 호출 전 기본 검증
const validateApiCall = () => {
    if (!isOnline()) {
        throw new Error('Network is offline');
    }
    return true;
};

export const workspaceAPI = {
    async getStructure() {
        const response = await fetch(API_ENDPOINTS.WORKSPACE_STRUCTURE);
        if (!response.ok) {
            throw new Error(`Failed to fetch workspace structure: ${response.status}`);
        }
        return response.json();
    }
};

export const moduleAPI = {
    async updateModule(moduleData) {
        const response = await fetch(API_ENDPOINTS.MODULE_UPDATE, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(moduleData)
        });

        if (!response.ok) {
            throw new Error(`Failed to update module: ${response.status}`);
        }
        return response.json();
    },

    async saveXML(moduleData) {
        const response = await fetch(API_ENDPOINTS.MODULE_SAVE_XML, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(moduleData)
        });

        if (!response.ok) {
            throw new Error(`Failed to save XML: ${response.status}`);
        }
        return response.text();
    },

    async previewXML(moduleData) {
        const response = await fetch(API_ENDPOINTS.MODULE_PREVIEW_XML, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(moduleData)
        });

        if (!response.ok) {
            throw new Error(`Failed to preview XML: ${response.status}`);
        }
        return response.text();
    }
};

export const modelAPI = {
    async getSimSchema() {
        const response = await fetch(API_ENDPOINTS.MODEL_SIM);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    }
};

export const canvasAPI = {
    async saveCanvasState(hwModules, lastFile) {
        const response = await fetch(API_ENDPOINTS.CANVAS_SAVE_STATE, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ hwModules, lastFile })
        });

        if (!response.ok) {
            throw new Error(`Failed to save canvas state: ${response.status}`);
        }
        return response.text();
    },

    async loadCanvasState() {
        const response = await fetch(API_ENDPOINTS.CANVAS_LOAD_STATE);
        if (!response.ok) {
            throw new Error(`Failed to load canvas state: ${response.status}`);
        }
        return response.json();
    },

    async getLastFile() {
        const response = await fetch(API_ENDPOINTS.CANVAS_LAST_FILE);
        if (!response.ok) {
            throw new Error(`Failed to get last file: ${response.status}`);
        }
        return response.text();
    },

    async setLastFile(lastFile) {
        const response = await fetch(API_ENDPOINTS.CANVAS_LAST_FILE, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ lastFile })
        });

        if (!response.ok) {
            throw new Error(`Failed to set last file: ${response.status}`);
        }
        return response.text();
    },

    async saveConfiguration(fileName) {
        const response = await fetch(API_ENDPOINTS.CANVAS_SAVE_CONFIG, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fileName })
        });

        if (!response.ok) {
            throw new Error(`Failed to save configuration: ${response.status}`);
        }
        return response.text();
    },

    async getConfigurationFiles() {
        const response = await fetch(API_ENDPOINTS.CANVAS_CONFIG_FILES);
        if (!response.ok) {
            throw new Error(`Failed to get configuration files: ${response.status}`);
        }
        return response.json();
    },

    async openConfiguration(fileName) {
        const response = await fetch(API_ENDPOINTS.CANVAS_OPEN_CONFIG, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fileName })
        });

        if (!response.ok) {
            throw new Error(`Failed to open configuration: ${response.status}`);
        }
        return response.json();
    },

    async newConfiguration() {
        const response = await fetch(API_ENDPOINTS.CANVAS_NEW_CONFIG, {
            method: 'POST'
        });

        if (!response.ok) {
            throw new Error(`Failed to create new configuration: ${response.status}`);
        }
        return response.json();
    },

    async getDockerAgents() {
        const response = await fetch(API_ENDPOINTS.AGENT_DOCKER_AGENTS);
        if (!response.ok) {
            throw new Error(`Failed to fetch docker agents: ${response.status}`);
        }
        return response.json();
    },

    async getHWModules() {
        const response = await fetch(API_ENDPOINTS.CANVAS_HW_MODULES);
        if (!response.ok) {
            throw new Error(`Failed to fetch HW modules: ${response.status}`);
        }
        return response.json();
    },

    async saveHwMapping(moduleName, targetName, type, target) {
        const response = await fetch(API_ENDPOINTS.CANVAS_HW_MAPPING, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                moduleName,
                targetName,
                type,
                target
            })
        });
        if (!response.ok) {
            throw new Error(`Failed to save HW mapping: ${response.status}`);
        }
        return response.text();
    },

    // 통합된 Simulation API
    async simulation(action, data = {}) {
        const response = await fetch(API_ENDPOINTS.CANVAS_SIMULATION, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action, ...data })
        });
        if (!response.ok) {
            throw new Error(`Failed to ${action} simulation: ${response.status}`);
        }
        return response.json();
    },

    // 편의 메서드들
    async saveSimulation(robotName, namespace, x, y, theta) {
        return this.simulation('save-robot', { robotName, namespace, x, y, theta });
    },

    async setSimMode(simMode) {
        return this.simulation('set-mode', { simMode });
    },

    async saveSimulationInfo(simulationHwName, simulationHwTarget) {
        return this.simulation('save-hw', { simulationHwName, simulationHwTarget });
    },

    async getSimulationInfo() {
        return this.simulation('get-info');
    },

    async refreshSimulationConfig() {
        const response = await fetch('/api/simulation-config/refresh', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
        if (!response.ok) {
            throw new Error(`Failed to refresh simulation config: ${response.status}`);
        }
        return response.json();
    },

    // 통합된 Operations API
    async operations(action) {
        console.log(`API operations called with action: ${action}`);
        console.log(`Request URL: ${API_ENDPOINTS.CANVAS_OPERATIONS}`);
        console.log(`Request body:`, { action });

        const response = await fetch(API_ENDPOINTS.CANVAS_OPERATIONS, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action })
        });

        console.log(`Response status: ${response.status}`);
        console.log(`Response ok: ${response.ok}`);

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`API error response:`, errorText);
            throw new Error(`Failed to ${action} modules: ${response.status} - ${errorText}`);
        }

        const result = await response.json();
        console.log(`API response:`, result);
        return result;
    },

    // 편의 메서드들
    async executeModules() {
        return this.operations('execute');
    },

    async deployModules() {
        return this.operations('deploy');
    },

    async stopModules() {
        return this.operations('stop');
    }
};

export const sharedUserStateAPI = {
    async getCurrentState() {
        const response = await fetch(API_ENDPOINTS.SHARED_USER_STATE);
        if (!response.ok) {
            throw new Error(`Failed to fetch shared user state: ${response.status}`);
        }
        return response.json();
    }
};

export const api = {
    get: async (url) => {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch ${url}: ${response.status}`);
        }
        return { data: await response.json() };
    },

    post: async (url, data) => {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!response.ok) {
            throw new Error(`Failed to post ${url}: ${response.status}`);
        }
        return { data: await response.json() };
    }
}; 