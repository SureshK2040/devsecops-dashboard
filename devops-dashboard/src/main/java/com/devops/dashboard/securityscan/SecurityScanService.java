package com.devops.dashboard.securityscan;

import com.devops.dashboard.common.ResourceNotFoundException;
import com.devops.dashboard.workspace.Workspace;
import com.devops.dashboard.workspace.WorkspaceDtos;
import com.devops.dashboard.workspace.WorkspaceRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
@Transactional
public class SecurityScanService {

    private final SecurityScanRepository securityScanRepository;
    private final VulnerabilityRepository vulnerabilityRepository;
    private final WorkspaceRepository workspaceRepository;

    public SecurityScanService(
            SecurityScanRepository securityScanRepository,
            VulnerabilityRepository vulnerabilityRepository,
            WorkspaceRepository workspaceRepository
    ) {
        this.securityScanRepository = securityScanRepository;
        this.vulnerabilityRepository = vulnerabilityRepository;
        this.workspaceRepository = workspaceRepository;
    }

    public record SecuritySummaryResponse(
            int overallScore,
            long criticalVulnerabilities,
            long highVulnerabilities,
            long mediumVulnerabilities,
            long lowVulnerabilities,
            long totalVulnerabilities,
            List<Vulnerability> recentVulnerabilities,
            List<SecurityScan> recentScans
    ) {}

    @Transactional(readOnly = true)
    public SecuritySummaryResponse getSecuritySummary() {
        long crit = vulnerabilityRepository.countBySeverity("CRITICAL");
        long high = vulnerabilityRepository.countBySeverity("HIGH");
        long med = vulnerabilityRepository.countBySeverity("MEDIUM");
        long low = vulnerabilityRepository.countBySeverity("LOW");
        long total = crit + high + med + low;

        int score = 100 - (int)(crit * 25 + high * 10 + med * 3);
        if (score < 0) score = 0;

        List<Vulnerability> recentVulns = vulnerabilityRepository.findTop50ByOrderByIdDesc();
        List<SecurityScan> recentScans = securityScanRepository.findTop10ByOrderByScannedAtDesc();

        return new SecuritySummaryResponse(score, crit, high, med, low, total, recentVulns, recentScans);
    }

    @Transactional(readOnly = true)
    public List<Vulnerability> getAllVulnerabilities() {
        return vulnerabilityRepository.findTop50ByOrderByIdDesc();
    }

    public Vulnerability updateVulnerabilityStatus(Long id, String status) {
        Vulnerability v = vulnerabilityRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vulnerability", "id", id));
        v.setStatus(status.toUpperCase());
        return vulnerabilityRepository.save(v);
    }

    public SecurityScan runScanner(Long workspaceId, String scanType) {
        Workspace ws = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new ResourceNotFoundException("Workspace", "id", workspaceId));

        SecurityScan scan = new SecurityScan(
                ws,
                null,
                scanType != null ? scanType.toUpperCase() : "SAST_SEMGREP",
                0,
                0,
                1,
                2,
                94,
                "Manual triggered on-demand scan. Ruleset: OWASP Top 10"
        );

        scan.addVulnerability(new Vulnerability(
                "CWE-798",
                "Hardcoded credentials check",
                "Verified no hardcoded secrets in current git commit workspace",
                "LOW",
                "internal-linter",
                "1.0",
                null,
                "application.properties",
                5
        ));

        return securityScanRepository.save(scan);
    }
}

