package com.java.kr.ac.kangwon.rodos.service.rest.agent;

import java.util.List;

import com.google.gson.annotations.SerializedName;
import com.java.kr.ac.kangwon.rodos.model.Simulation;

public class RetrofitBody<T extends RequestItem> {

    @SerializedName("namespace")
    public String namespace;

    @SerializedName("sim_mode")
    public boolean sim_mode;

    @SerializedName("simulation")
    public Simulation simulation;

    @SerializedName("list")
    public List<T> list;

    public String getNamespace() {
        return namespace;
    }

    public void setNamespace(String namespace) {
        this.namespace = namespace;
    }

    public boolean isSim_mode() {
        return sim_mode;
    }

    public void setSim_mode(boolean sim_mode) {
        this.sim_mode = sim_mode;
    }

    public List<T> getList() {
        return list;
    }

    public void setList(List<T> list) {
        this.list = list;
    }

    public Simulation getSimulation() {
        return simulation;
    }

    public void setSimulation(Simulation simulation) {
        this.simulation = simulation;
    }
}
