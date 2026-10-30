package com.devops.dashboard.task;

import com.devops.dashboard.common.PageResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tasks")
@Tag(name = "Task Management", description = "Endpoints for Kanban, tasks, filtering, assignment, and status updates")
@SecurityRequirement(name = "bearerAuth")
public class TaskController {

    private final TaskService taskService;

    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create a new task")
    public ResponseEntity<TaskDtos.TaskResponse> createTask(@Valid @RequestBody TaskDtos.CreateTaskRequest request) {
        return new ResponseEntity<>(taskService.createTask(request), HttpStatus.CREATED);
    }

    @GetMapping
    @Operation(summary = "Get tasks with comprehensive filtering and pagination")
    public ResponseEntity<?> getTasks(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String priority,
            @RequestParam(required = false) Long workspaceId,
            @RequestParam(required = false) Long assignedUserId,
            @RequestParam(required = false) String search,
            @RequestParam(required = false, defaultValue = "false") boolean all,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        if (all) {
            return ResponseEntity.ok(taskService.getAllTasks());
        }
        return ResponseEntity.ok(taskService.getTasksFiltered(status, priority, workspaceId, assignedUserId, search, pageable));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get task by ID")
    public ResponseEntity<TaskDtos.TaskResponse> getTaskById(@PathVariable Long id) {
        return ResponseEntity.ok(taskService.getTaskById(id));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update task details")
    public ResponseEntity<TaskDtos.TaskResponse> updateTask(
            @PathVariable Long id,
            @Valid @RequestBody TaskDtos.UpdateTaskRequest request) {
        return ResponseEntity.ok(taskService.updateTask(id, request));
    }

    @PatchMapping("/{id}/assign")
    @Operation(summary = "Assign or reassign task to a user")
    public ResponseEntity<TaskDtos.TaskResponse> assignTask(
            @PathVariable Long id,
            @RequestBody TaskDtos.AssignTaskRequest request) {
        return ResponseEntity.ok(taskService.assignTask(id, request.assignedUserId()));
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Change task lifecycle status")
    public ResponseEntity<TaskDtos.TaskResponse> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody TaskDtos.UpdateStatusRequest request) {
        return ResponseEntity.ok(taskService.updateStatus(id, request.status()));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Delete task")
    public void deleteTask(@PathVariable Long id) {
        taskService.deleteTask(id);
    }

    @GetMapping("/workspace/{workspaceId}")
    @Operation(summary = "Get all tasks in a specific workspace")
    public ResponseEntity<List<TaskDtos.TaskResponse>> getTasksByWorkspace(@PathVariable Long workspaceId) {
        return ResponseEntity.ok(taskService.getTasksByWorkspace(workspaceId));
    }
}

