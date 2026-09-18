import { useState, useEffect, useMemo } from 'react';
import { CATEGORY_OPTIONS, getCategoryInfo } from '../utils/module/Category';
import { generateModuleID } from '../utils/module/ModuleID';

export function useGenInfoState(genInfo, onChange, onModuleIdChange, wizardType = 'software') {
    // genInfo가 null이면 빈 객체로 초기화
    const initGenInfo = useMemo(() => genInfo || {}, [genInfo]);
    
    // wizardType에 따라 moduleCategory 자동 설정
    const getModuleCategory = () => {
        if (wizardType === 'robot') {
            return 'robot';
        } else {
            // controller, software 등은 'another'
            return 'another';
        }
    };
    
    // 초기 genInfo에 moduleCategory 및 idType 추가
    const initGenInfoWithCategory = useMemo(() => {
        // controller나 robot일 때는 idType을 'Comp'로 강제 설정
        const shouldForceComposite = wizardType === 'controller' || wizardType === 'robot';
        return {
            ...initGenInfo,
            moduleCategory: initGenInfo.moduleCategory || getModuleCategory(),
            idType: shouldForceComposite ? 'Comp' : (initGenInfo.idType || '')
        };
    }, [initGenInfo, wizardType]);
    
    const [genInfoState, setGenInfoState] = useState(initGenInfoWithCategory);

    // 2단계 카테고리 드롭다운 상태만 local state
    const [selectedCategory1, setSelectedCategory1] = useState(initGenInfoWithCategory.category1 || '');
    const [selectedCategory2, setSelectedCategory2] = useState(initGenInfoWithCategory.category2 || '');

    // 초기 로드 시에만 상태를 설정하고, 이후에는 로컬 상태를 유지
    useEffect(() => {
        // genInfoState가 비어있을 때만 초기화 (첫 로드 시)
        if (!genInfoState.moduleName && !genInfoState.manufacturer) {
            setGenInfoState(initGenInfoWithCategory);
            setSelectedCategory1(initGenInfoWithCategory.category1 || '');
            setSelectedCategory2(initGenInfoWithCategory.category2 || '');
        }
    }, [initGenInfoWithCategory, genInfoState.moduleName, genInfoState.manufacturer]);
    
    // wizardType 변경 시 moduleCategory 및 idType 업데이트
    useEffect(() => {
        const newModuleCategory = getModuleCategory();
        const shouldForceComposite = wizardType === 'controller' || wizardType === 'robot';
        const newIdType = shouldForceComposite ? 'Comp' : (genInfoState.idType || '');
        
        setGenInfoState(prev => {
            const needsUpdate = prev.moduleCategory !== newModuleCategory || 
                                (shouldForceComposite && prev.idType !== 'Comp');
            
            if (needsUpdate) {
                const updated = {
                    ...prev,
                    moduleCategory: newModuleCategory,
                    ...(shouldForceComposite && { idType: 'Comp' })
                };
                if (onChange) {
                    onChange(updated);
                }
                return updated;
            }
            return prev;
        });
    }, [wizardType, onChange]);

    // 필수 입력값 체크 함수 (Description, Examples 제외)
    const isRequiredFilled = () => {
        return (
            genInfoState.moduleName &&
            genInfoState.manufacturer &&
            genInfoState.vendorPid1 && genInfoState.vendorPid2 && genInfoState.vendorPid3 &&
            genInfoState.revisionNumber1 && genInfoState.revisionNumber2 &&
            genInfoState.serialNumber &&
            (genInfoState.instanceId != null && genInfoState.instanceId !== '') &&
            genInfoState.idType &&
            selectedCategory1 && selectedCategory2
        );
    };

    // moduleID 생성
    // 입력기 타입에 따라 level0 결정: 'software' 또는 'composite' = '10', 'controller' 또는 'robot' = '00'
    const level0 = (wizardType === 'controller' || wizardType === 'robot') ? '00' : '10';
    const categoryInfo = getCategoryInfo(selectedCategory1, selectedCategory2, level0);
    const moduleID = isRequiredFilled()
        ? generateModuleID(genInfoState, categoryInfo, genInfoState.instanceId)
        : null;

    // moduleID가 생성되면 부모(WizardDialog 등)에 전달
    useEffect(() => {
        if (moduleID && onModuleIdChange) {
            onModuleIdChange(moduleID);
        }
    }, [moduleID, onModuleIdChange]);

    // moduleID 문자열 생성 (UI 표시용)
    const moduleIDString = moduleID ? `${moduleID.mID}-${moduleID.iID}` : null;

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        const updated = { ...genInfoState, [name]: value };
        setGenInfoState(updated);
        if (onChange) onChange(updated);
    };

    const handleToggleChange = (name) => {
        const updated = { ...genInfoState, [name]: !(genInfoState?.[name] || false) };
        setGenInfoState(updated);
        if (onChange) onChange(updated);
    };

    const handleCompositeTypeChange = (type) => {
        // controller나 robot일 때는 변경 불가
        if (wizardType === 'controller' || wizardType === 'robot') {
            return;
        }
        const idType = type === 'basic' ? 'Bas' : 'Comp';
        const updated = {
            ...genInfoState,
            idType: idType
        };
        setGenInfoState(updated);
        if (onChange) onChange(updated);
    };

    const handleCategory1Change = (e) => {
        setSelectedCategory1(e.target.value);
        setSelectedCategory2('');
        const updated = { ...genInfoState, category1: e.target.value, category2: '' };
        setGenInfoState(updated);
        if (onChange) onChange(updated);
    };

    const handleCategory2Change = (e) => {
        setSelectedCategory2(e.target.value);
        const updated = { ...genInfoState, category2: e.target.value };
        setGenInfoState(updated);
        if (onChange) onChange(updated);
    };

    const category2Options = CATEGORY_OPTIONS.find(opt => opt.value === selectedCategory1)?.children || [];

    // 16진수 2자리만 허용
    const handleHex2Input = (e) => {
        let value = e.target.value.toUpperCase().replace(/[^0-9A-F]/g, '').slice(0, 2);
        const updated = { ...genInfoState, [e.target.name]: value };
        setGenInfoState(updated);
        if (onChange) onChange(updated);
    };

    // 16진수 4자리만 허용 (Revision Number Major/Minor)
    const handleHex4Input = (e) => {
        let value = e.target.value.toUpperCase().replace(/[^0-9A-F]/g, '').slice(0, 4);
        const updated = { ...genInfoState, [e.target.name]: value };
        setGenInfoState(updated);
        if (onChange) onChange(updated);
    };

    // 10진수, 최대값 제한 (Serial Number)
    const handleSerialInput = (e) => {
        let value = e.target.value.replace(/[^0-9]/g, '');
        if (value.length > 10) value = value.slice(0, 10);
        if (Number(value) > 4294967295) value = '4294967295';
        const updated = { ...genInfoState, [e.target.name]: value };
        setGenInfoState(updated);
        if (onChange) onChange(updated);
    };

    // 0~255만 허용 (Instance ID)
    const handleInstanceIdInput = (e) => {
        let value = e.target.value.replace(/[^0-9]/g, '');
        if (Number(value) > 255) value = '255';
        const updated = { ...genInfoState, [e.target.name]: value };
        setGenInfoState(updated);
        if (onChange) onChange(updated);
    };

    // 세그먼트 버튼 핸들러들 (이름표 + 버튼 두 개 형태)
    const handleSegmentChange = (fieldName, value) => {
        const updated = { ...genInfoState, [fieldName]: value };
        setGenInfoState(updated);
        if (onChange) onChange(updated);
    };

    return {
        initGenInfo: genInfoState,
        selectedCategory1,
        selectedCategory2,
        moduleID,
        moduleIDString,
        category2Options,
        isRequiredFilled,
        handleInputChange,
        handleToggleChange,
        handleCompositeTypeChange,
        handleCategory1Change,
        handleCategory2Change,
        handleHex2Input,
        handleHex4Input,
        handleSerialInput,
        handleInstanceIdInput,
        handleSegmentChange
    };
}
