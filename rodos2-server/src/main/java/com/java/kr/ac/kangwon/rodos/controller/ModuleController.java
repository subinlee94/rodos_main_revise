package com.java.kr.ac.kangwon.rodos.controller;

import java.io.FileWriter;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.module.jsonSchema.JsonSchema;
import com.fasterxml.jackson.module.jsonSchema.JsonSchemaGenerator;
import com.java.kr.ac.kangwon.rodos.model.RobotInfo;
import com.java.kr.ac.kangwon.rodos.model.SharedUserState;
import com.java.kr.ac.kangwon.rodos.model.cim.CompModule;
import com.java.kr.ac.kangwon.rodos.model.sim.SoftwareModule;
import com.java.kr.ac.kangwon.rodos.service.SharedUserStateService;
import com.java.kr.ac.kangwon.rodos.service.SoftwareModuleService;
import com.java.kr.ac.kangwon.rodos.service.rest.agent.SimulationConfig;

@RestController
@CrossOrigin(origins = "http://localhost:3000")
public class ModuleController {

    @Autowired
    private SoftwareModuleService softwareModuleService;

    @Autowired
    private SharedUserStateService sharedUserStateService;

    @GetMapping("/api/model/sim")
    public JsonSchema getModuleSchema() throws Exception {
        ObjectMapper mapper = new ObjectMapper();
        JsonSchemaGenerator schemaGen = new JsonSchemaGenerator(mapper);
        return schemaGen.generateSchema(SoftwareModule.class);
    }

    @PostMapping("/api/module/update")
    public ResponseEntity<String> updateModule(@RequestBody String moduleData) {
        try {
            System.out.println("Received module data: " + moduleData);

            ObjectMapper mapper = new ObjectMapper();

            // JSON 파싱 설정 개선
            mapper.configure(com.fasterxml.jackson.databind.DeserializationFeature.ACCEPT_EMPTY_STRING_AS_NULL_OBJECT,
                    true);
            mapper.configure(com.fasterxml.jackson.databind.DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
            mapper.configure(com.fasterxml.jackson.databind.DeserializationFeature.ACCEPT_SINGLE_VALUE_AS_ARRAY, true);
            mapper.configure(com.fasterxml.jackson.databind.DeserializationFeature.FAIL_ON_NULL_FOR_PRIMITIVES, false);
            mapper.configure(com.fasterxml.jackson.databind.DeserializationFeature.READ_UNKNOWN_ENUM_VALUES_AS_NULL,
                    true);

            SoftwareModule softwareModule = mapper.readValue(moduleData, SoftwareModule.class);

            System.out.println("moduleName: " + softwareModule.getModuleName());
            System.out.println("idnType: " + softwareModule.getIdnType());
            System.out.println("properties: " + softwareModule.getProperties());
            System.out.println("ioVariables: " + softwareModule.getIoVariables());
            System.out.println("infrastructure: " + softwareModule.getInfrastructure());
            System.out.println("executableForm: " + softwareModule.getExecutableForm());

            softwareModuleService.updateModule(softwareModule);
            System.out.println("Module updated successfully in service");
            return ResponseEntity.ok("Module updated successfully");
        } catch (JsonProcessingException e) {
            System.out.println("JSON Processing Error: " + e.getMessage());
            System.out.println("Error location: " + e.getLocation());
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Invalid JSON format: " + e.getMessage());
        } catch (Exception e) {
            System.out.println("ERROR in updateModule: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Error updating module: " + e.getMessage());
        }
    }

    @PostMapping("/api/module/preview-xml")
    public ResponseEntity<String> previewModuleXML(@RequestBody String moduleData) {
        try {
            System.out.println("=== Preview XML Request ===");
            System.out.println("Received module data: " + moduleData);

            ObjectMapper mapper = new ObjectMapper();
            // JSON 파싱 설정 개선
            mapper.configure(com.fasterxml.jackson.databind.DeserializationFeature.ACCEPT_EMPTY_STRING_AS_NULL_OBJECT,
                    true);
            mapper.configure(com.fasterxml.jackson.databind.DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
            mapper.configure(com.fasterxml.jackson.databind.DeserializationFeature.ACCEPT_SINGLE_VALUE_AS_ARRAY, true);
            mapper.configure(com.fasterxml.jackson.databind.DeserializationFeature.FAIL_ON_NULL_FOR_PRIMITIVES, false);
            mapper.configure(com.fasterxml.jackson.databind.DeserializationFeature.READ_UNKNOWN_ENUM_VALUES_AS_NULL,
                    true);

            System.out.println("Parsing JSON to SoftwareModule...");
            SoftwareModule softwareModule = mapper.readValue(moduleData, SoftwareModule.class);
            System.out.println("SoftwareModule parsed successfully");
            System.out.println("moduleName: " + softwareModule.getModuleName());
            System.out.println("idnType: " + softwareModule.getIdnType());
            System.out.println("properties: " + softwareModule.getProperties());
            System.out.println("ioVariables: " + softwareModule.getIoVariables());
            System.out.println("infrastructure: " + softwareModule.getInfrastructure());
            System.out.println("executableForm: " + softwareModule.getExecutableForm());

            // XML 변환
            System.out.println("Converting to XML...");
            com.fasterxml.jackson.dataformat.xml.XmlMapper xmlMapper = new com.fasterxml.jackson.dataformat.xml.XmlMapper();
            xmlMapper.enable(com.fasterxml.jackson.databind.SerializationFeature.INDENT_OUTPUT);
            xmlMapper.configure(com.fasterxml.jackson.databind.SerializationFeature.FAIL_ON_EMPTY_BEANS, false);
            String xml = xmlMapper.writeValueAsString(softwareModule);
            System.out.println("XML generated successfully");
            System.out.println("XML preview: " + xml.substring(0, Math.min(xml.length(), 200)) + "...");

            return ResponseEntity.ok(xml);
        } catch (com.fasterxml.jackson.core.JsonProcessingException e) {
            System.out.println("JSON Processing Error in preview-xml: " + e.getMessage());
            System.out.println("Error location: " + e.getLocation());
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Invalid JSON format: " + e.getMessage());
        } catch (Exception e) {
            System.out.println("ERROR in previewModuleXML: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Error generating XML preview: " + e.getMessage());
        }
    }

    @PostMapping("/api/module/save-xml")
    public ResponseEntity<String> saveModuleXML(@RequestBody String moduleData) {
        try {
            System.out.println("=== Save Module XML Request ===");
            System.out.println("Received module data: " + moduleData);

            ObjectMapper mapper = new ObjectMapper();
            mapper.configure(com.fasterxml.jackson.databind.DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
            mapper.configure(com.fasterxml.jackson.databind.DeserializationFeature.ACCEPT_EMPTY_STRING_AS_NULL_OBJECT,
                    true);
            mapper.configure(com.fasterxml.jackson.databind.DeserializationFeature.ACCEPT_SINGLE_VALUE_AS_ARRAY, true);
            mapper.configure(com.fasterxml.jackson.databind.DeserializationFeature.FAIL_ON_NULL_FOR_PRIMITIVES, false);

            // JSON에서 type 필드를 먼저 확인하여 모듈 타입 결정
            com.fasterxml.jackson.databind.JsonNode rootNode = mapper.readTree(moduleData);
            String moduleType = rootNode.has("type") ? rootNode.get("type").asText() : "SIM";

            System.out.println("Detected module type: " + moduleType);

            String xml;
            String moduleName;
            String filePrefix;

            if ("Composite".equals(moduleType)) {
                // Composite 모듈 처리
                CompModule compModule = mapper.readValue(moduleData, CompModule.class);
                System.out.println("CompModule parsed successfully");
                System.out.println("moduleName: " + compModule.getModuleName());
                System.out.println("manufacturer: " + compModule.getManufacturer());

                // SimulationConfig 업데이트 (Modelling 정보에서 추출)
                String selectedRobotName = rootNode.has("selectedRobotName")
                        ? rootNode.get("selectedRobotName").asText()
                        : null;
                updateSimulationConfigFromModelling(compModule, selectedRobotName);

                // XML 변환
                com.fasterxml.jackson.dataformat.xml.XmlMapper xmlMapper = new com.fasterxml.jackson.dataformat.xml.XmlMapper();
                xmlMapper.enable(com.fasterxml.jackson.databind.SerializationFeature.INDENT_OUTPUT);
                xmlMapper.configure(com.fasterxml.jackson.databind.SerializationFeature.FAIL_ON_EMPTY_BEANS, false);
                xml = xmlMapper.writeValueAsString(compModule);

                moduleName = (compModule.getModuleName() != null) ? compModule.getModuleName() : "composite_module";
                filePrefix = "composite";
            } else {
                // Software 모듈 처리 (기존 로직)
                SoftwareModule softwareModule = mapper.readValue(moduleData, SoftwareModule.class);
                System.out.println("SoftwareModule parsed successfully");
                System.out.println("moduleName: " + softwareModule.getModuleName());

                // XML 변환
                com.fasterxml.jackson.dataformat.xml.XmlMapper xmlMapper = new com.fasterxml.jackson.dataformat.xml.XmlMapper();
                xmlMapper.enable(com.fasterxml.jackson.databind.SerializationFeature.INDENT_OUTPUT);
                xmlMapper.configure(com.fasterxml.jackson.databind.SerializationFeature.FAIL_ON_EMPTY_BEANS, false);
                xml = xmlMapper.writeValueAsString(softwareModule);

                moduleName = (softwareModule.getModuleName() != null) ? softwareModule.getModuleName()
                        : "software_module";
                filePrefix = "software";
            }

            // Module Info 디렉토리 생성
            String moduleInfoDir = ".rodos/WorkSpace/Module Info";
            Path moduleInfoPath = Paths.get(moduleInfoDir);
            if (!Files.exists(moduleInfoPath)) {
                Files.createDirectories(moduleInfoPath);
            }

            // 파일명 생성
            if (moduleName.trim().isEmpty()) {
                moduleName = filePrefix + "_module";
            }
            String fileName = moduleName + ".xml";
            Path filePath = moduleInfoPath.resolve(fileName);

            // XML 파일 저장
            try (FileWriter writer = new FileWriter(filePath.toFile())) {
                writer.write(xml);
            }

            System.out.println("XML file saved successfully: " + filePath.toAbsolutePath());
            return ResponseEntity.ok("XML file saved successfully: " + filePath.toAbsolutePath());
        } catch (Exception e) {
            System.out.println("ERROR in saveModuleXML: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Error saving XML file: " + e.getMessage());
        }
    }

    /**
     * Composite 모듈의 Modelling 정보에서 SimulationConfig를 업데이트하고 SharedUserState에 저장
     * 선택된 로봇만 업데이트하여 각 로봇의 개별 모델링 정보를 보존
     */
    private void updateSimulationConfigFromModelling(CompModule compModule, String selectedRobotName) {
        try {
            if (compModule.getModelling() != null && compModule.getModelling().getList_simulationModel() != null) {
                var simulationModels = compModule.getModelling().getList_simulationModel();

                // SharedUserState에서 Robot 정보 가져오기
                SharedUserState state = sharedUserStateService.loadCurrentState();
                if (state.getEditors() != null && state.getEditors().getSystem() != null
                        && state.getEditors().getSystem().getRobots() != null) {

                    // 선택된 로봇만 SimulationConfig 생성/업데이트
                    if (selectedRobotName != null && !selectedRobotName.trim().isEmpty()) {
                        System.out.println("선택된 로봇: " + selectedRobotName);

                        // 선택된 로봇 찾기
                        RobotInfo selectedRobot = null;
                        for (var robot : state.getEditors().getSystem().getRobots()) {
                            if (robot.getName() != null && robot.getName().equals(selectedRobotName)) {
                                selectedRobot = robot;
                                break;
                            }
                        }

                        if (selectedRobot != null) {
                            for (var simulationModel : simulationModels) {
                                if (simulationModel.getSimulator() != null
                                        && !simulationModel.getSimulator().trim().isEmpty()) {

                                    // 기존 SimulationConfig 찾기
                                    SimulationConfig existingConfig = null;
                                    if (state.getSimulationInfo() != null
                                            && state.getSimulationInfo().getSimulationConfigs() != null) {
                                        for (var config : state.getSimulationInfo().getSimulationConfigs()) {
                                            if (config.getRobotName() != null
                                                    && config.getRobotName().equals(selectedRobot.getName())) {
                                                existingConfig = config;
                                                break;
                                            }
                                        }
                                    }

                                    if (existingConfig != null) {
                                        // 기존 config가 있으면 simulator, path만 업데이트 (namespace, x, y, theta는 유지)
                                        System.out.println(
                                                "로봇 " + selectedRobot.getName() + "의 기존 SimulationConfig 업데이트:");
                                        System.out.println("  - 기존 simulator: " + existingConfig.getSimulator() + " -> "
                                                + simulationModel.getSimulator());

                                        existingConfig.setSimulatorName(simulationModel.getSimulator());

                                        // Model Files에서 model_path 추출
                                        if (simulationModel.getModelFiles() != null
                                                && !simulationModel.getModelFiles().isEmpty()) {
                                            var firstModelFile = simulationModel.getModelFiles().get(0);
                                            if (firstModelFile.getFilePath() != null
                                                    && !firstModelFile.getFilePath().trim().isEmpty()) {
                                                System.out.println("  - 기존 path: " + existingConfig.getPath() + " -> "
                                                        + firstModelFile.getFilePath());
                                                existingConfig.setPath(firstModelFile.getFilePath());
                                            }
                                        }

                                        // 업데이트된 config 저장
                                        sharedUserStateService.addSimulationConfig(existingConfig);

                                        System.out.println("SimulationConfig 업데이트 완료: " + selectedRobot.getName());
                                        System.out.println("  - Simulator: " + existingConfig.getSimulator());
                                        System.out.println("  - Model Path: " + existingConfig.getPath());
                                    } else {
                                        // 기존 config가 없으면 새로운 SimulationConfig 생성
                                        SimulationConfig newConfig = new SimulationConfig();
                                        newConfig.setRobotName(selectedRobot.getName());

                                        // Robot의 simulation 정보에서 namespace, x, y, theta 가져오기
                                        if (selectedRobot.getSimulation() != null) {
                                            System.out.println(
                                                    "로봇 " + selectedRobot.getName() + "의 simulation 정보: namespace="
                                                            + selectedRobot.getSimulation().getNamespace() +
                                                            ", x=" + selectedRobot.getSimulation().getX() + ", y="
                                                            + selectedRobot.getSimulation().getY() +
                                                            ", theta=" + selectedRobot.getSimulation().getTheta());
                                            newConfig.setNamespace(selectedRobot.getSimulation().getNamespace());
                                            newConfig.setX(selectedRobot.getSimulation().getX());
                                            newConfig.setY(selectedRobot.getSimulation().getY());
                                            newConfig.setTheta(selectedRobot.getSimulation().getTheta());
                                        } else {
                                            System.out.println(
                                                    "로봇 " + selectedRobot.getName() + "의 simulation 정보가 없음 - 기본값 사용");
                                            newConfig.setNamespace(selectedRobot.getName());
                                            newConfig.setX("0");
                                            newConfig.setY("0");
                                            newConfig.setTheta("0");
                                        }

                                        // Composite 모듈에서 simulator, path 가져오기
                                        newConfig.setSimulatorName(simulationModel.getSimulator());

                                        // Model Files에서 model_path 추출
                                        if (simulationModel.getModelFiles() != null
                                                && !simulationModel.getModelFiles().isEmpty()) {
                                            var firstModelFile = simulationModel.getModelFiles().get(0);
                                            if (firstModelFile.getFilePath() != null
                                                    && !firstModelFile.getFilePath().trim().isEmpty()) {
                                                newConfig.setPath(firstModelFile.getFilePath());
                                            }
                                        }

                                        // 새로운 config 저장
                                        sharedUserStateService.addSimulationConfig(newConfig);

                                        System.out.println("새로운 SimulationConfig 생성 완료: " + selectedRobot.getName());
                                        System.out.println("  - RobotName: " + newConfig.getRobotName());
                                        System.out.println("  - Namespace: " + newConfig.getNamespace());
                                        System.out.println("  - Position: x=" + newConfig.getX() + ", y="
                                                + newConfig.getY() + ", theta=" + newConfig.getTheta());
                                        System.out.println("  - Simulator: " + newConfig.getSimulator());
                                        System.out.println("  - Model Path: " + newConfig.getPath());
                                    }
                                    break; // 첫 번째 simulationModel만 사용
                                }
                            }
                        } else {
                            System.out.println("선택된 로봇을 찾을 수 없음: " + selectedRobotName);
                        }
                    } else {
                        System.out.println("선택된 로봇 정보가 없음 - SimulationConfig 업데이트 건너뜀");
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("Error updating SimulationConfig: " + e.getMessage());
            e.printStackTrace();
        }
    }

}