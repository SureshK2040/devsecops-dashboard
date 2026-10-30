package com.devops.dashboard.deployment;

import com.devops.dashboard.workspace.Workspace;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "deployments")
public class Deployment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "workspace_id")
    private Workspace workspace;

    @Column(nullable = false, length = 30)
    private String environment; // DEV, STAGING, PRODUCTION

    @Column(nullable = false, length = 50)
    private String version;

    @Column(name = "commit_hash", length = 40)
    private String commitHash;

    @Column(nullable = false, length = 30)
    private String status = "PENDING"; // PENDING, DEPLOYING, SUCCESS, FAILED, ROLLED_BACK

    @Column(name = "deployed_by", nullable = false, length = 50)
    private String deployedBy;

    @Column(name = "started_at", nullable = false)
    private LocalDateTime startedAt = LocalDateTime.now();

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    public Deployment() {}

    public Deployment(Workspace workspace, String environment, String version, String commitHash, String status, String deployedBy) {
        this.workspace = workspace;
        this.environment = environment;
        this.version = version;
        this.commitHash = commitHash;
        this.status = status != null ? status : "PENDING";
        this.deployedBy = deployedBy;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Workspace getWorkspace() { return workspace; }
    public void setWorkspace(Workspace workspace) { this.workspace = workspace; }
    public String getEnvironment() { return environment; }
    public void setEnvironment(String environment) { this.environment = environment; }
    public String getVersion() { return version; }
    public void setVersion(String version) { this.version = version; }
    public String getCommitHash() { return commitHash; }
    public void setCommitHash(String commitHash) { this.commitHash = commitHash; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getDeployedBy() { return deployedBy; }
    public void setDeployedBy(String deployedBy) { this.deployedBy = deployedBy; }
    public LocalDateTime getStartedAt() { return startedAt; }
    public void setStartedAt(LocalDateTime startedAt) { this.startedAt = startedAt; }
    public LocalDateTime getCompletedAt() { return completedAt; }
    public void setCompletedAt(LocalDateTime completedAt) { this.completedAt = completedAt; }
}

