import { useState, useEffect, useRef } from 'react';

export function useInfrastructureState(infrastructure, setInfrastructure) {
    const [infraState, setInfraState] = useState(infrastructure);
    const isInitialized = useRef(false);

    // Database
    const [dbInput, setDbInput] = useState({ name: '', version: { min: '', max: '' } });

    // Middleware
    const [mwInput, setMwInput] = useState({ name: '', version: { min: '', max: '' } });

    // Communications
    const [commList, setCommList] = useState(infrastructure?.communications?.communicationList || []);
    const [commInput, setCommInput] = useState({ mostTopProtocol: [], underlyingProtocol: { name: '', layerType: '' } });
    const [mtpInput, setMtpInput] = useState({ name: '', layerType: '' });
    const [underInput, setUnderInput] = useState({ name: '', layerType: '' });

    // props로 받은 infrastructure가 바뀔 때만 동기화 (초기 로드 시에만)
    useEffect(() => {
        if (!isInitialized.current) {
            setInfraState(infrastructure);
            isInitialized.current = true;
        }
    }, [infrastructure]);

    // 상태가 변경될 때마다 부모 컴포넌트에 동기화
    useEffect(() => {
        if (isInitialized.current) {
            setInfrastructure(infraState);
        }
    }, [infraState, setInfrastructure]);

    // Database 추가/삭제
    const handleAddDb = () => {
        console.log(`InfrastructurePage - handleAddDb:`, dbInput);
        setInfraState(prev => {
            const newInfra = { ...prev, databases: [...(prev.databases || []), dbInput] };
            console.log(`InfrastructurePage - updated infrastructure:`, newInfra);
            return newInfra;
        });
        setDbInput({ name: '', version: { min: '', max: '' } });
    };

    const handleRemoveDb = idx => {
        console.log(`InfrastructurePage - handleRemoveDb at index:`, idx);
        setInfraState(prev => {
            const newInfra = { ...prev, databases: prev.databases.filter((_, i) => i !== idx) };
            console.log(`InfrastructurePage - updated infrastructure:`, newInfra);
            return newInfra;
        });
    };

    // Middleware 추가/삭제
    const handleAddMw = () => {
        console.log(`InfrastructurePage - handleAddMw:`, mwInput);
        setInfraState(prev => {
            const newInfra = { ...prev, middlewares: [...(prev.middlewares || []), mwInput] };
            console.log(`InfrastructurePage - updated infrastructure:`, newInfra);
            return newInfra;
        });
        setMwInput({ name: '', version: { min: '', max: '' } });
    };

    const handleRemoveMw = idx => {
        console.log(`InfrastructurePage - handleRemoveMw at index:`, idx);
        setInfraState(prev => {
            const newInfra = { ...prev, middlewares: prev.middlewares.filter((_, i) => i !== idx) };
            console.log(`InfrastructurePage - updated infrastructure:`, newInfra);
            return newInfra;
        });
    };

    // Communications 추가/삭제
    const handleAddMtp = () => {
        setCommInput(prev => ({ ...prev, mostTopProtocol: [...(prev.mostTopProtocol || []), mtpInput] }));
        setMtpInput({ name: '', layerType: '' });
    };

    const handleRemoveMtp = idx => {
        setCommInput(prev => ({ ...prev, mostTopProtocol: prev.mostTopProtocol.filter((_, i) => i !== idx) }));
    };

    const handleSetUnder = (val) => {
        setCommInput(prev => ({ ...prev, underlyingProtocol: val }));
    };

    const handleAddComm = () => {
        setCommList(prev => [...prev, commInput]);
        setCommInput({ mostTopProtocol: [], underlyingProtocol: { name: '', layerType: '' } });
    };

    const handleRemoveComm = idx => {
        setCommList(prev => prev.filter((_, i) => i !== idx));
    };

    return {
        // 상태
        infraState,
        dbInput,
        mwInput,
        commList,
        commInput,
        mtpInput,
        underInput,

        // 상태 설정 함수
        setDbInput,
        setMwInput,
        setCommInput,
        setMtpInput,
        setUnderInput,

        // 이벤트 핸들러
        handleAddDb,
        handleRemoveDb,
        handleAddMw,
        handleRemoveMw,
        handleAddMtp,
        handleRemoveMtp,
        handleSetUnder,
        handleAddComm,
        handleRemoveComm
    };
}
