package com.java.kr.ac.kangwon.rodos.service;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Stream;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.java.kr.ac.kangwon.rodos.model.sim.SoftwareModule;
import com.java.kr.ac.kangwon.rodos.service.rest.informationModel.IM;

/**
 * WorkSpace/Module Info XML — Registry에 없어도 위자드에서 SW/HW 모듈로 사용할 수 있게 한다.
 */
@Service
public class WorkspaceImService {

    private static final Path MODULE_INFO_DIR = Paths.get(".rodos", "WorkSpace", "Module Info");

    @Autowired
    private ModuleClassifier moduleClassifier;

    public List<IM> listAll() {
        List<IM> result = new ArrayList<>();
        if (!Files.isDirectory(MODULE_INFO_DIR)) {
            return result;
        }
        try (Stream<Path> paths = Files.list(MODULE_INFO_DIR)) {
            paths.filter(Files::isRegularFile)
                    .filter(p -> p.getFileName().toString().toLowerCase().endsWith(".xml"))
                    .forEach(path -> {
                        IM im = parseFile(path);
                        if (im != null && im.getModuleID() != null && !im.getModuleID().isBlank()) {
                            result.add(im);
                        }
                    });
        } catch (Exception e) {
            System.err.println("WorkspaceImService.listAll failed: " + e.getMessage());
            e.printStackTrace();
        }
        return result;
    }

    public IM findByModuleId(String moduleId) {
        if (moduleId == null || moduleId.trim().isEmpty()) {
            return null;
        }
        String trimmed = moduleId.trim();
        List<String> candidates = moduleIdCandidates(trimmed);
        for (IM im : listAll()) {
            if (im.getModuleID() == null) continue;
            for (String candidate : candidates) {
                if (matchesModuleId(im.getModuleID(), candidate)) {
                    return im;
                }
            }
        }
        return null;
    }

    private IM parseFile(Path path) {
        try {
            String xml = Files.readString(path);
            String fallbackName = path.getFileName().toString();
            if (fallbackName.toLowerCase().endsWith(".xml")) {
                fallbackName = fallbackName.substring(0, fallbackName.length() - 4);
            }
            SoftwareModule module = moduleClassifier.xmlToSoftwareModuleSafe(xml, fallbackName);
            String moduleId = extractModuleId(module);
            if (moduleId == null || moduleId.isBlank()) {
                return null;
            }
            String classification = moduleClassifier.classifyModule(moduleId);
            IM im = new IM(
                    module.getModuleName() != null ? module.getModuleName() : fallbackName,
                    moduleId,
                    xml,
                    IM.Type.SOFTWARE);
            im.setClassification(classification);
            return im;
        } catch (Exception e) {
            System.err.println("WorkspaceImService.parseFile failed: " + path + " — " + e.getMessage());
            return null;
        }
    }

    private String extractModuleId(SoftwareModule module) {
        if (module == null || module.getIdnType() == null || module.getIdnType().getModuleID() == null) {
            return null;
        }
        String mID = module.getIdnType().getModuleID().getmID();
        String iID = module.getIdnType().getModuleID().getiID();
        if (mID == null || mID.trim().isEmpty()) {
            return null;
        }
        if (iID != null && !iID.trim().isEmpty()) {
            return mID.trim() + "-" + iID.trim();
        }
        return mID.trim();
    }

    private List<String> moduleIdCandidates(String moduleId) {
        List<String> candidates = new ArrayList<>();
        candidates.add(moduleId);
        if (moduleId.contains("-")) {
            candidates.add(moduleId.replace("-", ""));
        } else if (moduleId.length() > 2) {
            candidates.add(moduleId.substring(0, moduleId.length() - 2) + "-"
                    + moduleId.substring(moduleId.length() - 2));
        }
        return candidates;
    }

    private boolean matchesModuleId(String stored, String candidate) {
        if (stored == null || candidate == null) return false;
        if (stored.equals(candidate)) return true;
        return stored.replace("-", "").equalsIgnoreCase(candidate.replace("-", ""));
    }

    /** Registry 목록에 workspace IM을 합치되 module_id 중복은 제외 */
    public List<IM> mergeUnique(List<IM> registryList, List<IM> workspaceList) {
        List<IM> merged = new ArrayList<>(registryList != null ? registryList : new ArrayList<>());
        Set<String> seen = new HashSet<>();
        for (IM im : merged) {
            if (im.getModuleID() != null) {
                seen.add(normalizeId(im.getModuleID()));
            }
        }
        List<IM> wsList = workspaceList != null ? workspaceList : new ArrayList<>();
        for (IM ws : wsList) {
            if (ws.getModuleID() == null) continue;
            String key = normalizeId(ws.getModuleID());
            if (!seen.contains(key)) {
                merged.add(ws);
                seen.add(key);
            }
        }
        return merged;
    }

    private String normalizeId(String id) {
        return id != null ? id.replace("-", "").toLowerCase() : "";
    }
}
