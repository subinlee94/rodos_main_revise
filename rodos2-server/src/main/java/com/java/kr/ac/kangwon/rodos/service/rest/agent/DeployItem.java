package com.java.kr.ac.kangwon.rodos.service.rest.agent;

import com.google.gson.annotations.SerializedName;

public class DeployItem {
    @SerializedName("clusterName")
    private String clusterName;

    @SerializedName("moduleName")
    private String moduleName;

    @SerializedName("imageName")
    private String imageName;

    @SerializedName("tag")
    private String tag;

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

    public String getImageName() {
        return imageName;
    }

    public void setImageName(String imageName) {
        this.imageName = imageName;
    }

    public String getTag() {
        return tag;
    }

    public void setTag(String tag) {
        this.tag = tag;
    }
}
