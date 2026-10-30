package com.devops.dashboard.workspace;

import com.devops.dashboard.common.PageResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/workspaces")
@Tag(name = "Workspaces & Projects", description = "Endpoints for managing workspaces, projects, and repositories")
@SecurityRequirement(name = "bearerAuth")
public class WorkspaceController {

    private final WorkspaceService workspaceService;

    public WorkspaceController(WorkspaceService workspaceService) {
        this.workspaceService = workspaceService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "Create a new project/workspace (Admin/Manager)")
    public ResponseEntity<WorkspaceDtos.WorkspaceResponse> createWorkspace(
            @Valid @RequestBody WorkspaceDtos.CreateWorkspaceRequest request) {
        return new ResponseEntity<>(workspaceService.createWorkspace(request), HttpStatus.CREATED);
    }

    @GetMapping
    @Operation(summary = "Get all workspaces (list or paginated)")
    public ResponseEntity<?> getAllWorkspaces(
            @RequestParam(required = false, defaultValue = "false") boolean paginated,
            @PageableDefault(size = 20) Pageable pageable) {
        if (paginated) {
            return ResponseEntity.ok(workspaceService.getWorkspacesPaginated(pageable));
        }
        return ResponseEntity.ok(workspaceService.getAllWorkspaces());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get workspace/project by ID")
    public ResponseEntity<WorkspaceDtos.WorkspaceResponse> getWorkspaceById(@PathVariable Long id) {
        return ResponseEntity.ok(workspaceService.getWorkspaceById(id));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "Update workspace/project details (Admin/Manager)")
    public ResponseEntity<WorkspaceDtos.WorkspaceResponse> updateWorkspace(
            @PathVariable Long id,
            @Valid @RequestBody WorkspaceDtos.UpdateWorkspaceRequest request) {
        return ResponseEntity.ok(workspaceService.updateWorkspace(id, request));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete workspace/project (Admin only)")
    public void deleteWorkspace(@PathVariable Long id) {
        workspaceService.deleteWorkspace(id);
    }
}

