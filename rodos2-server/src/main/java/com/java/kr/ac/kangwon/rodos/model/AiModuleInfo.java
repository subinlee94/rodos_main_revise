package com.java.kr.ac.kangwon.rodos.model;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlProperty;
import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlRootElement;

/**
 * AiModuleInfo - AI/인식 모듈
 * Rodos 1의 AiModuleInfo와 동일한 구조
 */
@JacksonXmlRootElement(localName = "Module")
public class AiModuleInfo extends ModuleInfo {

    @JacksonXmlProperty(localName = "ai", isAttribute = true)
    @JsonInclude(JsonInclude.Include.NON_DEFAULT)
    private boolean isAi = true;

    public AiModuleInfo() {
        super();
    }

    public boolean isAi() {
        return isAi;
    }

    public void setAi(boolean isAi) {
        this.isAi = isAi;
    }
}
