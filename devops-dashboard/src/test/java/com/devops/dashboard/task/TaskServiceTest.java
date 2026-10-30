package com.devops.dashboard.task;

import com.devops.dashboard.audit.AuditService;
import com.devops.dashboard.notification.NotificationService;
import com.devops.dashboard.user.Role;
import com.devops.dashboard.user.User;
import com.devops.dashboard.user.UserRepository;
import com.devops.dashboard.workspace.Workspace;
import com.devops.dashboard.workspace.WorkspaceRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TaskServiceTest {

    @Mock
    private TaskRepository taskRepository;

    @Mock
    private WorkspaceRepository workspaceRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private AuditService auditService;

    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private TaskService taskService;

    private Workspace sampleWorkspace;
    private User sampleUser;

    @BeforeEach
    void setUp() {
        sampleWorkspace = new Workspace("Security Project", "Desc", "https://github.com/repo", "ACTIVE", null);
        sampleWorkspace.setId(1L);

        sampleUser = new User("developer", "dev@test.com", "pass", "Jane", "Dev", Role.DEVELOPER);
        sampleUser.setId(2L);
    }

    @Test
    void testCreateTaskSuccess() {
        when(workspaceRepository.findById(1L)).thenReturn(Optional.of(sampleWorkspace));
        when(userRepository.findById(2L)).thenReturn(Optional.of(sampleUser));

        Task savedTask = new Task();
        savedTask.setId(100L);
        savedTask.setTitle("Fix SAST Vulnerability");
        savedTask.setStatus("TODO");
        savedTask.setPriority("HIGH");
        savedTask.setWorkspace(sampleWorkspace);
        savedTask.setAssignedUser(sampleUser);

        when(taskRepository.save(any(Task.class))).thenReturn(savedTask);

        TaskDtos.CreateTaskRequest request = new TaskDtos.CreateTaskRequest(
                "Fix SAST Vulnerability",
                "Detailed description",
                "TODO",
                "HIGH",
                1L,
                2L,
                LocalDate.now(),
                LocalDate.now().plusDays(5),
                5,
                "SECURITY"
        );

        TaskDtos.TaskResponse response = taskService.createTask(request);

        assertNotNull(response);
        assertEquals(100L, response.id());
        assertEquals("Fix SAST Vulnerability", response.title());
        verify(auditService).log(eq("TASK_CREATED"), eq("Task"), eq("100"), any(), any());
        verify(notificationService).createNotification(eq(sampleUser), eq("TASK_ASSIGNED"), any(), any(), any());
    }

    @Test
    void testUpdateStatusToDone() {
        Task existingTask = new Task();
        existingTask.setId(50L);
        existingTask.setTitle("Deploy helm chart");
        existingTask.setStatus("IN_PROGRESS");
        existingTask.setCreatedBy(sampleUser);

        when(taskRepository.findById(50L)).thenReturn(Optional.of(existingTask));
        when(taskRepository.save(any(Task.class))).thenAnswer(invocation -> invocation.getArgument(0));

        TaskDtos.TaskResponse updated = taskService.updateStatus(50L, "DONE");

        assertEquals("DONE", updated.status());
        verify(auditService).log(eq("TASK_STATUS_CHANGED"), eq("Task"), eq("50"), any(), any());
        verify(notificationService).createNotification(eq(sampleUser), eq("TASK_COMPLETED"), any(), any(), any());
    }
}

