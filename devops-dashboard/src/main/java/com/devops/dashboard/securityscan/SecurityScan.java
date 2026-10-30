package com.devops.dashboard.securityscan;

import com.devops.dashboard.pipeline.Pipeline;
import com.devops.dashboard.workspace.Workspace;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "security_scans")
public class SecurityScan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "workspace_id")
    private Workspace workspace;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pipeline_id")
    private Pipeline pipeline;

    @Column(name = "scan_type", nullable = false, length = 40)
    private String scanType; // SAST_SEMGREP, DEPENDENCY_TRIVY, CONTAINER_TRIVY, DAST_ZAP

    @Column(nullable = false, length = 30)
    private String status = "COMPLETED";

    @Column(name = "critical_count", nullable = false)
    private int criticalCount = 0;

    @Column(name = "high_count", nullable = false)
    private int highCount = 0;

    @Column(name = "medium_count", nullable = false)
    private int mediumCount = 0;

    @Column(name = "low_count", nullable = false)
    private int lowCount = 0;

    @Column(name = "security_score", nullable = false)
    private int securityScore = 100;

    @Column(name = "scanned_at", nullable = false)
    private LocalDateTime scannedAt = LocalDateTime.now();

    @Column(name = "report_details", columnDefinition = "TEXT")
    private String reportDetails;

    @OneToMany(mappedBy = "securityScan", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JsonManagedReference
    private List<Vulnerability> vulnerabilities = new ArrayList<>();

    public SecurityScan() {}

    public SecurityScan(Workspace workspace, Pipeline pipeline, String scanType, int criticalCount, int highCount, int mediumCount, int lowCount, int securityScore, String reportDetails) {
        this.workspace = workspace;
        this.pipeline = pipeline;
        this.scanType = scanType;
        this.criticalCount = criticalCount;
        this.highCount = highCount;
        this.mediumCount = mediumCount;
        this.lowCount = lowCount;
        this.securityScore = securityScore;
        this.reportDetails = reportDetails;
    }

    public void addVulnerability(Vulnerability v) {
        vulnerabilities.add(v);
        v.setSecurityScan(this);
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Workspace getWorkspace() { return workspace; }
    public void setWorkspace(Workspace workspace) { this.workspace = workspace; }
    public Pipeline getPipeline() { return pipeline; }
    public void setPipeline(Pipeline pipeline) { this.pipeline = pipeline; }
    public String getScanType() { return scanType; }
    public void setScanType(String scanType) { this.scanType = scanType; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public int getCriticalCount() { return criticalCount; }
    public void setCriticalCount(int criticalCount) { this.criticalCount = criticalCount; }
    public int getHighCount() { return highCount; }
    public void setHighCount(int highCount) { this.highCount = highCount; }
    public int getMediumCount() { return mediumCount; }
    public void setMediumCount(int mediumCount) { this.mediumCount = mediumCount; }
    public int getLowCount() { return lowCount; }
    public void setLowCount(int lowCount) { this.lowCount = lowCount; }
    public int getSecurityScore() { return securityScore; }
    public void setSecurityScore(int securityScore) { this.securityScore = securityScore; }
    public LocalDateTime getScannedAt() { return scannedAt; }
    public String getReportDetails() { return reportDetails; }
    public void setReportDetails(String reportDetails) { this.reportDetails = reportDetails; }
    public List<Vulnerability> getVulnerabilities() { return vulnerabilities; }
}

