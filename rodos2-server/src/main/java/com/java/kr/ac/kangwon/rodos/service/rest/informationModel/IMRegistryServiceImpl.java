package com.java.kr.ac.kangwon.rodos.service.rest.informationModel;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.HttpMethod;

import java.util.List;
import java.util.Arrays;
import java.util.Map;
import java.util.ArrayList;

/**
 * IM Registry API 구현체
 * 외부 Registry 서버와 통신하여 Edge, Robot 등의 정보 모델을 관리
 */
@Service
public class IMRegistryServiceImpl implements IMRegistryApi {

    private static final String BASE_URL = "http://iic-api.kangwon.ac.kr:8008";
    private final RestTemplate restTemplate;

    public IMRegistryServiceImpl() {
        this.restTemplate = new RestTemplate();
    }

    @Override
    public List<IM> getListIM(String classification) {
        try {
            String url;
            url = BASE_URL + "/InformationModel/list?classification=" + classification;

            System.out.println("=== getListIM 호출 시작 ===");
            System.out.println("Classification: " + classification);
            System.out.println("요청 URL: " + url);

            // JSON 응답을 Map으로 받아서 처리
            ResponseEntity<Map[]> response = restTemplate.getForEntity(url, Map[].class);

            System.out.println("응답 상태 코드: " + response.getStatusCode());
            System.out.println("응답 바디 존재 여부: " + (response.getBody() != null));

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Map[] imArray = response.getBody();
                System.out.println("받은 Map 개수: " + imArray.length);

                List<IM> result = new ArrayList<>();

                // 각 Map을 IM 객체로 변환
                for (int i = 0; i < imArray.length; i++) {
                    Map<String, Object> moduleData = imArray[i];
                    System.out.println("--- Map[" + i + "] 상세 정보 ---");
                    System.out.println("  Raw data: " + moduleData);

                    // Map 데이터를 IM 객체로 변환
                    IM im = new IM(
                            (String) moduleData.get("module_name"),
                            (String) moduleData.get("module_id"),
                            (String) moduleData.get("xml_file"),
                            IM.Type.ROBOT // 기본값으로 ROBOT 설정
                    );

                    // classification이 있으면 설정
                    if (moduleData.get("classification") != null) {
                        im.setClassification((String) moduleData.get("classification"));
                    }

                    System.out.println("  변환된 IM: " + im.getModuleName() + " / " + im.getModuleID());
                    result.add(im);
                }

                return result;
            } else {
                System.out.println("응답이 성공적이지 않거나 바디가 null입니다.");
                System.out.println("상태 코드: " + response.getStatusCode());
                System.out.println("바디 null 여부: " + (response.getBody() == null));
            }
        } catch (Exception e) {
            System.out.println("=== getListIM 예외 발생 ===");
            System.out.println("예외 타입: " + e.getClass().getSimpleName());
            System.out.println("예외 메시지: " + e.getMessage());
            e.printStackTrace();
        }
        System.out.println("=== getListIM 종료 (빈 리스트 반환) ===");
        return List.of();
    }

    @Override
    public IM getIM(String moduleId) {
        try {
            String url = BASE_URL + "/InformationModel/get?module_id=" + moduleId;
            ResponseEntity<IM> response = restTemplate.getForEntity(url, IM.class);

            if (response.getStatusCode().is2xxSuccessful()) {
                return response.getBody();
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return null;
    }

    @Override
    public boolean doUploadIM(IM informationModel) {
        try {
            String url = BASE_URL + "/InformationModel/add";

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<IM> request = new HttpEntity<>(informationModel, headers);
            ResponseEntity<String> response = restTemplate.postForEntity(url, request, String.class);

            return response.getStatusCode().is2xxSuccessful();
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    @Override
    public boolean deleteIM(String moduleId) {
        try {
            String url = BASE_URL + "/InformationModel/delete";

            IM im = new IM(moduleId);
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<IM> request = new HttpEntity<>(im, headers);
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.DELETE, request, String.class);

            return response.getStatusCode().is2xxSuccessful();
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }
}
