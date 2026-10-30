package com.devops.dashboard.deployment;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/deployments")
@Tag(name = "Deployments", description = "Endpoints for multi-environment deployments and audit tracking")
@SecurityRequirement(name = "bearerAuth")
public class DeploymentController {

    private final DeploymentService deploymentService;

    public DeploymentController(DeploymentService deploymentService) {
        this.deploymentService = deploymentService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'DEVELOPER')")
    @Operation(summary = "Trigger a new deployment to DEV, STAGING, or PRODUCTION")
    public ResponseEntity<DeploymentService.DeploymentResponse> deploy(
            @Valid @RequestBody DeploymentService.DeployRequest request) {
        return new ResponseEntity<>(deploymentService.deploy(request), HttpStatus.CREATED);
    }

    @GetMapping
    @Operation(summary = "Get recent deployments across all environments")
    public ResponseEntity<List<DeploymentService.DeploymentResponse>> getAllDeployments() {
        return ResponseEntity.ok(deploymentService.getAllDeployments());
    }

    @GetMapping("/workspace/{workspaceId}")
    @Operation(summary = "Get deployments for a specific project/workspace")
    public ResponseEntity<List<DeploymentService.DeploymentResponse>> getDeploymentsByWorkspace(
            @PathVariable Long workspaceId) {
        return ResponseEntity.ok(deploymentService.getDeploymentsByWorkspace(workspaceId));
    }
}

