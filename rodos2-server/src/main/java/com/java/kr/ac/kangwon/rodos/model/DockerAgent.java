package com.java.kr.ac.kangwon.rodos.model;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * DockerAgent 모델 클래스
 * iic-api의 dockerAgent 목록에서 가져오는 데이터 구조
 */
public class DockerAgent {

    @JsonProperty("ip")
    private String ip;

    @JsonProperty("hwname")
    private String hwname;

    @JsonProperty("type")
    private String type;

    public DockerAgent() {
    }

    public DockerAgent(String ip, String hwname, String type) {
        this.ip = ip;
        this.hwname = hwname;
        this.type = type;
    }

    public String getIp() {
        return ip;
    }

    public void setIp(String ip) {
        this.ip = ip;
    }

    public String getHwname() {
        return hwname;
    }

    public void setHwname(String hwname) {
        this.hwname = hwname;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    @Override
    public String toString() {
        return "DockerAgent{" +
                "ip='" + ip + '\'' +
                ", hwname='" + hwname + '\'' +
                ", type='" + type + '\'' +
                '}';
    }
}
