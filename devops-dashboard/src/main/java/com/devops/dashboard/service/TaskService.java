
package com.devops.dashboard.service;

import com.devops.dashboard.entity.Task;
import com.devops.dashboard.entity.Workspace;
import com.devops.dashboard.repository.TaskRepository;
import com.devops.dashboard.repository.WorkspaceRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TaskService {

    private final TaskRepository taskRepository;
    private final WorkspaceRepository workspaceRepository;

    public TaskService(
            TaskRepository taskRepository,
            WorkspaceRepository workspaceRepository) {
        this.taskRepository = taskRepository;
        this.workspaceRepository = workspaceRepository;
    }

    public Task createTask(Task task) {
        assignWorkspace(task);
        return taskRepository.save(task);
    }

    public List<Task> getAllTasks() {
        return taskRepository.findAll();
    }

    public List<Task> getTasksByWorkspace(Long workspaceId) {
        if (!workspaceRepository.existsById(workspaceId)) {
            throw new RuntimeException(
                    "Workspace not found with id: " + workspaceId);
        }

        return taskRepository.findByWorkspace_Id(workspaceId);
    }

    public Task getTaskById(Long id) {
        return taskRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Task not found with id: " + id));
    }

    public Task updateTask(Long id, Task updatedTask) {
        Task existingTask = getTaskById(id);

        existingTask.setTitle(updatedTask.getTitle());
        existingTask.setDescription(updatedTask.getDescription());
        existingTask.setStatus(updatedTask.getStatus());
        existingTask.setPriority(updatedTask.getPriority());
        existingTask.setDueDate(updatedTask.getDueDate());

        if (updatedTask.getStartDate() != null) {
            existingTask.setStartDate(updatedTask.getStartDate());
        }

        if (updatedTask.getStoryPoints() != null) {
            existingTask.setStoryPoints(updatedTask.getStoryPoints());
        }

        if (updatedTask.getTaskType() != null) {
            existingTask.setTaskType(updatedTask.getTaskType());
        }

        if (updatedTask.getWorkspace() != null) {
            assignWorkspace(updatedTask);
            existingTask.setWorkspace(updatedTask.getWorkspace());
        }

        return taskRepository.save(existingTask);
    }

    private void assignWorkspace(Task task) {
        if (task.getWorkspace() == null) {
            return;
        }

        Long workspaceId = task.getWorkspace().getId();

        if (workspaceId == null) {
            throw new IllegalArgumentException(
                    "Workspace ID is required when assigning a workspace");
        }

        Workspace workspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Workspace not found with id: " + workspaceId));

        task.setWorkspace(workspace);
    }

    public void deleteTask(Long id) {
        Task existingTask = getTaskById(id);
        taskRepository.delete(existingTask);
    }
}
