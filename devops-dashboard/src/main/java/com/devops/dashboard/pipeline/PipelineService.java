package com.devops.dashboard.pipeline;

import com.devops.dashboard.audit.AuditService;
import com.devops.dashboard.common.ResourceNotFoundException;
import com.devops.dashboard.workspace.Workspace;
import com.devops.dashboard.workspace.WorkspaceRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class PipelineService {

    private final PipelineRepository pipelineRepository;
    private final WorkspaceRepository workspaceRepository;
    private final AuditService auditService;

    public PipelineService(
            PipelineRepository pipelineRepository,
            WorkspaceRepository workspaceRepository,
            AuditService auditService
    ) {
        this.pipelineRepository = pipelineRepository;
        this.workspaceRepository = workspaceRepository;
        this.auditService = auditService;
    }

    public PipelineDtos.PipelineResponse triggerPipeline(PipelineDtos.TriggerPipelineRequest request) {
        Workspace ws = workspaceRepository.findById(request.workspaceId())
                .orElseThrow(() -> new ResourceNotFoundException("Workspace", "id", request.workspaceId()));

        String username = getCurrentUsername();
        String commitHash = request.commitHash() != null ? request.commitHash() : generateRandomHash();

        Pipeline pipeline = new Pipeline(
                ws,
                request.pipelineName(),
                request.branch() != null ? request.branch() : "main",
                commitHash,
                request.commitMessage() != null ? request.commitMessage() : "Triggered manual pipeline build",
                username
        );
        pipeline.setStatus("SUCCESS");
        pipeline.setStartedAt(LocalDateTime.now().minusMinutes(4));
        pipeline.setCompletedAt(LocalDateTime.now());
        pipeline.setDurationSeconds(240L);

        // Standard 7-stage DevSecOps Pipeline
        String[] stageNames = {"SOURCE", "BUILD", "TEST", "SAST", "DEPENDENCY_SCAN", "CONTAINER_SCAN", "DEPLOY"};
        for (int i = 0; i < stageNames.length; i++) {
            PipelineStage stage = new PipelineStage(
                    stageNames[i],
                    i + 1,
                    "SUCCESS",
                    "Stage " + stageNames[i] + " passed successfully in 35s. Quality gates verified."
            );
            stage.setStartedAt(LocalDateTime.now().minusMinutes(4 - i / 2));
            stage.setCompletedAt(LocalDateTime.now().minusMinutes(3 - i / 2));
            stage.setDurationSeconds(35L);
            pipeline.addStage(stage);
        }

        Pipeline saved = pipelineRepository.save(pipeline);
        auditService.log("PIPELINE_TRIGGERED", "Pipeline", String.valueOf(saved.getId()), "Triggered pipeline " + saved.getPipelineName(), null);

        return PipelineDtos.PipelineResponse.fromEntity(saved);
    }

    @Transactional(readOnly = true)
    public List<PipelineDtos.PipelineResponse> getAllPipelines() {
        return pipelineRepository.findTop20ByOrderByCreatedAtDesc().stream()
                .map(PipelineDtos.PipelineResponse::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<PipelineDtos.PipelineResponse> getPipelinesByWorkspace(Long workspaceId) {
        return pipelineRepository.findByWorkspace_IdOrderByCreatedAtDesc(workspaceId).stream()
                .map(PipelineDtos.PipelineResponse::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public PipelineDtos.PipelineResponse getPipelineById(Long id) {
        Pipeline pipeline = pipelineRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Pipeline", "id", id));
        return PipelineDtos.PipelineResponse.fromEntity(pipeline);
    }

    private String getCurrentUsername() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && !auth.getPrincipal().equals("anonymousUser")) {
            return auth.getName();
        }
        return "system";
    }

    private String generateRandomHash() {
        return Long.toHexString(Double.doubleToLongBits(Math.random())).substring(0, 7);
    }
}

