
package com.devops.dashboard.repository;

import com.devops.dashboard.entity.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {

    List<Task> findByWorkspace_Id(Long workspaceId);
}
