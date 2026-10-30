package com.devops.dashboard.workspace;

import com.devops.dashboard.user.UserDto;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

public class WorkspaceDtos {

    public record CreateWorkspaceRequest(
            @NotBlank(message = "Workspace / Project name is required")
            @Size(max = 100, message = "Name cannot exceed 100 characters")
            String name,

            @Size(max = 500, message = "Description cannot exceed 500 characters")
            String description,

            String repositoryUrl,
            String status
    ) {}

    public record UpdateWorkspaceRequest(
            @NotBlank(message = "Workspace / Project name is required")
            @Size(max = 100)
            String name,

            @Size(max = 500)
            String description,

            String repositoryUrl,
            String status
    ) {}

    public record WorkspaceResponse(
            Long id,
            String name,
            String description,
            String repositoryUrl,
            String status,
            UserDto owner,
            LocalDateTime createdAt,
            LocalDateTime updatedAt
    ) {
        public static WorkspaceResponse fromEntity(Workspace w) {
            if (w == null) return null;
            return new WorkspaceResponse(
                    w.getId(),
                    w.getName(),
                    w.getDescription(),
                    w.getRepositoryUrl(),
                    w.getStatus(),
                    w.getOwner() != null ? UserDto.fromEntity(w.getOwner()) : null,
                    w.getCreatedAt(),
                    w.getUpdatedAt()
            );
        }
    }
}

