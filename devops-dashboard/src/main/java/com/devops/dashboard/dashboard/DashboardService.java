package com.devops.dashboard.dashboard;

import com.devops.dashboard.audit.AuditLog;
import com.devops.dashboard.audit.AuditService;
import com.devops.dashboard.deployment.Deployment;
import com.devops.dashboard.deployment.DeploymentRepository;
import com.devops.dashboard.pipeline.Pipeline;
import com.devops.dashboard.pipeline.PipelineRepository;
import com.devops.dashboard.securityscan.SecurityScanService;
import com.devops.dashboard.task.Task;
import com.devops.dashboard.task.TaskRepository;
import com.devops.dashboard.workspace.WorkspaceRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@Transactional(readOnly = true)
public class DashboardService {

    private final WorkspaceRepository workspaceRepository;
    private final TaskRepository taskRepository;
    private final PipelineRepository pipelineRepository;
    private final DeploymentRepository deploymentRepository;
    private final SecurityScanService securityScanService;
    private final AuditService auditService;

    public DashboardService(
            WorkspaceRepository workspaceRepository,
            TaskRepository taskRepository,
            PipelineRepository pipelineRepository,
            DeploymentRepository deploymentRepository,
            SecurityScanService securityScanService,
            AuditService auditService
    ) {
        this.workspaceRepository = workspaceRepository;
        this.taskRepository = taskRepository;
        this.pipelineRepository = pipelineRepository;
        this.deploymentRepository = deploymentRepository;
        this.securityScanService = securityScanService;
        this.auditService = auditService;
    }

    public record DashboardSummary(
            long totalProjects,
            long activeProjects,
            long totalTasks,
            long completedTasks,
            long pendingTasks,
            long failedPipelines,
            long totalPipelines,
            long successfulDeployments,
            long securityIssues,
            long criticalIssues,
            int securityScore
    ) {}

    public DashboardSummary getSummary() {
        long totalProjects = workspaceRepository.count();
        long activeProjects = workspaceRepository.findByStatus("ACTIVE").size();

        long totalTasks = taskRepository.count();
        long completedTasks = taskRepository.countByStatus("DONE");
        long pendingTasks = totalTasks - completedTasks;

        long totalPipelines = pipelineRepository.count();
        long failedPipelines = pipelineRepository.countByStatus("FAILED");

        long successfulDeployments = deploymentRepository.countByStatus("SUCCESS");

        var secSummary = securityScanService.getSecuritySummary();

        return new DashboardSummary(
                totalProjects,
                activeProjects,
                totalTasks,
                completedTasks,
                pendingTasks,
                failedPipelines,
                totalPipelines,
                successfulDeployments,
                secSummary.totalVulnerabilities(),
                secSummary.criticalVulnerabilities(),
                secSummary.overallScore()
        );
    }

    public Map<String, Long> getTaskMetrics() {
        Map<String, Long> metrics = new HashMap<>();
        metrics.put("TODO", taskRepository.countByStatus("TODO"));
        metrics.put("IN_PROGRESS", taskRepository.countByStatus("IN_PROGRESS"));
        metrics.put("IN_REVIEW", taskRepository.countByStatus("IN_REVIEW"));
        metrics.put("BLOCKED", taskRepository.countByStatus("BLOCKED"));
        metrics.put("DONE", taskRepository.countByStatus("DONE"));
        return metrics;
    }

    public List<AuditLog> getRecentActivity() {
        return auditService.getRecentLogs();
    }
}

