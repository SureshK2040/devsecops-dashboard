package com.devops.dashboard.deployment;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DeploymentRepository extends JpaRepository<Deployment, Long> {
    List<Deployment> findByWorkspace_IdOrderByStartedAtDesc(Long workspaceId);
    List<Deployment> findTop20ByOrderByStartedAtDesc();
    long countByStatus(String status);
}

