package com.java.kr.ac.kangwon.rodos.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.java.kr.ac.kangwon.rodos.service.rest.agent.DockerAgentService;
import com.java.kr.ac.kangwon.rodos.model.DockerAgent;

@RestController
@RequestMapping("/api/agent")
@CrossOrigin(origins = "http://localhost:3000")
public class AgentRegistryController {

    @Autowired
    private DockerAgentService dockerAgentService;

    /**
     * DockerAgent 목록 가져오기
     */
    @GetMapping("/docker-agents")
    public ResponseEntity<List<DockerAgent>> getDockerAgents() {
        try {
            List<DockerAgent> agents = dockerAgentService.getDockerAgentList();
            return ResponseEntity.ok(agents);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
}
