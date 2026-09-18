package com.java.kr.ac.kangwon.rodos.service.rest.agent;

import com.google.gson.annotations.SerializedName;

public class StopItem {
    @SerializedName("clusterName")
    private String clusterName;

    public String getClusterName() {
        return clusterName;
    }

    public void setClusterName(String clusterName) {
        this.clusterName = clusterName;
    }
}
