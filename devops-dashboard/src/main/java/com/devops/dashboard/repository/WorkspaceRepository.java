
package com.devops.dashboard.repository;

import com.devops.dashboard.entity.Workspace;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface WorkspaceRepository extends JpaRepository<Workspace, Long> {
    boolean existsByNameIgnoreCase(String name);
}
