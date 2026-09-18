package com.java.kr.ac.kangwon.rodos.service.rest.agent;

import java.util.List;
import java.util.ArrayList;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.ResponseEntity;

import com.java.kr.ac.kangwon.rodos.model.DockerAgent;

/**
 * DockerAgent 서비스
 * iic-api에서 dockerAgent 목록을 가져오는 서비스
 */
@Service
public class DockerAgentService {

    private static final String BASE_URL = "http://iic-api.kangwon.ac.kr:8008";
    private final RestTemplate restTemplate;

    public DockerAgentService() {
        this.restTemplate = new RestTemplate();
    }

    /**
     * iic-api에서 dockerAgent 목록을 가져옴
     * 
     * @return DockerAgent 목록
     */
    public List<DockerAgent> getDockerAgentList() {
        try {
            String url = BASE_URL + "/dockerAgent/list";

            System.out.println("=== getDockerAgentList 호출 시작 ===");
            System.out.println("요청 URL: " + url);

            // JSON 응답을 Map 배열로 받아서 처리
            ResponseEntity<Map[]> response = restTemplate.getForEntity(url, Map[].class);

            System.out.println("응답 상태 코드: " + response.getStatusCode());
            System.out.println("응답 바디 존재 여부: " + (response.getBody() != null));

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Map[] agentArray = response.getBody();
                System.out.println("받은 Map 개수: " + agentArray.length);

                List<DockerAgent> result = new ArrayList<>();

                // 각 Map을 DockerAgent 객체로 변환
                for (int i = 0; i < agentArray.length; i++) {
                    Map<String, Object> agentData = agentArray[i];
                    System.out.println("--- Map[" + i + "] 상세 정보 ---");
                    System.out.println("  Raw data: " + agentData);

                    // Map 데이터를 DockerAgent 객체로 변환
                    DockerAgent agent = new DockerAgent(
                            (String) agentData.get("ip"),
                            (String) agentData.get("hwname"),
                            (String) agentData.get("type"));

                    System.out.println("  변환된 DockerAgent: " + agent.getHwname() + " / " + agent.getIp() + " / "
                            + agent.getType());
                    result.add(agent);
                }

                return result;
            } else {
                System.out.println("응답이 성공적이지 않거나 바디가 null입니다.");
                System.out.println("상태 코드: " + response.getStatusCode());
                System.out.println("바디 null 여부: " + (response.getBody() == null));
            }
        } catch (Exception e) {
            System.out.println("=== getDockerAgentList 예외 발생 ===");
            System.out.println("예외 타입: " + e.getClass().getSimpleName());
            System.out.println("예외 메시지: " + e.getMessage());
            e.printStackTrace();
        }

        System.out.println("=== getDockerAgentList 종료 (빈 리스트 반환) ===");
        return new ArrayList<>();
    }
}
