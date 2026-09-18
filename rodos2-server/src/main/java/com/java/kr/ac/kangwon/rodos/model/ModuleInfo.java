package com.java.kr.ac.kangwon.rodos.model;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;
import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlProperty;

/**
 * ModuleInfo - 모듈의 기본 추상 클래스
 * Rodos 1의 ModuleInfo와 동일한 구조
 */
@JsonTypeInfo(use = JsonTypeInfo.Id.NAME, include = JsonTypeInfo.As.PROPERTY, property = "type")
@JsonSubTypes({
        @JsonSubTypes.Type(value = RosModuleInfo.class, name = "software"),
        @JsonSubTypes.Type(value = AiModuleInfo.class, name = "ai")
})
public abstract class ModuleInfo {

    @JacksonXmlProperty(localName = "name", isAttribute = true)
    @JsonInclude(JsonInclude.Include.NON_NULL)
    private String name;

    @JacksonXmlProperty(localName = "ref", isAttribute = true)
    @JsonInclude(JsonInclude.Include.NON_NULL)
    private String ref;

    @JacksonXmlProperty(localName = "style")
    @JsonInclude(JsonInclude.Include.NON_NULL)
    private Style style;

    public ModuleInfo() {
        this.style = new Style();
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getRef() {
        return ref;
    }

    public void setRef(String ref) {
        this.ref = ref;
    }

    public Style getStyle() {
        return style;
    }

    public void setStyle(Style style) {
        this.style = style;
    }

    /**
     * 전체 이름 계산 (owner.name 형식)
     */
    public String computeFullName() {
        return name;
    }
}
