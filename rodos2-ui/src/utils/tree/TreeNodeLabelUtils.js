import { TreeNode } from './TreeNode';

/**
 * Generate a label for a property node based on its type and data
 * Similar to Java PropertyLabelProvider.getText()
 * @param {Object} node - Property node or property data
 * @returns {string} Formatted label string
 */
export function getNodeLabel(node) {
    // Handle both TreeNode instances and plain property objects
    const property = node instanceof TreeNode ? node.getValue() : node;

    if (!property) {
        return 'Unknown Property';
    }

    const complexType = property.complexType || property.complex || 'NONE';
    const name = property.name || '';
    const type = property.type || '';
    const description = property.description || '';
    const unit = property.unit || '';
    const value = property.value || '';
    const inDataType = property.inDataType || '';

    // Simplified format: Name (Type) Value Unit Description
    const parts = [];

    // Name
    if (name) {
        parts.push(name);
    } else {
        parts.push('Unnamed');
    }

    // Type (with complex type if exists)
    if (complexType !== 'NONE' && complexType !== 'None' && complexType) {
        if (complexType === 'CLASS') {
            parts.push(`(${type || 'class'})`);
        } else if (complexType === 'POINTER') {
            parts.push(`(${inDataType || 'pointer'})`);
        } else {
            parts.push(`(${type || complexType.toLowerCase()})`);
        }
    } else if (type) {
        parts.push(`(${type})`);
    }

    // Value
    if (value) {
        if (complexType === 'ARRAY' || complexType === 'VECTOR') {
            const valuesStr = formatArrayValues(value);
            parts.push(valuesStr);
        } else {
            parts.push(value);
        }
    }

    // Unit
    if (unit) {
        parts.push(unit);
    }

    // Description (shortened)
    if (description) {
        const shortDesc = description.length > 20 ? description.substring(0, 20) + '...' : description;
        parts.push(shortDesc);
    }

    return parts.join(' ');
}

/**
 * Format array values for display
 * @param {string|Array} value - Array value (string or array)
 * @returns {string} Formatted array string
 */
function formatArrayValues(value) {
    if (!value) {
        return '[]';
    }

    // If value is already a string representation of array
    if (typeof value === 'string') {
        // Try to parse if it's JSON-like
        try {
            const parsed = JSON.parse(value);
            if (Array.isArray(parsed)) {
                return `[${parsed.join(', ')}]`;
            }
        } catch (e) {
            // If parsing fails, treat as plain string
            return `[${value}]`;
        }
        return `[${value}]`;
    }

    // If value is an array
    if (Array.isArray(value)) {
        return `[${value.join(', ')}]`;
    }

    return `[${value}]`;
}

/**
 * Get a short label for a property (name and type only)
 * @param {Object} node - Property node or property data
 * @returns {string} Short label
 */
export function getShortNodeLabel(node) {
    const property = node instanceof TreeNode ? node.getValue() : node;

    if (!property) {
        return 'Unknown';
    }

    const name = property.name || '';
    const type = property.type || '';
    const complexType = property.complexType || property.complex || '';

    if (complexType && complexType !== 'NONE') {
        return `${name} (${complexType})`;
    }

    return `${name} (${type})`;
}

/**
 * Get a detailed label for a property (all information)
 * @param {Object} node - Property node or property data
 * @returns {string} Detailed label
 */
export function getDetailedNodeLabel(node) {
    const property = node instanceof TreeNode ? node.getValue() : node;

    if (!property) {
        return 'Unknown Property';
    }

    const parts = [];

    // Basic info
    if (property.name) parts.push(`Name: ${property.name}`);
    if (property.type) parts.push(`Type: ${property.type}`);
    if (property.description) parts.push(`Description: ${property.description}`);
    if (property.unit) parts.push(`Unit: ${property.unit}`);
    if (property.value) parts.push(`Value: ${property.value}`);

    // Complex type specific info
    if (property.complexType && property.complexType !== 'NONE') {
        parts.push(`Complex Type: ${property.complexType}`);
        if (property.complexName) parts.push(`Complex Name: ${property.complexName}`);
        if (property.inDataType) parts.push(`In Data Type: ${property.inDataType}`);
    }

    return parts.join(' | ');
}

/**
 * Get a tooltip text for a property
 * @param {Object} node - Property node or property data
 * @returns {string} Tooltip text
 */
export function getNodeTooltip(node) {
    const property = node instanceof TreeNode ? node.getValue() : node;

    if (!property) {
        return 'No property information available';
    }

    const tooltipParts = [];

    if (property.description) {
        tooltipParts.push(property.description);
    }

    if (property.unit) {
        tooltipParts.push(`Unit: ${property.unit}`);
    }

    if (property.value) {
        tooltipParts.push(`Value: ${property.value}`);
    }

    if (property.complexType && property.complexType !== 'NONE') {
        tooltipParts.push(`Complex Type: ${property.complexType}`);
        if (property.complexName) {
            tooltipParts.push(`Complex Name: ${property.complexName}`);
        }
    }

    return tooltipParts.join('\n');
}

/**
 * Check if a property is of a specific complex type
 * @param {Object} node - Property node or property data
 * @param {string} complexType - Complex type to check
 * @returns {boolean} True if property is of the specified complex type
 */
export function isComplexType(node, complexType) {
    const property = node instanceof TreeNode ? node.getValue() : node;

    if (!property) {
        return false;
    }

    const nodeComplexType = property.complexType || property.complex || 'NONE';
    return nodeComplexType.toUpperCase() === complexType.toUpperCase();
}

/**
 * Get the display icon for a property based on its type
 * @param {Object} node - Property node or property data
 * @returns {string} Icon class or identifier
 */
export function getPropertyIcon(node) {
    const property = node instanceof TreeNode ? node.getValue() : node;

    if (!property) {
        return 'icon-unknown';
    }

    const complexType = property.complexType || property.complex || 'NONE';

    switch (complexType.toUpperCase()) {
        case 'NONE':
            return 'icon-simple';
        case 'ARRAY':
        case 'array':
            return 'icon-array';
        case 'CLASS':
        case 'class':
            return 'icon-class';
        case 'POINTER':
        case 'pointer':
            return 'icon-pointer';
        case 'VECTOR':
        case 'vector':
            return 'icon-vector';
        default:
            return 'icon-unknown';
    }
}

/**
 * Generate a label for a service node (ServiceProfile or ServiceMethod)
 * @param {Object} node - Service node or service data
 * @returns {string} Formatted label string
 */
export function getServiceNodeLabel(node) {
    const serviceData = node instanceof TreeNode ? node.getValue() : node;

    if (!serviceData) {
        return 'Unknown Service';
    }

    // ServiceProfile
    if (serviceData.type) {
        const type = serviceData.type || '';
        const id = serviceData.ID || '';
        const pvType = serviceData.PVType || '';
        const moType = serviceData.MOType || '';
        const path = serviceData.path || '';

        const parts = [`(${type})`];
        if (id) parts.push(`ID: ${id}`);
        if (pvType) parts.push(`PV: ${pvType}`);
        if (moType) parts.push(`MO: ${moType}`);
        if (path) parts.push(`Path: ${path}`);

        return parts.join(', ');
    }

    // ServiceMethod
    if (serviceData.methodName) {
        const methodName = serviceData.methodName || '';
        const retType = serviceData.retType || '';
        const moType = serviceData.MOType || '';
        const reqProvType = serviceData.reqProvType || '';
        const argCount = serviceData.argSpecs ? serviceData.argSpecs.length : 0;

        const parts = [`${methodName}`];
        if (retType) parts.push(`→ ${retType}`);
        if (moType) parts.push(`MO: ${moType}`);
        if (reqProvType) parts.push(`Type: ${reqProvType}`);
        if (argCount > 0) parts.push(`(${argCount} args)`);

        return parts.join(', ');
    }

    // ArgSpec
    if (serviceData.name && serviceData.type) {
        const name = serviceData.name || '';
        const type = serviceData.type || '';
        return `${name}: ${type}`;
    }

    return 'Unknown Service Node';
}

/**
 * Get a short label for a service node
 * @param {Object} node - Service node or service data
 * @returns {string} Short label
 */
export function getShortServiceNodeLabel(node) {
    const serviceData = node instanceof TreeNode ? node.getValue() : node;

    if (!serviceData) {
        return 'Unknown';
    }

    // ServiceProfile
    if (serviceData.type) {
        const type = serviceData.type || '';
        const id = serviceData.ID || '';
        return id ? `${id} (${type})` : `Service (${type})`;
    }

    // ServiceMethod
    if (serviceData.methodName) {
        const methodName = serviceData.methodName || '';
        const retType = serviceData.retType || '';
        return retType ? `${methodName} → ${retType}` : methodName;
    }

    // ArgSpec
    if (serviceData.name && serviceData.type) {
        const name = serviceData.name || '';
        const type = serviceData.type || '';
        return `${name}: ${type}`;
    }

    return 'Unknown';
}

/**
 * Get a tooltip text for a service node
 * @param {Object} node - Service node or service data
 * @returns {string} Tooltip text
 */
export function getServiceNodeTooltip(node) {
    const serviceData = node instanceof TreeNode ? node.getValue() : node;

    if (!serviceData) {
        return 'No service information available';
    }

    const tooltipParts = [];

    // ServiceProfile
    if (serviceData.type) {
        tooltipParts.push(`Type: ${serviceData.type}`);
        if (serviceData.ID) tooltipParts.push(`ID: ${serviceData.ID}`);
        if (serviceData.PVType) tooltipParts.push(`PV Type: ${serviceData.PVType}`);
        if (serviceData.MOType) tooltipParts.push(`MO Type: ${serviceData.MOType}`);
        if (serviceData.path) tooltipParts.push(`Path: ${serviceData.path}`);

        if (serviceData.additionalInfo && serviceData.additionalInfo.length > 0) {
            const infoList = serviceData.additionalInfo.map(info => `${info.name}: ${info.value}`).join(', ');
            tooltipParts.push(`Additional Info: ${infoList}`);
        }

        if (serviceData.serviceMethods && serviceData.serviceMethods.length > 0) {
            tooltipParts.push(`Methods: ${serviceData.serviceMethods.length}`);
        }
    }

    // ServiceMethod
    if (serviceData.methodName) {
        tooltipParts.push(`Method: ${serviceData.methodName}`);
        if (serviceData.retType) tooltipParts.push(`Return Type: ${serviceData.retType}`);
        if (serviceData.MOType) tooltipParts.push(`MO Type: ${serviceData.MOType}`);
        if (serviceData.reqProvType) tooltipParts.push(`Req/Prov Type: ${serviceData.reqProvType}`);

        if (serviceData.argSpecs && serviceData.argSpecs.length > 0) {
            const argList = serviceData.argSpecs.map(arg => `${arg.name}: ${arg.type}`).join(', ');
            tooltipParts.push(`Arguments: ${argList}`);
        }
    }

    // ArgSpec
    if (serviceData.name && serviceData.type) {
        tooltipParts.push(`Argument: ${serviceData.name}`);
        tooltipParts.push(`Type: ${serviceData.type}`);
    }

    return tooltipParts.join('\n');
}

/**
 * Check if a node is a service profile
 * @param {Object} node - Service node or service data
 * @returns {boolean} True if node is a service profile
 */
export function isServiceProfile(node) {
    const serviceData = node instanceof TreeNode ? node.getValue() : node;
    return serviceData && serviceData.type;
}

/**
 * Check if a node is a service method
 * @param {Object} node - Service node or service data
 * @returns {boolean} True if node is a service method
 */
export function isServiceMethod(node) {
    const serviceData = node instanceof TreeNode ? node.getValue() : node;
    return serviceData && serviceData.methodName;
}

/**
 * Get the service type icon
 * @param {Object} node - Service node or service data
 * @returns {string} Icon class or identifier
 */
export function getServiceIcon(node) {
    if (isServiceProfile(node)) {
        return 'icon-service-profile';
    }
    if (isServiceMethod(node)) {
        return 'icon-service-method';
    }
    return 'icon-service-unknown';
}

/**
 * Generate a label for a SafeSecure node based on its type and data
 * @param {Object} node - SafeSecure node or data
 * @returns {string} Formatted label string
 */
export function getSafeSecureNodeLabel(node) {
    const data = node instanceof TreeNode ? node.getValue() : node;

    if (!data) {
        return 'Unknown SafeSecure Node';
    }

    // Safety Function
    if (data.safetyFunctionType) {
        const type = data.safetyFunctionType || 'Unknown';
        const validType = data.validSafetyLevelType || '';
        const pl = data.eachSafetyLevelPL || '';
        const sil = data.eachSafetyLevelSIL || '';

        const levelInfo = [];
        if (validType) levelInfo.push(validType);
        if (pl) levelInfo.push(`PL:${pl}`);
        if (sil) levelInfo.push(`SIL:${sil}`);

        const levelStr = levelInfo.length > 0 ? ` (${levelInfo.join(', ')})` : '';
        return `${type}${levelStr}`;
    }

    // Security
    if (data.type) {
        const type = data.type || 'Unknown';
        const value = data.value || '';
        const valueStr = value ? ` - Level ${value}` : '';
        return `${type}${valueStr}`;
    }

    return 'Unknown SafeSecure Node';
}

/**
 * Get a short label for a SafeSecure node
 * @param {Object} node - SafeSecure node or data
 * @returns {string} Short label
 */
export function getShortSafeSecureNodeLabel(node) {
    const data = node instanceof TreeNode ? node.getValue() : node;

    if (!data) {
        return 'Unknown';
    }

    if (data.safetyFunctionType) {
        return data.safetyFunctionType || 'Safety Function';
    }

    if (data.type) {
        return data.type || 'Security';
    }

    return 'Unknown';
}

/**
 * Get a tooltip text for a SafeSecure node
 * @param {Object} node - SafeSecure node or data
 * @returns {string} Tooltip text
 */
export function getSafeSecureNodeTooltip(node) {
    const data = node instanceof TreeNode ? node.getValue() : node;

    if (!data) {
        return 'No SafeSecure information available';
    }

    const tooltipParts = [];

    // Safety Function tooltip
    if (data.safetyFunctionType) {
        tooltipParts.push(`Safety Function Type: ${data.safetyFunctionType}`);
        if (data.validSafetyLevelType) {
            tooltipParts.push(`Valid Safety Level Type: ${data.validSafetyLevelType}`);
        }
        if (data.eachSafetyLevelPL) {
            tooltipParts.push(`Safety Level PL: ${data.eachSafetyLevelPL}`);
        }
        if (data.eachSafetyLevelSIL) {
            tooltipParts.push(`Safety Level SIL: ${data.eachSafetyLevelSIL}`);
        }
    }

    // Security tooltip
    if (data.type) {
        tooltipParts.push(`Security Type: ${data.type}`);
        if (data.value) {
            tooltipParts.push(`Security Level: ${data.value}`);
        }
    }

    return tooltipParts.join('\n');
}

/**
 * Check if a node is a Safety Function
 * @param {Object} node - SafeSecure node or data
 * @returns {boolean} True if node is a Safety Function
 */
export function isSafetyFunction(node) {
    const data = node instanceof TreeNode ? node.getValue() : node;
    return data && data.safetyFunctionType;
}

/**
 * Check if a node is a Security
 * @param {Object} node - SafeSecure node or data
 * @returns {boolean} True if node is a Security
 */
export function isSecurity(node) {
    const data = node instanceof TreeNode ? node.getValue() : node;
    return data && data.type && !data.safetyFunctionType;
}

/**
 * Get the display icon for a SafeSecure node based on its type
 * @param {Object} node - SafeSecure node or data
 * @returns {string} Icon emoji
 */
export function getSafeSecureIcon(node) {
    const data = node instanceof TreeNode ? node.getValue() : node;

    if (!data) {
        return '❓';
    }

    if (data.safetyFunctionType) {
        return '🛡️'; // Safety Function
    } else if (data.type) {
        return '🔒'; // Security
    }

    return '❓';
} 