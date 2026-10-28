
package com.devops.dashboard.controller;

import com.devops.dashboard.entity.Workspace;
import com.devops.dashboard.service.WorkspaceService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/workspaces")
public class WorkspaceController {

    private final WorkspaceService workspaceService;

    public WorkspaceController(WorkspaceService workspaceService) {
        this.workspaceService = workspaceService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Workspace createWorkspace(
            @Valid @RequestBody Workspace workspace) {
        return workspaceService.createWorkspace(workspace);
    }

    @GetMapping
    public List<Workspace> getAllWorkspaces() {
        return workspaceService.getAllWorkspaces();
    }

    @GetMapping("/{id}")
    public Workspace getWorkspaceById(@PathVariable Long id) {
        return workspaceService.getWorkspaceById(id);
    }
}
