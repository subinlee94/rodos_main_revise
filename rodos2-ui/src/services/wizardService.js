import { WIZARD_PAGES, REQUIRED_FIELDS, DEFAULT_VALUES } from '../constants/wizard';

// Wizard 데이터 검증 서비스
export const wizardValidationService = {
    // 특정 페이지의 필수 필드 검증
    validatePage(pageKey, data) {
        const requiredFields = REQUIRED_FIELDS[pageKey] || [];
        const errors = [];

        requiredFields.forEach(field => {
            // instanceId는 0도 유효한 값이므로 특별 처리
            if (field === 'instanceId') {
                if (data[field] == null || data[field] === '') {
                    errors.push(`${field} is required`);
                }
            } else if (!data[field] || data[field].toString().trim() === '') {
                errors.push(`${field} is required`);
            }
        });

        return {
            isValid: errors.length === 0,
            errors
        };
    },

    // 전체 Wizard 데이터 검증
    validateWizardData(wizardData) {
        const errors = [];
        const warnings = [];

        // 각 페이지별 검증
        Object.keys(WIZARD_PAGES).forEach(pageKey => {
            const pageData = wizardData[WIZARD_PAGES[pageKey]];
            if (pageData) {
                const validation = this.validatePage(WIZARD_PAGES[pageKey], pageData);
                errors.push(...validation.errors);
            }
        });

        // 추가 검증 로직들
        if (wizardData.genInfo) {
            // Module ID 생성 가능 여부 확인
            if (!this.canGenerateModuleID(wizardData.genInfo)) {
                warnings.push('Module ID cannot be generated. Please fill all required fields.');
            }
        }

        return {
            isValid: errors.length === 0,
            errors,
            warnings
        };
    },

    // Module ID 생성 가능 여부 확인
    canGenerateModuleID(genInfo) {
        const requiredFields = REQUIRED_FIELDS[WIZARD_PAGES.GEN_INFO];
        return requiredFields.every(field => {
            // instanceId는 0도 유효한 값이므로 특별 처리
            if (field === 'instanceId') {
                return genInfo[field] != null && genInfo[field] !== '';
            }
            return genInfo[field] && genInfo[field].toString().trim() !== '';
        });
    }
};

// Wizard 데이터 관리 서비스
export const wizardDataService = {
    // 초기 Wizard 데이터 생성
    createInitialWizardData() {
        const initialData = {};
        Object.keys(WIZARD_PAGES).forEach(pageKey => {
            const pageName = WIZARD_PAGES[pageKey];
            initialData[pageName] = DEFAULT_VALUES[pageName] || {};
        });
        return initialData;
    },

    // 특정 페이지 데이터 초기화
    resetPageData(pageKey) {
        return DEFAULT_VALUES[pageKey] || {};
    },

    // Wizard 데이터 병합
    mergeWizardData(existingData, newData) {
        return {
            ...existingData,
            ...newData
        };
    },

    // 특정 페이지 데이터 업데이트
    updatePageData(wizardData, pageKey, pageData) {
        return {
            ...wizardData,
            [pageKey]: {
                ...(wizardData[pageKey] || {}),
                ...pageData
            }
        };
    },

    // Wizard 데이터 내보내기
    exportWizardData(wizardData) {
        return {
            timestamp: new Date().toISOString(),
            data: wizardData,
            version: '1.0'
        };
    },

    // Wizard 데이터 가져오기
    importWizardData(importedData) {
        if (importedData && importedData.data) {
            return importedData.data;
        }
        return this.createInitialWizardData();
    }
};

// Wizard 진행 상태 관리 서비스
export const wizardProgressService = {
    // 완료된 페이지 확인
    getCompletedPages(wizardData) {
        const completedPages = [];

        Object.keys(WIZARD_PAGES).forEach(pageKey => {
            const pageName = WIZARD_PAGES[pageKey];
            const pageData = wizardData[pageName];

            if (pageData && this.isPageComplete(pageName, pageData)) {
                completedPages.push(pageName);
            }
        });

        return completedPages;
    },

    // 특정 페이지 완료 여부 확인
    isPageComplete(pageKey, pageData) {
        const validation = wizardValidationService.validatePage(pageKey, pageData);
        return validation.isValid;
    },

    // 진행률 계산 (0-100)
    calculateProgress(wizardData) {
        const totalPages = Object.keys(WIZARD_PAGES).length;
        const completedPages = this.getCompletedPages(wizardData).length;
        return Math.round((completedPages / totalPages) * 100);
    },

    // 다음 페이지 확인
    getNextPage(currentPage) {
        const pageOrder = Object.values(WIZARD_PAGES);
        const currentIndex = pageOrder.indexOf(currentPage);

        if (currentIndex < pageOrder.length - 1) {
            return pageOrder[currentIndex + 1];
        }
        return null;
    },

    // 이전 페이지 확인
    getPreviousPage(currentPage) {
        const pageOrder = Object.values(WIZARD_PAGES);
        const currentIndex = pageOrder.indexOf(currentPage);

        if (currentIndex > 0) {
            return pageOrder[currentIndex - 1];
        }
        return null;
    }
};

// Wizard XML 생성 서비스
export const wizardXMLService = {
    // 백엔드에 XML 생성 요청
    async generateXML(wizardData) {
        try {
            const response = await fetch('/api/module/preview-xml', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(wizardData)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.text();
        } catch (error) {
            console.error('Error generating XML:', error);
            throw error;
        }
    },

    // XML 파일 저장
    async saveXML(wizardData, fileName, onSuccess) {
        try {
            const response = await fetch('/api/module/save-xml', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(wizardData)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.text();

            // 성공 시 콜백 호출
            if (onSuccess && typeof onSuccess === 'function') {
                onSuccess();
            }

            return result;
        } catch (error) {
            console.error('Error saving XML:', error);
            throw error;
        }
    }
}; 