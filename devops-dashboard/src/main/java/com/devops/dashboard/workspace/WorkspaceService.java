package com.devops.dashboard.workspace;

import com.devops.dashboard.audit.AuditService;
import com.devops.dashboard.common.PageResponse;
import com.devops.dashboard.common.ResourceNotFoundException;
import com.devops.dashboard.user.User;
import com.devops.dashboard.user.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class WorkspaceService {

    private final WorkspaceRepository workspaceRepository;
    private final UserRepository userRepository;
    private final AuditService auditService;

    public WorkspaceService(WorkspaceRepository workspaceRepository, UserRepository userRepository, AuditService auditService) {
        this.workspaceRepository = workspaceRepository;
        this.userRepository = userRepository;
        this.auditService = auditService;
    }

    public WorkspaceDtos.WorkspaceResponse createWorkspace(WorkspaceDtos.CreateWorkspaceRequest request) {
        User currentUser = getCurrentUser();
        Workspace workspace = new Workspace(
                request.name(),
                request.description(),
                request.repositoryUrl(),
                request.status() != null ? request.status() : "ACTIVE",
                currentUser
        );
        Workspace saved = workspaceRepository.save(workspace);
        auditService.log("PROJECT_CREATED", "Workspace", String.valueOf(saved.getId()), "Created project: " + saved.getName(), null);
        return WorkspaceDtos.WorkspaceResponse.fromEntity(saved);
    }

    @Transactional(readOnly = true)
    public List<WorkspaceDtos.WorkspaceResponse> getAllWorkspaces() {
        return workspaceRepository.findAll().stream()
                .map(WorkspaceDtos.WorkspaceResponse::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public PageResponse<WorkspaceDtos.WorkspaceResponse> getWorkspacesPaginated(Pageable pageable) {
        Page<WorkspaceDtos.WorkspaceResponse> page = workspaceRepository.findAll(pageable)
                .map(WorkspaceDtos.WorkspaceResponse::fromEntity);
        return PageResponse.from(page);
    }

    @Transactional(readOnly = true)
    public WorkspaceDtos.WorkspaceResponse getWorkspaceById(Long id) {
        Workspace workspace = workspaceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Workspace", "id", id));
        return WorkspaceDtos.WorkspaceResponse.fromEntity(workspace);
    }

    public WorkspaceDtos.WorkspaceResponse updateWorkspace(Long id, WorkspaceDtos.UpdateWorkspaceRequest request) {
        Workspace workspace = workspaceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Workspace", "id", id));

        workspace.setName(request.name());
        workspace.setDescription(request.description());
        if (request.repositoryUrl() != null) workspace.setRepositoryUrl(request.repositoryUrl());
        if (request.status() != null) workspace.setStatus(request.status());

        Workspace updated = workspaceRepository.save(workspace);
        auditService.log("PROJECT_UPDATED", "Workspace", String.valueOf(updated.getId()), "Updated project: " + updated.getName(), null);
        return WorkspaceDtos.WorkspaceResponse.fromEntity(updated);
    }

    public void deleteWorkspace(Long id) {
        Workspace workspace = workspaceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Workspace", "id", id));
        workspaceRepository.delete(workspace);
        auditService.log("PROJECT_DELETED", "Workspace", String.valueOf(id), "Deleted project id: " + id, null);
    }

    private User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && !auth.getPrincipal().equals("anonymousUser")) {
            return userRepository.findByUsername(auth.getName()).orElse(null);
        }
        return null;
    }
}

