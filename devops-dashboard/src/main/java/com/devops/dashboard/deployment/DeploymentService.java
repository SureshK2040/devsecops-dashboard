package com.devops.dashboard.deployment;

import com.devops.dashboard.audit.AuditService;
import com.devops.dashboard.common.ResourceNotFoundException;
import com.devops.dashboard.workspace.Workspace;
import com.devops.dashboard.workspace.WorkspaceDtos;
import com.devops.dashboard.workspace.WorkspaceRepository;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class DeploymentService {

    private final DeploymentRepository deploymentRepository;
    private final WorkspaceRepository workspaceRepository;
    private final AuditService auditService;

    public DeploymentService(
            DeploymentRepository deploymentRepository,
            WorkspaceRepository workspaceRepository,
            AuditService auditService
    ) {
        this.deploymentRepository = deploymentRepository;
        this.workspaceRepository = workspaceRepository;
        this.auditService = auditService;
    }

    public record DeployRequest(
            @NotNull(message = "Workspace ID is required")
            Long workspaceId,

            @NotBlank(message = "Environment is required (DEV, STAGING, PRODUCTION)")
            String environment,

            @NotBlank(message = "Version is required")
            String version,

            String commitHash
    ) {}

    public record DeploymentResponse(
            Long id,
            WorkspaceDtos.WorkspaceResponse workspace,
            String environment,
            String version,
            String commitHash,
            String status,
            String deployedBy,
            LocalDateTime startedAt,
            LocalDateTime completedAt
    ) {
        public static DeploymentResponse fromEntity(Deployment d) {
            if (d == null) return null;
            return new DeploymentResponse(
                    d.getId(),
                    WorkspaceDtos.WorkspaceResponse.fromEntity(d.getWorkspace()),
                    d.getEnvironment(),
                    d.getVersion(),
                    d.getCommitHash(),
                    d.getStatus(),
                    d.getDeployedBy(),
                    d.getStartedAt(),
                    d.getCompletedAt()
            );
        }
    }

    public DeploymentResponse deploy(DeployRequest request) {
        Workspace ws = workspaceRepository.findById(request.workspaceId())
                .orElseThrow(() -> new ResourceNotFoundException("Workspace", "id", request.workspaceId()));

        String username = getCurrentUsername();
        Deployment deployment = new Deployment(
                ws,
                request.environment().toUpperCase(),
                request.version(),
                request.commitHash() != null ? request.commitHash() : "e4a781b",
                "SUCCESS",
                username
        );
        deployment.setCompletedAt(LocalDateTime.now());

        Deployment saved = deploymentRepository.save(deployment);
        auditService.log("DEPLOYMENT_COMPLETED", "Deployment", String.valueOf(saved.getId()),
                "Deployed version " + saved.getVersion() + " to " + saved.getEnvironment(), null);

        return DeploymentResponse.fromEntity(saved);
    }

    @Transactional(readOnly = true)
    public List<DeploymentResponse> getAllDeployments() {
        return deploymentRepository.findTop20ByOrderByStartedAtDesc().stream()
                .map(DeploymentResponse::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<DeploymentResponse> getDeploymentsByWorkspace(Long workspaceId) {
        return deploymentRepository.findByWorkspace_IdOrderByStartedAtDesc(workspaceId).stream()
                .map(DeploymentResponse::fromEntity)
                .toList();
    }

    private String getCurrentUsername() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && !auth.getPrincipal().equals("anonymousUser")) {
            return auth.getName();
        }
        return "system";
    }
}

