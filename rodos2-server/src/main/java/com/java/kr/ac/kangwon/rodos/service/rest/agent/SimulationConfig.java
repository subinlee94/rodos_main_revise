package com.java.kr.ac.kangwon.rodos.service.rest.agent;

import com.google.gson.annotations.SerializedName;

public class SimulationConfig {

    @SerializedName("robot_name")
    private String robotName;

    @SerializedName("namespace")
    private String namespace;

    @SerializedName("x")
    private String x;

    @SerializedName("y")
    private String y;

    @SerializedName("theta")
    private String theta;

    @SerializedName("simulator")
    private String simulator;

    @SerializedName("model_path")
    private String path;

    public SimulationConfig() {
    }

    public SimulationConfig(String robotName, String namespace, String x, String y, String theta) {
        this.robotName = robotName;
        this.namespace = namespace;
        this.x = x;
        this.y = y;
        this.theta = theta;
    }

    public String getRobotName() {
        return robotName;
    }

    public void setRobotName(String robotName) {
        this.robotName = robotName;
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

    public String getSimulator() {
        return simulator;
    }

    public void setSimulatorName(String simulatorName) {
        this.simulator = simulatorName;
    }

    public String getPath() {
        return path;
    }

    public void setPath(String path) {
        this.path = path;
    }
}
