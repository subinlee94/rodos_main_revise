package com.java.kr.ac.kangwon.rodos.controller;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.java.kr.ac.kangwon.rodos.model.SharedUserState;
import com.java.kr.ac.kangwon.rodos.service.SharedUserStateService;
import com.java.kr.ac.kangwon.rodos.service.rest.agent.SimulationConfig;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:3000")
public class SharedUserStateController {

    @Autowired
    private SharedUserStateService sharedUserStateService;

    /**
     * SharedUserState 전체 정보 가져오기
     */
    @GetMapping("/shared-user-state")
    public ResponseEntity<SharedUserState> getSharedUserState() {
        try {
            SharedUserState state = sharedUserStateService.loadCurrentState();
            return ResponseEntity.ok(state);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Canvas 상태 저장
     */
    @PostMapping("/canvas/save-state")
    public ResponseEntity<String> saveCanvasState(@RequestBody Map<String, Object> request) {
        try {
            @SuppressWarnings("unchecked")
            List<Object> hwModules = (List<Object>) request.get("hwModules");
            String lastFile = (String) request.get("lastFile");

            sharedUserStateService.saveCanvasState(hwModules, lastFile);

            return ResponseEntity.ok("Canvas state saved successfully");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                    .body("Failed to save canvas state: " + e.getMessage());
        }
    }

    /**
     * Canvas 상태 로드
     */
    @GetMapping("/canvas/load-state")
    public ResponseEntity<Map<String, Object>> loadCanvasState() {
        try {
            List<Object> hwModules = sharedUserStateService.loadCanvasState();
            String lastFile = sharedUserStateService.getLastFile();

            Map<String, Object> response = Map.of(
                    "hwModules", hwModules,
                    "lastFile", lastFile != null ? lastFile : "");

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Failed to load canvas state: " + e.getMessage()));
        }
    }

    /**
     * 마지막 파일 경로만 가져오기
     */
    @GetMapping("/canvas/last-file")
    public ResponseEntity<String> getLastFile() {
        try {
            String lastFile = sharedUserStateService.getLastFile();
            return ResponseEntity.ok(lastFile != null ? lastFile : "");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                    .body("Failed to get last file: " + e.getMessage());
        }
    }

    /**
     * 마지막 파일 경로 설정
     */
    @PostMapping("/last-file")
    public ResponseEntity<String> setLastFile(@RequestBody Map<String, String> request) {
        try {
            String lastFile = request.get("lastFile");
            sharedUserStateService.setLastFile(lastFile);
            return ResponseEntity.ok("Last file path updated successfully");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                    .body("Failed to set last file: " + e.getMessage());
        }
    }

    /**
     * 현재 상태를 Configuration으로 저장 (Save)
     */
    @PostMapping("/canvas/save-config")
    public ResponseEntity<String> saveConfiguration(@RequestBody Map<String, String> request) {
        try {
            String fileName = request.get("fileName");
            if (fileName == null || fileName.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("File name is required");
            }

            // 현재 상태를 가져와서 Configuration으로 저장
            var currentState = sharedUserStateService.loadCurrentState();
            sharedUserStateService.saveConfiguration(fileName, currentState);

            return ResponseEntity.ok("Configuration saved successfully as: " + fileName);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                    .body("Failed to save configuration: " + e.getMessage());
        }
    }

    /**
     * Configuration 파일 목록 가져오기
     */
    @GetMapping("/config-files")
    public ResponseEntity<List<String>> getConfigurationFiles() {
        try {
            List<String> files = sharedUserStateService.getConfigurationFiles();
            return ResponseEntity.ok(files);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(List.of());
        }
    }

    /**
     * Configuration 파일 열기 (Open)
     */
    @PostMapping("/canvas/open-config")
    public ResponseEntity<Map<String, Object>> openConfiguration(@RequestBody Map<String, String> request) {
        try {
            String fileName = request.get("fileName");
            if (fileName == null || fileName.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "File name is required"));
            }

            // Configuration 파일을 로드하여 현재 상태로 설정
            var configState = sharedUserStateService.loadConfiguration(fileName);
            sharedUserStateService.saveCurrentState(configState);

            // Canvas 상태로 변환하여 반환
            List<Object> hwModules = sharedUserStateService.loadCanvasState();
            String lastFile = configState.getLastFile();

            Map<String, Object> response = Map.of(
                    "hwModules", hwModules,
                    "lastFile", lastFile != null ? lastFile : "",
                    "fileName", fileName);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Failed to open configuration: " + e.getMessage()));
        }
    }

    /**
     * 현재 상태 초기화 (New)
     */
    @PostMapping("/canvas/new-config")
    public ResponseEntity<Map<String, Object>> newConfiguration() {
        try {
            sharedUserStateService.initializeCurrentState();

            // 초기화된 Canvas 상태 반환
            List<Object> hwModules = sharedUserStateService.loadCanvasState();
            String lastFile = sharedUserStateService.getLastFile();

            Map<String, Object> response = Map.of(
                    "hwModules", hwModules,
                    "lastFile", lastFile != null ? lastFile : "");

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Failed to create new configuration: " + e.getMessage()));
        }
    }

    /**
     * 현재 SharedUserState에서 HW 모듈 목록 가져오기 (HwMappingDialog용)
     */
    @GetMapping("/hw-modules")
    public ResponseEntity<List<Map<String, Object>>> getHWModules() {
        try {
            List<Object> hwModules = sharedUserStateService.loadCanvasState();
            List<Map<String, Object>> result = new ArrayList<>();

            System.out.println("=== getHWModules 호출 ===");
            System.out.println("로드된 HW 모듈 개수: " + hwModules.size());

            for (Object hwModule : hwModules) {
                if (hwModule instanceof java.util.Map) {
                    @SuppressWarnings("unchecked")
                    java.util.Map<String, Object> hw = (java.util.Map<String, Object>) hwModule;

                    System.out.println("HW 모듈 정보: " + hw);

                    Map<String, Object> moduleInfo = new java.util.HashMap<>();
                    moduleInfo.put("name", hw.get("name") != null ? hw.get("name").toString() : "");
                    moduleInfo.put("type", hw.get("type") != null ? hw.get("type").toString() : "");
                    moduleInfo.put("targetName", hw.get("name") != null ? hw.get("name").toString() : "");

                    // SW 모듈들 포함
                    if (hw.get("swModules") != null) {
                        moduleInfo.put("swModules", hw.get("swModules"));
                    }

                    // Simulation 정보 포함
                    if (hw.get("simulation") != null) {
                        moduleInfo.put("simulation", hw.get("simulation"));
                    }
                    result.add(moduleInfo);
                }
            }

            System.out.println("반환할 결과: " + result);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(List.of());
        }
    }

    /**
     * HW 매핑 정보 저장
     */
    @PostMapping("/save-hw-mapping")
    public ResponseEntity<String> saveHwMapping(@RequestBody Map<String, String> request) {
        try {
            String moduleName = request.get("moduleName");
            String targetName = request.get("targetName");
            String type = request.get("type");
            String target = request.get("target");

            if (moduleName == null || targetName == null || type == null || target == null) {
                return ResponseEntity.badRequest().body("All parameters are required");
            }

            sharedUserStateService.saveHwMapping(moduleName, targetName, type, target);
            return ResponseEntity.ok("HW mapping saved successfully");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                    .body("Failed to save HW mapping: " + e.getMessage());
        }
    }

    /**
     * 통합된 Simulation API
     */
    @PostMapping("/simulation")
    public ResponseEntity<Map<String, Object>> simulation(@RequestBody Map<String, Object> request) {
        try {
            String action = (String) request.get("action");
            if (action == null || action.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "action parameter is required"));
            }

            switch (action) {
                case "save-robot":
                    return handleSaveRobot(request);
                case "set-mode":
                    return handleSetMode(request);
                case "save-hw":
                    return handleSaveHw(request);
                case "get-info":
                    return handleGetInfo();
                default:
                    return ResponseEntity.badRequest()
                            .body(Map.of("error", "Unknown action: " + action));
            }
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Failed to process simulation request: " + e.getMessage()));
        }
    }

    private ResponseEntity<Map<String, Object>> handleSaveRobot(Map<String, Object> request) {
        try {
            String robotName = (String) request.get("robotName");
            String namespace = (String) request.get("namespace");
            String x = (String) request.get("x");
            String y = (String) request.get("y");
            String theta = (String) request.get("theta");

            if (robotName == null || namespace == null || x == null || y == null || theta == null) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "All robot parameters are required"));
            }

            sharedUserStateService.saveSimulation(robotName, namespace, x, y, theta);
            return ResponseEntity.ok(Map.of("message", "Robot simulation saved successfully"));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Failed to save robot simulation: " + e.getMessage()));
        }
    }

    private ResponseEntity<Map<String, Object>> handleSetMode(Map<String, Object> request) {
        try {
            Boolean simMode = (Boolean) request.get("simMode");
            if (simMode == null) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "simMode parameter is required"));
            }

            sharedUserStateService.setSimMode(simMode);
            return ResponseEntity.ok(Map.of("message", "Simulation mode set to: " + simMode));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Failed to set simulation mode: " + e.getMessage()));
        }
    }

    private ResponseEntity<Map<String, Object>> handleSaveHw(Map<String, Object> request) {
        try {
            String simulationHwName = (String) request.get("simulationHwName");
            String simulationHwTarget = (String) request.get("simulationHwTarget");

            if (simulationHwName == null || simulationHwName.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "simulationHwName parameter is required"));
            }

            if (simulationHwTarget == null || simulationHwTarget.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "simulationHwTarget parameter is required"));
            }

            sharedUserStateService.saveSimulationInfo(simulationHwName, simulationHwTarget);
            return ResponseEntity
                    .ok(Map.of("message", "Simulation HW saved: " + simulationHwName + " -> " + simulationHwTarget));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Failed to save simulation HW: " + e.getMessage()));
        }
    }

    private ResponseEntity<Map<String, Object>> handleGetInfo() {
        try {
            Map<String, Object> simulationInfo = sharedUserStateService.getSimulationInfo();
            return ResponseEntity.ok(simulationInfo);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Failed to get simulation info: " + e.getMessage()));
        }
    }

    /**
     * SimulationConfig 갱신 API
     */
    @PostMapping("/simulation-config/refresh")
    public ResponseEntity<Map<String, Object>> refreshSimulationConfig() {
        try {
            System.out.println("=== SimulationConfig 갱신 시작 ===");

            // SharedUserState에서 Robot 정보를 가져와서 SimulationConfig 갱신
            SharedUserState state = sharedUserStateService.loadCurrentState();
            if (state.getEditors() != null && state.getEditors().getSystem() != null
                    && state.getEditors().getSystem().getRobots() != null) {

                for (var robot : state.getEditors().getSystem().getRobots()) {
                    System.out.println("Robot 확인: " + robot.getName() + ", simulation 정보: " +
                            (robot.getSimulation() != null ? "있음" : "없음"));
                    if (robot.getSimulation() != null) {
                        // 기존 SimulationConfig 찾기
                        SimulationConfig existingConfig = null;
                        if (state.getSimulationInfo() != null
                                && state.getSimulationInfo().getSimulationConfigs() != null) {
                            for (var config : state.getSimulationInfo().getSimulationConfigs()) {
                                if (config.getRobotName() != null
                                        && config.getRobotName().equals(robot.getName())) {
                                    existingConfig = config;
                                    break;
                                }
                            }
                        }

                        if (existingConfig != null) {
                            // 기존 SimulationConfig가 있으면 Robot 정보만 업데이트
                            System.out.println("기존 SimulationConfig 업데이트: " + robot.getName());
                            System.out.println("  - 기존 simulator: " + existingConfig.getSimulator());
                            System.out.println("  - 기존 path: " + existingConfig.getPath());

                            existingConfig.setNamespace(robot.getSimulation().getNamespace());
                            existingConfig.setX(robot.getSimulation().getX());
                            existingConfig.setY(robot.getSimulation().getY());
                            existingConfig.setTheta(robot.getSimulation().getTheta());

                            System.out.println("  - 업데이트된 namespace: " + existingConfig.getNamespace());
                            System.out.println("  - 업데이트된 position: x=" + existingConfig.getX() +
                                    ", y=" + existingConfig.getY() + ", theta=" + existingConfig.getTheta());
                        } else {
                            // 기존 SimulationConfig가 없으면 새로 생성
                            System.out.println("새로운 SimulationConfig 생성: " + robot.getName());
                            SimulationConfig config = new SimulationConfig();
                            config.setRobotName(robot.getName());
                            config.setNamespace(robot.getSimulation().getNamespace());
                            config.setX(robot.getSimulation().getX());
                            config.setY(robot.getSimulation().getY());
                            config.setTheta(robot.getSimulation().getTheta());

                            // SimulationConfig 저장
                            sharedUserStateService.addSimulationConfig(config);
                        }

                        // Robot의 simulation 태그에도 해당 로봇의 SimulationConfig만 복사
                        if (state.getSimulationInfo() != null
                                && state.getSimulationInfo().getSimulationConfigs() != null) {
                            if (robot.getSimulation() != null) {
                                // 해당 로봇의 SimulationConfig만 찾아서 복사
                                java.util.List<SimulationConfig> robotConfigs = new java.util.ArrayList<>();
                                for (var simConfig : state.getSimulationInfo().getSimulationConfigs()) {
                                    if (simConfig.getRobotName() != null
                                            && simConfig.getRobotName().equals(robot.getName())) {
                                        robotConfigs.add(simConfig);
                                        break;
                                    }
                                }
                                robot.getSimulation().setSimulationConfigs(robotConfigs);
                                System.out
                                        .println("SimulationConfig copied to Robot simulation tag: " + robot.getName());
                            }
                        }

                        // SharedUserState 저장
                        sharedUserStateService.saveCurrentState(state);
                    }
                }
            }

            return ResponseEntity.ok(Map.of("message", "SimulationConfig가 성공적으로 갱신되었습니다."));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "SimulationConfig 갱신 실패: " + e.getMessage()));
        }
    }

    /**
     * 통합된 Operations API
     */
    @PostMapping("/operations")
    public ResponseEntity<Map<String, Object>> operations(@RequestBody Map<String, String> request) {
        try {
            System.out.println("=== Operations API 호출 ===");
            System.out.println("Request: " + request);

            String action = request.get("action");
            if (action == null || action.isEmpty()) {
                System.out.println("Error: action parameter is required");
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "action parameter is required"));
            }

            System.out.println("Action: " + action);
            SharedUserState state = sharedUserStateService.loadCurrentState();
            System.out.println("SharedUserState loaded successfully");

            Map<String, Object> result;

            switch (action) {
                case "execute":
                    System.out.println("Executing executeModules...");
                    Map<String, Object> executeResult = sharedUserStateService.executeModules(state);
                    System.out.println("Execute result: " + executeResult);

                    // Deploy Agent 응답 형식으로 변환
                    result = convertToDeployAgentResponse(executeResult);
                    System.out.println("Converted result: " + result);
                    break;
                case "deploy":
                    System.out.println("Executing deployModules...");
                    result = sharedUserStateService.deployModules(state);
                    System.out.println("Deploy result: " + result);
                    break;
                case "stop":
                    System.out.println("Executing stopModules...");
                    result = sharedUserStateService.stopModules(state);
                    System.out.println("Stop result: " + result);
                    break;
                default:
                    System.out.println("Unknown action: " + action);
                    return ResponseEntity.badRequest()
                            .body(Map.of("error", "Unknown action: " + action));
            }

            System.out.println("Returning result: " + result);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Failed to process operation: " + e.getMessage()));
        }
    }

    /**
     * SharedUserStateService 결과를 Deploy Agent 응답 형식으로 변환
     */
    private Map<String, Object> convertToDeployAgentResponse(Map<String, Object> executeResult) {
        Map<String, Object> response = new java.util.HashMap<>();

        // success 필드를 status로 변환
        Boolean success = (Boolean) executeResult.get("success");
        if (success != null && success) {
            response.put("status", "success");
        } else {
            response.put("status", "error");
        }

        // executedModules에서 모듈 이름 추출하여 requested_containers 생성
        @SuppressWarnings("unchecked")
        java.util.List<String> executedModules = (java.util.List<String>) executeResult.get("executedModules");
        java.util.List<String> requestedContainers = new java.util.ArrayList<>();

        if (executedModules != null) {
            for (String module : executedModules) {
                // "moduleName: Success" 형식에서 모듈 이름만 추출
                String moduleName = module.split(":")[0].trim();
                requestedContainers.add(moduleName);
            }
        }

        response.put("requested_containers", requestedContainers);
        response.put("total_requested", requestedContainers.size());

        // 메시지 생성
        Integer totalExecuted = (Integer) executeResult.get("totalExecuted");
        Integer totalFailed = (Integer) executeResult.get("totalFailed");

        if (success != null && success) {
            response.put("message", "Container deployment requests sent for " + totalExecuted + " modules");
            response.put("note", "Containers are starting in background");
        } else {
            response.put("message", "Container deployment failed for " + totalFailed + " modules");
            response.put("error", "Deployment failed");
        }

        return response;
    }
}
