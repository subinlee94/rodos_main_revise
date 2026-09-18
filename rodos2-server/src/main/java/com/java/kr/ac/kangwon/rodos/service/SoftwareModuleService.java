package com.java.kr.ac.kangwon.rodos.service;

import com.java.kr.ac.kangwon.rodos.model.sim.SoftwareModule;
import org.springframework.stereotype.Service;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.dataformat.xml.XmlMapper;

@Service
public class SoftwareModuleService {

    private SoftwareModule currentModule;
    private final ObjectMapper jsonMapper = new ObjectMapper();
    private final XmlMapper xmlMapper = new XmlMapper();

    public SoftwareModuleService() {
        this.currentModule = new SoftwareModule();
    }

    public void updateModule(SoftwareModule softwareModule) {
        this.currentModule = softwareModule;
    }

    public String generateXML() throws Exception {
        if (currentModule == null) {
            throw new IllegalStateException("No module data available");
        }

        // XML 생성 시 루트 엘리먼트 이름을 "SoftwareModule"로 설정
        return xmlMapper.writeValueAsString(currentModule);
    }

    public SoftwareModule getCurrentModule() {
        return currentModule;
    }
}