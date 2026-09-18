import { useEffect, useMemo, useCallback, useRef, useState } from 'react';
import { swAspectsService } from '../services/swAspectsService';
import { hwAspectsService } from '../services/hwAspectsService';

export function useIDnTypeState(idnType, onChange, genInfo, moduleID, moduleIDString) {
    const initIdnType = useMemo(() => idnType || {}, [idnType]);
    const initGenInfo = useMemo(() => genInfo || {}, [genInfo]);

    // SWAspects 관련 상태
    const [swModules, setSwModules] = useState([]);
    const [selectedSWModules, setSelectedSWModules] = useState([]);
    const [loading, setLoading] = useState(false);

    // HWAspects 관련 상태
    const [hwModules, setHwModules] = useState([]);
    const [selectedHWModules, setSelectedHWModules] = useState([]);
    const [hwLoading, setHwLoading] = useState(false);
    const swHydratedRef = useRef(false);
    const hwHydratedRef = useRef(false);
    const swInitialHydratedRef = useRef(false);
    const hwInitialHydratedRef = useRef(false);

    // genInfo.idType이 변경될 때 idnType.idtype도 자동으로 업데이트
    useEffect(() => {
        if (initGenInfo.idType && initGenInfo.idType !== initIdnType.idtype) {
            if (onChange) {
                onChange({
                    ...(initIdnType || {}),
                    idtype: initGenInfo.idType,
                    swAspects: swHydratedRef.current
                        ? swAspectsService.transformToModuleIDs(selectedSWModules)
                        : (initIdnType.swAspects || []),
                    hwAspects: hwHydratedRef.current
                        ? hwAspectsService.transformToModuleIDs(selectedHWModules)
                        : (initIdnType.hwAspects || [])
                });
            }
        }
    }, [initGenInfo.idType, initIdnType, onChange, selectedSWModules, selectedHWModules]);

    // SW 모듈 목록 로드
    const loadSWModules = useCallback(async () => {
        if (initGenInfo.idType === 'Comp') {
            setLoading(true);
            try {
                const modules = await swAspectsService.getSWModules();
                setSwModules(modules);
            } catch (error) {
                console.error('Error loading SW modules:', error);
            } finally {
                setLoading(false);
            }
        }
    }, [initGenInfo.idType]);

    // HW 모듈 목록 로드
    const loadHWModules = useCallback(async () => {
        if (initGenInfo.idType === 'Comp') {
            setHwLoading(true);
            try {
                const modules = await hwAspectsService.getHWModules();
                setHwModules(modules);
            } catch (error) {
                console.error('Error loading HW modules:', error);
            } finally {
                setHwLoading(false);
            }
        }
    }, [initGenInfo.idType]);

    // idType이 Comp일 때 SW 모듈 로드
    useEffect(() => {
        loadSWModules();
    }, [loadSWModules]);

    // idType이 Comp일 때 HW 모듈 로드
    useEffect(() => {
        loadHWModules();
    }, [loadHWModules]);

    // idnType.swAspects로 선택 SW 모듈 복원
    useEffect(() => {
        if (initGenInfo.idType !== 'Comp') return;
        if (!Array.isArray(swModules) || swModules.length === 0) return;
        if (swInitialHydratedRef.current) return;
        const swAspects = Array.isArray(initIdnType.swAspects) ? initIdnType.swAspects : [];

        const getCandidates = (aspect) => {
            if (!aspect || !aspect.mID) return [];
            const iID = `${aspect.iID || '00'}`;
            return [`${aspect.mID}-${iID}`, `${aspect.mID}${iID}`];
        };

        const restored = swModules.filter(module =>
            swAspects.some(aspect => getCandidates(aspect).includes(module.moduleID))
        );
        setSelectedSWModules(restored);
        swHydratedRef.current = true;
        swInitialHydratedRef.current = true;
    }, [initGenInfo.idType, initIdnType.swAspects, swModules]);

    // idnType.hwAspects로 선택 HW 모듈 복원
    useEffect(() => {
        if (initGenInfo.idType !== 'Comp') return;
        if (!Array.isArray(hwModules) || hwModules.length === 0) return;
        if (hwInitialHydratedRef.current) return;
        const hwAspects = Array.isArray(initIdnType.hwAspects) ? initIdnType.hwAspects : [];

        const getCandidates = (aspect) => {
            if (!aspect || !aspect.mID) return [];
            const iID = `${aspect.iID || '00'}`;
            return [`${aspect.mID}-${iID}`, `${aspect.mID}${iID}`];
        };

        const restored = hwModules.filter(module =>
            hwAspects.some(aspect => getCandidates(aspect).includes(module.moduleID))
        );
        setSelectedHWModules(restored);
        hwHydratedRef.current = true;
        hwInitialHydratedRef.current = true;
    }, [initGenInfo.idType, initIdnType.hwAspects, hwModules]);

    // SW 모듈 선택/해제 핸들러
    const handleSWModuleToggle = useCallback((module) => {
        setSelectedSWModules(prev => {
            const isSelected = prev.some(m => m.moduleID === module.moduleID);
            if (isSelected) {
                return prev.filter(m => m.moduleID !== module.moduleID);
            } else {
                return [...prev, module];
            }
        });
    }, []);

    // HW 모듈 선택/해제 핸들러
    const handleHWModuleToggle = useCallback((module) => {
        setSelectedHWModules(prev => {
            const isSelected = prev.some(m => m.moduleID === module.moduleID);
            if (isSelected) {
                return prev.filter(m => m.moduleID !== module.moduleID);
            } else {
                return [...prev, module];
            }
        });
    }, []);

    // 선택된 SW 모듈들을 SWAspects로 변환하여 저장
    const updateSWAspects = useCallback(() => {
        if (onChange) {
            const swModuleIDs = swAspectsService.transformToModuleIDs(selectedSWModules);
            const hwModuleIDs = hwAspectsService.transformToModuleIDs(selectedHWModules);
            onChange({
                ...(initIdnType || {}),
                swAspects: swModuleIDs,
                hwAspects: hwModuleIDs
            });
        }
    }, [selectedSWModules, selectedHWModules, initIdnType, onChange]);

    // 선택된 HW 모듈들을 HWAspects로 변환하여 저장
    const updateHWAspects = useCallback(() => {
        if (onChange) {
            const swModuleIDs = swAspectsService.transformToModuleIDs(selectedSWModules);
            const hwModuleIDs = hwAspectsService.transformToModuleIDs(selectedHWModules);
            onChange({
                ...(initIdnType || {}),
                swAspects: swModuleIDs,
                hwAspects: hwModuleIDs
            });
        }
    }, [selectedSWModules, selectedHWModules, initIdnType, onChange]);

    // 선택된 SW 모듈이 변경될 때마다 SWAspects 업데이트
    useEffect(() => {
        if (initGenInfo.idType === 'Comp' && swHydratedRef.current) {
            updateSWAspects();
        }
    }, [selectedSWModules, updateSWAspects, initGenInfo.idType]);

    // 선택된 HW 모듈이 변경될 때마다 HWAspects 업데이트
    useEffect(() => {
        if (initGenInfo.idType === 'Comp' && hwHydratedRef.current) {
            updateHWAspects();
        }
    }, [selectedHWModules, updateHWAspects, initGenInfo.idType]);

    // 이벤트 핸들러
    const handleInputChange = useCallback((e) => {
        const { name, value } = e.target;
        console.log(`IDnTypePage - handleInputChange: ${name} = ${value}`);
        if (onChange) {
            // swAspects와 hwAspects를 유지하기 위해 현재 선택된 모듈에서 가져옴
            const currentSWAspects = swHydratedRef.current
                ? swAspectsService.transformToModuleIDs(selectedSWModules)
                : (initIdnType.swAspects || []);
            const currentHWAspects = hwHydratedRef.current
                ? hwAspectsService.transformToModuleIDs(selectedHWModules)
                : (initIdnType.hwAspects || []);
            const newData = { 
                ...(initIdnType || {}), 
                [name]: value, 
                moduleID, 
                moduleIDString,
                idtype: initGenInfo.idType || initIdnType.idtype || '',
                swAspects: currentSWAspects,
                hwAspects: currentHWAspects
            };
            console.log(`IDnTypePage - calling onChange with:`, newData);
            onChange(newData);
        }
    }, [initIdnType, onChange, moduleID, moduleIDString, selectedSWModules, selectedHWModules]);

    return {
        initIdnType,
        initGenInfo,
        handleInputChange,
        swModules,
        selectedSWModules,
        loading,
        handleSWModuleToggle,
        hwModules,
        selectedHWModules,
        hwLoading,
        handleHWModuleToggle
    };
} 