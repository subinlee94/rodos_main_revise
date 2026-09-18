package com.java.kr.ac.kangwon.rodos.service.rest.agent;

import java.util.ArrayList;
import java.util.List;
import com.google.gson.annotations.SerializedName;

public class DeployBody {
    @SerializedName("list")
    private List<DeployItem> list;

    public DeployBody() {
        this.list = new ArrayList<DeployItem>();
    }

    public List<DeployItem> getList() {
        return list;
    }

    public void setList(List<DeployItem> list) {
        this.list = list;
    }

    public void addItem(DeployItem item) {
        if (item != null) {
            this.list.add(item);
        }
    }

    public void append(String clusterName, String imageName, String moduleName, String tag) {
        var item = new DeployItem();
        item.setClusterName(clusterName);
        item.setImageName(imageName);
        item.setModuleName(moduleName);
        item.setTag(tag);
        this.list.add(item);
    }
}
