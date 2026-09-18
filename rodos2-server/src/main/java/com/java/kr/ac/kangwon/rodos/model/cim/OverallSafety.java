package com.java.kr.ac.kangwon.rodos.model.cim;

import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlProperty;
import com.java.kr.ac.kangwon.rodos.model.xmlTagNames;

public class OverallSafety {

    @JacksonXmlProperty(localName = xmlTagNames.OVERALL_SAFETY_TYPE)
    private String overallSafetyType;

    public String getOverallSafetyType() {
        return overallSafetyType;
    }

    public void setOverallSafetyType(String overallSafetyType) {
        this.overallSafetyType = overallSafetyType;
    }
}
