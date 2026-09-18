package com.java.kr.ac.kangwon.rodos.model;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlElementWrapper;
import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlProperty;

/**
 * RobotInfo - Robot HW 모듈 정보
 * Rodos 1의 RobotInfo와 동일한 구조
 */
public class RobotInfo extends HWInfo {

    @JacksonXmlElementWrapper(useWrapping = false)
    @JacksonXmlProperty(localName = "Module")
    private List<ModuleInfo> modules;

    public RobotInfo() {
        super();
        this.modules = new java.util.ArrayList<>();
    }

    @Override
    public List<ModuleInfo> getModules() {
        return modules;
    }

    public void setModules(List<ModuleInfo> modules) {
        this.modules = modules;
    }
}
