-- ==========================================================
-- DevSecOps Dashboard Platform - V2 Seed Demo Data
-- Pure DML migration inserting demo users, workspaces, tasks,
-- pipelines, stages, deployments, security scans, vulns, logs, notifications.
-- ==========================================================

-- 1. Seed default users (password: password123)
INSERT INTO users (username, email, password, first_name, last_name, role, enabled)
VALUES 
('admin', 'admin@devsecops.local', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', 'DevSecOps', 'Admin', 'ADMIN', true),
('manager', 'manager@devsecops.local', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', 'Project', 'Manager', 'MANAGER', true),
('developer', 'developer@devsecops.local', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', 'Cloud', 'Developer', 'DEVELOPER', true),
('viewer', 'viewer@devsecops.local', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', 'Guest', 'Auditor', 'VIEWER', true)
ON CONFLICT (username) DO NOTHING;

-- 2. Seed sample workspaces
INSERT INTO workspaces (name, description, repository_url, status, owner_id)
SELECT 'Payment Gateway Service', 'Microservice handling PCI-DSS compliant credit card and ACH transactions', 'https://github.com/org/payment-gateway', 'ACTIVE', u.id
FROM users u WHERE u.username = 'admin'
AND NOT EXISTS (SELECT 1 FROM workspaces WHERE name = 'Payment Gateway Service');

INSERT INTO workspaces (name, description, repository_url, status, owner_id)
SELECT 'Auth & Identity Provider', 'OAuth2/OIDC centralized identity service and JWT issuer', 'https://github.com/org/auth-service', 'ACTIVE', u.id
FROM users u WHERE u.username = 'admin'
AND NOT EXISTS (SELECT 1 FROM workspaces WHERE name = 'Auth & Identity Provider');

INSERT INTO workspaces (name, description, repository_url, status, owner_id)
SELECT 'Cloud Infrastructure IaC', 'Terraform and Kubernetes infrastructure manifests for AWS EKS', 'https://github.com/org/cloud-infra', 'ACTIVE', u.id
FROM users u WHERE u.username = 'manager'
AND NOT EXISTS (SELECT 1 FROM workspaces WHERE name = 'Cloud Infrastructure IaC');

-- 3. Seed Sample Tasks
INSERT INTO tasks (title, description, status, priority, workspace_id, assigned_user_id, created_by_id, due_date, story_points, task_type)
SELECT 'Implement SonarQube Quality Gate', 'Configure SonarQube Maven plugin and fail builds on block-level vulnerabilities', 'IN_PROGRESS', 'HIGH', w.id, dev.id, mgr.id, CURRENT_DATE + 5, 5, 'TASK'
FROM workspaces w, users dev, users mgr
WHERE w.name = 'Payment Gateway Service' AND dev.username = 'developer' AND mgr.username = 'manager'
AND NOT EXISTS (SELECT 1 FROM tasks WHERE title = 'Implement SonarQube Quality Gate');

INSERT INTO tasks (title, description, status, priority, workspace_id, assigned_user_id, created_by_id, due_date, story_points, task_type)
SELECT 'Upgrade PostgreSQL Driver & Fix CVEs', 'Patch CVE-2024-1597 in pgsql driver and regenerate SBOM', 'TODO', 'CRITICAL', w.id, dev.id, adm.id, CURRENT_DATE + 2, 3, 'BUG'
FROM workspaces w, users dev, users adm
WHERE w.name = 'Payment Gateway Service' AND dev.username = 'developer' AND adm.username = 'admin'
AND NOT EXISTS (SELECT 1 FROM tasks WHERE title = 'Upgrade PostgreSQL Driver & Fix CVEs');

INSERT INTO tasks (title, description, status, priority, workspace_id, assigned_user_id, created_by_id, due_date, story_points, task_type)
SELECT 'Setup Trivy Container Scanner in GitHub Actions', 'Scan Docker image before pushing to AWS ECR in CI workflow', 'DONE', 'HIGH', w.id, dev.id, adm.id, CURRENT_DATE - 1, 8, 'TASK'
FROM workspaces w, users dev, users adm
WHERE w.name = 'Auth & Identity Provider' AND dev.username = 'developer' AND adm.username = 'admin'
AND NOT EXISTS (SELECT 1 FROM tasks WHERE title = 'Setup Trivy Container Scanner in GitHub Actions');

INSERT INTO tasks (title, description, status, priority, workspace_id, assigned_user_id, created_by_id, due_date, story_points, task_type)
SELECT 'Configure Mutual TLS on Kubernetes Ingress', 'Enforce mTLS on internal service mesh communication', 'IN_REVIEW', 'MEDIUM', w.id, dev.id, mgr.id, CURRENT_DATE + 7, 5, 'TASK'
FROM workspaces w, users dev, users mgr
WHERE w.name = 'Cloud Infrastructure IaC' AND dev.username = 'developer' AND mgr.username = 'manager'
AND NOT EXISTS (SELECT 1 FROM tasks WHERE title = 'Configure Mutual TLS on Kubernetes Ingress');

-- 4. Seed Sample Pipeline
INSERT INTO pipelines (workspace_id, pipeline_name, branch, commit_hash, commit_message, status, started_at, completed_at, duration_seconds, triggered_by)
SELECT w.id, 'Payment Service CI/CD', 'main', '7a2f91c', 'feat: update payment encryption keys', 'SUCCESS', NOW() - INTERVAL '2 hours', NOW() - INTERVAL '1 hour 54 minutes', 360, 'developer'
FROM workspaces w WHERE w.name = 'Payment Gateway Service'
AND NOT EXISTS (SELECT 1 FROM pipelines WHERE pipeline_name = 'Payment Service CI/CD');

-- 5. Seed Pipeline Stages
INSERT INTO pipeline_stages (pipeline_id, stage_name, stage_order, status, started_at, completed_at, duration_seconds, logs)
SELECT p.id, s.stage_name, s.stage_order, 'SUCCESS', NOW() - INTERVAL '2 hours', NOW() - INTERVAL '1 hour 54 minutes', s.duration_seconds, s.logs
FROM pipelines p
CROSS JOIN (
    VALUES 
    ('SOURCE', 1, 60, 'Git checkout commit 7a2f91c on branch main complete.'),
    ('BUILD', 2, 120, 'Maven clean compile complete without errors.'),
    ('TEST', 3, 60, 'JUnit 5 tests executed: 42 passed, 0 failed, 0 skipped.'),
    ('SAST', 4, 60, 'Semgrep SAST scan completed: 0 high/critical issues.'),
    ('DEPENDENCY_SCAN', 5, 60, 'Trivy fs / OWASP scan finished with green status.'),
    ('CONTAINER_SCAN', 6, 30, 'Docker container image scanned: 0 critical vulnerabilities.'),
    ('DEPLOY', 7, 30, 'Kubernetes deployment applied to production namespace.')
) AS s(stage_name, stage_order, duration_seconds, logs)
WHERE p.pipeline_name = 'Payment Service CI/CD'
AND NOT EXISTS (SELECT 1 FROM pipeline_stages WHERE pipeline_id = p.id);

-- 6. Seed Sample Deployments
INSERT INTO deployments (workspace_id, environment, version, commit_hash, status, deployed_by, started_at, completed_at)
SELECT w.id, 'PRODUCTION', 'v1.4.0', '7a2f91c', 'SUCCESS', 'developer', NOW() - INTERVAL '2 hours', NOW() - INTERVAL '1 hour 54 minutes'
FROM workspaces w WHERE w.name = 'Payment Gateway Service'
AND NOT EXISTS (SELECT 1 FROM deployments WHERE version = 'v1.4.0' AND environment = 'PRODUCTION');

INSERT INTO deployments (workspace_id, environment, version, commit_hash, status, deployed_by, started_at, completed_at)
SELECT w.id, 'STAGING', 'v1.4.0-rc1', '91a27e0', 'SUCCESS', 'developer', NOW() - INTERVAL '1 day', NOW() - INTERVAL '23 hours 50 minutes'
FROM workspaces w WHERE w.name = 'Payment Gateway Service'
AND NOT EXISTS (SELECT 1 FROM deployments WHERE version = 'v1.4.0-rc1' AND environment = 'STAGING');

-- 7. Seed Sample Security Scans
INSERT INTO security_scans (workspace_id, pipeline_id, scan_type, status, critical_count, high_count, medium_count, low_count, security_score, scanned_at, report_details)
SELECT w.id, p.id, 'SAST_SEMGREP', 'COMPLETED', 0, 1, 2, 5, 88, NOW() - INTERVAL '2 hours', 'Semgrep Ruleset: OWASP Top 10 + CWE Top 25'
FROM workspaces w
LEFT JOIN pipelines p ON p.workspace_id = w.id AND p.pipeline_name = 'Payment Service CI/CD'
WHERE w.name = 'Payment Gateway Service'
AND NOT EXISTS (SELECT 1 FROM security_scans WHERE scan_type = 'SAST_SEMGREP');

INSERT INTO security_scans (workspace_id, pipeline_id, scan_type, status, critical_count, high_count, medium_count, low_count, security_score, scanned_at, report_details)
SELECT w.id, p.id, 'DEPENDENCY_TRIVY', 'COMPLETED', 1, 2, 4, 1, 75, NOW() - INTERVAL '2 hours', 'Trivy SCA scan of pom.xml dependencies'
FROM workspaces w
LEFT JOIN pipelines p ON p.workspace_id = w.id AND p.pipeline_name = 'Payment Service CI/CD'
WHERE w.name = 'Payment Gateway Service'
AND NOT EXISTS (SELECT 1 FROM security_scans WHERE scan_type = 'DEPENDENCY_TRIVY');

-- 8. Seed Sample Vulnerabilities linked to scan
INSERT INTO vulnerabilities (security_scan_id, cve_id, title, description, severity, package_name, installed_version, fixed_version, file_path, status)
SELECT s.id, 'CVE-2024-1597', 'PostgreSQL JDBC Driver SQL Injection Risk', 'PostgreSQL JDBC Driver allows SQL Injection via fastpath queries', 'CRITICAL', 'org.postgresql:postgresql', '42.7.1', '42.7.2', 'pom.xml', 'OPEN'
FROM security_scans s WHERE s.scan_type = 'DEPENDENCY_TRIVY'
AND NOT EXISTS (SELECT 1 FROM vulnerabilities WHERE cve_id = 'CVE-2024-1597');

INSERT INTO vulnerabilities (security_scan_id, cve_id, title, description, severity, package_name, installed_version, fixed_version, file_path, status)
SELECT s.id, 'CWE-89', 'Potential SQL String Concatenation', 'Query formed with raw string concatenation', 'HIGH', 'backend-service', '1.0.0', NULL, 'TaskRepository.java', 'IN_REVIEW'
FROM security_scans s WHERE s.scan_type = 'SAST_SEMGREP'
AND NOT EXISTS (SELECT 1 FROM vulnerabilities WHERE cve_id = 'CWE-89');

-- 9. Seed Sample Audit Logs
INSERT INTO audit_logs (username, action, entity_type, entity_id, description, ip_address, timestamp)
SELECT 'admin', 'USER_LOGIN', 'User', CAST(u.id AS VARCHAR), 'Successful user authentication', '127.0.0.1', NOW() - INTERVAL '3 hours'
FROM users u WHERE u.username = 'admin'
AND NOT EXISTS (SELECT 1 FROM audit_logs WHERE action = 'USER_LOGIN' AND username = 'admin');

-- 10. Seed Sample Notifications
INSERT INTO notifications (user_id, type, title, message, is_read, link)
SELECT u.id, 'TASK_ASSIGNED', 'New Task Assigned', 'You have been assigned to task: Upgrade PostgreSQL Driver & Fix CVEs', false, '/tasks'
FROM users u WHERE u.username = 'developer'
AND NOT EXISTS (SELECT 1 FROM notifications WHERE type = 'TASK_ASSIGNED' AND title = 'New Task Assigned');

INSERT INTO notifications (user_id, type, title, message, is_read, link)
SELECT u.id, 'SECURITY_ALERT', 'Critical Vulnerability Detected', 'Trivy SCA flagged CVE-2024-1597 in Payment Gateway Service', false, '/security'
FROM users u WHERE u.username = 'admin'
AND NOT EXISTS (SELECT 1 FROM notifications WHERE type = 'SECURITY_ALERT' AND title = 'Critical Vulnerability Detected');
