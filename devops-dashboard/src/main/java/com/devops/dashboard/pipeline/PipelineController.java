package com.devops.dashboard.pipeline;

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
@RequestMapping("/api/pipelines")
@Tag(name = "DevSecOps Pipelines", description = "Endpoints for CI/CD pipelines, stages, logs, and triggers")
@SecurityRequirement(name = "bearerAuth")
public class PipelineController {

    private final PipelineService pipelineService;

    public PipelineController(PipelineService pipelineService) {
        this.pipelineService = pipelineService;
    }

    @PostMapping("/trigger")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'DEVELOPER')")
    @Operation(summary = "Trigger a new CI/CD DevSecOps pipeline")
    public ResponseEntity<PipelineDtos.PipelineResponse> triggerPipeline(
            @Valid @RequestBody PipelineDtos.TriggerPipelineRequest request) {
        return new ResponseEntity<>(pipelineService.triggerPipeline(request), HttpStatus.CREATED);
    }

    @GetMapping
    @Operation(summary = "Get recent pipelines")
    public ResponseEntity<List<PipelineDtos.PipelineResponse>> getAllPipelines() {
        return ResponseEntity.ok(pipelineService.getAllPipelines());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get pipeline execution details and stage logs")
    public ResponseEntity<PipelineDtos.PipelineResponse> getPipelineById(@PathVariable Long id) {
        return ResponseEntity.ok(pipelineService.getPipelineById(id));
    }

    @GetMapping("/workspace/{workspaceId}")
    @Operation(summary = "Get pipelines by workspace/project")
    public ResponseEntity<List<PipelineDtos.PipelineResponse>> getPipelinesByWorkspace(@PathVariable Long workspaceId) {
        return ResponseEntity.ok(pipelineService.getPipelinesByWorkspace(workspaceId));
    }
}

