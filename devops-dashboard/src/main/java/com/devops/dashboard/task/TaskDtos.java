package com.devops.dashboard.task;

import com.devops.dashboard.user.UserDto;
import com.devops.dashboard.workspace.WorkspaceDtos;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class TaskDtos {

    public record CreateTaskRequest(
            @NotBlank(message = "Task title is required")
            @Size(max = 150, message = "Title cannot exceed 150 characters")
            String title,

            @Size(max = 1000, message = "Description cannot exceed 1000 characters")
            String description,

            String status,
            String priority,
            Long workspaceId,
            Long assignedUserId,
            LocalDate startDate,
            LocalDate dueDate,

            @Min(value = 0, message = "Story points cannot be negative")
            @Max(value = 100, message = "Story points cannot exceed 100")
            Integer storyPoints,

            String taskType
    ) {}

    public record UpdateTaskRequest(
            @NotBlank(message = "Task title is required")
            @Size(max = 150)
            String title,

            @Size(max = 1000)
            String description,

            String status,
            String priority,
            Long workspaceId,
            Long assignedUserId,
            LocalDate startDate,
            LocalDate dueDate,
            Integer storyPoints,
            String taskType
    ) {}

    public record AssignTaskRequest(Long assignedUserId) {}

    public record UpdateStatusRequest(
            @NotBlank(message = "Status is required")
            String status
    ) {}

    public record TaskResponse(
            Long id,
            String title,
            String description,
            String status,
            String priority,
            WorkspaceDtos.WorkspaceResponse workspace,
            UserDto assignedUser,
            UserDto createdBy,
            LocalDate startDate,
            LocalDate dueDate,
            Integer storyPoints,
            String taskType,
            LocalDateTime createdAt,
            LocalDateTime updatedAt,
            LocalDateTime completedAt
    ) {
        public static TaskResponse fromEntity(Task t) {
            if (t == null) return null;
            return new TaskResponse(
                    t.getId(),
                    t.getTitle(),
                    t.getDescription(),
                    t.getStatus(),
                    t.getPriority(),
                    WorkspaceDtos.WorkspaceResponse.fromEntity(t.getWorkspace()),
                    UserDto.fromEntity(t.getAssignedUser()),
                    UserDto.fromEntity(t.getCreatedBy()),
                    t.getStartDate(),
                    t.getDueDate(),
                    t.getStoryPoints(),
                    t.getTaskType(),
                    t.getCreatedAt(),
                    t.getUpdatedAt(),
                    t.getCompletedAt()
            );
        }
    }
}

