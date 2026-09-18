// 유효성 검사 서비스 함수들

export const validationService = {
    validateModuleData(moduleData) {
        const errors = [];

        // GenInfo 검증
        if (!moduleData.genInfo) {
            errors.push('General Information is required');
        } else {
            const genInfo = moduleData.genInfo;
            if (!genInfo.moduleName) errors.push('Module name is required');
            if (!genInfo.manufacturer) errors.push('Manufacturer is required');
            if (!genInfo.compositeType) errors.push('Composite type is required');
        }

        // IDnType 검증
        if (!moduleData.idnType) {
            errors.push('ID and Type information is required');
        } else {
            const idnType = moduleData.idnType;
            if (!idnType.idtype) errors.push('ID type is required');
            if (!idnType.infoModelVersion) errors.push('Info model version is required');
        }

        // Properties 검증
        if (!moduleData.properties || !moduleData.properties.length) {
            errors.push('At least one property is required');
        }

        // IOVariables 검증
        if (!moduleData.ioVariables || !moduleData.ioVariables.length) {
            errors.push('At least one I/O variable is required');
        }

        // Services 검증
        if (!moduleData.services || !moduleData.services.length) {
            errors.push('At least one service is required');
        }

        // Infrastructure 검증
        if (!moduleData.infrastructure) {
            errors.push('Infrastructure information is required');
        }

        // SafeSecure 검증
        if (!moduleData.safeSecure) {
            errors.push('Safety and Security information is required');
        }

        // ExecutableForm 검증
        if (!moduleData.executableForm) {
            errors.push('Executable form information is required');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    },

    validateXMLStructure(xmlData) {
        const errors = [];

        // XML 구조 검증
        if (!xmlData.includes('<Module')) {
            errors.push('Invalid XML structure: Missing Module tag');
        }

        if (!xmlData.includes('<GenInfo')) {
            errors.push('Invalid XML structure: Missing GenInfo section');
        }

        if (!xmlData.includes('<IDnType')) {
            errors.push('Invalid XML structure: Missing IDnType section');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    },

    validateModuleID(moduleID) {
        // ModuleID 형식 검증 (64자리 16진수)
        const moduleIDPattern = /^[0-9A-Fa-f]{64}$/;

        if (!moduleID) {
            return { isValid: false, error: 'Module ID is required' };
        }

        if (!moduleIDPattern.test(moduleID)) {
            return { isValid: false, error: 'Module ID must be 64 characters hexadecimal' };
        }

        return { isValid: true };
    },

    validateCategoryInfo(categoryInfo) {
        if (!categoryInfo || !categoryInfo.l1) {
            return { isValid: false, error: 'Category information is required' };
        }

        return { isValid: true };
    }
}; 