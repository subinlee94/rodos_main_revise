package com.java.kr.ac.kangwon.rodos.service.rest.agent;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.google.gson.annotations.SerializedName;

public class ExecuteItem extends RequestItem {
    public ExecuteItem() {
        this.ports = new ArrayList<Integer>();
        this.envs = new ArrayList<String>();
        this.devices = new ArrayList<String>();
        this.volume = new HashMap<String, VolumeConfig>();
    }

    @SerializedName("imageName")
    private String imageName;

    @SerializedName("port")
    private List<Integer> ports;

    @SerializedName("address")
    private String address;

    @SerializedName("containerName")
    private String containerName;

    @SerializedName("command")
    private String command;

    @SerializedName("envs")
    private List<String> envs;

    @SerializedName("gpu")
    private String gpu;

    @SerializedName("device")
    private List<String> devices;

    @SerializedName("volume")
    private Map<String, VolumeConfig> volume;

    @SerializedName("network_mode")
    private String networkMode;

    @SerializedName("privileged")
    private boolean privileged;

    @SerializedName("detach")
    private boolean detach = true;

    @SerializedName("auto_remove")
    private boolean autoRemove;

    @SerializedName("tty")
    private boolean tty;

    @SerializedName("order")
    private int order;

    @SerializedName("modelling")
    private ModellingConfig modelling;

    public String getImageName() {
        return imageName;
    }

    public void setImageName(String imageName) {
        if (imageName != null)
            this.imageName = imageName;
    }

    public List<Integer> getPorts() {
        return ports;
    }

    public void setPorts(List<Integer> ports) {
        if (ports != null)
            this.ports = ports;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        if (address != null)
            this.address = address;
    }

    public String getContainerName() {
        return containerName;
    }

    public void setContainerName(String containerName) {
        this.containerName = containerName;
    }

    public String getCommand() {
        return command;
    }

    public void setCommand(String command) {
        if (command != null)
            this.command = command;
    }

    public List<String> getEnvs() {
        return envs;
    }

    public void setEnvs(List<String> envs) {
        if (envs != null)
            this.envs = envs;
    }

    public void addEnv(String env) {
        if (this.envs == null) {
            this.envs = new ArrayList<>();
        }
        this.envs.add(env);
    }

    public String getGpu() {
        return gpu;
    }

    public void setGpu(String gpu) {
        this.gpu = gpu;
    }

    public List<String> getDevices() {
        return devices;
    }

    public void setDevices(List<String> devices) {
        if (devices != null)
            this.devices = devices;
    }

    public Map<String, VolumeConfig> getVolume() {
        return volume;
    }

    public void setVolume(Map<String, VolumeConfig> volume) {
        if (volume != null)
            this.volume = volume;
    }

    public String getNetworkMode() {
        return networkMode;
    }

    public void setNetworkMode(String networkMode) {
        if (networkMode != null)
            this.networkMode = networkMode;
    }

    public boolean isPrivileged() {
        return privileged;
    }

    public void setPrivileged(boolean privileged) {
        this.privileged = privileged;
    }

    public boolean isDetach() {
        return detach;
    }

    public void setDetach(boolean detach) {
        this.detach = detach;
    }

    public boolean isAutoRemove() {
        return autoRemove;
    }

    public void setAutoRemove(boolean autoRemove) {
        this.autoRemove = autoRemove;
    }

    public boolean isTty() {
        return tty;
    }

    public void setTty(boolean tty) {
        this.tty = tty;
    }

    public int getOrder() {
        return order;
    }

    public void setOrder(int order) {
        this.order = order;
    }

    public ModellingConfig getModelling() {
        return modelling;
    }

    public void setModelling(ModellingConfig modelling) {
        if (modelling != null)
            this.modelling = modelling;
    }
}
