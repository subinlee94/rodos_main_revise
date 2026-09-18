package com.java.kr.ac.kangwon.rodos.model;

import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlRootElement;

/**
 * RosModuleInfo - 일반적인 ROS 소프트웨어 모듈
 * Rodos 1의 RosModuleInfo와 동일한 구조
 */
@JacksonXmlRootElement(localName = "Module")
public class RosModuleInfo extends ModuleInfo {

    public RosModuleInfo() {
        super();
    }
}
