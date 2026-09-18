package com.java.kr.ac.kangwon.rodos.service.rest.informationModel;

/**
 * Result of attempting to register an IM on the registry (remote and/or local fallback).
 */
public final class ImUploadResult {

	private final boolean success;
	private final String failureReason;
	private final boolean localOnly;
	private final boolean clientError;

	private ImUploadResult(boolean success, String failureReason, boolean localOnly, boolean clientError) {
		this.success = success;
		this.failureReason = failureReason;
		this.localOnly = localOnly;
		this.clientError = clientError;
	}

	public static ImUploadResult remoteOk() {
		return new ImUploadResult(true, null, false, false);
	}

	public static ImUploadResult localOk() {
		return new ImUploadResult(true, null, true, false);
	}

	public static ImUploadResult failure(String reason) {
		return new ImUploadResult(false, reason != null ? reason : "Unknown error", false, false);
	}

	/** Remote registry rejected the request (e.g. duplicate module, validation). */
	public static ImUploadResult failureClient(String reason) {
		return new ImUploadResult(false, reason != null ? reason : "Bad request", false, true);
	}

	public boolean isSuccess() {
		return success;
	}

	public String getFailureReason() {
		return failureReason;
	}

	public boolean isLocalOnly() {
		return localOnly;
	}

	public boolean isClientError() {
		return clientError;
	}
}
