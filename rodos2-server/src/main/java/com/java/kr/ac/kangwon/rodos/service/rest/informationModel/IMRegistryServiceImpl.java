package com.java.kr.ac.kangwon.rodos.service.rest.informationModel;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.time.Duration;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.web.client.RestTemplate;

/**
 * IM Registry API 구현체 — 원격 Registry와 통신하고, 실패 시 로컬 파일 레지스트리로 대체한다.
 */
@Service
public class IMRegistryServiceImpl implements IMRegistryApi {

	private final RestTemplate restTemplate;
	private final LocalImRegistryStore localStore;
	private final Map<String, CachedList> listCache = new ConcurrentHashMap<>();

	private final String baseUrl;
	private final boolean localFallback;
	private final long listCacheTtlMs;

	private record CachedList(List<IM> modules, long expiresAt) {}

	public IMRegistryServiceImpl(
			LocalImRegistryStore localStore,
			RestTemplateBuilder restTemplateBuilder,
			@Value("${rodos.registry.base-url:http://iic-api.kangwon.ac.kr:8008}") String baseUrl,
			@Value("${rodos.registry.local-fallback:true}") boolean localFallback,
			@Value("${rodos.registry.connect-timeout-ms:1500}") long connectTimeoutMs,
			@Value("${rodos.registry.read-timeout-ms:3000}") long readTimeoutMs,
			@Value("${rodos.registry.list-cache-ttl-ms:30000}") long listCacheTtlMs) {
		this.localStore = localStore;
		this.baseUrl = baseUrl != null ? baseUrl.replaceAll("/$", "") : "http://iic-api.kangwon.ac.kr:8008";
		this.localFallback = localFallback;
		this.listCacheTtlMs = Math.max(0, listCacheTtlMs);
		this.restTemplate = restTemplateBuilder
				.connectTimeout(Duration.ofMillis(Math.max(1, connectTimeoutMs)))
				.readTimeout(Duration.ofMillis(Math.max(1, readTimeoutMs)))
				.build();
	}

	@Override
	public List<IM> getListIM(String classification) {
		CachedList cached = listCache.get(classification);
		long now = System.currentTimeMillis();
		if (cached != null && cached.expiresAt() > now) {
			return new ArrayList<>(cached.modules());
		}
		List<IM> remote = fetchRemoteListIM(classification);
		List<IM> local = List.of();
		try {
			local = localStore.listByClassification(classification);
		} catch (Exception e) {
			System.err.println("Local registry list failed: " + e.getMessage());
			e.printStackTrace();
		}
		Set<String> remoteIds = new HashSet<>();
		for (IM im : remote) {
			if (im.getModuleID() != null) {
				remoteIds.add(im.getModuleID());
			}
		}
		List<IM> merged = new ArrayList<>(remote);
		for (IM im : local) {
			if (im.getModuleID() != null && !remoteIds.contains(im.getModuleID())) {
				merged.add(im);
			}
		}
		listCache.put(classification, new CachedList(List.copyOf(merged), now + listCacheTtlMs));
		return new ArrayList<>(merged);
	}

	private List<IM> fetchRemoteListIM(String classification) {
		try {
			String url = baseUrl + "/InformationModel/list?classification=" + classification;

			System.out.println("=== getListIM (remote) ===");
			System.out.println("Classification: " + classification);
			System.out.println("요청 URL: " + url);

			ResponseEntity<Map[]> response = restTemplate.getForEntity(url, Map[].class);

			System.out.println("응답 상태 코드: " + response.getStatusCode());
			System.out.println("응답 바디 존재 여부: " + (response.getBody() != null));

			if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
				Map[] imArray = response.getBody();
				System.out.println("받은 Map 개수: " + imArray.length);

				List<IM> result = new ArrayList<>();

				for (int i = 0; i < imArray.length; i++) {
					Map<String, Object> moduleData = imArray[i];
					System.out.println("--- Map[" + i + "] ---");
					System.out.println("  Raw data: " + moduleData);

					IM im = new IM(
							(String) moduleData.get("module_name"),
							(String) moduleData.get("module_id"),
							(String) moduleData.get("xml_file"),
							IM.Type.ROBOT);

					if (moduleData.get("classification") != null) {
						im.setClassification((String) moduleData.get("classification"));
					}

					System.out.println("  변환된 IM: " + im.getModuleName() + " / " + im.getModuleID());
					result.add(im);
				}

				return result;
			} else {
				System.out.println("Remote list: non-success or empty body. " + response.getStatusCode());
			}
		} catch (Exception e) {
			System.out.println("=== getListIM remote 예외 ===");
			System.out.println("예외 타입: " + e.getClass().getSimpleName());
			System.out.println("예외 메시지: " + e.getMessage());
			e.printStackTrace();
		}
		System.out.println("=== getListIM remote 종료 (빈) ===");
		return List.of();
	}

	@Override
	public IM getIM(String moduleId) {
		try {
			String url = baseUrl + "/InformationModel/get?module_id=" + moduleId;
			ResponseEntity<IM> response = restTemplate.getForEntity(url, IM.class);

			if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
				return response.getBody();
			}
		} catch (Exception e) {
			e.printStackTrace();
		}
		try {
			return localStore.get(moduleId);
		} catch (Exception e) {
			e.printStackTrace();
			return null;
		}
	}

	@Override
	public ImUploadResult doUploadIM(IM informationModel) {
		listCache.clear();
		String url = baseUrl + "/InformationModel/add";

		HttpHeaders headers = new HttpHeaders();
		headers.setContentType(MediaType.APPLICATION_JSON);

		HttpEntity<IM> request = new HttpEntity<>(informationModel, headers);
		try {
			ResponseEntity<String> response = restTemplate.postForEntity(url, request, String.class);
			HttpStatusCode code = response.getStatusCode();
			if (code.is2xxSuccessful()) {
				try {
					localStore.delete(informationModel.getModuleID());
				} catch (Exception e) {
					System.err.println("Local registry cleanup after remote OK: " + e.getMessage());
				}
				return ImUploadResult.remoteOk();
			}
			String body = response.getBody() != null ? response.getBody() : code.toString();
			if (code.is4xxClientError()) {
				System.err.println("Remote registry client error: " + body);
				return ImUploadResult.failureClient(body);
			}
			System.err.println("Remote registry server error: " + body);
		} catch (Exception e) {
			System.err.println("Remote registry unreachable: " + e.getMessage());
			e.printStackTrace();
		}

		if (!localFallback) {
			return ImUploadResult.failure(
					"Remote registry did not accept the module and rodos.registry.local-fallback is false.");
		}
		try {
			localStore.save(informationModel);
			System.out.println("Saved module to local registry: " + informationModel.getModuleID());
			return ImUploadResult.localOk();
		} catch (Exception e) {
			e.printStackTrace();
			return ImUploadResult.failure("Remote registry failed and local save failed: " + e.getMessage());
		}
	}

	@Override
	public boolean deleteIM(String moduleId) {
		listCache.clear();
		boolean remoteOk = false;
		try {
			String url = baseUrl + "/InformationModel/delete";

			IM im = new IM(moduleId);
			HttpHeaders headers = new HttpHeaders();
			headers.setContentType(MediaType.APPLICATION_JSON);

			HttpEntity<IM> request = new HttpEntity<>(im, headers);
			ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.DELETE, request, String.class);

			remoteOk = response.getStatusCode().is2xxSuccessful();
		} catch (Exception e) {
			e.printStackTrace();
		}
		boolean localOk = false;
		try {
			localOk = localStore.delete(moduleId);
		} catch (Exception e) {
			e.printStackTrace();
		}
		return remoteOk || localOk;
	}
}
