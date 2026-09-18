package com.java.kr.ac.kangwon.rodos.service.rest.informationModel;

import java.util.List;

/**
 * IM Registry API 서비스
 * Edge, Robot 등의 정보 모델을 Registry에서 관리
 */
public interface IMRegistryApi {

	/**
	 * 특정 분류의 모듈 목록 조회
	 */
	List<IM> getListIM(String classification);

	/**
	 * 모듈 ID로 모듈 정보 조회
	 */
	IM getIM(String moduleId);

	/**
	 * 새 모듈 등록
	 */
	boolean doUploadIM(IM informationModel);

	/**
	 * 모듈 삭제
	 */
	boolean deleteIM(String moduleId);
}
