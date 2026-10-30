package com.devops.dashboard.pipeline;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "pipeline_stages")
public class PipelineStage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pipeline_id", nullable = false)
    @JsonBackReference
    private Pipeline pipeline;

    @Column(name = "stage_name", nullable = false, length = 50)
    private String stageName;

    @Column(name = "stage_order", nullable = false)
    private int stageOrder;

    @Column(nullable = false, length = 30)
    private String status = "PENDING";

    @Column(name = "started_at")
    private LocalDateTime startedAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @Column(name = "duration_seconds")
    private Long durationSeconds = 0L;

    @Column(columnDefinition = "TEXT")
    private String logs;

    public PipelineStage() {}

    public PipelineStage(String stageName, int stageOrder, String status, String logs) {
        this.stageName = stageName;
        this.stageOrder = stageOrder;
        this.status = status != null ? status : "PENDING";
        this.logs = logs;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Pipeline getPipeline() { return pipeline; }
    public void setPipeline(Pipeline pipeline) { this.pipeline = pipeline; }
    public String getStageName() { return stageName; }
    public void setStageName(String stageName) { this.stageName = stageName; }
    public int getStageOrder() { return stageOrder; }
    public void setStageOrder(int stageOrder) { this.stageOrder = stageOrder; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public LocalDateTime getStartedAt() { return startedAt; }
    public void setStartedAt(LocalDateTime startedAt) { this.startedAt = startedAt; }
    public LocalDateTime getCompletedAt() { return completedAt; }
    public void setCompletedAt(LocalDateTime completedAt) { this.completedAt = completedAt; }
    public Long getDurationSeconds() { return durationSeconds; }
    public void setDurationSeconds(Long durationSeconds) { this.durationSeconds = durationSeconds; }
    public String getLogs() { return logs; }
    public void setLogs(String logs) { this.logs = logs; }
}

