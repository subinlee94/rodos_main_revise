import { useState, useCallback, useRef } from 'react';
import { canvasAPI } from '../services/api';

// 모듈 진행 상태 관리 훅
export function useModuleProgress() {
    const [moduleProgress, setModuleProgress] = useState({});
    const [overallProgress, setOverallProgress] = useState(0);
    const [isRunning, setIsRunning] = useState(false);

    const progressTimeouts = useRef({});
    const progressIntervals = useRef({});

    // Agent 응답에서 특정 모듈의 결과 찾기
    const findModuleResult = useCallback((result, moduleName) => {
        if (!result || !result.result) {
            return null;
        }

        // result.result가 배열인 경우 (Agent 응답)
        if (Array.isArray(result.result)) {
            return result.result.find(item =>
                item.moduleName === moduleName ||
                item.clusterName === moduleName
            );
        }

        // result.result가 객체인 경우
        if (typeof result.result === 'object') {
            return result.result[moduleName] || null;
        }

        return null;
    }, []);

    // 모듈 진행 상태 업데이트
    const updateModuleProgress = useCallback((moduleId, progressData) => {
        setModuleProgress(prev => ({
            ...prev,
            [moduleId]: {
                ...prev[moduleId],
                ...progressData,
                lastUpdated: Date.now()
            }
        }));
    }, []);

    // 전체 작업 시작 (Execute/Deploy/Stop)
    const startOverallOperation = useCallback(async (operation) => {
        console.log('=== startOverallOperation 호출됨 ===');
        console.log('Operation:', operation);
        console.log('현재 시간:', new Date().toISOString());

        setIsRunning(true);
        setOverallProgress(0);
        setModuleProgress({});

        try {
            // 현재 캔버스의 모듈 정보 가져오기
            console.log('canvasAPI.getHWModules() 호출 시작...');
            const hwModules = await canvasAPI.getHWModules();
            console.log('canvasAPI.getHWModules() 응답:', hwModules);
            const modules = [];

            // 각 HW 모듈의 Software 모듈들을 수집
            console.log('HW 모듈 수집 시작, 총 개수:', hwModules.length);
            hwModules.forEach((hwModule, index) => {
                console.log(`HW 모듈 ${index}:`, hwModule);
                const swModules = hwModule.swModules || [];
                console.log(`  - swModules:`, swModules);
                if (Array.isArray(swModules) && swModules.length > 0) {
                    swModules.forEach(swModule => {
                        const moduleInfo = {
                            id: `${hwModule.name}-${swModule.name}`,
                            name: swModule.name,
                            hwName: hwModule.name,
                            hwTarget: hwModule.target,
                            moduleName: swModule.name
                        };
                        console.log('  - 추가할 모듈:', moduleInfo);
                        modules.push(moduleInfo);
                    });
                }
            });
            console.log('수집된 총 모듈 개수:', modules.length);

            if (modules.length === 0) {
                setIsRunning(false);
                return;
            }

            // 각 모듈을 pending 상태로 초기화
            const initialProgress = {};
            modules.forEach(module => {
                initialProgress[module.id] = {
                    status: 'pending',
                    progress: 0,
                    operation,
                    moduleName: module.name,
                    hwName: module.hwName,
                    hwTarget: module.hwTarget
                };
            });
            setModuleProgress(initialProgress);

            // API 호출
            console.log(`Starting ${operation} operation with ${modules.length} modules`);
            let apiCall;
            switch (operation) {
                case 'execute':
                    console.log('Calling canvasAPI.executeModules()');
                    apiCall = canvasAPI.executeModules();
                    break;
                case 'deploy':
                    console.log('Calling canvasAPI.deployModules()');
                    apiCall = canvasAPI.deployModules();
                    break;
                case 'stop':
                    console.log('Calling canvasAPI.stopModules()');
                    apiCall = canvasAPI.stopModules();
                    break;
                default:
                    throw new Error(`Unknown operation: ${operation}`);
            }

            // 모든 모듈을 running 상태로 변경
            const runningProgress = {};
            modules.forEach(module => {
                runningProgress[module.id] = {
                    ...initialProgress[module.id],
                    status: 'running',
                    progress: 50
                };
            });
            setModuleProgress(runningProgress);

            // API 호출 실행
            console.log('Executing API call...');
            const result = await apiCall;
            console.log('API call result:', result);

            // Agent 응답 분석하여 각 모듈 상태 업데이트
            const finalProgress = {};

            // 새로운 응답 형식 처리
            if (result.status === 'success') {
                console.log('Execute 성공:', result.message);
                console.log('요청된 컨테이너:', result.requested_containers);
                console.log('총 요청 수:', result.total_requested);

                // 모든 모듈을 성공 상태로 설정
                modules.forEach(module => {
                    finalProgress[module.id] = {
                        ...runningProgress[module.id],
                        status: 'completed',
                        progress: 100,
                        message: result.message || 'Container deployment successful',
                        containerName: result.requested_containers?.includes(module.name) ?
                            `${module.name}_container` : 'N/A'
                    };
                });
            } else {
                console.log('Execute 실패:', result.message || result.error);

                // 모든 모듈을 실패 상태로 설정
                modules.forEach(module => {
                    finalProgress[module.id] = {
                        ...runningProgress[module.id],
                        status: 'error',
                        progress: 0,
                        error: result.message || result.error || 'Operation failed',
                        message: 'Failed'
                    };
                });
            }

            setModuleProgress(finalProgress);
            setOverallProgress(100);

        } catch (error) {
            console.error(`${operation} failed:`, error);

            // 에러 상태로 업데이트
            const errorProgress = {};
            Object.keys(moduleProgress).forEach(moduleId => {
                errorProgress[moduleId] = {
                    ...moduleProgress[moduleId],
                    status: 'error',
                    progress: 0,
                    error: error.message
                };
            });
            setModuleProgress(errorProgress);
            setOverallProgress(100);
        } finally {
            setIsRunning(false);
        }
    }, [updateModuleProgress]);

    // 진행 상태 초기화
    const resetProgress = useCallback(() => {
        // 모든 타이머 정리
        Object.values(progressTimeouts.current).forEach(timeout => clearTimeout(timeout));
        Object.values(progressIntervals.current).forEach(interval => clearInterval(interval));
        progressTimeouts.current = {};
        progressIntervals.current = {};

        // 상태 초기화
        setModuleProgress({});
        setOverallProgress(0);
        setIsRunning(false);
    }, []);

    // 특정 모듈의 진행 상태 가져오기
    const getModuleProgress = useCallback((moduleId) => {
        return moduleProgress[moduleId] || {
            status: 'idle',
            progress: 0,
            moduleName: '',
            operation: ''
        };
    }, [moduleProgress]);

    // 실행 중인 모듈 수 가져오기
    const getRunningModulesCount = useCallback(() => {
        return Object.values(moduleProgress).filter(progress => progress.status === 'running').length;
    }, [moduleProgress]);

    // 완료된 모듈 수 가져오기
    const getCompletedModulesCount = useCallback(() => {
        return Object.values(moduleProgress).filter(progress =>
            progress.status === 'completed' || progress.status === 'error'
        ).length;
    }, [moduleProgress]);

    return {
        moduleProgress,
        overallProgress,
        isRunning,
        updateModuleProgress,
        startOverallOperation,
        resetProgress,
        getModuleProgress,
        getRunningModulesCount,
        getCompletedModulesCount
    };
}