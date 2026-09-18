package com.java.kr.ac.kangwon.rodos.model.cim;

import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlProperty;
import com.java.kr.ac.kangwon.rodos.model.xmlTagNames;

public class CyberSecurity {

    @JacksonXmlProperty(localName = xmlTagNames.OVERALL_CYB_SECURITY_LEVEL)
    private String overallCybSecurityLevel;

    public String getOverallCybSecurityLevel() {
        return overallCybSecurityLevel;
    }

    public void setOverallCybSecurityLevel(String overallCybSecurityLevel) {
        this.overallCybSecurityLevel = overallCybSecurityLevel;
    }
}
