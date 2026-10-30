package com.devops.dashboard.pipeline;

import com.devops.dashboard.workspace.WorkspaceDtos;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;
import java.util.List;

public class PipelineDtos {

    public record TriggerPipelineRequest(
            @NotNull(message = "Workspace ID is required")
            Long workspaceId,

            @NotBlank(message = "Pipeline name is required")
            String pipelineName,

            String branch,
            String commitHash,
            String commitMessage
    ) {}

    public record PipelineStageDto(
            Long id,
            String stageName,
            int stageOrder,
            String status,
            LocalDateTime startedAt,
            LocalDateTime completedAt,
            Long durationSeconds,
            String logs
    ) {
        public static PipelineStageDto fromEntity(PipelineStage s) {
            if (s == null) return null;
            return new PipelineStageDto(
                    s.getId(),
                    s.getStageName(),
                    s.getStageOrder(),
                    s.getStatus(),
                    s.getStartedAt(),
                    s.getCompletedAt(),
                    s.getDurationSeconds(),
                    s.getLogs()
            );
        }
    }

    public record PipelineResponse(
            Long id,
            WorkspaceDtos.WorkspaceResponse workspace,
            String pipelineName,
            String branch,
            String commitHash,
            String commitMessage,
            String status,
            LocalDateTime startedAt,
            LocalDateTime completedAt,
            Long durationSeconds,
            String triggeredBy,
            LocalDateTime createdAt,
            List<PipelineStageDto> stages
    ) {
        public static PipelineResponse fromEntity(Pipeline p) {
            if (p == null) return null;
            return new PipelineResponse(
                    p.getId(),
                    WorkspaceDtos.WorkspaceResponse.fromEntity(p.getWorkspace()),
                    p.getPipelineName(),
                    p.getBranch(),
                    p.getCommitHash(),
                    p.getCommitMessage(),
                    p.getStatus(),
                    p.getStartedAt(),
                    p.getCompletedAt(),
                    p.getDurationSeconds(),
                    p.getTriggeredBy(),
                    p.getCreatedAt(),
                    p.getStages() != null ? p.getStages().stream().map(PipelineStageDto::fromEntity).toList() : List.of()
            );
        }
    }
}

