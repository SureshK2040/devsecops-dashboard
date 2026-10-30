package com.devops.dashboard.pipeline;

import com.devops.dashboard.workspace.Workspace;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "pipelines")
public class Pipeline {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "workspace_id")
    private Workspace workspace;

    @Column(name = "pipeline_name", nullable = false, length = 100)
    private String pipelineName;

    @Column(nullable = false, length = 100)
    private String branch = "main";

    @Column(name = "commit_hash", length = 40)
    private String commitHash;

    @Column(name = "commit_message", length = 255)
    private String commitMessage;

    @Column(nullable = false, length = 30)
    private String status = "QUEUED";

    @Column(name = "started_at")
    private LocalDateTime startedAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @Column(name = "duration_seconds")
    private Long durationSeconds = 0L;

    @Column(name = "triggered_by", nullable = false, length = 50)
    private String triggeredBy = "system";

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @OneToMany(mappedBy = "pipeline", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @OrderBy("stageOrder ASC")
    @JsonManagedReference
    private List<PipelineStage> stages = new ArrayList<>();

    public Pipeline() {}

    public Pipeline(Workspace workspace, String pipelineName, String branch, String commitHash, String commitMessage, String triggeredBy) {
        this.workspace = workspace;
        this.pipelineName = pipelineName;
        this.branch = branch != null ? branch : "main";
        this.commitHash = commitHash;
        this.commitMessage = commitMessage;
        this.triggeredBy = triggeredBy != null ? triggeredBy : "system";
        this.status = "QUEUED";
    }

    public void addStage(PipelineStage stage) {
        stages.add(stage);
        stage.setPipeline(this);
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Workspace getWorkspace() { return workspace; }
    public void setWorkspace(Workspace workspace) { this.workspace = workspace; }
    public String getPipelineName() { return pipelineName; }
    public void setPipelineName(String pipelineName) { this.pipelineName = pipelineName; }
    public String getBranch() { return branch; }
    public void setBranch(String branch) { this.branch = branch; }
    public String getCommitHash() { return commitHash; }
    public void setCommitHash(String commitHash) { this.commitHash = commitHash; }
    public String getCommitMessage() { return commitMessage; }
    public void setCommitMessage(String commitMessage) { this.commitMessage = commitMessage; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public LocalDateTime getStartedAt() { return startedAt; }
    public void setStartedAt(LocalDateTime startedAt) { this.startedAt = startedAt; }
    public LocalDateTime getCompletedAt() { return completedAt; }
    public void setCompletedAt(LocalDateTime completedAt) { this.completedAt = completedAt; }
    public Long getDurationSeconds() { return durationSeconds; }
    public void setDurationSeconds(Long durationSeconds) { this.durationSeconds = durationSeconds; }
    public String getTriggeredBy() { return triggeredBy; }
    public void setTriggeredBy(String triggeredBy) { this.triggeredBy = triggeredBy; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public List<PipelineStage> getStages() { return stages; }
    public void setStages(List<PipelineStage> stages) { this.stages = stages; }
}

