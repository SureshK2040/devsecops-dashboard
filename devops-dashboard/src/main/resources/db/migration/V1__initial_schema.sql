-- ==========================================================
-- DevSecOps Dashboard Platform - V1 Initial Schema
-- ==========================================================

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    role VARCHAR(30) NOT NULL DEFAULT 'DEVELOPER',
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

-- 2. Workspaces / Projects Table (Preserves and elevates legacy workspace)
CREATE TABLE IF NOT EXISTS workspaces (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description VARCHAR(500),
    repository_url VARCHAR(255),
    status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    owner_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

-- 3. Tasks Table (Preserves and improves legacy task model)
CREATE TABLE IF NOT EXISTS tasks (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    description VARCHAR(1000),
    status VARCHAR(30) NOT NULL DEFAULT 'TODO',
    priority VARCHAR(30) NOT NULL DEFAULT 'MEDIUM',
    workspace_id BIGINT REFERENCES workspaces(id) ON DELETE CASCADE,
    assigned_user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    created_by_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    start_date DATE,
    due_date DATE,
    story_points INTEGER DEFAULT 0,
    task_type VARCHAR(30) DEFAULT 'TASK',
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITHOUT TIME ZONE
);

-- 4. Pipelines Table
CREATE TABLE IF NOT EXISTS pipelines (
    id BIGSERIAL PRIMARY KEY,
    workspace_id BIGINT REFERENCES workspaces(id) ON DELETE CASCADE,
    pipeline_name VARCHAR(100) NOT NULL,
    branch VARCHAR(100) NOT NULL DEFAULT 'main',
    commit_hash VARCHAR(40),
    commit_message VARCHAR(255),
    status VARCHAR(30) NOT NULL DEFAULT 'QUEUED',
    started_at TIMESTAMP WITHOUT TIME ZONE,
    completed_at TIMESTAMP WITHOUT TIME ZONE,
    duration_seconds BIGINT DEFAULT 0,
    triggered_by VARCHAR(50) NOT NULL DEFAULT 'system',
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW()
);

-- 5. Pipeline Stages Table
CREATE TABLE IF NOT EXISTS pipeline_stages (
    id BIGSERIAL PRIMARY KEY,
    pipeline_id BIGINT NOT NULL REFERENCES pipelines(id) ON DELETE CASCADE,
    stage_name VARCHAR(50) NOT NULL,
    stage_order INT NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    started_at TIMESTAMP WITHOUT TIME ZONE,
    completed_at TIMESTAMP WITHOUT TIME ZONE,
    duration_seconds BIGINT DEFAULT 0,
    logs TEXT
);

-- 6. Deployments Table
CREATE TABLE IF NOT EXISTS deployments (
    id BIGSERIAL PRIMARY KEY,
    workspace_id BIGINT REFERENCES workspaces(id) ON DELETE CASCADE,
    environment VARCHAR(30) NOT NULL,
    version VARCHAR(50) NOT NULL,
    commit_hash VARCHAR(40),
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    deployed_by VARCHAR(50) NOT NULL,
    started_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMP WITHOUT TIME ZONE
);

-- 7. Security Scans Table
CREATE TABLE IF NOT EXISTS security_scans (
    id BIGSERIAL PRIMARY KEY,
    workspace_id BIGINT REFERENCES workspaces(id) ON DELETE CASCADE,
    pipeline_id BIGINT REFERENCES pipelines(id) ON DELETE SET NULL,
    scan_type VARCHAR(40) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'COMPLETED',
    critical_count INT NOT NULL DEFAULT 0,
    high_count INT NOT NULL DEFAULT 0,
    medium_count INT NOT NULL DEFAULT 0,
    low_count INT NOT NULL DEFAULT 0,
    security_score INT NOT NULL DEFAULT 100,
    scanned_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
    report_details TEXT
);

-- 8. Vulnerabilities Table
CREATE TABLE IF NOT EXISTS vulnerabilities (
    id BIGSERIAL PRIMARY KEY,
    security_scan_id BIGINT NOT NULL REFERENCES security_scans(id) ON DELETE CASCADE,
    cve_id VARCHAR(50),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    severity VARCHAR(20) NOT NULL,
    package_name VARCHAR(100),
    installed_version VARCHAR(50),
    fixed_version VARCHAR(50),
    file_path VARCHAR(255),
    line_number INT,
    status VARCHAR(30) NOT NULL DEFAULT 'OPEN'
);

-- 9. Audit Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    action VARCHAR(50) NOT NULL,
    entity_type VARCHAR(50),
    entity_id VARCHAR(50),
    description TEXT,
    ip_address VARCHAR(45),
    timestamp TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW()
);

-- 10. Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(40) NOT NULL,
    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    link VARCHAR(255),
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW()
);

-- Indexes for high performance
CREATE INDEX IF NOT EXISTS idx_tasks_workspace ON tasks(workspace_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_assignee ON tasks(assigned_user_id);
CREATE INDEX IF NOT EXISTS idx_pipelines_workspace ON pipelines(workspace_id);
CREATE INDEX IF NOT EXISTS idx_deployments_workspace ON deployments(workspace_id);
CREATE INDEX IF NOT EXISTS idx_security_scans_workspace ON security_scans(workspace_id);
CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON audit_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);

