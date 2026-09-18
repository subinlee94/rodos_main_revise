import { VALIDATION_RULES } from '../../constants/wizard';

// 입력 검증 유틸리티
export const inputValidationHelpers = {
    // 16진수 2자리 검증
    validateHex2(value) {
        const rule = VALIDATION_RULES.HEX_2;
        return rule.pattern.test(value) && value.length <= rule.maxLength;
    },

    // 16진수 4자리 검증
    validateHex4(value) {
        const rule = VALIDATION_RULES.HEX_4;
        return rule.pattern.test(value) && value.length <= rule.maxLength;
    },

    // 시리얼 번호 검증
    validateSerialNumber(value) {
        const rule = VALIDATION_RULES.SERIAL_NUMBER;
        const numValue = parseInt(value, 10);
        return rule.pattern.test(value) && numValue <= rule.maxValue;
    },

    // 인스턴스 ID 검증
    validateInstanceId(value) {
        const rule = VALIDATION_RULES.INSTANCE_ID;
        const numValue = parseInt(value, 10);
        return rule.pattern.test(value) && numValue <= rule.maxValue;
    },

    // 입력값 정규화
    normalizeHexInput(value, maxLength) {
        return value.toUpperCase().replace(/[^0-9A-F]/g, '').slice(0, maxLength);
    },

    normalizeNumericInput(value, maxValue) {
        const numValue = parseInt(value.replace(/[^0-9]/g, ''), 10);
        return Math.min(numValue, maxValue).toString();
    }
};

// 데이터 변환 유틸리티
export const dataTransformationHelpers = {
    // 카테고리 정보를 Module ID 생성용으로 변환
    transformCategoryInfo(category1, category2) {
        return {
            category1,
            category2,
            categoryId: `${category1}_${category2}`.toUpperCase()
        };
    },

    // GenInfo를 Module ID 생성용으로 변환
    transformGenInfoForModuleID(genInfo) {
        return {
            manufacturer: genInfo.manufacturer || '',
            vendorPid1: genInfo.vendorPid1 || '',
            vendorPid2: genInfo.vendorPid2 || '',
            vendorPid3: genInfo.vendorPid3 || '',
            revisionNumber1: genInfo.revisionNumber1 || '',
            revisionNumber2: genInfo.revisionNumber2 || '',
            serialNumber: genInfo.serialNumber || '',
            instanceId: genInfo.instanceId || ''
        };
    },

    // 트리 데이터를 평면화
    flattenTreeData(treeData) {
        const flattened = [];

        const traverse = (nodes, path = []) => {
            nodes.forEach((node, index) => {
                const currentPath = [...path, index];
                flattened.push({
                    ...node,
                    path: currentPath
                });

                if (node.children && node.children.length > 0) {
                    traverse(node.children, currentPath);
                }
            });
        };

        if (Array.isArray(treeData)) {
            traverse(treeData);
        }

        return flattened;
    },

    // 평면화된 데이터를 트리로 변환
    unflattenTreeData(flattenedData) {
        const tree = [];

        flattenedData.forEach(item => {
            const { path, ...nodeData } = item;
            let currentLevel = tree;

            path.forEach((index, level) => {
                if (level === path.length - 1) {
                    currentLevel[index] = { ...nodeData };
                } else {
                    if (!currentLevel[index]) {
                        currentLevel[index] = { children: [] };
                    }
                    currentLevel = currentLevel[index].children;
                }
            });
        });

        return tree;
    }
};

// UI 상태 관리 유틸리티
export const uiStateHelpers = {
    // 탭 상태 토글
    toggleTab(activeTab, newTab) {
        return activeTab === newTab ? activeTab : newTab;
    },

    // 선택된 노드 경로 업데이트
    updateSelectedNodePath(currentPath, newPath) {
        return newPath || [];
    },

    // 입력 필드 초기화
    resetInputFields(fields) {
        const resetFields = {};
        fields.forEach(field => {
            resetFields[field] = '';
        });
        return resetFields;
    },

    // 복합 입력 필드 초기화
    resetComplexInputFields(fieldGroups) {
        const resetFields = {};
        Object.keys(fieldGroups).forEach(group => {
            resetFields[group] = fieldGroups[group].reduce((acc, field) => {
                acc[field] = '';
                return acc;
            }, {});
        });
        return resetFields;
    }
};

// 검증 메시지 유틸리티
export const validationMessageHelpers = {
    // 필드별 검증 메시지 생성
    getFieldValidationMessage(fieldName, value, rule) {
        if (!value || value.toString().trim() === '') {
            return `${fieldName} is required`;
        }

        if (rule && !rule.pattern.test(value)) {
            return rule.message || `${fieldName} format is invalid`;
        }

        return null;
    },

    // 전체 폼 검증 메시지 생성
    getFormValidationMessages(formData, validationRules) {
        const messages = [];

        Object.keys(validationRules).forEach(fieldName => {
            const rule = validationRules[fieldName];
            const value = formData[fieldName];
            const message = this.getFieldValidationMessage(fieldName, value, rule);

            if (message) {
                messages.push(message);
            }
        });

        return messages;
    },

    // 경고 메시지 생성
    getWarningMessage(fieldName, currentValue, recommendedValue) {
        if (currentValue !== recommendedValue) {
            return `${fieldName} is recommended to be "${recommendedValue}"`;
        }
        return null;
    }
};

// 데이터 검증 유틸리티
export const dataValidationHelpers = {
    // 객체의 필수 필드 확인
    validateRequiredFields(data, requiredFields) {
        const missingFields = [];

        requiredFields.forEach(field => {
            // instanceId는 0도 유효한 값이므로 특별 처리
            if (field === 'instanceId') {
                if (data[field] == null || data[field] === '') {
                    missingFields.push(field);
                }
            } else if (!data[field] || data[field].toString().trim() === '') {
                missingFields.push(field);
            }
        });

        return {
            isValid: missingFields.length === 0,
            missingFields
        };
    },

    // 중복 값 확인
    validateUniqueValues(data, fieldName) {
        const values = data[fieldName] || [];
        const uniqueValues = new Set(values);

        return {
            isValid: values.length === uniqueValues.size,
            duplicates: values.filter((value, index) => values.indexOf(value) !== index)
        };
    },

    // 값 범위 확인
    validateValueRange(value, min, max) {
        const numValue = parseFloat(value);
        return {
            isValid: !isNaN(numValue) && numValue >= min && numValue <= max,
            value: numValue,
            range: { min, max }
        };
    }
}; 