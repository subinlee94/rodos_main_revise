import { useState, useEffect } from 'react';
import { canvasAPI } from '../services/api';

export const useSimulationDialog = (open, configuration) => {
    const [selectedModule, setSelectedModule] = useState(null);
    const [selectedHW, setSelectedHW] = useState(null);
    const [mContent, setMContent] = useState({
        'Module Name': '',
        'Namespace': '',
        'x': '',
        'y': '',
        'Θ': ''
    });
    const [mHwContent, setMHwContent] = useState({
        'Simulation HW Name': ''
    });
    const [mappingList, setMappingList] = useState([]);
    const [crdaList, setCrdaList] = useState([]);

    const loadSimulationInfo = async () => {
        try {
            const simulationInfo = await canvasAPI.getSimulationInfo();
            console.log('로드된 Simulation 정보:', simulationInfo);

            // 선택된 Simulation HW Name 설정
            if (simulationInfo.selectedSimulationHwName) {
                setMHwContent({
                    'Simulation HW Name': simulationInfo.selectedSimulationHwName
                });
            }

            // 저장된 Simulation Robot 정보가 있으면 첫 번째 것을 선택
            if (simulationInfo.simulationRobots && simulationInfo.simulationRobots.length > 0) {
                const firstRobot = simulationInfo.simulationRobots[0];
                setSelectedModule({
                    name: firstRobot.name,
                    namespace: firstRobot.namespace || '',
                    x: firstRobot.x || '',
                    y: firstRobot.y || '',
                    theta: firstRobot.theta || '',
                    hwName: firstRobot.name
                });
                setMContent({
                    'Module Name': firstRobot.name,
                    'Namespace': firstRobot.namespace || '',
                    'x': firstRobot.x || '',
                    'y': firstRobot.y || '',
                    'Θ': firstRobot.theta || ''
                });
            }
        } catch (error) {
            console.error('Failed to load simulation info:', error);
        }
    };

    useEffect(() => {
        if (open) {
            if (configuration) {
                initializeItems(configuration);
            }

            // Edge 모듈 목록을 DockerAgent에서 가져오기
            loadEdgeModules();

            // Canvas의 Robot 모듈 목록을 CurrentSharedUserState에서 가져오기
            loadRobotModules();

            // 저장된 Simulation 정보 불러오기
            loadSimulationInfo();
        }
    }, [open, configuration]);

    const loadEdgeModules = async () => {
        try {
            // DockerAgent 레지스트리에서 Edge 타입만 필터링
            const agents = await canvasAPI.getDockerAgents();
            const edgeModules = agents
                .filter(agent => agent.type === 'edge')
                .map((agent, index) => ({
                    id: `CRDA_${String(index + 1).padStart(3, '0')}`,
                    hwName: agent.hwname || 'unknown',
                    type: 'edge',
                    ip: agent.ip || 'unknown'
                }));
            setCrdaList(edgeModules);
        } catch (error) {
            console.error('Failed to load edge modules:', error);
            // Fallback to sample data
        }
    };

    const loadRobotModules = async () => {
        try {
            const hwModules = await canvasAPI.getHWModules();
            console.log('로드된 HW 모듈들:', hwModules);

            // Robot 모듈만 필터링
            const robotModules = hwModules
                .filter(module => module.type === 'robot')
                .map(module => ({
                    name: module.name,
                    namespace: module.simulation?.namespace || '',
                    x: module.simulation?.x || '',
                    y: module.simulation?.y || '',
                    theta: module.simulation?.theta || '',
                    hwName: module.name
                }));

            console.log('변환된 Robot 모듈 리스트:', robotModules);

            // 기존 mappingList와 병합하여 사용자 입력 정보 보존
            setMappingList(prevMappingList => {
                const mergedList = robotModules.map(robotModule => {
                    // 기존에 같은 이름의 모듈이 있는지 확인
                    const existingModule = prevMappingList.find(prev => prev.name === robotModule.name);
                    if (existingModule) {
                        // 기존 정보를 우선하되, 서버에서 가져온 정보로 빈 필드만 채움
                        return {
                            ...robotModule,
                            namespace: existingModule.namespace || robotModule.namespace,
                            x: existingModule.x || robotModule.x,
                            y: existingModule.y || robotModule.y,
                            theta: existingModule.theta || robotModule.theta
                        };
                    }
                    return robotModule;
                });

                console.log('병합된 Robot 모듈 리스트:', mergedList);
                return mergedList;
            });
        } catch (error) {
            console.error('Failed to load robot modules:', error);
            setMappingList([]);
        }
    };

    const initializeItems = (config) => {
        const modules = [];

        if (config.edges) {
            config.edges.forEach(edge => {
                modules.push({
                    name: edge.name,
                    namespace: edge.namespace || '',
                    x: edge.x || '',
                    y: edge.y || '',
                    theta: edge.theta || '',
                    hwName: edge.hwName || ''
                });
            });
        }

        if (config.robots) {
            config.robots.forEach(robot => {
                modules.push({
                    name: robot.name,
                    namespace: robot.namespace || '',
                    x: robot.x || '',
                    y: robot.y || '',
                    theta: robot.theta || '',
                    hwName: robot.hwName || ''
                });
            });
        }

        setMappingList(modules);
    };

    const handleModuleSelect = (module) => {
        setSelectedModule(module);
        setMContent({
            'Module Name': module.name,
            'Namespace': module.namespace || '',
            'x': module.x || '',
            'y': module.y || '',
            'Θ': module.theta || ''
        });
    };

    const handleHWSelect = (hw) => {
        setSelectedHW(hw);
        setMHwContent({
            'Simulation HW Name': hw.hwName
        });
    };

    const handleContentChange = (field, value) => {
        setMContent(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSave = async () => {
        if (selectedModule && selectedHW) {
            try {
                // 백엔드에 Simulation 정보 저장 (Robot + 선택된 HW)
                await canvasAPI.saveSimulation(
                    selectedModule.name,
                    mContent['Namespace'],
                    mContent['x'],
                    mContent['y'],
                    mContent['Θ']
                );

                // 선택된 Simulation HW 정보 저장 (실제 Target IP 사용)
                await canvasAPI.saveSimulationInfo(selectedHW.hwName, selectedHW.ip || 'localhost');

                // Simulation 모드 활성화
                await canvasAPI.setSimMode(true);

                // 로컬 상태 업데이트
                setMappingList(prev => prev.map(module =>
                    module.name === selectedModule.name
                        ? {
                            ...module,
                            namespace: mContent['Namespace'],
                            x: mContent['x'],
                            y: mContent['y'],
                            theta: mContent['Θ']
                        }
                        : module
                ));

                // 테이블을 최신 상태로 다시 로드
                await loadRobotModules();

                // SimulationConfig 갱신 (Robot 정보 기반으로)
                try {
                    console.log('SimulationConfig 갱신 시작 - Robot 정보:', {
                        name: selectedModule.name,
                        namespace: mContent['Namespace'],
                        x: mContent['x'],
                        y: mContent['y'],
                        theta: mContent['Θ']
                    });
                    await canvasAPI.refreshSimulationConfig();
                    console.log('SimulationConfig 갱신 완료');
                } catch (error) {
                    console.error('SimulationConfig 갱신 실패:', error);
                }

                console.log('Simulation saved:', mContent);
                console.log('Selected Simulation HW:', selectedHW.hwName);
                return { success: true, message: 'Simulation 정보가 저장되었습니다.' };
            } catch (error) {
                console.error('Failed to save simulation:', error);
                return { success: false, message: 'Simulation 정보 저장에 실패했습니다.' };
            }
        }
        return { success: false, message: '모듈과 Simulation HW를 모두 선택해주세요.' };
    };

    return {
        // State
        selectedModule,
        selectedHW,
        mContent,
        mHwContent,
        mappingList,
        crdaList,

        // Actions
        handleModuleSelect,
        handleHWSelect,
        handleContentChange,
        handleSave
    };
};
