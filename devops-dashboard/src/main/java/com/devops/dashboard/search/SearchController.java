package com.devops.dashboard.search;

import com.devops.dashboard.pipeline.PipelineDtos;
import com.devops.dashboard.pipeline.PipelineRepository;
import com.devops.dashboard.task.TaskDtos;
import com.devops.dashboard.task.TaskRepository;
import com.devops.dashboard.user.UserDto;
import com.devops.dashboard.user.UserRepository;
import com.devops.dashboard.workspace.WorkspaceDtos;
import com.devops.dashboard.workspace.WorkspaceRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/search")
@Tag(name = "Global Search", description = "Omni-search across projects, tasks, pipelines, and team members")
@SecurityRequirement(name = "bearerAuth")
public class SearchController {

    private final WorkspaceRepository workspaceRepository;
    private final TaskRepository taskRepository;
    private final PipelineRepository pipelineRepository;
    private final UserRepository userRepository;

    public SearchController(
            WorkspaceRepository workspaceRepository,
            TaskRepository taskRepository,
            PipelineRepository pipelineRepository,
            UserRepository userRepository
    ) {
        this.workspaceRepository = workspaceRepository;
        this.taskRepository = taskRepository;
        this.pipelineRepository = pipelineRepository;
        this.userRepository = userRepository;
    }

    public record SearchResult(
            String query,
            List<WorkspaceDtos.WorkspaceResponse> projects,
            List<TaskDtos.TaskResponse> tasks,
            List<PipelineDtos.PipelineResponse> pipelines,
            List<UserDto> users
    ) {}

    @GetMapping
    @Operation(summary = "Global search across the platform")
    public ResponseEntity<SearchResult> search(@RequestParam("q") String query) {
        if (query == null || query.trim().length() < 2) {
            return ResponseEntity.ok(new SearchResult(query, List.of(), List.of(), List.of(), List.of()));
        }

        String q = query.trim().toLowerCase();

        var matchedProjects = workspaceRepository.findAll().stream()
                .filter(w -> w.getName().toLowerCase().contains(q) || (w.getDescription() != null && w.getDescription().toLowerCase().contains(q)))
                .map(WorkspaceDtos.WorkspaceResponse::fromEntity)
                .toList();

        var matchedTasks = taskRepository.findAll().stream()
                .filter(t -> t.getTitle().toLowerCase().contains(q) || (t.getDescription() != null && t.getDescription().toLowerCase().contains(q)))
                .map(TaskDtos.TaskResponse::fromEntity)
                .toList();

        var matchedPipelines = pipelineRepository.findAll().stream()
                .filter(p -> p.getPipelineName().toLowerCase().contains(q) || p.getBranch().toLowerCase().contains(q))
                .map(PipelineDtos.PipelineResponse::fromEntity)
                .toList();

        var matchedUsers = userRepository.findAll().stream()
                .filter(u -> u.getUsername().toLowerCase().contains(q) || u.getEmail().toLowerCase().contains(q) ||
                        (u.getFirstName() != null && u.getFirstName().toLowerCase().contains(q)))
                .map(UserDto::fromEntity)
                .toList();

        return ResponseEntity.ok(new SearchResult(query, matchedProjects, matchedTasks, matchedPipelines, matchedUsers));
    }
}

