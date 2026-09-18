package com.java.kr.ac.kangwon.rodos.model;

import java.util.ArrayList;
import java.util.List;

/**
 * Configuration - RODOS2용 단순화된 Configuration 클래스
 * RODOS1의 복잡한 Observable 패턴과 XStream 변환기를 제거하고
 * Spring Boot + React.js 환경에 맞게 단순화
 */
public class Configuration {

    public final List<CloudInfo> clouds = new ArrayList<>();
    public final List<EdgeInfo> edges = new ArrayList<>();
    public final List<RobotInfo> robots = new ArrayList<>();
    public Simulation simulationInfo;

    public Configuration() {
        // 기본 생성자
    }

    /**
     * 모든 하드웨어 정보를 지우고 초기화
     */
    public void clear() {
        clouds.clear();
        edges.clear();
        robots.clear();
        simulationInfo = null;
    }

    /**
     * Configuration이 비어있는지 확인
     */
    public boolean isEmpty() {
        return clouds.isEmpty() && edges.isEmpty() && robots.isEmpty();
    }

    /**
     * 전체 모듈 수를 반환
     */
    public int getTotalModuleCount() {
        int count = 0;
        for (CloudInfo cloud : clouds) {
            count += cloud.getModules().size();
        }
        for (EdgeInfo edge : edges) {
            count += edge.getModules().size();
        }
        for (RobotInfo robot : robots) {
            count += robot.getModules().size();
        }
        return count;
    }
}
