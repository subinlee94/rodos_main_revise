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
import java.util.concurrent.CompletableFuture;

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
import com.java.kr.ac.kangwon.rodos.model.cim.ModuleID;
import com.java.kr.ac.kangwon.rodos.service.ModuleClassifier;
import com.java.kr.ac.kangwon.rodos.service.PropertiesMapSerializer;
import com.java.kr.ac.kangwon.rodos.service.WorkspaceImService;
import com.java.kr.ac.kangwon.rodos.service.rest.informationModel.IM;
import com.java.kr.ac.kangwon.rodos.service.rest.informationModel.IMRegistryApi;
import com.java.kr.ac.kangwon.rodos.service.rest.informationModel.ImUploadResult;

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

    @Autowired
    private WorkspaceImService workspaceImService;

    public static class LinkedModuleAspectsRequest {
        private List<Map<String, String>> swAspects;
        private List<Map<String, String>> hwAspects;

        public List<Map<String, String>> getSwAspects() {
            return swAspects;
        }

        public void setSwAspects(List<Map<String, String>> swAspects) {
            this.swAspects = swAspects;
        }

        public List<Map<String, String>> getHwAspects() {
            return hwAspects;
        }

        public void setHwAspects(List<Map<String, String>> hwAspects) {
            this.hwAspects = hwAspects;
        }
    }

    /** A selectable source module, optionally nested below a selected HW/controller module. */
    private record LinkedAspect(Map<String, String> aspect, String parentModuleID, String parentModuleName,
            String sourceType) {}

    /**
     * 모든 모듈을 가져와서 자동으로 분류하여 반환
     */
    @GetMapping("/all")
    public ResponseEntity<Object> getAllModules() {
        try {
            // 인수인계(4.3): 분류별 조회를 병렬화해 원격 Registry 지연이 누적되지 않게 한다.
            CompletableFuture<List<IM>> aiFuture = CompletableFuture.supplyAsync(() -> registryService.getListIM("ai"));
            CompletableFuture<List<IM>> softwareFuture = CompletableFuture.supplyAsync(() -> registryService.getListIM("software"));
            CompletableFuture<List<IM>> controllerFuture = CompletableFuture.supplyAsync(() -> registryService.getListIM("controller"));
            CompletableFuture<List<IM>> robotFuture = CompletableFuture.supplyAsync(() -> registryService.getListIM("robot"));
            CompletableFuture<List<IM>> edgeFuture = CompletableFuture.supplyAsync(() -> registryService.getListIM("edge"));
            CompletableFuture<List<IM>> cloudFuture = CompletableFuture.supplyAsync(() -> registryService.getListIM("cloud"));

            CompletableFuture.allOf(aiFuture, softwareFuture, controllerFuture, robotFuture, edgeFuture, cloudFuture).join();

            List<IM> aiModules = aiFuture.join();
            System.out.println("AI 모듈 개수: " + aiModules.size());

            List<IM> softwareModules = softwareFuture.join();
            System.out.println("Software 모듈 개수: " + softwareModules.size());

            List<IM> controllerModules = controllerFuture.join();
            System.out.println("Controller 모듈 개수: " + controllerModules.size());
            // 하위 호환: 기존 robot 분류에 남아있는 데이터도 controller로 합쳐서 반환
            List<IM> legacyRobotModules = robotFuture.join();
            System.out.println("Legacy Robot 모듈 개수: " + legacyRobotModules.size());
            List<IM> mergedControllerModules = new ArrayList<>(controllerModules);
            mergedControllerModules.addAll(legacyRobotModules);

            List<IM> edgeModules = edgeFuture.join();
            System.out.println("Edge 모듈 개수: " + edgeModules.size());

            List<IM> cloudModules = cloudFuture.join();
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

            // WorkSpace/Module Info XML — Registry에 없는 로컬 IM도 목록에 포함
            for (IM ws : workspaceImService.listAll()) {
                String moduleID = ws.getModuleID();
                if (moduleID == null || moduleID.isEmpty()) {
                    continue;
                }
                String classification = moduleClassifier.classifyModule(moduleID);
                switch (classification) {
                    case "ai" -> addUniqueIm(aiModules, ws);
                    case "edge" -> addUniqueIm(edgeModules, ws);
                    case "cloud" -> addUniqueIm(cloudModules, ws);
                    case "robot" -> addUniqueIm(robotModules, ws);
                    case "controller" -> addUniqueIm(classifiedControllerModules, ws);
                    case "software" -> addUniqueIm(softwareModules, ws);
                    default -> addUniqueIm(softwareModules, ws);
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
            response.put("properties", moduleData.getProperties() != null
                    ? PropertiesMapSerializer.toMap(moduleData.getProperties())
                    : new HashMap<>());
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
     * 인수인계(4.7): 선택한 swAspects와 hwAspects를 펼쳐 Properties/I/O/Services와 출처를 반환한다.
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
            List<LinkedAspect> linkedAspects = resolveLinkedAspects(request);
            if (linkedAspects.isEmpty()) {
                return ResponseEntity.badRequest().body("swAspects or hwAspects is required");
            }

            List<Map<String, Object>> modules = new ArrayList<>();

            for (LinkedAspect linkedAspect : linkedAspects) {
                Map<String, String> aspect = linkedAspect.aspect();
                String mID = aspect != null ? aspect.get("mID") : null;
                String iID = aspect != null ? aspect.get("iID") : null;
                if (mID == null || mID.trim().isEmpty()) continue;

                String safeIID = (iID == null || iID.trim().isEmpty()) ? "00" : iID.trim();
                String hyphenModuleId = mID + "-" + safeIID;

                IM im = getIMByFlexibleId(hyphenModuleId);

                Map<String, Object> moduleInfo = new LinkedHashMap<>();
                moduleInfo.put("requestedModuleID", hyphenModuleId);
                moduleInfo.put("parentModuleID", linkedAspect.parentModuleID());
                moduleInfo.put("parentModuleName", linkedAspect.parentModuleName());
                moduleInfo.put("sourceType", linkedAspect.sourceType());

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
                moduleInfo.put("properties", moduleData.getProperties() != null
                        ? PropertiesMapSerializer.toMap(moduleData.getProperties())
                        : new HashMap<>());
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

        return workspaceImService.findByModuleId(trimmed);
    }

    private void addUniqueIm(List<IM> target, IM candidate) {
        if (target == null || candidate == null || candidate.getModuleID() == null) {
            return;
        }
        String candidateKey = candidate.getModuleID().replace("-", "").toLowerCase();
        for (IM existing : target) {
            if (existing.getModuleID() != null
                    && existing.getModuleID().replace("-", "").equalsIgnoreCase(candidateKey)) {
                return;
            }
        }
        target.add(candidate);
    }

    /**
     * Returns selected SW modules and selected HW/controller modules. SW children of a
     * controller are retained under that controller so the UI does not lose provenance.
     */
    private List<LinkedAspect> resolveLinkedAspects(LinkedModuleAspectsRequest request) {
        List<LinkedAspect> resolved = new ArrayList<>();
        java.util.Set<String> directSeen = new java.util.HashSet<>();

        if (request != null && request.getSwAspects() != null) {
            for (Map<String, String> aspect : request.getSwAspects()) {
                addUniqueLinkedAspect(resolved, directSeen, aspect, null, null, "software");
            }
        }

        if (request != null && request.getHwAspects() != null) {
            for (Map<String, String> hwAspect : request.getHwAspects()) {
                String moduleId = aspectToHyphenModuleId(hwAspect);
                if (moduleId == null) continue;

                IM im = getIMByFlexibleId(moduleId);
                if (im == null) continue;

                String parentName = im.getModuleName() != null ? im.getModuleName() : moduleId;
                addUniqueLinkedAspect(resolved, directSeen, hwAspect, null, null, "hardware");

                SoftwareModule parentData = moduleClassifier.xmlToSoftwareModuleSafe(
                        im.getXmlString(), im.getModuleName());
                if (parentData.getIdnType() == null || parentData.getIdnType().getSwAspects() == null) {
                    continue;
                }
                List<ModuleID> childIds = parentData.getIdnType().getSwAspects().getModuleIDs();
                if (childIds == null) continue;
                java.util.Set<String> childSeen = new java.util.HashSet<>();
                for (ModuleID child : childIds) {
                    if (child == null) continue;
                    Map<String, String> childAspect = new LinkedHashMap<>();
                    childAspect.put("mID", child.getmID() != null ? child.getmID() : "");
                    childAspect.put("iID", child.getiID() != null ? child.getiID() : "00");
                    // Do not globally deduplicate children: the same SW module can belong to
                    // different controller instances and must remain selectable in each branch.
                    addUniqueLinkedAspect(resolved, childSeen, childAspect,
                            moduleId, parentName, "software");
                }
            }
        }

        return resolved;
    }

    private void addUniqueLinkedAspect(List<LinkedAspect> target, java.util.Set<String> seen,
            Map<String, String> aspect, String parentModuleID, String parentModuleName, String sourceType) {
        if (aspect == null) return;
        String mID = aspect.get("mID");
        if (mID == null || mID.trim().isEmpty()) return;
        String iID = aspect.get("iID");
        String safeIID = (iID == null || iID.trim().isEmpty()) ? "00" : iID.trim();
        String key = (mID + safeIID).replace("-", "").toLowerCase();
        if (!seen.add(key)) return;
        Map<String, String> copy = new LinkedHashMap<>();
        copy.put("mID", mID.trim());
        copy.put("iID", safeIID);
        target.add(new LinkedAspect(copy, parentModuleID, parentModuleName, sourceType));
    }

    private void addUniqueAspect(List<Map<String, String>> merged, java.util.Set<String> seen,
            Map<String, String> aspect) {
        if (aspect == null) return;
        String mID = aspect.get("mID");
        if (mID == null || mID.trim().isEmpty()) return;
        String iID = aspect.get("iID");
        String safeIID = (iID == null || iID.trim().isEmpty()) ? "00" : iID.trim();
        String key = (mID + safeIID).replace("-", "").toLowerCase();
        if (seen.contains(key)) return;
        seen.add(key);
        Map<String, String> copy = new LinkedHashMap<>();
        copy.put("mID", mID.trim());
        copy.put("iID", safeIID);
        merged.add(copy);
    }

    private String aspectToHyphenModuleId(Map<String, String> aspect) {
        if (aspect == null) return null;
        String mID = aspect.get("mID");
        if (mID == null || mID.trim().isEmpty()) return null;
        String iID = aspect.get("iID");
        String safeIID = (iID == null || iID.trim().isEmpty()) ? "00" : iID.trim();
        return mID.trim() + "-" + safeIID;
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

            ImUploadResult uploadResult = registryService.doUploadIM(im);
            if (uploadResult.isSuccess()) {
                String message = "Module file uploaded and registered successfully: " + file.getOriginalFilename()
                        + " with classification: " + detectedClassification;
                if (uploadResult.isLocalOnly()) {
                    message += " (registered locally only — remote IIC registry was unreachable or returned a server error; "
                            + "module is available in Registry Modules while using this server)";
                }
                return ResponseEntity.ok(message);
            } else {
                String reason = uploadResult.getFailureReason() != null ? uploadResult.getFailureReason()
                        : "Failed to add module";
                if (uploadResult.isClientError()) {
                    return ResponseEntity.badRequest().body(reason);
                }
                return ResponseEntity.internalServerError().body(reason);
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
                String filename = request.get("filename");
                if (filename == null || filename.isBlank()) {
                    return ResponseEntity.badRequest()
                            .body("Either moduleId parameter or filename in body is required");
                }

                // Workspace 메뉴의 Delete는 Registry ID가 아니라 실제 파일 삭제 요청이다.
                // 파일명만 허용하고 정규화된 경로가 허용 디렉터리 안에 있는지 재확인한다.
                Path safeFilename = Paths.get(filename).getFileName();
                if (!safeFilename.toString().equals(filename)) {
                    return ResponseEntity.badRequest().body("Invalid workspace filename");
                }

                Path workspaceRoot = Paths.get(".rodos", "WorkSpace").toAbsolutePath().normalize();
                Path[] allowedDirectories = {
                        workspaceRoot.resolve("Module Info").normalize(),
                        workspaceRoot.resolve("Configuration").normalize()
                };

                Path deletedPath = null;
                for (Path directory : allowedDirectories) {
                    Path candidate = directory.resolve(safeFilename).normalize();
                    if (candidate.startsWith(directory) && Files.isRegularFile(candidate)) {
                        Files.delete(candidate);
                        deletedPath = candidate;
                        break;
                    }
                }

                if (deletedPath == null) {
                    return ResponseEntity.notFound().build();
                }

                targetId = filename;
                if (targetId.contains(".")) {
                    targetId = targetId.substring(0, targetId.lastIndexOf("."));
                }

                // 로컬/원격 Registry에 동일 ID가 있으면 함께 정리하되,
                // Registry에 없다는 이유로 이미 성공한 파일 삭제를 실패 처리하지 않는다.
                try {
                    registryService.deleteIM(targetId);
                } catch (Exception registryError) {
                    System.out.println("Workspace file deleted; registry cleanup skipped: "
                            + registryError.getMessage());
                }
                return ResponseEntity.ok("Workspace file deleted successfully: " + filename);
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
