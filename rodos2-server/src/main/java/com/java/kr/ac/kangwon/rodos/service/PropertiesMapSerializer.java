package com.java.kr.ac.kangwon.rodos.service;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import com.java.kr.ac.kangwon.rodos.model.Enumerate;
import com.java.kr.ac.kangwon.rodos.model.cim.ModuleID;
import com.java.kr.ac.kangwon.rodos.model.sim.CompilerType;
import com.java.kr.ac.kangwon.rodos.model.sim.ExecutionType;
import com.java.kr.ac.kangwon.rodos.model.sim.Library;
import com.java.kr.ac.kangwon.rodos.model.sim.OSType;
import com.java.kr.ac.kangwon.rodos.model.sim.Organization;
import com.java.kr.ac.kangwon.rodos.model.sim.Owner;
import com.java.kr.ac.kangwon.rodos.model.sim.Properties;
import com.java.kr.ac.kangwon.rodos.model.sim.RangeString;

/**
 * Properties → 프론트 linked-data용 Map.
 * Jackson 기본 직렬화 시 compilerType/osName·opType 등이 누락되는 문제를 피한다.
 */
public final class PropertiesMapSerializer {

    private PropertiesMapSerializer() {
    }

    public static Map<String, Object> toMap(Properties properties) {
        Map<String, Object> map = new LinkedHashMap<>();
        if (properties == null) {
            map.put("properties", List.of());
            map.put("osType", Map.of());
            map.put("compilerType", Map.of());
            map.put("executionTypes", List.of());
            map.put("libraries", List.of());
            map.put("organization", Map.of());
            return map;
        }

        map.put("properties", properties.getProperties() != null ? properties.getProperties() : List.of());
        map.put("osType", toOsTypeMap(properties.osType));
        map.put("compilerType", toCompilerTypeMap(properties.getCompilerType()));
        map.put("executionTypes", toExecutionTypesList(properties.getExecutionTypes()));
        map.put("libraries", toLibrariesList(properties.getLibraries()));
        map.put("organization", toOrganizationMap(properties.getOrganization()));
        return map;
    }

    private static Map<String, Object> toOsTypeMap(OSType osType) {
        Map<String, Object> map = new LinkedHashMap<>();
        if (osType == null) {
            return map;
        }
        map.put("type", osType.getType());
        Enumerate.NoBit bit = osType.getBit();
        map.put("bit", bit != null ? bit.name() : null);
        map.put("version", osType.getVersion());
        return map;
    }

    private static Map<String, Object> toCompilerTypeMap(CompilerType compilerType) {
        Map<String, Object> map = new LinkedHashMap<>();
        if (compilerType == null) {
            return map;
        }

        String osName = compilerType.osName != null ? compilerType.osName : compilerType.getOSName();
        map.put("osname", osName);
        map.put("osName", osName);
        map.put("compilerName", compilerType.getCompilerName());
        map.put("verRangeOS", toRangeMap(compilerType.getVerRangeOS()));
        map.put("verRangeCompiler", toRangeMap(compilerType.getVerRangeCompiler()));
        map.put("bitsnCPUarch", compilerType.getBitsnCPUarch());
        return map;
    }

    private static Map<String, String> toRangeMap(RangeString range) {
        Map<String, String> map = new LinkedHashMap<>();
        if (range == null) {
            return map;
        }
        map.put("min", range.getMin());
        map.put("max", range.getMax());
        return map;
    }

    private static List<Map<String, Object>> toExecutionTypesList(List<ExecutionType> executionTypes) {
        List<Map<String, Object>> list = new ArrayList<>();
        if (executionTypes == null) {
            return list;
        }
        for (ExecutionType et : executionTypes) {
            if (et == null) {
                continue;
            }
            Map<String, Object> item = new LinkedHashMap<>();
            item.put("priority", et.getPriority());
            Enumerate.OpTypes opType = et.getOPType();
            item.put("optype", opType != null ? opType.name() : null);
            item.put("opType", opType != null ? opType.name() : null);
            item.put("hardRT", et.getHardRT());
            item.put("timeConstraint", et.getTimeConstraint() != null ? et.getTimeConstraint().trim() : null);
            Enumerate.InstanceTypes instanceType = et.getInstanceType();
            item.put("instanceType", instanceType != null ? instanceType.name() : null);
            list.add(item);
        }
        return list;
    }

    private static List<Map<String, Object>> toLibrariesList(List<Library> libraries) {
        List<Map<String, Object>> list = new ArrayList<>();
        if (libraries == null) {
            return list;
        }
        for (Library library : libraries) {
            if (library == null || library.getName() == null || library.getName().isBlank()) {
                continue;
            }
            Map<String, Object> item = new LinkedHashMap<>();
            item.put("name", library.getName());
            item.put("version", library.getVersion() != null ? library.getVersion() : "");
            list.add(item);
        }
        return list;
    }

    private static Map<String, Object> toOrganizationMap(Organization organization) {
        Map<String, Object> map = new LinkedHashMap<>();
        if (organization == null) {
            return map;
        }

        String ownerId = toModuleIdString(organization.getOwner());
        if (ownerId != null && !ownerId.isBlank()) {
            map.put("owner", ownerId);
        }
        if (organization.getDependency() != null && !organization.getDependency().isBlank()) {
            map.put("dependency", organization.getDependency());
        }

        List<Map<String, Object>> members = new ArrayList<>();
        if (organization.getMembers() != null) {
            for (com.java.kr.ac.kangwon.rodos.model.sim.OrgMemberType member : organization.getMembers()) {
                if (member == null || member.getModuleID() == null) continue;
                Map<String, Object> item = new LinkedHashMap<>();
                String mID = member.getModuleID().getmID();
                String iID = member.getModuleID().getiID();
                item.put("moduleID", (mID != null ? mID : "")
                        + (iID != null && !iID.isBlank() ? "-" + iID : ""));
                item.put("dependency", member.getDependency() != null ? member.getDependency().name() : "");
                members.add(item);
            }
        }
        map.put("members", members);
        map.put("additionalInfo", List.of());
        return map;
    }

    private static String toModuleIdString(Owner owner) {
        if (owner == null || owner.getModuleID() == null) {
            return null;
        }
        ModuleID moduleID = owner.getModuleID();
        String mID = moduleID.getmID();
        if (mID == null || mID.isBlank()) {
            return null;
        }
        String iID = moduleID.getiID();
        if (iID != null && !iID.isBlank()) {
            return mID.trim() + "-" + iID.trim();
        }
        return mID.trim();
    }
}
