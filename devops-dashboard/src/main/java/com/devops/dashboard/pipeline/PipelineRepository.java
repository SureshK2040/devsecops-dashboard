package com.devops.dashboard.pipeline;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PipelineRepository extends JpaRepository<Pipeline, Long> {
    List<Pipeline> findByWorkspace_IdOrderByCreatedAtDesc(Long workspaceId);
    List<Pipeline> findTop20ByOrderByCreatedAtDesc();
    long countByStatus(String status);
}

