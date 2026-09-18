import { useState, useCallback, useEffect } from 'react';
import { canvasAPI } from '../services/api';

export function useCanvasState() {
    const [hwModules, setHwModules] = useState([]);
    const [dragOverHexIdx, setDragOverHexIdx] = useState(null);
    const [draggedModuleIdx, setDraggedModuleIdx] = useState(null);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const [draggedSWModule, setDraggedSWModule] = useState(null);

    // Canvas 상태 저장 - 먼저 정의
    const saveCanvasState = useCallback(async (lastFile = '') => {
        try {
            await canvasAPI.saveCanvasState(hwModules, lastFile);
            console.log('Canvas state saved successfully');
        } catch (error) {
            console.error('Failed to save canvas state:', error);
        }
    }, [hwModules]);

    const addHWModule = useCallback((name, x, y, moduleType, ref = null, classifier = null, controllerInfoModel = null, moduleID = '') => {
        console.log('addHWModule 호출됨:', { name, x, y, moduleType, ref, classifier, controllerInfoModel, moduleID });
        setHwModules(prev => {
            const normalizedType = `${moduleType || ''}`.toLowerCase();
            const storesParentInfoModel = normalizedType === 'controller' || normalizedType === 'robot';
            const newModule = {
                name,
                x,
                y,
                type: moduleType,
                moduleType: moduleType, // Canvas.js에서 사용하는 필드
                ref: ref, // SharedUserState의 ref 정보
                moduleID: moduleID || ref || '',
                classifier: classifier, // SharedUserState의 classifier 정보
                swModules: [],
                isComposite: false // Composite 모듈 여부
            };
            if (storesParentInfoModel && controllerInfoModel) {
                newModule.controllerInfoModel = controllerInfoModel;
            }
            console.log('새로운 HW 모듈 생성:', newModule);
            const newModules = [...prev, newModule];
            console.log('전체 HW 모듈 목록:', newModules);
            // 즉시 저장
            setTimeout(() => saveCanvasState(), 100);
            return newModules;
        });
    }, [saveCanvasState]);

    const linkControllerToRobot = useCallback((controllerIdx, robotIdx) => {
        setHwModules(prev => {
            const controller = prev[controllerIdx];
            const robot = prev[robotIdx];
            if (!controller || !robot || `${controller.moduleType || controller.type}`.toLowerCase() !== 'controller'
                || `${robot.moduleType || robot.type}`.toLowerCase() !== 'robot') return prev;

            const parentRobotRef = robot.moduleID || robot.ref || robot.name;
            return prev.map((module, idx) => idx === controllerIdx ? {
                ...module,
                parentRobotRef,
                parentRobotName: robot.name,
                x: robot.x,
                y: robot.y
            } : module);
        });
    }, []);

    const updateHWModulePosition = useCallback((idx, x, y) => {
        setHwModules(prev => {
            const newModules = prev.map((hw, i) =>
                i === idx ? { ...hw, x, y } : hw
            );
            return newModules;
        });
    }, []);

    const updateHWModuleToComposite = useCallback((idx, compositeData) => {
        setHwModules(prev => {
            const newModules = prev.map((hw, i) =>
                i === idx ? {
                    ...hw,
                    isComposite: true,
                    compositeData: compositeData,
                    controllerInfoModel: {
                        ...(hw.controllerInfoModel || {}),
                        ...(compositeData?.controllerInfoModel || {})
                    },
                    originalModuleType: hw.moduleType, // 원래 모듈 타입 저장
                    moduleType: 'composite'
                } : hw
            );
            // 즉시 저장
            setTimeout(() => saveCanvasState(), 100);
            return newModules;
        });
    }, [saveCanvasState]);

    const updateControllerModuleInfo = useCallback((idx, controllerInfoModel) => {
        setHwModules(prev => {
            const nextModules = prev.map((hw, i) => {
                if (i !== idx) return hw;
                return {
                    ...hw,
                    controllerInfoModel: {
                        ...(hw.controllerInfoModel || {}),
                        ...(controllerInfoModel || {})
                    }
                };
            });
            setTimeout(() => saveCanvasState(), 100);
            return nextModules;
        });
    }, [saveCanvasState]);

    const addSWModule = useCallback((hwIdx, name, x, y, moduleType, moduleID = '') => {
        console.log('addSWModule 호출됨:', { hwIdx, name, x, y, moduleType, moduleID });
        setHwModules(prev => {
            console.log('현재 HW 모듈들:', prev);
            const newModules = prev.map((hw, i) => {
                if (i === hwIdx) {
                    const newSwModule = {
                        name,
                        x,
                        y,
                        type: moduleType,
                        moduleType: moduleType, // Canvas.js에서 사용하는 필드
                        moduleID
                    };
                    console.log('새로운 SW 모듈 추가:', newSwModule);
                    return {
                        ...hw,
                        swModules: [...(hw.swModules || []), newSwModule]
                    };
                }
                return hw;
            });
            console.log('업데이트된 HW 모듈들:', newModules);
            // 즉시 저장
            setTimeout(() => saveCanvasState(), 100);
            return newModules;
        });
    }, [saveCanvasState]);

    const updateSWModulePosition = useCallback((hwIdx, swIdx, x, y) => {
        setHwModules(prev => {
            const newModules = prev.map((hw, i) => {
                if (i === hwIdx) {
                    const newSwModules = [...hw.swModules];
                    newSwModules[swIdx] = { ...newSwModules[swIdx], x, y };
                    return { ...hw, swModules: newSwModules };
                }
                return hw;
            });
            return newModules;
        });
    }, []);

    const removeSWModule = useCallback((hwIdx, swIdx) => {
        setHwModules(prev => {
            const newModules = prev.map((hw, i) => {
                if (i === hwIdx) {
                    return {
                        ...hw,
                        swModules: hw.swModules.filter((_, j) => j !== swIdx)
                    };
                }
                return hw;
            });
            // 즉시 저장
            setTimeout(() => saveCanvasState(), 100);
            return newModules;
        });
    }, [saveCanvasState]);

    const removeHWModule = useCallback((hwIdx) => {
        setHwModules(prev => {
            const target = prev[hwIdx];
            if (!target) return prev;

            const targetType = `${target.moduleType || target.type || ''}`.toLowerCase();
            const targetRefs = new Set([target.moduleID, target.ref, target.name].filter(Boolean));

            return prev.filter((module, idx) => {
                if (idx === hwIdx) return false;
                if (targetType !== 'robot') return true;
                return !targetRefs.has(module.parentRobotRef);
            });
        });
    }, []);

    const setDragState = useCallback((moduleIdx, offset) => {
        setDraggedModuleIdx(moduleIdx);
        setDragOffset(offset);
    }, []);

    const setSWDragState = useCallback((hwIdx, swIdx, offset) => {
        setDraggedSWModule({ hwIdx, swIdx, offset });
    }, []);

    const clearDragState = useCallback(() => {
        setDraggedModuleIdx(null);
        setDraggedSWModule(null);
    }, []);

    // Canvas 상태 로드 - 새로고침 안전성 개선
    const loadCanvasState = useCallback(async () => {
        try {
            const response = await canvasAPI.loadCanvasState();
            if (response && response.hwModules) {
                setHwModules(response.hwModules);
                console.log('Canvas state loaded successfully');
                return response;
            }
            // 응답이 없거나 hwModules가 없는 경우 빈 상태로 설정
            setHwModules([]);
            return { hwModules: [], lastFile: '' };
        } catch (error) {
            console.error('Failed to load canvas state:', error);
            // 로드 실패 시 빈 상태로 초기화
            setHwModules([]);
            return { hwModules: [], lastFile: '' };
        }
    }, []);

    // 마지막 파일 경로 가져오기
    const getLastFile = useCallback(async () => {
        try {
            return await canvasAPI.getLastFile();
        } catch (error) {
            console.error('Failed to get last file:', error);
            return '';
        }
    }, []);

    // 마지막 파일 경로 설정
    const setLastFile = useCallback(async (lastFile) => {
        try {
            await canvasAPI.setLastFile(lastFile);
        } catch (error) {
            console.error('Failed to set last file:', error);
        }
    }, []);

    // Configuration 저장
    const saveConfiguration = useCallback(async (fileName) => {
        try {
            await canvasAPI.saveConfiguration(fileName);
            console.log('Configuration saved successfully:', fileName);
        } catch (error) {
            console.error('Failed to save configuration:', error);
            throw error;
        }
    }, []);

    // Configuration 파일 목록 가져오기
    const getConfigurationFiles = useCallback(async () => {
        try {
            return await canvasAPI.getConfigurationFiles();
        } catch (error) {
            console.error('Failed to get configuration files:', error);
            return [];
        }
    }, []);

    // Configuration 열기
    const openConfiguration = useCallback(async (fileName) => {
        try {
            const response = await canvasAPI.openConfiguration(fileName);
            setHwModules(response.hwModules || []);
            return response;
        } catch (error) {
            console.error('Failed to open configuration:', error);
            throw error;
        }
    }, []);

    // 새 Configuration 생성
    const newConfiguration = useCallback(async () => {
        try {
            const response = await canvasAPI.newConfiguration();
            setHwModules(response.hwModules || []);
            return response;
        } catch (error) {
            console.error('Failed to create new configuration:', error);
            throw error;
        }
    }, []);

    // 자동 로딩 제거 - 필요할 때만 수동으로 호출
    // useEffect(() => {
    //     loadCanvasState();
    // }, [loadCanvasState]);

    // HW 모듈 변경 시 자동 저장 (디바운스 적용) - 위치 변경 시에만
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (hwModules.length > 0) {
                saveCanvasState();
            }
        }, 2000); // 2초 후 저장 (위치 변경 시에만)

        return () => clearTimeout(timeoutId);
    }, [hwModules, saveCanvasState]);

    return {
        hwModules,
        dragOverHexIdx,
        draggedModuleIdx,
        dragOffset,
        draggedSWModule,
        setDragOverHexIdx,
        addHWModule,
        updateHWModulePosition,
        updateHWModuleToComposite,
        updateControllerModuleInfo,
        linkControllerToRobot,
        addSWModule,
        updateSWModulePosition,
        removeSWModule,
        removeHWModule,
        setDragState,
        setSWDragState,
        clearDragState,
        saveCanvasState,
        loadCanvasState,
        getLastFile,
        setLastFile,
        saveConfiguration,
        getConfigurationFiles,
        openConfiguration,
        newConfiguration
    };
} 
