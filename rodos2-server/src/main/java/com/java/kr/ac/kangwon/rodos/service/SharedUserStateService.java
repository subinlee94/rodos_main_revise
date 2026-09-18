package com.java.kr.ac.kangwon.rodos.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.fasterxml.jackson.dataformat.xml.XmlMapper;
import com.java.kr.ac.kangwon.rodos.compute.ExecutorManager;
import com.java.kr.ac.kangwon.rodos.model.AiModuleInfo;
import com.java.kr.ac.kangwon.rodos.model.CloudInfo;
import com.java.kr.ac.kangwon.rodos.model.Configuration;
import com.java.kr.ac.kangwon.rodos.model.EdgeInfo;
import com.java.kr.ac.kangwon.rodos.model.HWInfo;
import com.java.kr.ac.kangwon.rodos.model.ModuleInfo;
import com.java.kr.ac.kangwon.rodos.model.RobotInfo;
import com.java.kr.ac.kangwon.rodos.model.RosModuleInfo;
import com.java.kr.ac.kangwon.rodos.model.SharedUserState;
import com.java.kr.ac.kangwon.rodos.model.Simulation;
import com.java.kr.ac.kangwon.rodos.model.Style;
import com.java.kr.ac.kangwon.rodos.service.rest.informationModel.IM;
import com.java.kr.ac.kangwon.rodos.service.rest.informationModel.IMRegistryApi;
import com.java.kr.ac.kangwon.rodos.service.rest.agent.SimulationConfig;

@Service
public class SharedUserStateService {

    private final XmlMapper xmlMapper;
    private final IMRegistryApi imRegistryApi;
    private final ModuleClassifier moduleClassifier;
    private final ExecutorManager executorManager;
    private static final String RODOS_DIR = ".rodos";
    private static final String CURRENT_STATE_FILE = "CurrentSharedUserState.xml";
    private static final String CONFIG_DIR = "Workspace/Configuration";

    public SharedUserStateService(ModuleClassifier moduleClassifier, IMRegistryApi imRegistryApi,
            ExecutorManager executorManager) {
        this.moduleClassifier = moduleClassifier;
        this.imRegistryApi = imRegistryApi;
        this.executorManager = executorManager;
        this.xmlMapper = new XmlMapper();
        this.xmlMapper.configure(com.fasterxml.jackson.databind.DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES,
                false);
        // XML 포맷팅을 위한 설정
        this.xmlMapper.configure(com.fasterxml.jackson.databind.SerializationFeature.INDENT_OUTPUT, true);
        this.xmlMapper.configure(com.fasterxml.jackson.databind.SerializationFeature.FAIL_ON_EMPTY_BEANS, false);
    }

    /**
     * .rodos 디렉토리와 Configuration 디렉토리, CurrentSharedUserState.xml 파일을 생성
     */
    public void initializeConfigDirectory() throws IOException {
        Path rodosPath = Paths.get(RODOS_DIR);
        if (!Files.exists(rodosPath)) {
            Files.createDirectories(rodosPath);
        }

        Path configPath = rodosPath.resolve(CONFIG_DIR);
        if (!Files.exists(configPath)) {
            Files.createDirectories(configPath);
        }

        Path currentStatePath = rodosPath.resolve(CURRENT_STATE_FILE);
        if (!Files.exists(currentStatePath)) {
            SharedUserState defaultState = createDefaultSharedUserState();
            saveCurrentState(defaultState);
        }
    }

    /**
     * 기본 SharedUserState 생성
     */
    private SharedUserState createDefaultSharedUserState() {
        SharedUserState state = new SharedUserState();
        state.setLastFile(".rodos/cache/App Configuration(xml)/test.xml");
        return state;
    }

    /**
     * 현재 상태를 CurrentSharedUserState.xml로 저장
     */
    public void saveCurrentState(SharedUserState state) throws IOException {
        Path currentStatePath = Paths.get(RODOS_DIR, CURRENT_STATE_FILE);
        xmlMapper.writeValue(currentStatePath.toFile(), state);
    }

    /**
     * CurrentSharedUserState.xml에서 현재 상태 로드
     */
    public SharedUserState loadCurrentState() throws IOException {
        Path currentStatePath = Paths.get(RODOS_DIR, CURRENT_STATE_FILE);

        if (!Files.exists(currentStatePath)) {
            System.out.println("XML 파일이 없어서 초기화 실행");
            initializeConfigDirectory();
        }

        SharedUserState state = xmlMapper.readValue(currentStatePath.toFile(), SharedUserState.class);
        System.out.println("XML에서 로드된 SharedUserState: " + state);

        // XML에서 로드한 후 스타일 정보를 RobotInfo와 ModuleInfo에 매핑
        mapStylesToRobots(state);

        // 디버깅: Robot들의 모듈 정보 확인
        System.out.println("=== XML 로드 후 Robot 모듈 정보 ===");
        for (RobotInfo robot : state.getEditors().getSystem().getRobots()) {
            System.out.println("Robot: " + robot.getName() + " - 모듈 개수: " + robot.getModules().size());
            for (ModuleInfo module : robot.getModules()) {
                System.out.println("  - 모듈: " + module.getName() + " (ref: " + module.getRef() + ")");
            }
        }

        return state;
    }

    /**
     * XML에서 로드한 스타일 정보를 HWInfo와 ModuleInfo 객체에 매핑
     */
    private void mapStylesToRobots(SharedUserState state) {
        // Cloud 스타일 매핑
        for (CloudInfo cloud : state.getEditors().getSystem().getClouds()) {
            mapStylesToHWInfo(cloud, state);
        }

        // Edge 스타일 매핑
        for (EdgeInfo edge : state.getEditors().getSystem().getEdges()) {
            mapStylesToHWInfo(edge, state);
        }

        // Robot 스타일 매핑
        for (RobotInfo robot : state.getEditors().getSystem().getRobots()) {
            mapStylesToHWInfo(robot, state);
        }
    }

    /**
     * HWInfo와 그 하위 ModuleInfo들에 스타일을 매핑하는 헬퍼 메서드
     */
    private void mapStylesToHWInfo(HWInfo hwInfo, SharedUserState state) {
        // HW 스타일 매핑
        Style hwStyle = state.getEditors().getSystem().getStyles()
                .getStyle(hwInfo.getName());
        if (hwStyle != null) {
            hwInfo.setStyle(hwStyle);
        }

        // Module 스타일 매핑
        for (ModuleInfo module : hwInfo.getModules()) {
            String moduleTarget = module.computeFullName();
            Style moduleStyle = state.getEditors().getSystem().getStyles()
                    .getStyle(moduleTarget);
            if (moduleStyle != null) {
                module.setStyle(moduleStyle);
            }
        }
    }

    /**
     * Configuration 디렉토리에 이름을 지정하여 저장
     */
    public void saveConfiguration(String fileName, SharedUserState state) throws IOException {
        if (!fileName.endsWith(".xml")) {
            fileName += ".xml";
        }
        Path configPath = Paths.get(RODOS_DIR, CONFIG_DIR, fileName);
        xmlMapper.writeValue(configPath.toFile(), state);
    }

    /**
     * Configuration 디렉토리에서 파일 로드
     */
    public SharedUserState loadConfiguration(String fileName) throws IOException {
        if (!fileName.endsWith(".xml")) {
            fileName += ".xml";
        }
        Path configPath = Paths.get(RODOS_DIR, CONFIG_DIR, fileName);
        if (!Files.exists(configPath)) {
            throw new IOException("Configuration file not found: " + fileName);
        }
        return xmlMapper.readValue(configPath.toFile(), SharedUserState.class);
    }

    /**
     * Configuration 디렉토리의 모든 파일 목록 가져오기
     */
    public List<String> getConfigurationFiles() throws IOException {
        Path configPath = Paths.get(RODOS_DIR, CONFIG_DIR);
        if (!Files.exists(configPath)) {
            return new ArrayList<>();
        }

        return Files.list(configPath)
                .filter(path -> path.toString().endsWith(".xml"))
                .map(path -> path.getFileName().toString())
                .sorted()
                .collect(java.util.stream.Collectors.toList());
    }

    /**
     * 현재 상태 초기화 (New 기능)
     */
    public void initializeCurrentState() throws IOException {
        // 디렉토리 생성
        Path rodosPath = Paths.get(RODOS_DIR);
        if (!Files.exists(rodosPath)) {
            Files.createDirectories(rodosPath);
        }

        Path configPath = rodosPath.resolve(CONFIG_DIR);
        if (!Files.exists(configPath)) {
            Files.createDirectories(configPath);
        }

        // 기존 파일을 덮어쓰기 위해 강제로 기본 상태 생성
        SharedUserState defaultState = createDefaultSharedUserState();
        saveCurrentState(defaultState);
    }

    /**
     * Canvas 상태를 현재 상태에 저장
     * 
     * @param hwModules Canvas의 HW 모듈 리스트
     * @param lastFile  마지막 파일 경로
     */
    public void saveCanvasState(List<Object> hwModules, String lastFile) throws IOException {
        SharedUserState state = loadCurrentState();

        // 기존 clouds, edges, robots와 styles 초기화
        state.getEditors().getSystem().getClouds().clear();
        state.getEditors().getSystem().getEdges().clear();
        state.getEditors().getSystem().getRobots().clear();
        state.getEditors().getSystem().getStyles().getStyles().clear();

        // hwModules가 null이거나 비어있어도 처리
        if (hwModules == null) {
            hwModules = new ArrayList<>();
        }

        // HW 모듈들을 분류해서 적절한 리스트에 저장
        for (Object hwModule : hwModules) {
            if (hwModule instanceof java.util.Map) {
                @SuppressWarnings("unchecked")
                java.util.Map<String, Object> hw = (java.util.Map<String, Object>) hwModule;

                String moduleName = (String) hw.get("name");
                String moduleType = (String) hw.get("moduleType");

                // ModuleClassifier를 사용해서 실제 분류 결정
                String moduleId = getModuleId(moduleName);
                String actualClassification = moduleClassifier.classifyModule(moduleId);

                System.out.println("=== 모듈 분류 ===");
                System.out.println("모듈명: " + moduleName);
                System.out.println("프론트엔드 moduleType: " + moduleType);
                System.out.println("ModuleID: " + moduleId);
                System.out.println("ModuleClassifier 분류: " + actualClassification);

                // 디버깅: 모듈 ID 파싱 과정 출력
                if (moduleId != null && moduleId.contains("-")) {
                    String[] mIDs = moduleId.split("-");
                    if (mIDs.length >= 5) {
                        String mCID = mIDs[4];
                        System.out.println("mCID (4번째): " + mCID);
                        try {
                            int dCID = Integer.parseInt(mCID, 16);
                            String bCID = toBinaryStringWithLeadingZero(dCID, 24);
                            System.out.println("bCID (24비트): " + bCID);
                            System.out.println("bCID 시작 2비트: " + bCID.substring(0, 2));
                            if (bCID.length() >= 6) {
                                System.out.println("bCID 2-6비트 (분류): " + bCID.substring(2, 6));
                            }
                        } catch (Exception e) {
                            System.out.println("ID 파싱 오류: " + e.getMessage());
                        }
                    }
                }

                // Edge 모듈명 패턴 체크 (park_edge, edge_ 등)
                if (moduleName.toLowerCase().contains("edge") && !"edge".equals(actualClassification)) {
                    System.out.println("Edge 모듈명 패턴 감지, 강제로 edge로 분류: " + moduleName);
                    actualClassification = "edge";
                }

                // Robot 모듈명 패턴 체크 (Turtlebot3_, robot_ 등)
                // TODO: IM Registry에 올바른 모듈 ID가 등록되면 이 패턴 체크를 제거할 수 있음
                if ((moduleName.toLowerCase().contains("turtlebot") ||
                        moduleName.toLowerCase().contains("robot") ||
                        moduleName.toLowerCase().contains("burger")) &&
                        !"robot".equals(actualClassification)) {
                    System.out.println("Robot 모듈명 패턴 감지, 강제로 robot으로 분류: " + moduleName);
                    actualClassification = "robot";
                }

                // 분류에 따라 적절한 HWInfo 객체 생성
                if ("cloud".equals(actualClassification)) {
                    CloudInfo cloud = new CloudInfo();
                    cloud.setName(moduleName);
                    cloud.setRef(getModuleId(moduleName));
                    cloud.setType(actualClassification);

                    // Cloud 스타일 설정
                    Style cloudStyle = new Style();
                    cloudStyle.setPx(convertToDouble(hw.get("x")));
                    cloudStyle.setPy(convertToDouble(hw.get("y")));
                    cloudStyle.setWidth(338.0);
                    cloudStyle.setHeight(383.0);
                    cloud.setStyle(cloudStyle);

                    // SW 모듈들 추가
                    addSWModulesToHW(cloud, hw);

                    state.getEditors().getSystem().getClouds().add(cloud);
                } else if ("edge".equals(actualClassification)) {
                    EdgeInfo edge = new EdgeInfo();
                    edge.setName(moduleName);
                    edge.setRef(getModuleId(moduleName));
                    edge.setType(actualClassification);

                    // Edge 스타일 설정
                    Style edgeStyle = new Style();
                    edgeStyle.setPx(convertToDouble(hw.get("x")));
                    edgeStyle.setPy(convertToDouble(hw.get("y")));
                    edgeStyle.setWidth(338.0);
                    edgeStyle.setHeight(383.0);
                    edge.setStyle(edgeStyle);

                    // SW 모듈들 추가
                    addSWModulesToHW(edge, hw);

                    state.getEditors().getSystem().getEdges().add(edge);
                } else { // "robot" 또는 기타
                    RobotInfo robot = new RobotInfo();
                    robot.setName(moduleName);
                    robot.setRef(getModuleId(moduleName));
                    robot.setType(actualClassification); // 실제 분류 결과 사용

                    // Robot 스타일 설정
                    Style robotStyle = new Style();
                    robotStyle.setPx(convertToDouble(hw.get("x")));
                    robotStyle.setPy(convertToDouble(hw.get("y")));
                    robotStyle.setWidth(338.0);
                    robotStyle.setHeight(383.0);
                    robot.setStyle(robotStyle);

                    // SW 모듈들 추가
                    addSWModulesToHW(robot, hw);

                    state.getEditors().getSystem().getRobots().add(robot);
                }
            }
        }

        // 스타일 동기화 - rodos 1의 sync() 패턴
        state.getEditors().getSystem().sync();

        state.setLastFile(lastFile);
        saveCurrentState(state);
    }

    /**
     * 현재 상태에서 Canvas 상태 로드
     */
    public List<Object> loadCanvasState() throws IOException {
        SharedUserState state = loadCurrentState();
        List<Object> hwModules = new java.util.ArrayList<>();

        // System.out.println("=== loadCanvasState 호출 ===");

        // null 체크 추가
        var clouds = state.getEditors().getSystem().getClouds();
        var edges = state.getEditors().getSystem().getEdges();
        var robots = state.getEditors().getSystem().getRobots();

        // System.out.println("XML에서 로드된 Cloud 개수: " + (clouds != null ? clouds.size() :
        // 0));
        // System.out.println("XML에서 로드된 Edge 개수: " + (edges != null ? edges.size() :
        // 0));
        // System.out.println("XML에서 로드된 Robot 개수: " + (robots != null ? robots.size() :
        // 0));

        // Cloud 모듈들 로드
        if (clouds != null) {
            for (CloudInfo cloud : clouds) {
                hwModules.add(createHWModuleFromHWInfo(cloud, "cloud"));
            }
        }

        // Edge 모듈들 로드
        if (edges != null) {
            for (EdgeInfo edge : edges) {
                hwModules.add(createHWModuleFromHWInfo(edge, "edge"));
            }
        }

        // Robot 모듈들 로드
        if (robots != null) {
            for (RobotInfo robot : robots) {
                hwModules.add(createHWModuleFromHWInfo(robot, "robot"));
            }
        }

        return hwModules;
    }

    /**
     * HWInfo에서 프론트엔드용 HW 모듈 맵을 생성하는 헬퍼 메서드
     */
    private java.util.Map<String, Object> createHWModuleFromHWInfo(HWInfo hwInfo, String type) {
        System.out.println("HWInfo 정보: name=" + hwInfo.getName() + ", type=" + hwInfo.getType() + ", targetName="
                + hwInfo.getTargetName());

        java.util.Map<String, Object> hwModule = new java.util.HashMap<>();
        hwModule.put("name", hwInfo.getName());
        hwModule.put("type", type); // cloud, edge, robot
        hwModule.put("moduleType", hwInfo.getType() != null ? hwInfo.getType() : type); // Canvas.js에서 사용하는 필드

        // HW 모듈의 위치 정보 - 스타일에서 직접 가져오기
        Style hwStyle = hwInfo.getStyle();
        if (hwStyle != null) {
            hwModule.put("x", hwStyle.getPx());
            hwModule.put("y", hwStyle.getPy());
        } else {
            // 스타일이 없으면 기본값
            hwModule.put("x", 0.0);
            hwModule.put("y", 0.0);
        }

        // SW 모듈들 추가
        List<Object> swModules = new java.util.ArrayList<>();
        for (ModuleInfo module : hwInfo.getModules()) {
            java.util.Map<String, Object> swModule = new java.util.HashMap<>();
            swModule.put("name", module.getName());
            swModule.put("type", "software");
            swModule.put("moduleType", "software"); // Canvas.js에서 사용하는 필드

            // SW 모듈의 위치 정보 - 스타일에서 직접 가져오기
            Style swStyle = module.getStyle();
            if (swStyle != null) {
                swModule.put("x", swStyle.getPx());
                swModule.put("y", swStyle.getPy());
            } else {
                // 스타일이 없으면 기본값
                swModule.put("x", 0.0);
                swModule.put("y", 0.0);
            }

            swModules.add(swModule);
        }

        hwModule.put("swModules", swModules);

        // Simulation 정보 추가 (Robot의 경우)
        if (hwInfo.getSimulation() != null) {
            java.util.Map<String, Object> simulationInfo = new java.util.HashMap<>();
            simulationInfo.put("namespace", hwInfo.getSimulation().getNamespace());
            simulationInfo.put("x", hwInfo.getSimulation().getX());
            simulationInfo.put("y", hwInfo.getSimulation().getY());
            simulationInfo.put("theta", hwInfo.getSimulation().getTheta());
            hwModule.put("simulation", simulationInfo);
        }

        return hwModule;
    }

    /**
     * HW 모듈에 SW 모듈들을 추가하는 헬퍼 메서드
     */
    private void addSWModulesToHW(HWInfo hwInfo, java.util.Map<String, Object> hw) {
        @SuppressWarnings("unchecked")
        List<Object> swModules = (List<Object>) hw.get("swModules");
        if (swModules != null) {
            for (Object swModule : swModules) {
                if (swModule instanceof java.util.Map) {
                    @SuppressWarnings("unchecked")
                    java.util.Map<String, Object> sw = (java.util.Map<String, Object>) swModule;

                    // ModuleClassifier를 사용해서 모듈 타입 결정
                    String moduleName = (String) sw.get("name");
                    String moduleType = moduleClassifier.classifyModule(getModuleId(moduleName));

                    ModuleInfo module;
                    if ("ai".equals(moduleType)) {
                        module = new AiModuleInfo();
                    } else {
                        module = new RosModuleInfo();
                    }

                    module.setName(moduleName);
                    module.setRef(getModuleId(moduleName));

                    // SW 모듈 스타일 설정
                    Style swStyle = new Style();
                    swStyle.setPx(convertToDouble(sw.get("x")));
                    swStyle.setPy(convertToDouble(sw.get("y")));
                    swStyle.setWidth(76.0);
                    swStyle.setHeight(76.0);
                    module.setStyle(swStyle);

                    hwInfo.getModules().add(module);
                }
            }
        }
    }

    /**
     * Object를 Double로 안전하게 변환
     */
    private Double convertToDouble(Object value) {
        if (value == null) {
            return 0.0;
        }
        if (value instanceof Double) {
            return (Double) value;
        }
        if (value instanceof Integer) {
            return ((Integer) value).doubleValue();
        }
        if (value instanceof Number) {
            return ((Number) value).doubleValue();
        }
        try {
            return Double.parseDouble(value.toString());
        } catch (NumberFormatException e) {
            return 0.0;
        }
    }

    /**
     * 마지막 파일 경로 가져오기
     */
    public String getLastFile() throws IOException {
        SharedUserState state = loadCurrentState();
        return state.getLastFile();
    }

    /**
     * 마지막 파일 경로 설정
     */
    public void setLastFile(String lastFile) throws IOException {
        SharedUserState state = loadCurrentState();
        state.setLastFile(lastFile);
        saveCurrentState(state);
    }

    /**
     * HW 매핑 정보 저장 (HwMappingDialog에서 사용)
     */
    public void saveHwMapping(String moduleName, String targetName, String type, String target) throws IOException {
        SharedUserState state = loadCurrentState();

        // Cloud, Edge, Robot에서 해당 모듈 찾기
        for (CloudInfo cloud : state.getEditors().getSystem().getClouds()) {
            if (cloud.getName().equals(moduleName)) {
                cloud.setTargetName(targetName);
                cloud.setType(type);
                cloud.setTarget(target);
                saveCurrentState(state);
                return;
            }
        }

        for (EdgeInfo edge : state.getEditors().getSystem().getEdges()) {
            if (edge.getName().equals(moduleName)) {
                edge.setTargetName(targetName);
                edge.setType(type);
                edge.setTarget(target);
                saveCurrentState(state);
                return;
            }
        }

        for (RobotInfo robot : state.getEditors().getSystem().getRobots()) {
            if (robot.getName().equals(moduleName)) {
                robot.setTargetName(targetName);
                robot.setType(type);
                robot.setTarget(target);
                saveCurrentState(state);
                return;
            }
        }
    }

    /**
     * Simulation 정보 저장 (로봇별)
     */
    public void saveSimulation(String robotName, String namespace, String x, String y, String theta)
            throws IOException {
        SharedUserState state = loadCurrentState();

        // Robot에서 해당 모듈 찾기
        for (RobotInfo robot : state.getEditors().getSystem().getRobots()) {
            if (robot.getName().equals(robotName)) {
                Simulation simulation = new Simulation();
                simulation.setNamespace(namespace);
                simulation.setX(x);
                simulation.setY(y);
                simulation.setTheta(theta);
                robot.setSimulation(simulation);
                saveCurrentState(state);
                return;
            }
        }
    }

    /**
     * Simulation 모드 설정
     */
    public void setSimMode(Boolean simMode) throws IOException {
        SharedUserState state = loadCurrentState();
        state.setSimMode(simMode);
        saveCurrentState(state);
    }

    /**
     * Simulation 정보 저장 (HW Name, Target IP 포함)
     */
    public void saveSimulationInfo(String simulationHwName, String simulationHwTarget) throws IOException {
        SharedUserState state = loadCurrentState();

        // Simulation 정보 생성 또는 업데이트
        Simulation simulationInfo = state.getSimulationInfo();
        if (simulationInfo == null) {
            simulationInfo = new Simulation();
        }

        simulationInfo.setSimulationHwName(simulationHwName);
        simulationInfo.setSimulationHwTarget(simulationHwTarget);

        state.setSimulationInfo(simulationInfo);
        saveCurrentState(state);

        System.out.println("Simulation Info 저장: HW Name=" + simulationHwName + ", Target=" + simulationHwTarget);
    }

    /**
     * 저장된 Simulation 정보 가져오기
     */
    public Map<String, Object> getSimulationInfo() throws IOException {
        SharedUserState state = loadCurrentState();
        Map<String, Object> simulationInfo = new java.util.HashMap<>();

        // 저장된 Simulation 정보
        Simulation simInfo = state.getSimulationInfo();
        if (simInfo != null) {
            simulationInfo.put("selectedSimulationHwName", simInfo.getSimulationHwName());
            simulationInfo.put("simulationHwTarget", simInfo.getSimulationHwTarget());
        }

        // Simulation 설정이 있는 Robot들의 정보
        java.util.List<Map<String, Object>> simulationRobots = new java.util.ArrayList<>();
        for (RobotInfo robot : state.getEditors().getSystem().getRobots()) {
            if (robot.getSimulation() != null) {
                Map<String, Object> robotInfo = new java.util.HashMap<>();
                robotInfo.put("name", robot.getName());
                robotInfo.put("namespace", robot.getSimulation().getNamespace());
                robotInfo.put("x", robot.getSimulation().getX());
                robotInfo.put("y", robot.getSimulation().getY());
                robotInfo.put("theta", robot.getSimulation().getTheta());
                simulationRobots.add(robotInfo);
            }
        }
        simulationInfo.put("simulationRobots", simulationRobots);

        return simulationInfo;
    }

    /**
     * SimulationConfig를 Simulation에 추가
     */
    public void addSimulationConfig(SimulationConfig config) throws IOException {
        SharedUserState state = loadCurrentState();

        // SimulationInfo가 없으면 생성
        if (state.getSimulationInfo() == null) {
            state.setSimulationInfo(new Simulation());
        }

        // 기존에 같은 robotName의 config가 있으면 제거
        state.getSimulationInfo().removeSimulationConfig(config.getRobotName());

        // 새로운 config 추가
        state.getSimulationInfo().addSimulationConfig(config);

        // Robot의 simulation 태그에도 해당 로봇의 SimulationConfig만 복사
        if (state.getEditors() != null && state.getEditors().getSystem() != null
                && state.getEditors().getSystem().getRobots() != null) {
            for (var robot : state.getEditors().getSystem().getRobots()) {
                if (robot.getName() != null && robot.getName().equals(config.getRobotName())) {
                    if (robot.getSimulation() != null) {
                        // 해당 로봇의 SimulationConfig만 리스트로 만들어서 복사
                        java.util.List<SimulationConfig> robotConfigs = new java.util.ArrayList<>();
                        robotConfigs.add(config);
                        robot.getSimulation().setSimulationConfigs(robotConfigs);
                        System.out.println("SimulationConfig copied to Robot simulation tag: " + robot.getName());
                    }
                    break;
                }
            }
        }

        // SharedUserState 저장
        saveCurrentState(state);

        System.out.println(
                "SimulationConfig added to Simulation: " + config.getRobotName() + " -> " + config.getSimulator());
    }

    /**
     * 모듈 실행 (Execute 기능) - ExecutorManager 사용
     */
    public Map<String, Object> executeModules(SharedUserState state) throws IOException {
        Map<String, Object> result = new java.util.HashMap<>();
        java.util.List<String> executedModules = new java.util.ArrayList<>();
        java.util.List<String> failedModules = new java.util.ArrayList<>();

        System.out.println("=== Execute Modules 시작 ===");
        System.out.println("Simulation Mode: " + state.getSimMode());

        try {
            // SharedUserState를 Configuration으로 변환
            Configuration config = state.toConfiguration();

            // ExecutorManager를 사용하여 Execute 실행하고 Agent 응답 받기
            Map<String, Object> executeResult = executorManager.doCRDAExecute(config);

            // Agent 응답 처리
            if (executeResult != null && executeResult.containsKey("result")) {
                Object agentResult = executeResult.get("result");
                if (agentResult instanceof java.util.List) {
                    @SuppressWarnings("unchecked")
                    java.util.List<Map<String, Object>> results = (java.util.List<Map<String, Object>>) agentResult;

                    for (Map<String, Object> moduleResult : results) {
                        String moduleName = (String) moduleResult.get("moduleName");
                        String status = (String) moduleResult.get("status");

                        if ("success".equals(status)) {
                            executedModules.add(moduleName + ": Success");
                        } else {
                            String errorMsg = (String) moduleResult.get("log");
                            failedModules.add(moduleName + ": " + (errorMsg != null ? errorMsg : "Failed"));
                        }
                    }
                }
            } else {
                executedModules.add("Execute: Success");
            }

            System.out.println("Execute 완료 - 성공: " + executedModules.size() + ", 실패: " + failedModules.size());

        } catch (Exception e) {
            failedModules.add("Execute: " + e.getMessage());
            System.err.println("Execute 실패: " + e.getMessage());
        }

        result.put("success", failedModules.isEmpty());
        result.put("executedModules", executedModules);
        result.put("failedModules", failedModules);
        result.put("totalExecuted", executedModules.size());
        result.put("totalFailed", failedModules.size());

        return result;
    }

    /**
     * 10진수 정수를 받아 2진수로 표현하여 문자열로 변환하되, 앞자리의 0이 생략되지 않도록 패딩을 추가하는 메서드
     */
    private static String toBinaryStringWithLeadingZero(int num, int totalBits) {
        String binaryStr = Integer.toBinaryString(num);
        int zeroPadding = totalBits - binaryStr.length();
        for (int i = 0; i < zeroPadding; i++) {
            binaryStr = "0" + binaryStr;
        }
        return binaryStr;
    }

    /**
     * 모듈명으로 실제 ModuleID를 IM Registry에서 조회
     */
    private String getModuleId(String moduleName) {
        try {
            String[] classifications = { "ai", "robot", "controller", "edge", "cloud", "software" };

            for (String classification : classifications) {
                List<IM> modules = imRegistryApi.getListIM(classification);
                for (IM module : modules) {
                    if (moduleName.equals(module.getModuleName())) {
                        return module.getModuleID();
                    }
                }
            }

            // 찾지 못한 경우 UUID 생성 (fallback)
            return java.util.UUID.randomUUID().toString().replace("-", "");

        } catch (Exception e) {
            // 예외 발생 시 UUID 생성 (fallback)
            return java.util.UUID.randomUUID().toString().replace("-", "");
        }
    }

    /**
     * 모듈 배포 (Deploy 기능) - ExecutorManager 사용
     */
    public Map<String, Object> deployModules(SharedUserState state) throws IOException {
        Map<String, Object> result = new java.util.HashMap<>();
        java.util.List<String> deployedModules = new java.util.ArrayList<>();
        java.util.List<String> failedModules = new java.util.ArrayList<>();

        System.out.println("=== Deploy Modules 시작 ===");
        System.out.println("Simulation Mode: " + state.getSimMode());

        try {
            // SharedUserState를 Configuration으로 변환
            Configuration config = state.toConfiguration();

            // ExecutorManager를 사용하여 Deploy 실행
            executorManager.doCRDADeploy(config);

            deployedModules.add("Deploy: Success");
            System.out.println("Deploy 성공");

        } catch (Exception e) {
            failedModules.add("Deploy: " + e.getMessage());
            System.err.println("Deploy 실패: " + e.getMessage());
        }

        result.put("success", failedModules.isEmpty());
        result.put("deployedModules", deployedModules);
        result.put("failedModules", failedModules);
        result.put("totalDeployed", deployedModules.size());
        result.put("totalFailed", failedModules.size());

        return result;
    }

    /**
     * 모듈 중지 (Stop 기능) - ExecutorManager 사용
     */
    public Map<String, Object> stopModules(SharedUserState state) throws IOException {
        Map<String, Object> result = new java.util.HashMap<>();
        java.util.List<String> stoppedModules = new java.util.ArrayList<>();
        java.util.List<String> failedModules = new java.util.ArrayList<>();

        System.out.println("=== Stop Modules 시작 ===");
        System.out.println("Simulation Mode: " + state.getSimMode());

        try {
            // SharedUserState를 Configuration으로 변환
            Configuration config = state.toConfiguration();

            // ExecutorManager를 사용하여 Stop 실행
            executorManager.doCRDAStop(config);

            stoppedModules.add("Stop: Success");
            System.out.println("Stop 성공");

        } catch (Exception e) {
            failedModules.add("Stop: " + e.getMessage());
            System.err.println("Stop 실패: " + e.getMessage());
        }

        result.put("success", failedModules.isEmpty());
        result.put("stoppedModules", stoppedModules);
        result.put("failedModules", failedModules);
        result.put("totalStopped", stoppedModules.size());
        result.put("totalFailed", failedModules.size());

        return result;
    }

}
