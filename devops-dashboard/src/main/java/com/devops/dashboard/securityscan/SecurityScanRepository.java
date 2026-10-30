package com.devops.dashboard.securityscan;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SecurityScanRepository extends JpaRepository<SecurityScan, Long> {
    List<SecurityScan> findByWorkspace_IdOrderByScannedAtDesc(Long workspaceId);
    List<SecurityScan> findTop10ByOrderByScannedAtDesc();
}

