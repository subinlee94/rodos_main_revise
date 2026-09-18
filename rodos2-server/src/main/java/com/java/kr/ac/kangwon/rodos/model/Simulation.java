package com.java.kr.ac.kangwon.rodos.model;

import java.util.List;
import java.util.ArrayList;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlElementWrapper;
import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlProperty;
import com.java.kr.ac.kangwon.rodos.service.rest.agent.SimulationConfig;

/**
 * Simulation 정보를 담는 모델 클래스
 * Rodos 1의 Simulation과 동일한 구조
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public class Simulation {

    @JacksonXmlProperty(localName = "namespace", isAttribute = true)
    private String namespace;

    @JacksonXmlProperty(localName = "x", isAttribute = true)
    private String x;

    @JacksonXmlProperty(localName = "y", isAttribute = true)
    private String y;

    @JacksonXmlProperty(localName = "theta", isAttribute = true)
    private String theta;

    @JacksonXmlProperty(localName = "simulationHwName")
    @JsonInclude(JsonInclude.Include.NON_NULL)
    private String simulationHwName;

    @JacksonXmlProperty(localName = "simulationHwTarget")
    @JsonInclude(JsonInclude.Include.NON_NULL)
    private String simulationHwTarget;

    @JacksonXmlProperty(localName = "simulationConfigs")
    @JacksonXmlElementWrapper(localName = "SimulationConfigs")
    @JsonInclude(JsonInclude.Include.NON_NULL)
    private List<SimulationConfig> simulationConfigs;

    public Simulation() {
        this.simulationConfigs = new ArrayList<>();
    }

    public Simulation(String namespace, String x, String y, String theta) {
        this.namespace = namespace;
        this.x = x;
        this.y = y;
        this.theta = theta;
    }

    public String getNamespace() {
        return namespace;
    }

    public void setNamespace(String namespace) {
        this.namespace = namespace;
    }

    public String getX() {
        return x;
    }

    public void setX(String x) {
        this.x = x;
    }

    public String getY() {
        return y;
    }

    public void setY(String y) {
        this.y = y;
    }

    public String getTheta() {
        return theta;
    }

    public void setTheta(String theta) {
        this.theta = theta;
    }

    public String getSimulationHwName() {
        return simulationHwName;
    }

    public void setSimulationHwName(String simulationHwName) {
        this.simulationHwName = simulationHwName;
    }

    public String getSimulationHwTarget() {
        return simulationHwTarget;
    }

    public void setSimulationHwTarget(String simulationHwTarget) {
        this.simulationHwTarget = simulationHwTarget;
    }

    public List<SimulationConfig> getSimulationConfigs() {
        return simulationConfigs;
    }

    public void setSimulationConfigs(List<SimulationConfig> simulationConfigs) {
        this.simulationConfigs = simulationConfigs;
    }

    public void addSimulationConfig(SimulationConfig config) {
        if (this.simulationConfigs == null) {
            this.simulationConfigs = new ArrayList<>();
        }
        this.simulationConfigs.add(config);
    }

    public void removeSimulationConfig(String robotName) {
        if (this.simulationConfigs != null) {
            this.simulationConfigs
                    .removeIf(config -> config.getRobotName() != null && config.getRobotName().equals(robotName));
        }
    }

    @Override
    public String toString() {
        return "Simulation{" +
                "namespace='" + namespace + '\'' +
                ", x='" + x + '\'' +
                ", y='" + y + '\'' +
                ", theta='" + theta + '\'' +
                '}';
    }
}
