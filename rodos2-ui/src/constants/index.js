// 애플리케이션 전체에서 사용되는 상수들

export const WIZARD_TYPES = {
    SIM: 'SIM',
    IMR: 'IMR',
    IMCON: 'IMCON'
};

export const MODULE_TYPES = {
    HW: 'hw',
    SW: 'sw'
};

export const CANVAS_CONSTANTS = {
    HEX_CENTER_X: 120,
    HEX_CENTER_Y: 120,
    MAX_HEX_DISTANCE: 80
};

export const API_ENDPOINTS = {
    WORKSPACE_STRUCTURE: '/api/workspace/structure',
    MODULE_UPDATE: '/api/module/update',
    MODULE_SAVE_XML: '/api/module/save-xml',
    MODULE_PREVIEW_XML: '/api/module/preview-xml',
    MODEL_SIM: '/api/model/sim',
    CANVAS_SAVE_STATE: '/api/canvas/save-state',
    CANVAS_LOAD_STATE: '/api/canvas/load-state',
    CANVAS_LAST_FILE: '/api/canvas/last-file',
    CANVAS_SAVE_CONFIG: '/api/canvas/save-config',
    CANVAS_OPEN_CONFIG: '/api/canvas/open-config',
    CANVAS_NEW_CONFIG: '/api/canvas/new-config',
    CANVAS_CONFIG_FILES: '/api/canvas/config-files',
    CANVAS_HW_MODULES: '/api/hw-modules',
    CANVAS_HW_MAPPING: '/api/save-hw-mapping',
    CANVAS_SIMULATION: '/api/simulation',
    CANVAS_OPERATIONS: '/api/operations',
    AGENT_DOCKER_AGENTS: '/api/agent/docker-agents',
    SHARED_USER_STATE: '/api/shared-user-state'
};

// Wizard 관련 상수들
export * from './wizard';

// SoftwareModule 관련 상수들
export * from './softwareModule'; 