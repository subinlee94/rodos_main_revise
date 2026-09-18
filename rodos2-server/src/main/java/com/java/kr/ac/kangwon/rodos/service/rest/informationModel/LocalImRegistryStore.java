package com.java.kr.ac.kangwon.rodos.service.rest.informationModel;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

import org.springframework.stereotype.Component;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

/**
 * Persists modules when the remote IIC registry is unreachable or returns a server error.
 * Stored under {@code .rodos/local-registry/modules.json} (server working directory).
 */
@Component
public class LocalImRegistryStore {

	private static final Path STORE_PATH = Paths.get(".rodos", "local-registry", "modules.json");

	private final ObjectMapper objectMapper = new ObjectMapper();
	private final Object lock = new Object();

	public void save(IM im) throws Exception {
		synchronized (lock) {
			List<IM> all = loadAll();
			List<IM> next = new ArrayList<>();
			String id = im.getModuleID();
			for (IM existing : all) {
				if (id != null && id.equals(existing.getModuleID())) {
					continue;
				}
				next.add(existing);
			}
			next.add(im);
			writeAll(next);
		}
	}

	public IM get(String moduleId) throws Exception {
		if (moduleId == null) {
			return null;
		}
		synchronized (lock) {
			return loadAll().stream()
					.filter(m -> moduleId.equals(m.getModuleID()))
					.findFirst()
					.orElse(null);
		}
	}

	public List<IM> listByClassification(String classification) throws Exception {
		if (classification == null) {
			return List.of();
		}
		String c = classification.toLowerCase();
		synchronized (lock) {
			return loadAll().stream()
					.filter(m -> m.getClassification() != null && c.equalsIgnoreCase(m.getClassification()))
					.collect(Collectors.toList());
		}
	}

	public boolean delete(String moduleId) throws Exception {
		if (moduleId == null) {
			return false;
		}
		synchronized (lock) {
			List<IM> all = loadAll();
			boolean removed = all.removeIf(m -> moduleId.equals(m.getModuleID()));
			if (removed) {
				writeAll(all);
			}
			return removed;
		}
	}

	private List<IM> loadAll() throws Exception {
		if (!Files.exists(STORE_PATH)) {
			return new ArrayList<>();
		}
		byte[] bytes = Files.readAllBytes(STORE_PATH);
		if (bytes.length == 0) {
			return new ArrayList<>();
		}
		List<IM> list = objectMapper.readValue(bytes, new TypeReference<List<IM>>() {
		});
		return list != null ? new ArrayList<>(list) : new ArrayList<>();
	}

	private void writeAll(List<IM> modules) throws Exception {
		Files.createDirectories(Objects.requireNonNull(STORE_PATH.getParent()));
		objectMapper.writerWithDefaultPrettyPrinter().writeValue(STORE_PATH.toFile(), modules);
	}
}
