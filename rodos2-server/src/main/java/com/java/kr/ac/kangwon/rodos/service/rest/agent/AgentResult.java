package com.java.kr.ac.kangwon.rodos.service.rest.agent;

import java.util.List;

import com.google.gson.annotations.SerializedName;

public class AgentResult {
    @SerializedName("result")
    private List<ResultItem> result;

    public List<ResultItem> getResult() {
        return result;
    }

    public void setResult(List<ResultItem> result) {
        this.result = result;
    }

    public static class ResultItem {
        @SerializedName("clusterName")
        private String clusterName;

        @SerializedName("moduleName")
        private String moduleName;

        @SerializedName("containerId")
        private String containerId;

        @SerializedName("imageId")
        private String imageId;

        @SerializedName("statusCode")
        private int statusCode;

        @SerializedName("status")
        private String status;

        @SerializedName("log")
        private String log;

        @SerializedName("updateAt")
        private String updateAt;

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

        public String getContainerId() {
            return containerId;
        }

        public void setContainerId(String containerId) {
            this.containerId = containerId;
        }

        public String getImageId() {
            return imageId;
        }

        public void setImageId(String imageId) {
            this.imageId = imageId;
        }

        public int getStatusCode() {
            return statusCode;
        }

        public void setStatusCode(int statusCode) {
            this.statusCode = statusCode;
        }

        public String getStatus() {
            return status;
        }

        public void setStatus(String status) {
            this.status = status;
        }

        public String getLog() {
            return log;
        }

        public void setLog(String log) {
            this.log = log;
        }

        public String getUpdateAt() {
            return updateAt;
        }

        public void setUpdateAt(String updateAt) {
            this.updateAt = updateAt;
        }
    }
}
