package com.java.kr.ac.kangwon.rodos.controller;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Stream;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.java.kr.ac.kangwon.rodos.model.sim.SoftwareModule;
import com.java.kr.ac.kangwon.rodos.service.ModuleClassifier;
import com.java.kr.ac.kangwon.rodos.service.rest.informationModel.IM;
import com.java.kr.ac.kangwon.rodos.service.rest.informationModel.IMRegistryApi;

/**
 * IM Registry REST API Controller
 * Edge, Robot 등의 정보 모델을 Registry에서 관리하고 Workspace 기능도 통합
 */
@RestController
@RequestMapping("/api/registry")
@CrossOrigin(origins = "*")

public class IMRegistryController {
    @Autowired
    private IMRegistryApi registryService;

    @Autowired
    private ModuleClassifier moduleClassifier;

    public static class LinkedModuleAspectsRequest {
        private List<Map<String, String>> swAspects;

        public List<Map<String, String>> getSwAspects() {
            return swAspects;
        }

        public void setSwAspects(List<Map<String, String>> swAspects) {
            this.swAspects = swAspects;
        }
    }

    /**
     * 모든 모듈을 가져와서 자동으로 분류하여 반환
     */
    @GetMapping("/all")
    public ResponseEntity<Object> getAllModules() {
        try {
            // 각 분류별로 직접 호출하여 모듈 목록 조회
            List<IM> aiModules = registryService.getListIM("ai");
            System.out.println("AI 모듈 개수: " + aiModules.size());

            List<IM> softwareModules = registryService.getListIM("software");
            System.out.println("Software 모듈 개수: " + softwareModules.size());

            List<IM> controllerModules = registryService.getListIM("controller");
            System.out.println("Controller 모듈 개수: " + controllerModules.size());
            // 하위 호환: 기존 robot 분류에 남아있는 데이터도 controller로 합쳐서 반환
            List<IM> legacyRobotModules = registryService.getListIM("robot");
            System.out.println("Legacy Robot 모듈 개수: " + legacyRobotModules.size());
            List<IM> mergedControllerModules = new ArrayList<>(controllerModules);
            mergedControllerModules.addAll(legacyRobotModules);

            List<IM> edgeModules = registryService.getListIM("edge");
            System.out.println("Edge 모듈 개수: " + edgeModules.size());

            List<IM> cloudModules = registryService.getListIM("cloud");
            System.out.println("Cloud 모듈 개수: " + cloudModules.size());

            // ModuleClassifier를 사용하여 controller와 robot으로 재분류
            List<IM> robotModules = new ArrayList<>();
            List<IM> classifiedControllerModules = new ArrayList<>();
            
            for (IM module : mergedControllerModules) {
                String moduleID = module.getModuleID();
                if (moduleID != null && !moduleID.isEmpty()) {
                    String classification = moduleClassifier.classifyModule(moduleID);
                    if ("robot".equals(classification)) {
                        robotModules.add(module);
                    } else {
                        classifiedControllerModules.add(module);
                    }
                } else {
                    // moduleID가 없으면 기본적으로 controller로 분류
                    classifiedControllerModules.add(module);
                }
            }

            // 분류된 결과를 맵으로 반환
            var result = new java.util.HashMap<String, Object>();
            result.put("ai", aiModules);
            result.put("controller", classifiedControllerModules);
            result.put("robot", robotModules);
            result.put("edge", edgeModules);
            result.put("cloud", cloudModules);
            result.put("software", softwareModules);


            return ResponseEntity.ok(result);
        } catch (Exception e) {
            System.out.println("=== getAllModules 예외 발생 ===");
            System.out.println("예외 타입: " + e.getClass().getSimpleName());
            System.out.println("예외 메시지: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * 특정 분류의 모듈 목록 조회
     */
    @GetMapping("/list/{classification}")
    public ResponseEntity<List<IM>> getListIM(@PathVariable String classification) {
        try {
            List<IM> modules = registryService.getListIM(classification);
            return ResponseEntity.ok(modules);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * AI 모듈 목록 조회
     */
    @GetMapping("/ai")
    public ResponseEntity<List<IM>> getAiModules() {
        try {
            List<IM> aiModules = registryService.getListIM("ai");
            return ResponseEntity.ok(aiModules);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
    /**
     * Software 모듈 목록 조회
     */
    @GetMapping("/software")
    public ResponseEntity<List<IM>> getSoftwareModules() {
        try {
            List<IM> softwareModules = registryService.getListIM("software");
            return ResponseEntity.ok(softwareModules);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Controller 모듈 목록 조회
     */
    @GetMapping("/controller")
    public ResponseEntity<List<IM>> getControllerModules() {
        try {
            List<IM> controllerModules = registryService.getListIM("controller");
            return ResponseEntity.ok(controllerModules);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * 모듈 ID로 모듈 정보 조회
     */
    @GetMapping("/module/{moduleId}")
    public ResponseEntity<IM> getIM(@PathVariable String moduleId) {
        try {
            IM module = registryService.getIM(moduleId);
            if (module != null) {
                return ResponseEntity.ok(module);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * 모듈 ID로 정보모델을 파싱하여 프론트에서 바로 사용할 수 있는 JSON으로 반환
     */
    @GetMapping("/module/{moduleId}/model-data")
    public ResponseEntity<Object> getParsedModuleData(@PathVariable String moduleId) {
        try {
            IM im = getIMByFlexibleId(moduleId);
            if (im == null) {
                return ResponseEntity.notFound().build();
            }

            SoftwareModule moduleData = moduleClassifier.xmlToSoftwareModuleSafe(im.getXmlString(), im.getModuleName());
            Map<String, Object> response = new LinkedHashMap<>();
            response.put("found", true);
            response.put("moduleName", moduleData.getModuleName());
            response.put("moduleID", im.getModuleID());
            response.put("manufacturer", moduleData.getManufacturer());
            response.put("description", moduleData.getDescription());
            response.put("examples", moduleData.getExamples());
            response.put("idnType", moduleData.getIdnType() != null ? moduleData.getIdnType() : new HashMap<>());
            response.put("properties", moduleData.getProperties() != null ? moduleData.getProperties() : new HashMap<>());
            response.put("ioVariables", moduleData.getIoVariables() != null ? moduleData.getIoVariables() : new HashMap<>());
            response.put("services", moduleData.getServices() != null ? moduleData.getServices() : new HashMap<>());
            response.put("infrastructure", moduleData.getInfrastructure() != null ? moduleData.getInfrastructure() : new HashMap<>());
            response.put("safeSecure", moduleData.getSafeSecure() != null ? moduleData.getSafeSecure() : new HashMap<>());
            response.put("modelling", moduleData.getModelling() != null ? moduleData.getModelling() : new HashMap<>());
            response.put("executableForm", moduleData.getExecutableForm() != null ? moduleData.getExecutableForm() : new HashMap<>());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Failed to parse module data: " + e.getMessage());
        }
    }

    /**
     * IDnType에서 선택한 SW 모듈들(swAspects)의 services/ioVariables 조회
     */
    @PostMapping("/module/linked-data")
    public ResponseEntity<Object> getLinkedModuleData(@RequestBody LinkedModuleAspectsRequest request) {
        System.out.println("linked-data api 요청 받음");
        try {
            List<Map<String, String>> requestedAspects = request != null ? request.getSwAspects() : null;
            String requestJson = new com.fasterxml.jackson.databind.ObjectMapper()
                    .writerWithDefaultPrettyPrinter()
                    .writeValueAsString(requestedAspects);
            System.out.println("linked-data api 요청 swAspects 개수: " + (requestedAspects != null ? requestedAspects.size() : 0));
            System.out.println("linked-data api 요청 swAspects: ");
            System.out.println(requestJson);
        } catch (Exception logError) {
            System.out.println("linked-data api 요청 데이터 로깅 실패: " + logError.getMessage());
        }
        try {
            List<Map<String, String>> swAspects = request != null ? request.getSwAspects() : null;
            if (swAspects == null || swAspects.isEmpty()) {
                return ResponseEntity.badRequest().body("swAspects is required");
            }

            List<Map<String, Object>> modules = new ArrayList<>();

            for (Map<String, String> aspect : swAspects) {
                String mID = aspect != null ? aspect.get("mID") : null;
                String iID = aspect != null ? aspect.get("iID") : null;
                if (mID == null || mID.trim().isEmpty()) continue;

                String safeIID = (iID == null || iID.trim().isEmpty()) ? "00" : iID.trim();
                String hyphenModuleId = mID + "-" + safeIID;
                String plainModuleId = mID + safeIID;

                IM im = registryService.getIM(hyphenModuleId);
                if (im == null) im = registryService.getIM(plainModuleId);

                Map<String, Object> moduleInfo = new LinkedHashMap<>();
                moduleInfo.put("requestedModuleID", hyphenModuleId);

                if (im == null) {
                    moduleInfo.put("found", false);
                    moduleInfo.put("moduleName", "");
                    moduleInfo.put("moduleID", hyphenModuleId);
                    moduleInfo.put("services", new HashMap<>());
                    moduleInfo.put("ioVariables", new HashMap<>());
                    moduleInfo.put("properties", new HashMap<>());
                    modules.add(moduleInfo);
                    continue;
                }

                SoftwareModule moduleData = moduleClassifier.xmlToSoftwareModuleSafe(im.getXmlString(), im.getModuleName());
                moduleInfo.put("found", true);
                moduleInfo.put("moduleName", moduleData.getModuleName());
                moduleInfo.put("moduleID", im.getModuleID());
                moduleInfo.put("services", moduleData.getServices() != null ? moduleData.getServices() : new HashMap<>());
                moduleInfo.put("ioVariables", moduleData.getIoVariables() != null ? moduleData.getIoVariables() : new HashMap<>());
                moduleInfo.put("properties", moduleData.getProperties() != null ? moduleData.getProperties() : new HashMap<>());
                modules.add(moduleInfo);
            }

            Map<String, Object> response = new LinkedHashMap<>();
            response.put("modules", modules);
            response.put("count", modules.size());

            try {
                String responseJson = new com.fasterxml.jackson.databind.ObjectMapper()
                        .writerWithDefaultPrettyPrinter()
                        .writeValueAsString(response);
                System.out.println("=== /api/registry/module/linked-data response ===");
                System.out.println(responseJson);
                System.out.println("=== /api/registry/module/linked-data response end ===");
            } catch (Exception logError) {
                System.out.println("=== /api/registry/module/linked-data response (fallback) ===");
                System.out.println(response);
                System.out.println("response logging failed: " + logError.getMessage());
                System.out.println("=== /api/registry/module/linked-data response end ===");
            }

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Failed to load linked module data: " + e.getMessage());
        }
    }

    private IM getIMByFlexibleId(String moduleId) {
        if (moduleId == null || moduleId.trim().isEmpty()) {
            return null;
        }

        String trimmed = moduleId.trim();
        IM im = registryService.getIM(trimmed);
        if (im != null) return im;

        if (trimmed.contains("-")) {
            String plain = trimmed.replace("-", "");
            return registryService.getIM(plain);
        }

        if (trimmed.length() > 2) {
            String withHyphen = trimmed.substring(0, trimmed.length() - 2) + "-" + trimmed.substring(trimmed.length() - 2);
            IM hyphenCandidate = registryService.getIM(withHyphen);
            if (hyphenCandidate != null) return hyphenCandidate;
        }

        return null;
    }


    /**
     * 새 모듈 등록 (JSON 또는 파일 업로드 지원)
     */
    @PostMapping("/module/upload")
    public ResponseEntity<String> doUploadIM(
            @RequestParam("file") MultipartFile file) {
        try {
            if (file == null || file.isEmpty()) {
                return ResponseEntity.badRequest().body("File is required");
            }

            // 파일 업로드 처리
            String moduleName = file.getOriginalFilename();
            if (moduleName != null && moduleName.contains(".")) {
                moduleName = moduleName.substring(0, moduleName.lastIndexOf("."));
            }

            String xmlContent = new String(file.getBytes(), "UTF-8");
            System.out.println(xmlContent);
            
            SoftwareModule softwareModule = moduleClassifier.xmlToSoftwareModuleSafe(xmlContent, moduleName);

            // 모듈ID 추출 (idnType에서 mID와 iID를 조합)
            String moduleId = null;
            System.out.println("=== 모듈ID 추출 시작 ===");
            System.out.println("idnType: " + (softwareModule.getIdnType() != null ? "존재" : "null"));
            
            if (softwareModule.getIdnType() != null) {
                var moduleIDObj = softwareModule.getIdnType().getModuleID();
                System.out.println("moduleID 객체: " + (moduleIDObj != null ? "존재" : "null"));
                
                if (moduleIDObj != null) {
                    String mID = moduleIDObj.getmID();
                    String iID = moduleIDObj.getiID();
                    System.out.println("mID: " + mID);
                    System.out.println("iID: " + iID);
                    
                    if (mID != null && !mID.trim().isEmpty()) {
                        if (iID != null && !iID.trim().isEmpty()) {
                            moduleId = mID + "-" + iID;
                        } else {
                            moduleId = mID;
                        }
                        System.out.println("추출된 moduleId: " + moduleId);
                    } else {
                        System.out.println("Warning: mID가 null이거나 비어있음");
                    }
                } else {
                    System.out.println("Warning: ModuleID 객체가 null");
                }
            } else {
                System.out.println("Warning: idnType이 null");
            }
            
            // 모듈ID가 없으면 에러 처리
            if (moduleId == null || moduleId.trim().isEmpty()) {
                String errorMsg = "ModuleID를 추출할 수 없습니다. XML 파일에 ModuleID 정보가 있는지 확인하세요.";
                System.err.println(errorMsg);
                return ResponseEntity.badRequest().body(errorMsg);
            }
            
            System.out.println("최종 moduleId: " + moduleId);
            System.out.println("=== 모듈ID 추출 완료 ===");

            IM im = new IM(
                    softwareModule.getModuleName(),
                    moduleId,
                    xmlContent,
                    IM.Type.SOFTWARE);

            System.out.println("=== IM 데이터 ===");
            System.out.println("Module Name: " + im.getModuleName());
            System.out.println("Module ID: " + im.getModuleID());
            System.out.println("Classification: " + im.getClassification());
            System.out.println("=================================");
            
            // 모듈 ID를 분석하여 자동으로 분류 설정
            String detectedClassification = moduleClassifier.classifyModule(im.getModuleID());
            im.setClassification(detectedClassification);

            boolean success = registryService.doUploadIM(im);
            if (success) {
                String message = "Module file uploaded and registered successfully: " + file.getOriginalFilename();
                return ResponseEntity.ok(message + " with classification: " + detectedClassification);
            } else {
                return ResponseEntity.internalServerError().body("Failed to add module");
            }
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Error adding module: " + e.getMessage());
        }
    }

    /**
     * 모듈 삭제 (모듈 ID 또는 파일명으로)
     */
    @DeleteMapping("/module/delete")
    public ResponseEntity<String> deleteIM(
            @RequestParam(value = "moduleId", required = false) String moduleId,
            @RequestBody(required = false) Map<String, String> request) {
        try {
            String targetId = moduleId;

            if (targetId == null && request != null) {
                // 파일명으로 삭제
                String filename = request.get("filename");
                if (filename == null) {
                    return ResponseEntity.badRequest()
                            .body("Either moduleId parameter or filename in body is required");
                }

                // 파일명에서 모듈명 추출 (확장자 제거)
                targetId = filename;
                if (targetId.contains(".")) {
                    targetId = targetId.substring(0, targetId.lastIndexOf("."));
                }
            } else if (targetId == null) {
                return ResponseEntity.badRequest().body("Either moduleId parameter or filename in body is required");
            }

            boolean success = registryService.deleteIM(targetId);
            if (success) {
                return ResponseEntity.ok("Module deleted successfully: " + targetId);
            } else {
                return ResponseEntity.internalServerError().body("Failed to delete module");
            }
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Error deleting module: " + e.getMessage());
        }
    }

    // ========== Workspace 기능 ==========
    /**
     * Workspace의 Module Info에 XML 파일 저장
     */
    @PostMapping("/workspace/save-file")
    public ResponseEntity<String> saveWorkspaceFile(
            @RequestParam("filename") String filename,
            @RequestParam("content") String content) {
        try {
            // .rodos/WorkSpace/Module Info 디렉토리 경로
            Path workspacePath = Paths.get(".rodos", "WorkSpace");
            Path moduleInfoPath = workspacePath.resolve("Module Info");
            
            // 디렉토리가 없으면 생성
            if (!Files.exists(moduleInfoPath)) {
                Files.createDirectories(moduleInfoPath);
            }
            
            // 파일 경로
            Path filePath = moduleInfoPath.resolve(filename);
            
            // 파일 저장
            Files.write(filePath, content.getBytes("UTF-8"));
            
            return ResponseEntity.ok("File saved successfully: " + filename);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Error saving file: " + e.getMessage());
        }
    }

    /**
     * Workspace 파일 내용 조회
     */
    @GetMapping("/workspace/file")
    public ResponseEntity<String> getWorkspaceFile(
            @RequestParam("filename") String filename) {
        try {
            // .rodos/WorkSpace 디렉토리 경로
            Path workspacePath = Paths.get(".rodos", "WorkSpace");
            
            // Module Info와 Configuration 디렉토리에서 파일 찾기
            Path moduleInfoPath = workspacePath.resolve("Module Info").resolve(filename);
            Path configPath = workspacePath.resolve("Configuration").resolve(filename);
            
            Path filePath = null;
            if (Files.exists(moduleInfoPath)) {
                filePath = moduleInfoPath;
            } else if (Files.exists(configPath)) {
                filePath = configPath;
            } else {
                return ResponseEntity.notFound().build();
            }
            
            // 파일 내용 읽기
            String content = Files.readString(filePath);
            return ResponseEntity.ok()
                    .header("Content-Type", "text/plain; charset=UTF-8")
                    .body(content);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Error reading file: " + e.getMessage());
        }
    }

    /**
     * Workspace 구조 조회
     */
    @GetMapping("/workspace/structure")
    public ResponseEntity<List<Map<String, Object>>> getWorkspaceStructure() {
        try {
            List<Map<String, Object>> structure = new ArrayList<>();

            // .rodos/WorkSpace 디렉토리 경로
            Path workspacePath = Paths.get(".rodos", "WorkSpace");

            if (!Files.exists(workspacePath)) {
                // 디렉토리가 없으면 기본 구조 생성
                Files.createDirectories(workspacePath);
                Files.createDirectories(workspacePath.resolve("Configuration"));
                Files.createDirectories(workspacePath.resolve("Module Info"));
            }

            // WorkSpace 루트 노드
            Map<String, Object> workspaceNode = new HashMap<>();
            workspaceNode.put("key", "workspace");
            workspaceNode.put("label", "WorkSpace");

            List<Map<String, Object>> workspaceChildren = new ArrayList<>();

            // Configuration 디렉토리
            Path configPath = workspacePath.resolve("Configuration");
            Map<String, Object> configNode = new HashMap<>();
            configNode.put("key", "configuration");
            configNode.put("label", "Configuration");

            List<Map<String, Object>> configChildren = new ArrayList<>();
            if (Files.exists(configPath)) {
                try (Stream<Path> paths = Files.list(configPath)) {
                    paths.filter(Files::isRegularFile)
                            .forEach(file -> {
                                Map<String, Object> fileNode = new HashMap<>();
                                fileNode.put("key", "config_" + file.getFileName().toString());
                                fileNode.put("label", file.getFileName().toString());
                                fileNode.put("path", file.toString());
                                configChildren.add(fileNode);
                            });
                }
            }
            configNode.put("children", configChildren);
            workspaceChildren.add(configNode);

            // Module Info 디렉토리
            Path moduleInfoPath = workspacePath.resolve("Module Info");
            Map<String, Object> moduleInfoNode = new HashMap<>();
            moduleInfoNode.put("key", "moduleinfo");
            moduleInfoNode.put("label", "Module Info");

            List<Map<String, Object>> moduleInfoChildren = new ArrayList<>();
            if (Files.exists(moduleInfoPath)) {
                try (Stream<Path> paths = Files.list(moduleInfoPath)) {
                    paths.filter(Files::isRegularFile)
                            .forEach(file -> {
                                Map<String, Object> fileNode = new HashMap<>();
                                fileNode.put("key", "module_" + file.getFileName().toString());
                                fileNode.put("label", file.getFileName().toString());
                                fileNode.put("path", file.toString());
                                moduleInfoChildren.add(fileNode);
                            });
                }
            }
            moduleInfoNode.put("children", moduleInfoChildren);
            workspaceChildren.add(moduleInfoNode);

            workspaceNode.put("children", workspaceChildren);
            structure.add(workspaceNode);

            return ResponseEntity.ok(structure);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
}
