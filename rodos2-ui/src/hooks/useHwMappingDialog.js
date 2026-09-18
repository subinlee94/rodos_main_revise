import { useState, useEffect } from 'react';
import { canvasAPI } from '../services/api';

export const useHwMappingDialog = (open) => {
    const [selectedModule, setSelectedModule] = useState(null);
    const [selectedHW, setSelectedHW] = useState(null);
    const [mHwContent, setMHwContent] = useState({
        'HW Type': '',
        'HW Name': ''
    });
    const [mappingList, setMappingList] = useState([]);
    const [moduleList, setModuleList] = useState([]);
    const [crdaList, setCrdaList] = useState([]);

    useEffect(() => {
        if (open) {
            // DockerAgent 목록을 백엔드에서 가져오기
            loadDockerAgents();
            // SharedUserState에서 HW Module 목록을 가져오기
            loadHWModules();
        }
    }, [open]);

    const loadDockerAgents = async () => {
        try {
            const agents = await canvasAPI.getDockerAgents();
            // DockerAgent 데이터를 CRDA 형식으로 변환
            const crdaList = agents.map((agent, index) => ({
                id: `CRDA_${String(index + 1).padStart(3, '0')}`,
                hwType: agent.type || 'unknown',
                hwName: agent.hwname || 'unknown',
                ip: agent.ip || 'unknown'
            }));
            setCrdaList(crdaList);
        } catch (error) {
            console.error('Failed to load docker agents:', error);
            setCrdaList([]);
        }
    };

    const loadHWModules = async () => {
        try {
            const hwModules = await canvasAPI.getHWModules();
            console.log('로드된 HW 모듈들:', hwModules);

            // SharedUserState의 HW 모듈 데이터를 Module 형식으로 변환
            const moduleList = hwModules.map(module => ({
                name: module.name || 'unknown',
                type: module.type || 'unknown'
            }));

            console.log('변환된 모듈 리스트:', moduleList);
            setModuleList(moduleList);
        } catch (error) {
            console.error('Failed to load HW modules:', error);
            setModuleList([]);
        }
    };

    const handleModuleSelect = (module) => {
        setSelectedModule(module);
    };

    const handleHWSelect = (hw) => {
        setSelectedHW(hw);
        setMHwContent({
            'HW Type': hw.hwType || '',
            'HW Name': hw.hwName || ''
        });
    };

    const handleHwContentChange = (key, value) => {
        setMHwContent(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const handleMapping = () => {
        if (selectedModule && selectedHW) {
            // 중복 매핑 체크
            const existingMapping = mappingList.find(mapping =>
                mapping.name === selectedModule.name ||
                (mapping.hw && mapping.hw.hwName === selectedHW.hwName)
            );

            if (existingMapping) {
                alert('Mapping information has already been registered. You need to do one-to-one mapping.');
                return;
            }

            const newMapping = {
                name: selectedModule.name,
                module: selectedModule,
                hw: selectedHW
            };

            setMappingList(prev => [...prev, newMapping]);
            console.log('Mapping created:', newMapping);
        } else {
            alert('Please select HW Module and HW Info.');
        }
    };

    const handleDeleteMapping = () => {
        if (selectedModule && selectedHW) {
            setMappingList(prev => prev.filter(mapping =>
                !(mapping.name === selectedModule.name && mapping.hw.hwName === selectedHW.hwName)
            ));
            console.log('Mapping deleted');
        }
    };

    const handleSave = async () => {
        try {
            // 매핑 정보를 백엔드에 저장
            for (const mapping of mappingList) {
                await canvasAPI.saveHwMapping(
                    mapping.name,           // moduleName
                    mapping.hw.hwName,      // targetName
                    mapping.hw.hwType,      // type
                    mapping.hw.ip           // target (IP)
                );
            }
            console.log('All mappings saved successfully');
            return true;
        } catch (error) {
            console.error('Failed to save mappings:', error);
            alert('Failed to save HW mapping: ' + error.message);
            return false;
        }
    };

    return {
        // State
        selectedModule,
        selectedHW,
        mHwContent,
        mappingList,
        moduleList,
        crdaList,

        // Actions
        handleModuleSelect,
        handleHWSelect,
        handleHwContentChange,
        handleMapping,
        handleDeleteMapping,
        handleSave
    };
};
