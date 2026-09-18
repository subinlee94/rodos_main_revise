package com.java.kr.ac.kangwon.rodos.compute;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.java.kr.ac.kangwon.rodos.compute.docker.DockerCMD;
import com.java.kr.ac.kangwon.rodos.model.CloudInfo;
import com.java.kr.ac.kangwon.rodos.model.Configuration;
import com.java.kr.ac.kangwon.rodos.model.EdgeInfo;
import com.java.kr.ac.kangwon.rodos.model.ModuleInfo;
import com.java.kr.ac.kangwon.rodos.model.RobotInfo;
import com.java.kr.ac.kangwon.rodos.model.sim.ExeForm;
import com.java.kr.ac.kangwon.rodos.model.sim.ExecutableForm;
import com.java.kr.ac.kangwon.rodos.model.sim.SoftwareModule;
import com.java.kr.ac.kangwon.rodos.model.cim.CompModule;
import com.java.kr.ac.kangwon.rodos.service.rest.agent.SimulationConfig;
import com.java.kr.ac.kangwon.rodos.service.rest.agent.AgentResult;
import com.java.kr.ac.kangwon.rodos.service.rest.agent.DeployAgentApi;
import com.java.kr.ac.kangwon.rodos.service.rest.agent.DeployBody;
import com.java.kr.ac.kangwon.rodos.service.rest.agent.ExecuteBody;
import com.java.kr.ac.kangwon.rodos.service.rest.agent.ExecuteItem;
import com.java.kr.ac.kangwon.rodos.service.rest.agent.StopBody;
import com.java.kr.ac.kangwon.rodos.service.rest.informationModel.IMRegistryApi;

import retrofit2.Response;

/**
 * ExecutorManager - RODOS2용 단순화된 실행 관리자
 * RODOS1의 복잡한 구조를 제거하고 DeployAgent만 사용
 */

@Service
public class ExecutorManager {

	private final IMRegistryApi imRegistryApi;

	public ExecutorManager(IMRegistryApi imRegistryApi) {
		this.imRegistryApi = imRegistryApi;
	}

	/**
	 * 모듈 배포 (Deploy)
	 */
	public void doCRDADeploy(Configuration config) {
		System.out.println("=== Deploy 시작 ===");

		// Edge 배포
		for (EdgeInfo edge : config.edges) {
			List<ModuleInfo> modules = edge.getModules();
			if (modules.isEmpty())
				continue;

			DeployBody deployBody = new DeployBody();
			for (ModuleInfo moduleInfo : modules) {
				appendDeployBody(edge.getName(), deployBody, moduleInfo);
			}

			System.out.println("Edge 배포: " + edge.getName() + " -> " + edge.getTarget());
			Response<AgentResult> response = DeployAgentApi.doDeploySync(edge.getTarget(), deployBody);
			if (response != null && response.isSuccessful()) {
				System.out.println("Edge 배포 성공: " + edge.getName());
			} else {
				System.err.println("Edge 배포 실패: " + edge.getName() + " - "
						+ (response != null ? response.message() : "Response is null"));
			}
		}

		// Robot 배포
		for (RobotInfo robot : config.robots) {
			List<ModuleInfo> modules = robot.getModules();
			if (modules.isEmpty())
				continue;

			DeployBody deployBody = new DeployBody();
			for (ModuleInfo moduleInfo : modules) {
				appendDeployBody(robot.getName(), deployBody, moduleInfo);
			}

			System.out.println("Robot 배포: " + robot.getName() + " -> " + robot.getTarget());
			Response<AgentResult> response = DeployAgentApi.doDeploySync(robot.getTarget(), deployBody);
			if (response != null && response.isSuccessful()) {
				System.out.println("Robot 배포 성공: " + robot.getName());
			} else {
				System.err.println("Robot 배포 실패: " + robot.getName() + " - "
						+ (response != null ? response.message() : "Response is null"));
			}
		}

		// Cloud 배포
		for (CloudInfo cloud : config.clouds) {
			List<ModuleInfo> modules = cloud.getModules();
			if (modules.isEmpty())
				continue;

			DeployBody deployBody = new DeployBody();
			for (ModuleInfo moduleInfo : modules) {
				appendDeployBody(cloud.getName(), deployBody, moduleInfo);
			}

			System.out.println("Cloud 배포: " + cloud.getName() + " -> " + cloud.getTarget());
			Response<AgentResult> response = DeployAgentApi.doDeploySync(cloud.getTarget(), deployBody);
			if (response != null && response.isSuccessful()) {
				System.out.println("Cloud 배포 성공: " + cloud.getName());
			} else {
				System.err.println("Cloud 배포 실패: " + cloud.getName() + " - "
						+ (response != null ? response.message() : "Response is null"));
			}
		}
	}

	/**
	 * 모듈 실행 (Execute)
	 */
	public Map<String, Object> doCRDAExecute(Configuration config) {
		System.out.println("=== Execute 시작 ===");
		System.out.println("Configuration - Edges: " + config.edges.size() + ", Robots: " + config.robots.size()
				+ ", Clouds: " + config.clouds.size());

		Map<String, Object> result = new java.util.HashMap<>();
		java.util.List<Map<String, Object>> allResults = new java.util.ArrayList<>();

		// sim_mode 확인 - Simulation HW가 있는지 체크
		EdgeInfo simulationHW = null;
		System.out.println("Edge 개수: " + config.edges.size());
		for (EdgeInfo edge : config.edges) {
			System.out.println("Edge: " + edge.getName() + ", Target: " + edge.getTarget() + ", Simulation: "
					+ (edge.getSimulation() != null ? "있음" : "없음"));
			if (edge.getSimulation() != null) {
				simulationHW = edge;
				System.out.println("Simulation HW 발견: " + edge.getName());
				break;
			}
		}

		if (simulationHW != null) {
			// sim_mode = true: Simulation HW로만 실행
			System.out.println(
					"Simulation 모드 - Simulation HW: " + simulationHW.getName() + " -> " + simulationHW.getTarget());
			java.util.List<Map<String, Object>> simulationResults = executeSimulationMode(simulationHW, config);
			allResults.addAll(simulationResults);
		} else {
			// sim_mode = false: 모든 Edge/Robot을 실제 환경에서 실행
			System.out.println("실제 환경 모드 - 모든 Edge/Robot 실행");
			java.util.List<Map<String, Object>> realResults = executeRealMode(config);
			allResults.addAll(realResults);
		}

		result.put("result", allResults);
		return result;
	}

	private java.util.List<Map<String, Object>> executeSimulationMode(EdgeInfo simulationHW, Configuration config) {
		// Simulation HW로만 실행
		ExecuteBody executeBody = new ExecuteBody();
		executeBody.setSimMode(true);
		executeBody.setNamespace(simulationHW.getSimulation().getNamespace());

		// Deploy Agent가 기대하는 형태로 simulation 객체 생성
		java.util.Map<String, Object> simulation = new java.util.HashMap<>();
		java.util.List<java.util.Map<String, Object>> simulationConfigs = new java.util.ArrayList<>();

		// SimulationConfig를 Deploy Agent 형태로 변환
		if (config.simulationInfo != null && config.simulationInfo.getSimulationConfigs() != null) {
			for (SimulationConfig simConfig : config.simulationInfo.getSimulationConfigs()) {
				java.util.Map<String, Object> simModel = new java.util.HashMap<>();
				simModel.put("namespace", simConfig.getNamespace());
				simModel.put("entity", simConfig.getRobotName()); // entity는 robotName 사용
				simModel.put("x", simConfig.getX());
				simModel.put("y", simConfig.getY());
				simModel.put("z", "0"); // z는 기본값 0
				simModel.put("simulator", simConfig.getSimulator());
				simModel.put("path", simConfig.getPath());
				simulationConfigs.add(simModel);
			}
		}

		simulation.put("simulationConfigs", simulationConfigs);
		executeBody.setSimulation(simulation);

		// SimulationConfig를 활용하여 로봇별 시뮬레이션 설정 적용
		java.util.Map<String, SimulationConfig> robotSimConfigs = new java.util.HashMap<>();
		if (config.simulationInfo != null && config.simulationInfo.getSimulationConfigs() != null) {
			for (SimulationConfig simConfig : config.simulationInfo.getSimulationConfigs()) {
				if (simConfig.getRobotName() != null) {
					robotSimConfigs.put(simConfig.getRobotName(), simConfig);
					System.out.println("SimulationConfig 로드: " + simConfig.getRobotName() +
							" -> " + simConfig.getSimulator() + " (" + simConfig.getPath() + ")");
				}
			}
		}

		// 모든 Robot의 Software 모듈들을 Simulation HW로 전송
		for (RobotInfo robot : config.robots) {
			List<ModuleInfo> modules = robot.getModules();
			System.out.println("Simulation Robot: " + robot.getName() + ", 모듈 개수: " + modules.size());

			// 각 로봇의 simulation 정보 사용 (SimulationConfig 우선)
			String robotNamespace = robot.getName(); // 기본값
			SimulationConfig robotSimConfig = robotSimConfigs.get(robot.getName());

			if (robotSimConfig != null) {
				// SimulationConfig에서 정보 가져오기
				robotNamespace = robotSimConfig.getNamespace() != null ? robotSimConfig.getNamespace()
						: robot.getName();
				System.out.println("로봇 " + robot.getName() + "의 SimulationConfig 정보: namespace=" + robotNamespace +
						", simulator=" + robotSimConfig.getSimulator() +
						", model_path=" + robotSimConfig.getPath());
			} else if (robot.getSimulation() != null) {
				// 기존 simulation 정보 사용
				robotNamespace = robot.getSimulation().getNamespace();
				System.out.println("로봇 " + robot.getName() + "의 simulation 정보: namespace=" + robotNamespace +
						", x=" + robot.getSimulation().getX() +
						", y=" + robot.getSimulation().getY() +
						", theta=" + robot.getSimulation().getTheta());
			}

			for (ModuleInfo moduleInfo : modules) {
				ExecuteItem executeItem = new ExecuteItem();
				executeItem.setClusterName(robot.getName());
				// executeItem.setTarget(simulationHW.getTarget()); // localhost로 강제 설정
				executeItem.setAddress("localhost"); // localhost로 강제 설정
				executeItem.setModuleName(moduleInfo.getName());
				executeItem.setContainerName(moduleInfo.getName() + "_container");

				// executableForm 가져오기
				ExecutableForm executableForm = getExecutableForm(moduleInfo);
				if (executableForm != null && executableForm.getExeForms() != null
						&& !executableForm.getExeForms().isEmpty()) {
					String imageName = executableForm.getExeForms().get(0).getExeFileURL();
					String shellCmd = executableForm.getExeForms().get(0).getShellCmd();

					// Docker 명령어 파싱
					DockerCMD.DockerRunCommandInfo dockerInfo = DockerCMD.parseDockerRunCommand(shellCmd);

					// ExecuteItem 설정
					executeItem.setImageName(dockerInfo.imageName != null ? dockerInfo.imageName : imageName);
					executeItem.setCommand(shellCmd);

					// Docker 옵션들 추출하여 설정
					if (dockerInfo.options != null) {
						executeItem.setPrivileged(dockerInfo.options.contains("--privileged"));
						executeItem.setDetach(
								dockerInfo.options.contains("-d") || dockerInfo.options.contains("--detach"));
						executeItem.setTty(dockerInfo.options.contains("-t") || dockerInfo.options.contains("--tty"));
						executeItem.setAutoRemove(dockerInfo.options.contains("--rm"));

						// 네트워크 옵션 추출
						for (int i = 0; i < dockerInfo.options.size(); i++) {
							if (dockerInfo.options.get(i).equals("--network") && i + 1 < dockerInfo.options.size()) {
								executeItem.setNetworkMode(dockerInfo.options.get(i + 1));
								break;
							}
						}
					}

					System.out.println("Simulation ExecuteItem 설정 완료:");
					System.out.println("  - ModuleName: " + moduleInfo.getName());
					System.out.println("  - ImageName: " + executeItem.getImageName());
					System.out.println("  - Command: " + executeItem.getCommand());
					System.out.println("  - Privileged: " + executeItem.isPrivileged());
					System.out.println("  - Detach: " + executeItem.isDetach());
					System.out.println("  - TTY: " + executeItem.isTty());
					System.out.println("  - AutoRemove: " + executeItem.isAutoRemove());
				} else {
					// 기본값 설정
					executeItem.setImageName("default-image:latest");
					executeItem.setCommand("default-command");
					System.out.println("Simulation ExecuteItem 기본값 설정:");
					System.out.println("  - ModuleName: " + moduleInfo.getName());
					System.out.println("  - ImageName: default-image:latest");
					System.out.println("  - Command: default-command");
				}

				// 각 로봇의 namespace를 사용한 환경변수 설정
				List<String> envs = new ArrayList<>();
				envs.add("ROS_NAMESPACE=" + robotNamespace);
				executeItem.setEnvs(envs);

				executeBody.addItem(executeItem);
				System.out.println("ExecuteBody에 ExecuteItem 추가됨: " + moduleInfo.getName());
			}
		}

		System.out.println("Simulation 실행: " + simulationHW.getName() + " -> " + simulationHW.getTarget());
		System.out.println("ExecuteBody list 크기: " + executeBody.getList().size());
		for (int i = 0; i < executeBody.getList().size(); i++) {
			ExecuteItem item = executeBody.getList().get(i);
			System.out.println("  [" + i + "] ModuleName: " + item.getModuleName() +
					", ImageName: " + item.getImageName() +
					", Command: " + item.getCommand());
		}
		Response<AgentResult> response = DeployAgentApi.doExecuteSync("localhost", executeBody);
		// Response<AgentResult> response =
		// DeployAgentApi.doExecuteSync(simulationHW.getTarget(), executeBody);

		java.util.List<Map<String, Object>> results = new java.util.ArrayList<>();

		if (response != null && response.isSuccessful() && response.body() != null) {
			System.out.println("Simulation 실행 성공: " + simulationHW.getName());
			// Agent 응답에서 각 모듈 결과 추출
			AgentResult agentResult = response.body();
			if (agentResult.getResult() != null) {
				for (AgentResult.ResultItem item : agentResult.getResult()) {
					Map<String, Object> resultMap = new java.util.HashMap<>();
					resultMap.put("moduleName", item.getModuleName());
					resultMap.put("clusterName", item.getClusterName());
					resultMap.put("containerId", item.getContainerId());
					resultMap.put("statusCode", item.getStatusCode());
					resultMap.put("status", item.getStatus());
					resultMap.put("log", item.getLog());
					resultMap.put("updateAt", item.getUpdateAt());
					results.add(resultMap);
				}
			}
		} else {
			System.err.println("Simulation 실행 실패: " + simulationHW.getName() + " - "
					+ (response != null ? response.message() : "Response is null"));
			// 실패한 경우에도 결과 추가
			for (ExecuteItem item : executeBody.getList()) {
				Map<String, Object> errorResult = new java.util.HashMap<>();
				errorResult.put("moduleName", item.getModuleName());
				errorResult.put("clusterName", item.getClusterName());
				errorResult.put("status", "fail");
				errorResult.put("log", response != null ? response.message() : "Response is null");
				results.add(errorResult);
			}
		}

		return results;
	}

	private java.util.List<Map<String, Object>> executeRealMode(Configuration config) {
		java.util.List<Map<String, Object>> allResults = new java.util.ArrayList<>();

		// Edge 실행
		for (EdgeInfo edge : config.edges) {
			List<ModuleInfo> modules = edge.getModules();
			if (modules.isEmpty())
				continue;

			ExecuteBody executeBody = new ExecuteBody();

			// Simulation 설정이 있으면 적용
			if (edge.getSimulation() != null) {
				executeBody.setSimMode(true);
				executeBody.setNamespace(edge.getSimulation().getNamespace());
				executeBody.setSimulation(edge.getSimulation());
			}

			for (ModuleInfo moduleInfo : modules) {
				ExecuteItem executeItem = new ExecuteItem();
				executeItem.setClusterName(edge.getName());
				executeItem.setAddress(edge.getTarget());
				executeItem.setModuleName(moduleInfo.getName());

				// executableForm 가져오기
				ExecutableForm executableForm = getExecutableForm(moduleInfo);
				if (executableForm != null && executableForm.getExeForms() != null
						&& !executableForm.getExeForms().isEmpty()) {
					executeItem.setImageName(executableForm.getExeForms().get(0).getExeFileURL());
					executeItem.setCommand(executableForm.getExeForms().get(0).getShellCmd());
				} else {
					// 기본값 설정
					executeItem.setImageName("default-image:latest");
					executeItem.setCommand("default-command");
				}

				// 기본 환경변수 설정
				List<String> envs = new ArrayList<>();
				envs.add("ROS_NAMESPACE=" + edge.getName());
				executeItem.setEnvs(envs);

				executeBody.addItem(executeItem);
			}

			System.out.println("Edge 실행: " + edge.getName() + " -> " + edge.getTarget());
			Response<AgentResult> response = DeployAgentApi.doExecuteSync(edge.getTarget(), executeBody);
			if (response != null && response.isSuccessful()) {
				System.out.println("Edge 실행 성공: " + edge.getName());
			} else {
				System.err.println("Edge 실행 실패: " + edge.getName() + " - "
						+ (response != null ? response.message() : "Response is null"));
			}
		}

		// Robot 실행
		for (RobotInfo robot : config.robots) {
			List<ModuleInfo> modules = robot.getModules();
			System.out.println("Robot: " + robot.getName() + ", 모듈 개수: " + modules.size());
			if (modules.isEmpty())
				continue;

			ExecuteBody executeBody = new ExecuteBody();

			// Simulation 설정이 있으면 적용
			if (robot.getSimulation() != null) {
				executeBody.setSimMode(true);
				executeBody.setNamespace(robot.getSimulation().getNamespace());
				executeBody.setSimulation(robot.getSimulation());
			}

			for (ModuleInfo moduleInfo : modules) {
				ExecuteItem executeItem = new ExecuteItem();
				executeItem.setClusterName(robot.getName());
				executeItem.setAddress(robot.getTarget());
				executeItem.setModuleName(moduleInfo.getName());

				// executableForm 가져오기
				ExecutableForm executableForm = getExecutableForm(moduleInfo);
				if (executableForm != null && executableForm.getExeForms() != null
						&& !executableForm.getExeForms().isEmpty()) {
					executeItem.setImageName(executableForm.getExeForms().get(0).getExeFileURL());
					executeItem.setCommand(executableForm.getExeForms().get(0).getShellCmd());
				} else {
					// 기본값 설정
					executeItem.setImageName("default-image:latest");
					executeItem.setCommand("default-command");
				}

				// 기본 환경변수 설정
				List<String> envs = new ArrayList<>();
				envs.add("ROS_NAMESPACE=" + robot.getName());
				executeItem.setEnvs(envs);

				executeBody.addItem(executeItem);
			}

			System.out.println("Robot 실행: " + robot.getName() + " -> " + robot.getTarget());
			Response<AgentResult> response = DeployAgentApi.doExecuteSync(robot.getTarget(), executeBody);
			if (response != null && response.isSuccessful()) {
				System.out.println("Robot 실행 성공: " + robot.getName());
			} else {
				System.err.println("Robot 실행 실패: " + robot.getName() + " - "
						+ (response != null ? response.message() : "Response is null"));
			}
		}

		// Cloud 실행
		for (CloudInfo cloud : config.clouds) {
			List<ModuleInfo> modules = cloud.getModules();
			if (modules.isEmpty())
				continue;

			ExecuteBody executeBody = new ExecuteBody();

			for (ModuleInfo moduleInfo : modules) {
				ExecuteItem executeItem = new ExecuteItem();
				executeItem.setClusterName(cloud.getName());
				executeItem.setAddress(cloud.getTarget());
				executeItem.setModuleName(moduleInfo.getName());

				// executableForm 가져오기
				ExecutableForm executableForm = getExecutableForm(moduleInfo);
				if (executableForm != null && executableForm.getExeForms() != null
						&& !executableForm.getExeForms().isEmpty()) {
					executeItem.setImageName(executableForm.getExeForms().get(0).getExeFileURL());
					executeItem.setCommand(executableForm.getExeForms().get(0).getShellCmd());
				} else {
					// 기본값 설정
					executeItem.setImageName("default-image:latest");
					executeItem.setCommand("default-command");
				}

				// 기본 환경변수 설정
				List<String> envs = new ArrayList<>();
				envs.add("ROS_NAMESPACE=" + cloud.getName());
				executeItem.setEnvs(envs);

				executeBody.addItem(executeItem);
			}

			System.out.println("Cloud 실행: " + cloud.getName() + " -> " + cloud.getTarget());
			Response<AgentResult> response = DeployAgentApi.doExecuteSync(cloud.getTarget(), executeBody);
			if (response != null && response.isSuccessful()) {
				System.out.println("Cloud 실행 성공: " + cloud.getName());
			} else {
				System.err.println("Cloud 실행 실패: " + cloud.getName() + " - "
						+ (response != null ? response.message() : "Response is null"));
			}
		}

		return allResults;
	}

	/**
	 * 모듈 중지 (Stop)
	 */
	public void doCRDAStop(Configuration config) {
		System.out.println("=== Stop 시작 ===");

		// Edge 중지
		for (EdgeInfo edge : config.edges) {
			List<ModuleInfo> modules = edge.getModules();
			if (modules.isEmpty())
				continue;

			StopBody stopBody = new StopBody();
			stopBody.append(edge.getName());

			System.out.println("Edge 중지: " + edge.getName() + " -> " + edge.getTarget());
			Response<AgentResult> response = DeployAgentApi.doStopSync(edge.getTarget(), stopBody);
			if (response != null && response.isSuccessful()) {
				System.out.println("Edge 중지 성공: " + edge.getName());
			} else {
				System.err.println("Edge 중지 실패: " + edge.getName() + " - "
						+ (response != null ? response.message() : "Response is null"));
			}
		}

		// Robot 중지
		for (RobotInfo robot : config.robots) {
			List<ModuleInfo> modules = robot.getModules();
			if (modules.isEmpty())
				continue;

			StopBody stopBody = new StopBody();
			stopBody.append(robot.getName());

			System.out.println("Robot 중지: " + robot.getName() + " -> " + robot.getTarget());
			Response<AgentResult> response = DeployAgentApi.doStopSync(robot.getTarget(), stopBody);
			if (response != null && response.isSuccessful()) {
				System.out.println("Robot 중지 성공: " + robot.getName());
			} else {
				System.err.println("Robot 중지 실패: " + robot.getName() + " - "
						+ (response != null ? response.message() : "Response is null"));
			}
		}

		// Cloud 중지
		for (CloudInfo cloud : config.clouds) {
			List<ModuleInfo> modules = cloud.getModules();
			if (modules.isEmpty())
				continue;

			StopBody stopBody = new StopBody();
			stopBody.append(cloud.getName());

			System.out.println("Cloud 중지: " + cloud.getName() + " -> " + cloud.getTarget());
			Response<AgentResult> response = DeployAgentApi.doStopSync(cloud.getTarget(), stopBody);
			if (response != null && response.isSuccessful()) {
				System.out.println("Cloud 중지 성공: " + cloud.getName());
			} else {
				System.err.println("Cloud 중지 실패: " + cloud.getName() + " - "
						+ (response != null ? response.message() : "Response is null"));
			}
		}
	}

	/**
	 * 모듈 재시작 (Restart)
	 */
	public void doCRDARestart(Configuration config) {
		System.out.println("=== Restart 시작 ===");

		for (EdgeInfo edge : config.edges) {
			System.out.println("Edge 재시작: " + edge.getName() + " -> " + edge.getTarget());
			DeployAgentApi.doRestart(edge.getTarget());
		}

		for (RobotInfo robot : config.robots) {
			System.out.println("Robot 재시작: " + robot.getName() + " -> " + robot.getTarget());
			DeployAgentApi.doRestart(robot.getTarget());
		}

		for (CloudInfo cloud : config.clouds) {
			System.out.println("Cloud 재시작: " + cloud.getName() + " -> " + cloud.getTarget());
			DeployAgentApi.doRestart(cloud.getTarget());
		}
	}

	/**
	 * DeployBody에 모듈 정보 추가
	 */
	private void appendDeployBody(String clusterName, DeployBody deployBody, ModuleInfo moduleInfo) {
		String moduleName = moduleInfo.getName();
		String moduleRef = moduleInfo.getRef();

		if (moduleRef == null || moduleRef.isEmpty()) {
			System.err.println("Module reference is null for: " + moduleName);
			return;
		}

		try {
			// IM Registry에서 모듈 정보 가져오기
			var im = imRegistryApi.getIM(moduleRef);
			if (im == null) {
				System.err.println("Failed to get IM for module: " + moduleName);
				return;
			}

			// 기본 이미지명 설정 (실제로는 XML에서 파싱해야 함)
			String imageName = "default-image:latest";
			deployBody.append(clusterName, imageName, moduleName, "latest");

		} catch (Exception e) {
			System.err.println("Failed to process module: " + moduleName);
			System.err.println(e.getMessage());
		}
	}

	/**
	 * ModuleInfo에서 executableForm을 가져오는 메서드
	 */
	private ExecutableForm getExecutableForm(ModuleInfo moduleInfo) {
		try {
			// IM Registry에서 모듈 XML 가져오기
			String moduleName = moduleInfo.getName();
			System.out.println("ExecutableForm 가져오기 시도: " + moduleName);

			// IM Registry API 호출
			var im = imRegistryApi.getIM(moduleInfo.getRef());
			if (im == null) {
				System.err.println("IM is null for module: " + moduleName);
				return new ExecutableForm(); // 기본값
			}

			// IM을 XML 문자열로 변환
			String xmlContent = im.getXmlString();
			if (xmlContent == null || xmlContent.isEmpty()) {
				System.err.println("XML content is null or empty for module: " + moduleName);
				return new ExecutableForm(); // 기본값
			}

			// XML을 SoftwareModule 객체로 파싱
			SoftwareModule softwareModule = SoftwareModule.fromXml(xmlContent);
			if (softwareModule == null) {
				System.err.println("SoftwareModule 파싱 실패: " + moduleName);
				return new ExecutableForm();
			}

			// ExecutableForm 반환
			ExecutableForm executableForm = softwareModule.getExecutableForm();
			System.out.println("ExecutableForm 발견: " + (executableForm != null ? "있음" : "없음"));

			if (executableForm != null) {
				System.out.println("  - ExeForms 개수: "
						+ (executableForm.getExeForms() != null ? executableForm.getExeForms().size() : "null"));
				if (executableForm.getExeForms() != null && !executableForm.getExeForms().isEmpty()) {
					ExeForm firstExeForm = executableForm.getExeForms().get(0);
					System.out.println("  - 첫 번째 ExeForm:");
					System.out.println("    * ExeFileURL: " + firstExeForm.getExeFileURL());
					System.out.println("    * ShellCmd: " + firstExeForm.getShellCmd());
				}
			}

			return executableForm != null ? executableForm : new ExecutableForm();

		} catch (Exception e) {
			System.err.println("ExecutableForm 가져오기 실패: " + moduleInfo.getName() + " - " + e.getMessage());
			e.printStackTrace();
			return new ExecutableForm(); // 기본값
		}
	}
}