package com.java.kr.ac.kangwon.rodos.model;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;
import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlProperty;

/**
 * HWInfo - Hardware 모듈의 기본 클래스
 * Rodos 1의 HWInfo와 동일한 구조
 */
@JsonTypeInfo(use = JsonTypeInfo.Id.NAME, include = JsonTypeInfo.As.PROPERTY, property = "classifier")
@JsonSubTypes({
        @JsonSubTypes.Type(value = RobotInfo.class, name = "robot"),
        @JsonSubTypes.Type(value = EdgeInfo.class, name = "edge"),
        @JsonSubTypes.Type(value = CloudInfo.class, name = "cloud")
})
public abstract class HWInfo extends ModuleInfo {

    @JacksonXmlProperty(localName = "targetName", isAttribute = true)
    @JsonInclude(JsonInclude.Include.NON_NULL)
    private String targetName;

    @JacksonXmlProperty(localName = "type", isAttribute = true)
    @JsonInclude(JsonInclude.Include.NON_NULL)
    private String type;

    @JacksonXmlProperty(localName = "target", isAttribute = true)
    @JsonInclude(JsonInclude.Include.NON_NULL)
    private String target;

    @JacksonXmlProperty(localName = "simulation")
    @JsonInclude(JsonInclude.Include.NON_NULL)
    private Simulation simulation;

    public HWInfo() {
        super();
    }

    public String getTargetName() {
        return targetName;
    }

    public void setTargetName(String targetName) {
        this.targetName = targetName;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getTarget() {
        return target;
    }

    public void setTarget(String target) {
        this.target = target;
    }

    public Simulation getSimulation() {
        return simulation;
    }

    public void setSimulation(Simulation simulation) {
        this.simulation = simulation;
    }

    /**
     * 하위 클래스에서 구현해야 하는 모듈 리스트 반환
     */
    public abstract List<ModuleInfo> getModules();
}
