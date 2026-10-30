package com.devops.dashboard.audit;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/audit")
@Tag(name = "Audit Logs", description = "Enterprise audit logging endpoints")
@SecurityRequirement(name = "bearerAuth")
public class AuditController {

    private final AuditService auditService;

    public AuditController(AuditService auditService) {
        this.auditService = auditService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "Get audit logs with optional filtering")
    public ResponseEntity<List<AuditLog>> getAuditLogs(
            @RequestParam(required = false) String username,
            @RequestParam(required = false) String action
    ) {
        if (username != null && !username.isBlank()) {
            return ResponseEntity.ok(auditService.getLogsByUser(username));
        }
        if (action != null && !action.isBlank()) {
            return ResponseEntity.ok(auditService.getLogsByAction(action));
        }
        return ResponseEntity.ok(auditService.getRecentLogs());
    }
}

