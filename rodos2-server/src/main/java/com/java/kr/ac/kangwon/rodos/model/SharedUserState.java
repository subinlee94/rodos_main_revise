package com.java.kr.ac.kangwon.rodos.model;

import java.util.List;
import java.util.Map;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlElementWrapper;
import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlProperty;
import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlRootElement;

/**
 * SharedUserState - rodos 1 버전 구조를 참고한 개선된 설계
 * ObservableList와 ObservableValue 패턴을 단순화하여 Spring Boot 환경에 맞게 구현
 */
@JacksonXmlRootElement(localName = "kr.ac.kangwon.rodos.model.SharedUserState")
public class SharedUserState {

    @JacksonXmlProperty(localName = "editors")
    private Editors editors;

    @JacksonXmlProperty(localName = "lastFile")
    private String lastFile;

    @JacksonXmlProperty(localName = "sim_Mode", isAttribute = true)
    @JsonInclude(JsonInclude.Include.NON_NULL)
    private Boolean simMode;

    @JacksonXmlProperty(localName = "simulationInfo")
    @JsonInclude(JsonInclude.Include.NON_NULL)
    private Simulation simulationInfo;

    public SharedUserState() {
        this.editors = new Editors();
        this.lastFile = ".rodos/cache/App Configuration(xml)/test.xml";
    }

    public Editors getEditors() {
        return editors;
    }

    public void setEditors(Editors editors) {
        this.editors = editors;
    }

    public String getLastFile() {
        return lastFile;
    }

    public void setLastFile(String lastFile) {
        this.lastFile = lastFile;
    }

    public Boolean getSimMode() {
        return simMode;
    }

    public void setSimMode(Boolean simMode) {
        this.simMode = simMode;
    }

    public Simulation getSimulationInfo() {
        return simulationInfo;
    }

    public void setSimulationInfo(Simulation simulationInfo) {
        this.simulationInfo = simulationInfo;
    }

    /**
     * Editors - Configuration들의 컨테이너
     * rodos 1의 ObservableList<Configuration> editors 패턴을 단순화
     */
    public static class Editors {
        @JacksonXmlProperty(localName = "System")
        private System system;

        public Editors() {
            this.system = new System();
        }

        public System getSystem() {
            return system;
        }

        public void setSystem(System system) {
            this.system = system;
        }
    }

    /**
     * System - Configuration의 실제 구현체
     * rodos 1의 Configuration 클래스 구조를 참고
     */
    public static class System {
        @JacksonXmlElementWrapper(useWrapping = false)
        @JacksonXmlProperty(localName = "Cloud")
        @JsonInclude(JsonInclude.Include.NON_EMPTY)
        private List<CloudInfo> clouds;

        @JacksonXmlElementWrapper(useWrapping = false)
        @JacksonXmlProperty(localName = "Edge")
        @JsonInclude(JsonInclude.Include.NON_EMPTY)
        private List<EdgeInfo> edges;

        @JacksonXmlElementWrapper(useWrapping = false)
        @JacksonXmlProperty(localName = "Robot")
        @JsonInclude(JsonInclude.Include.NON_EMPTY)
        private List<RobotInfo> robots;

        @JacksonXmlProperty(localName = "Links")
        private Links links;

        @JacksonXmlProperty(localName = "Styles")
        private Styles styles;

        public System() {
            this.clouds = new java.util.ArrayList<>();
            this.edges = new java.util.ArrayList<>();
            this.robots = new java.util.ArrayList<>();
            this.links = new Links();
            this.styles = new Styles();
        }

        public List<CloudInfo> getClouds() {
            return clouds;
        }

        public void setClouds(List<CloudInfo> clouds) {
            this.clouds = clouds;
        }

        public List<EdgeInfo> getEdges() {
            return edges;
        }

        public void setEdges(List<EdgeInfo> edges) {
            this.edges = edges;
        }

        public List<RobotInfo> getRobots() {
            return robots;
        }

        public void setRobots(List<RobotInfo> robots) {
            this.robots = robots;
        }

        public Links getLinks() {
            return links;
        }

        public void setLinks(Links links) {
            this.links = links;
        }

        public Styles getStyles() {
            return styles;
        }

        public void setStyles(Styles styles) {
            this.styles = styles;
        }

        /**
         * 스타일 동기화 - rodos 1의 sync() 패턴
         */
        public void sync() {
            // Cloud 스타일 동기화
            for (CloudInfo cloud : clouds) {
                styles.putStyle(cloud.getName(), cloud.getStyle());
                for (ModuleInfo module : cloud.getModules()) {
                    styles.putStyle(module.computeFullName(), module.getStyle());
                }
            }

            // Edge 스타일 동기화
            for (EdgeInfo edge : edges) {
                styles.putStyle(edge.getName(), edge.getStyle());
                for (ModuleInfo module : edge.getModules()) {
                    styles.putStyle(module.computeFullName(), module.getStyle());
                }
            }

            // Robot 스타일 동기화
            for (RobotInfo robot : robots) {
                styles.putStyle(robot.getName(), robot.getStyle());
                for (ModuleInfo module : robot.getModules()) {
                    styles.putStyle(module.computeFullName(), module.getStyle());
                }
            }
        }
    }

    /**
     * Links - 모듈 간 연결 정보
     */
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class Links {
        // Links는 현재 빈 클래스로 유지 (필요시 확장)
        public Links() {
        }
    }

    /**
     * Styles - 스타일 맵 관리
     */
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class Styles {
        private Map<String, Style> styles;

        public Styles() {
            this.styles = new java.util.HashMap<>();
        }

        public Map<String, Style> getStyles() {
            return styles;
        }

        public void setStyles(Map<String, Style> styles) {
            this.styles = styles;
        }

        public void putStyle(String key, Style style) {
            if (style != null) {
                styles.put(key, style);
            }
        }

        public Style getStyle(String key) {
            return styles.get(key);
        }
    }

    /**
     * 현재 상태를 Configuration으로 변환 (ExecutorManager용)
     * RODOS2에서는 단순한 데이터 변환만 수행 (Observable 패턴 불필요)
     */
    public Configuration toConfiguration() {
        Configuration config = new Configuration();

        // Robots 변환 - 직접 참조 (Observable 불필요)
        if (editors != null && editors.getSystem() != null && editors.getSystem().getRobots() != null) {
            config.robots.addAll(editors.getSystem().getRobots());
        }

        // Edges 변환 - 직접 참조 (Observable 불필요)
        if (editors != null && editors.getSystem() != null && editors.getSystem().getEdges() != null) {
            config.edges.addAll(editors.getSystem().getEdges());
        }

        // Clouds 변환 - 직접 참조 (Observable 불필요)
        if (editors != null && editors.getSystem() != null && editors.getSystem().getClouds() != null) {
            config.clouds.addAll(editors.getSystem().getClouds());
        }

        // Simulation 정보 처리 - simulationInfo가 있으면 Simulation HW 생성
        if (simulationInfo != null && simulationInfo.getSimulationHwName() != null) {
            String simulationHwName = simulationInfo.getSimulationHwName();
            String simulationHwTarget = simulationInfo.getSimulationHwTarget();

            // Simulation HW를 Edge로 생성 (Simulation HW는 Edge 타입)
            EdgeInfo simulationEdge = new EdgeInfo();
            simulationEdge.setName(simulationHwName);
            // localhost로 강제 설정 (개발 환경)
            simulationEdge.setTarget("localhost");
            simulationEdge.setType("edge");

            // Simulation 객체 생성 및 설정
            Simulation simulation = new Simulation();

            simulationEdge.setSimulation(simulation);
            config.edges.add(simulationEdge);
        }

        // SimulationInfo 복사
        if (simulationInfo != null) {
            config.simulationInfo = simulationInfo;

            // simulation 객체에도 SimulationConfigs 복사 (ExecutorManager용)
            if (simulationInfo.getSimulationConfigs() != null && !simulationInfo.getSimulationConfigs().isEmpty()) {
                // 모든 Robot의 simulation 태그에 SimulationConfigs 복사
                if (editors != null && editors.getSystem() != null && editors.getSystem().getRobots() != null) {
                    for (var robot : editors.getSystem().getRobots()) {
                        if (robot.getSimulation() != null) {
                            robot.getSimulation().setSimulationConfigs(simulationInfo.getSimulationConfigs());
                        }
                    }
                }
            }
        }

        return config;
    }
}