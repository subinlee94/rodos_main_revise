package com.java.kr.ac.kangwon.rodos.service.rest.agent;

import com.google.gson.annotations.SerializedName;

public class VolumeConfig {
    @SerializedName("bind")
    private String bind;

    @SerializedName("mode")
    private String mode;

    public String getBind() {
        return bind;
    }

    public void setBind(String bind) {
        this.bind = bind;
    }

    public String getMode() {
        return mode;
    }

    public void setMode(String mode) {
        this.mode = mode;
    }
}
