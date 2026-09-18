package com.java.kr.ac.kangwon.rodos.model;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlProperty;

/**
 * Style - 모듈의 스타일 정보 (위치, 크기)
 * Rodos 1의 Style과 동일한 구조
 */
public class Style {

    @JacksonXmlProperty(localName = "px", isAttribute = true)
    @JsonInclude(JsonInclude.Include.NON_NULL)
    private Double px;

    @JacksonXmlProperty(localName = "py", isAttribute = true)
    @JsonInclude(JsonInclude.Include.NON_NULL)
    private Double py;

    @JacksonXmlProperty(localName = "width", isAttribute = true)
    @JsonInclude(JsonInclude.Include.NON_NULL)
    private Double width;

    @JacksonXmlProperty(localName = "height", isAttribute = true)
    @JsonInclude(JsonInclude.Include.NON_NULL)
    private Double height;

    public Style() {
        this.px = 0.0;
        this.py = 0.0;
        this.width = 0.0;
        this.height = 0.0;
    }

    public Style(Style other) {
        if (other != null) {
            this.px = other.px;
            this.py = other.py;
            this.width = other.width;
            this.height = other.height;
        } else {
            this.px = 0.0;
            this.py = 0.0;
            this.width = 0.0;
            this.height = 0.0;
        }
    }

    public Double getPx() {
        return px;
    }

    public void setPx(Double px) {
        this.px = px;
    }

    public Double getPy() {
        return py;
    }

    public void setPy(Double py) {
        this.py = py;
    }

    public Double getWidth() {
        return width;
    }

    public void setWidth(Double width) {
        this.width = width;
    }

    public Double getHeight() {
        return height;
    }

    public void setHeight(Double height) {
        this.height = height;
    }
}
