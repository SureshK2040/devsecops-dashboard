export interface User {
  id: number;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: 'ADMIN' | 'MANAGER' | 'DEVELOPER' | 'VIEWER';
  enabled: boolean;
  createdAt?: string;
}

export interface Workspace {
  id: number;
  name: string;
  description?: string;
  repositoryUrl?: string;
  status: 'ACTIVE' | 'PLANNING' | 'ON_HOLD' | 'COMPLETED' | 'ARCHIVED';
  owner?: User;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: number;
  title: string;
  description?: string;
  status: 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'BLOCKED' | 'DONE';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  workspace?: Workspace;
  assignedUser?: User;
  createdBy?: User;
  startDate?: string;
  dueDate?: string;
  storyPoints?: number;
  taskType?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface PipelineStage {
  id: number;
  stageName: string;
  stageOrder: number;
  status: 'PENDING' | 'RUNNING' | 'SUCCESS' | 'FAILED';
  startedAt?: string;
  completedAt?: string;
  durationSeconds: number;
  logs?: string;
}

export interface Pipeline {
  id: number;
  workspace?: Workspace;
  pipelineName: string;
  branch: string;
  commitHash?: string;
  commitMessage?: string;
  status: 'QUEUED' | 'RUNNING' | 'SUCCESS' | 'FAILED' | 'CANCELLED';
  startedAt?: string;
  completedAt?: string;
  durationSeconds: number;
  triggeredBy: string;
  createdAt: string;
  stages: PipelineStage[];
}

export interface Deployment {
  id: number;
  workspace?: Workspace;
  environment: 'DEV' | 'STAGING' | 'PRODUCTION';
  version: string;
  commitHash?: string;
  status: 'PENDING' | 'DEPLOYING' | 'SUCCESS' | 'FAILED' | 'ROLLED_BACK';
  deployedBy: string;
  startedAt: string;
  completedAt?: string;
}

export interface Vulnerability {
  id: number;
  cveId?: string;
  title: string;
  description?: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  packageName?: string;
  installedVersion?: string;
  fixedVersion?: string;
  filePath?: string;
  lineNumber?: number;
  status: 'OPEN' | 'IN_REVIEW' | 'RESOLVED' | 'FALSE_POSITIVE';
}

export interface SecuritySummary {
  overallScore: number;
  criticalVulnerabilities: number;
  highVulnerabilities: number;
  mediumVulnerabilities: number;
  lowVulnerabilities: number;
  totalVulnerabilities: number;
  recentVulnerabilities: Vulnerability[];
}

export interface DashboardSummary {
  totalProjects: number;
  activeProjects: number;
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  failedPipelines: number;
  totalPipelines: number;
  successfulDeployments: number;
  securityIssues: number;
  criticalIssues: number;
  securityScore: number;
}

export interface AuditLog {
  id: number;
  username: string;
  action: string;
  entityType?: string;
  entityId?: string;
  description?: string;
  ipAddress?: string;
  timestamp: string;
}

export interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  link?: string;
  createdAt: string;
}

