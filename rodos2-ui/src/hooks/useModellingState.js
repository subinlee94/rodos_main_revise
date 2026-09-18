import { useState, useCallback } from 'react';

export function useModellingState() {
    const [modelCases, setModelCases] = useState([]);

    // Model Case 관리
    const addModelCase = useCallback((modelCase) => {
        setModelCases(prev => [...prev, modelCase]);
    }, []);

    const updateModelCase = useCallback((index, updatedModelCase) => {
        setModelCases(prev => prev.map((mc, i) => i === index ? updatedModelCase : mc));
    }, []);

    const removeModelCase = useCallback((index) => {
        setModelCases(prev => prev.filter((_, i) => i !== index));
    }, []);

    // Model File 관리
    const addModelFile = useCallback((modelCaseIndex, modelFile) => {
        setModelCases(prev => prev.map((mc, i) => {
            if (i === modelCaseIndex) {
                return {
                    ...mc,
                    modelFiles: [...(mc.modelFiles || []), modelFile]
                };
            }
            return mc;
        }));
    }, []);

    const removeModelFile = useCallback((modelCaseIndex, fileIndex) => {
        setModelCases(prev => prev.map((mc, i) => {
            if (i === modelCaseIndex) {
                return {
                    ...mc,
                    modelFiles: mc.modelFiles.filter((_, fi) => fi !== fileIndex)
                };
            }
            return mc;
        }));
    }, []);

    // Dynamic SW 관리
    const addDynamicSW = useCallback((modelCaseIndex, dynamicSW) => {
        setModelCases(prev => prev.map((mc, i) => {
            if (i === modelCaseIndex) {
                return {
                    ...mc,
                    dynamicSWs: [...(mc.dynamicSWs || []), dynamicSW]
                };
            }
            return mc;
        }));
    }, []);

    const removeDynamicSW = useCallback((modelCaseIndex, swIndex) => {
        setModelCases(prev => prev.map((mc, i) => {
            if (i === modelCaseIndex) {
                return {
                    ...mc,
                    dynamicSWs: mc.dynamicSWs.filter((_, si) => si !== swIndex)
                };
            }
            return mc;
        }));
    }, []);

    // Additional Info 관리
    const addAdditionalInfo = useCallback((modelCaseIndex, additionalInfo) => {
        setModelCases(prev => prev.map((mc, i) => {
            if (i === modelCaseIndex) {
                return {
                    ...mc,
                    additionalInfo: [...(mc.additionalInfo || []), additionalInfo]
                };
            }
            return mc;
        }));
    }, []);

    const removeAdditionalInfo = useCallback((modelCaseIndex, infoIndex) => {
        setModelCases(prev => prev.map((mc, i) => {
            if (i === modelCaseIndex) {
                return {
                    ...mc,
                    additionalInfo: mc.additionalInfo.filter((_, ii) => ii !== infoIndex)
                };
            }
            return mc;
        }));
    }, []);

    const updateAdditionalInfo = useCallback((modelCaseIndex, infoIndex, updatedInfo) => {
        setModelCases(prev => prev.map((mc, i) => {
            if (i === modelCaseIndex) {
                return {
                    ...mc,
                    additionalInfo: mc.additionalInfo.map((info, ii) =>
                        ii === infoIndex ? updatedInfo : info
                    )
                };
            }
            return mc;
        }));
    }, []);

    // 초기화
    const resetModelling = useCallback(() => {
        setModelCases([]);
    }, []);

    // 데이터 로드
    const loadModelling = useCallback((data) => {
        if (data && data.list_simulationModel) {
            // 현재 상태와 비교하여 실제로 다를 때만 업데이트
            setModelCases(prevCases => {
                const newCases = data.list_simulationModel;
                if (JSON.stringify(prevCases) !== JSON.stringify(newCases)) {
                    return newCases;
                }
                return prevCases;
            });
        }
    }, []);

    return {
        modelCases,
        addModelCase,
        updateModelCase,
        removeModelCase,
        addModelFile,
        removeModelFile,
        addDynamicSW,
        removeDynamicSW,
        addAdditionalInfo,
        removeAdditionalInfo,
        updateAdditionalInfo,
        resetModelling,
        loadModelling
    };
}
