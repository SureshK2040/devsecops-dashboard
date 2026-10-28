
package com.devops.dashboard.service;

import com.devops.dashboard.entity.Workspace;
import com.devops.dashboard.repository.WorkspaceRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class WorkspaceService {

    private final WorkspaceRepository workspaceRepository;

    public WorkspaceService(WorkspaceRepository workspaceRepository) {
        this.workspaceRepository = workspaceRepository;
    }

    public Workspace createWorkspace(Workspace workspace) {
        if (workspaceRepository.existsByNameIgnoreCase(workspace.getName().trim())) {
            throw new IllegalArgumentException(
                    "A workspace with this name already exists"
            );
        }

        workspace.setName(workspace.getName().trim());
        return workspaceRepository.save(workspace);
    }

    public List<Workspace> getAllWorkspaces() {
        return workspaceRepository.findAll();
    }

    public Workspace getWorkspaceById(Long id) {
        return workspaceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException(
                        "Workspace not found with id: " + id
                ));
    }
}
