package com.devops.dashboard.securityscan;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/security")
@Tag(name = "DevSecOps Security", description = "Vulnerability dashboards, SAST, SCA, and container security scans")
@SecurityRequirement(name = "bearerAuth")
public class SecurityController {

    private final SecurityScanService securityScanService;

    public SecurityController(SecurityScanService securityScanService) {
        this.securityScanService = securityScanService;
    }

    @GetMapping("/summary")
    @Operation(summary = "Get aggregated security health score and vulnerability counts")
    public ResponseEntity<SecurityScanService.SecuritySummaryResponse> getSecuritySummary() {
        return ResponseEntity.ok(securityScanService.getSecuritySummary());
    }

    @GetMapping("/vulnerabilities")
    @Operation(summary = "List all detected vulnerabilities")
    public ResponseEntity<List<Vulnerability>> getAllVulnerabilities() {
        return ResponseEntity.ok(securityScanService.getAllVulnerabilities());
    }

    @PatchMapping("/vulnerabilities/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "Update status of a vulnerability (OPEN, IN_REVIEW, RESOLVED, FALSE_POSITIVE)")
    public ResponseEntity<Vulnerability> updateVulnerabilityStatus(
            @PathVariable Long id,
            @RequestParam String status) {
        return ResponseEntity.ok(securityScanService.updateVulnerabilityStatus(id, status));
    }

    @PostMapping("/scan/{workspaceId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'DEVELOPER')")
    @Operation(summary = "Run on-demand DevSecOps scan on a project")
    public ResponseEntity<SecurityScan> triggerScan(
            @PathVariable Long workspaceId,
            @RequestParam(required = false, defaultValue = "SAST_SEMGREP") String scanType) {
        return ResponseEntity.ok(securityScanService.runScanner(workspaceId, scanType));
    }
}

