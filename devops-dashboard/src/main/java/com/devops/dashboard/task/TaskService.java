package com.devops.dashboard.task;

import com.devops.dashboard.audit.AuditService;
import com.devops.dashboard.common.PageResponse;
import com.devops.dashboard.common.ResourceNotFoundException;
import com.devops.dashboard.notification.NotificationService;
import com.devops.dashboard.user.User;
import com.devops.dashboard.user.UserRepository;
import com.devops.dashboard.workspace.Workspace;
import com.devops.dashboard.workspace.WorkspaceRepository;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
@Transactional
public class TaskService {

    private final TaskRepository taskRepository;
    private final WorkspaceRepository workspaceRepository;
    private final UserRepository userRepository;
    private final AuditService auditService;
    private final NotificationService notificationService;

    public TaskService(
            TaskRepository taskRepository,
            WorkspaceRepository workspaceRepository,
            UserRepository userRepository,
            AuditService auditService,
            NotificationService notificationService
    ) {
        this.taskRepository = taskRepository;
        this.workspaceRepository = workspaceRepository;
        this.userRepository = userRepository;
        this.auditService = auditService;
        this.notificationService = notificationService;
    }

    public TaskDtos.TaskResponse createTask(TaskDtos.CreateTaskRequest request) {
        Task task = new Task();
        task.setTitle(request.title());
        task.setDescription(request.description());
        task.setStatus(request.status() != null ? request.status() : "TODO");
        task.setPriority(request.priority() != null ? request.priority() : "MEDIUM");
        task.setStartDate(request.startDate());
        task.setDueDate(request.dueDate());
        task.setStoryPoints(request.storyPoints() != null ? request.storyPoints() : 0);
        task.setTaskType(request.taskType() != null ? request.taskType() : "TASK");

        if (request.workspaceId() != null) {
            Workspace ws = workspaceRepository.findById(request.workspaceId())
                    .orElseThrow(() -> new ResourceNotFoundException("Workspace", "id", request.workspaceId()));
            task.setWorkspace(ws);
        }

        if (request.assignedUserId() != null) {
            User user = userRepository.findById(request.assignedUserId())
                    .orElseThrow(() -> new ResourceNotFoundException("User", "id", request.assignedUserId()));
            task.setAssignedUser(user);
        }

        User currentUser = getCurrentUser();
        task.setCreatedBy(currentUser);

        Task saved = taskRepository.save(task);

        auditService.log("TASK_CREATED", "Task", String.valueOf(saved.getId()), "Created task: " + saved.getTitle(), null);

        if (saved.getAssignedUser() != null) {
            notificationService.createNotification(
                    saved.getAssignedUser(),
                    "TASK_ASSIGNED",
                    "New Task Assigned",
                    "You were assigned to: " + saved.getTitle(),
                    "/tasks"
            );
        }

        return TaskDtos.TaskResponse.fromEntity(saved);
    }

    @Transactional(readOnly = true)
    public List<TaskDtos.TaskResponse> getAllTasks() {
        return taskRepository.findAll().stream().map(TaskDtos.TaskResponse::fromEntity).toList();
    }

    @Transactional(readOnly = true)
    public PageResponse<TaskDtos.TaskResponse> getTasksFiltered(
            String status,
            String priority,
            Long workspaceId,
            Long assignedUserId,
            String search,
            Pageable pageable
    ) {
        Specification<Task> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (status != null && !status.isBlank()) {
                predicates.add(cb.equal(cb.upper(root.get("status")), status.toUpperCase()));
            }
            if (priority != null && !priority.isBlank()) {
                predicates.add(cb.equal(cb.upper(root.get("priority")), priority.toUpperCase()));
            }
            if (workspaceId != null) {
                predicates.add(cb.equal(root.get("workspace").get("id"), workspaceId));
            }
            if (assignedUserId != null) {
                predicates.add(cb.equal(root.get("assignedUser").get("id"), assignedUserId));
            }
            if (search != null && !search.isBlank()) {
                String pattern = "%" + search.toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("title")), pattern),
                        cb.like(cb.lower(root.get("description")), pattern)
                ));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<TaskDtos.TaskResponse> page = taskRepository.findAll(spec, pageable).map(TaskDtos.TaskResponse::fromEntity);
        return PageResponse.from(page);
    }

    @Transactional(readOnly = true)
    public TaskDtos.TaskResponse getTaskById(Long id) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task", "id", id));
        return TaskDtos.TaskResponse.fromEntity(task);
    }

    @Transactional(readOnly = true)
    public List<TaskDtos.TaskResponse> getTasksByWorkspace(Long workspaceId) {
        if (!workspaceRepository.existsById(workspaceId)) {
            throw new ResourceNotFoundException("Workspace", "id", workspaceId);
        }
        return taskRepository.findByWorkspace_Id(workspaceId).stream()
                .map(TaskDtos.TaskResponse::fromEntity)
                .toList();
    }

    public TaskDtos.TaskResponse updateTask(Long id, TaskDtos.UpdateTaskRequest request) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task", "id", id));

        task.setTitle(request.title());
        task.setDescription(request.description());
        if (request.status() != null) task.setStatus(request.status());
        if (request.priority() != null) task.setPriority(request.priority());
        task.setStartDate(request.startDate());
        task.setDueDate(request.dueDate());
        if (request.storyPoints() != null) task.setStoryPoints(request.storyPoints());
        if (request.taskType() != null) task.setTaskType(request.taskType());

        if (request.workspaceId() != null) {
            Workspace ws = workspaceRepository.findById(request.workspaceId())
                    .orElseThrow(() -> new ResourceNotFoundException("Workspace", "id", request.workspaceId()));
            task.setWorkspace(ws);
        }

        if (request.assignedUserId() != null) {
            User user = userRepository.findById(request.assignedUserId())
                    .orElseThrow(() -> new ResourceNotFoundException("User", "id", request.assignedUserId()));
            task.setAssignedUser(user);
        }

        Task updated = taskRepository.save(task);
        auditService.log("TASK_UPDATED", "Task", String.valueOf(updated.getId()), "Updated task: " + updated.getTitle(), null);
        return TaskDtos.TaskResponse.fromEntity(updated);
    }

    public TaskDtos.TaskResponse assignTask(Long id, Long assignedUserId) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task", "id", id));

        if (assignedUserId != null) {
            User user = userRepository.findById(assignedUserId)
                    .orElseThrow(() -> new ResourceNotFoundException("User", "id", assignedUserId));
            task.setAssignedUser(user);

            notificationService.createNotification(
                    user,
                    "TASK_ASSIGNED",
                    "Task Assigned to You",
                    "Task '" + task.getTitle() + "' has been assigned to you",
                    "/tasks"
            );
        } else {
            task.setAssignedUser(null);
        }

        Task saved = taskRepository.save(task);
        auditService.log("TASK_ASSIGNED", "Task", String.valueOf(saved.getId()), "Assigned task to user id: " + assignedUserId, null);
        return TaskDtos.TaskResponse.fromEntity(saved);
    }

    public TaskDtos.TaskResponse updateStatus(Long id, String status) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task", "id", id));

        task.setStatus(status);
        Task saved = taskRepository.save(task);

        auditService.log("TASK_STATUS_CHANGED", "Task", String.valueOf(saved.getId()), "Changed status to: " + status, null);

        if ("DONE".equalsIgnoreCase(status) && task.getCreatedBy() != null) {
            notificationService.createNotification(
                    task.getCreatedBy(),
                    "TASK_COMPLETED",
                    "Task Completed",
                    "Task '" + task.getTitle() + "' is marked as DONE",
                    "/tasks"
            );
        }

        return TaskDtos.TaskResponse.fromEntity(saved);
    }

    public void deleteTask(Long id) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task", "id", id));
        taskRepository.delete(task);
        auditService.log("TASK_DELETED", "Task", String.valueOf(id), "Deleted task id: " + id, null);
    }

    private User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && !auth.getPrincipal().equals("anonymousUser")) {
            return userRepository.findByUsername(auth.getName()).orElse(null);
        }
        return null;
    }
}

