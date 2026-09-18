package com.java.kr.ac.kangwon.rodos.service.rest.agent;

import com.google.gson.annotations.SerializedName;

public class RequestItem {

    @SerializedName("moduleName")
    private String moduleName;

    @SerializedName("clusterName")
    private String clusterName;

    public String getClusterName() {
        return clusterName;
    }

    public void setClusterName(String clusterName) {
        this.clusterName = clusterName;
    }

    public String getModuleName() {
        return moduleName;
    }

    public void setModuleName(String moduleName) {
        this.moduleName = moduleName;
    }
}
