package com.devops.dashboard.dashboard;

import com.devops.dashboard.audit.AuditLog;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
@Tag(name = "Dashboard Analytics", description = "High-level summary KPIs and metrics for charts and platform monitoring")
@SecurityRequirement(name = "bearerAuth")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/summary")
    @Operation(summary = "Get high-level DevSecOps KPIs, health, and counts")
    public ResponseEntity<DashboardService.DashboardSummary> getSummary() {
        return ResponseEntity.ok(dashboardService.getSummary());
    }

    @GetMapping("/tasks")
    @Operation(summary = "Get task distribution metrics by status")
    public ResponseEntity<Map<String, Long>> getTaskMetrics() {
        return ResponseEntity.ok(dashboardService.getTaskMetrics());
    }

    @GetMapping("/activity")
    @Operation(summary = "Get platform recent audit activity")
    public ResponseEntity<List<AuditLog>> getRecentActivity() {
        return ResponseEntity.ok(dashboardService.getRecentActivity());
    }
}

