package com.java.kr.ac.kangwon.rodos.service.rest.agent;

import java.util.ArrayList;
import java.util.List;
import com.google.gson.annotations.SerializedName;

public class ExecuteBody {
    @SerializedName("list")
    private List<ExecuteItem> list;

    @SerializedName("namespace")
    private String namespace;

    @SerializedName("sim_mode")
    private boolean simMode;

    @SerializedName("simulation")
    private Object simulation;

    @SerializedName("simulation_hw_name")
    private String simulationHwName;

    public ExecuteBody() {
        this.list = new ArrayList<ExecuteItem>();
        this.simMode = false;
    }

    public List<ExecuteItem> getList() {
        return list;
    }

    public void setList(List<ExecuteItem> list) {
        this.list = list;
    }

    public String getNamespace() {
        return namespace;
    }

    public void setNamespace(String namespace) {
        this.namespace = namespace;
    }

    public boolean isSimMode() {
        return simMode;
    }

    public void setSimMode(boolean simMode) {
        this.simMode = simMode;
    }

    public Object getSimulation() {
        return simulation;
    }

    public void setSimulation(Object simulation) {
        this.simulation = simulation;
    }

    public void addItem(ExecuteItem item) {
        if (item != null) {
            this.list.add(item);
        }
    }

    public String getSimulationHwName() {
        return simulationHwName;
    }

    public void setSimulationHwName(String simulationHwName) {
        this.simulationHwName = simulationHwName;
    }
}
