package com.java.kr.ac.kangwon.rodos.service.rest.agent;

import java.util.ArrayList;
import java.util.List;

import com.google.gson.annotations.SerializedName;

public class ModellingConfig {
    @SerializedName("simulator")
    private String simulatorName;

    @SerializedName("model_path")
    private String path;

    @SerializedName("target_hw")
    private String targetHw;

    @SerializedName("target_hw_ip")
    private String targetHwIp;

    @SerializedName("simulations")
    private List<SimulationConfig> simulations;

    public ModellingConfig() {
        this.simulations = new ArrayList<>();
    }

    public String getSimulatorName() {
        return simulatorName;
    }

    public void setSimulatorName(String simulatorName) {
        this.simulatorName = simulatorName;
    }

    public String getPath() {
        return path;
    }

    public void setPath(String path) {
        this.path = path;
    }

    public String getTargetHw() {
        return targetHw;
    }

    public void setTargetHw(String targetHw) {
        this.targetHw = targetHw;
    }

    public String getTargetHwIp() {
        return targetHwIp;
    }

    public void setTargetHwIp(String targetHwIp) {
        this.targetHwIp = targetHwIp;
    }

    public List<SimulationConfig> getSimulations() {
        return simulations;
    }

    public void setSimulations(List<SimulationConfig> simulations) {
        this.simulations = simulations;
    }

    public void addSimulation(SimulationConfig simulation) {
        if (this.simulations == null) {
            this.simulations = new ArrayList<>();
        }
        this.simulations.add(simulation);
    }
}
