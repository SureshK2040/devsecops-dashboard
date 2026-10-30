import React, { useEffect, useState } from 'react';
import api from '../api/client';
import { DashboardSummary, AuditLog } from '../types';
import {
  FolderGit2,
  CheckCircle,
  Clock,
  GitPullRequest,
  Rocket,
  ShieldCheck,
  ShieldAlert,
  Activity,
  ArrowUpRight
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from 'recharts';

export const DashboardPage: React.FC = () => {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [taskMetrics, setTaskMetrics] = useState<Record<string, number>>({});
  const [recentLogs, setRecentLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [sumRes, tasksRes, actRes] = await Promise.all([
          api.get('/api/dashboard/summary'),
          api.get('/api/dashboard/tasks'),
          api.get('/api/dashboard/activity'),
        ]);
        setSummary(sumRes.data);
        setTaskMetrics(tasksRes.data);
        setRecentLogs(actRes.data.slice(0, 6));
      } catch (err) {
        console.error('Failed to load dashboard metrics', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-slate-200 dark:bg-dark-card rounded w-48"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-slate-200 dark:bg-dark-card rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  const taskChartData = Object.entries(taskMetrics).map(([key, val]) => ({
    name: key.replace('_', ' '),
    count: val,
  }));

  const COLORS = ['#6366f1', '#3b82f6', '#eab308', '#ef4444', '#10b981'];

  return (
    <div className="space-y-6">
      {/* Header Overview */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Cloud-Native Operations Dashboard</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time telemetry, DevSecOps pipelines, vulnerability scans, and deployment health.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            System Operational
          </span>
        </div>
      </div>

      {/* Primary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Projects */}
        <div className="p-5 rounded-xl bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Projects & Repos</span>
            <FolderGit2 size={18} className="text-brand-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight">{summary?.totalProjects || 0}</span>
            <span className="text-xs text-emerald-500 font-medium">{summary?.activeProjects || 0} active</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2 flex items-center gap-1">
            <ArrowUpRight size={13} className="text-emerald-500" /> Tracked microservices & IaC
          </p>
        </div>

        {/* Card 2: Pipelines */}
        <div className="p-5 rounded-xl bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Pipelines Execution</span>
            <GitPullRequest size={18} className="text-indigo-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight">{summary?.totalPipelines || 0}</span>
            <span className="text-xs text-rose-500 font-medium">{summary?.failedPipelines || 0} failed</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">Continuous integration & validation</p>
        </div>

        {/* Card 3: Deployments */}
        <div className="p-5 rounded-xl bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Successful Releases</span>
            <Rocket size={18} className="text-emerald-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-emerald-500">
              {summary?.successfulDeployments || 0}
            </span>
            <span className="text-xs text-slate-400">PROD & STG</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">Zero-downtime cluster rollouts</p>
        </div>

        {/* Card 4: Security Health */}
        <div className="p-5 rounded-xl bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">DevSecOps Score</span>
            <ShieldCheck size={18} className={summary && summary.securityScore > 80 ? 'text-emerald-500' : 'text-amber-500'} />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className={`text-2xl font-bold tracking-tight ${summary && summary.securityScore > 80 ? 'text-emerald-500' : 'text-amber-500'}`}>
              {summary?.securityScore || 0}%
            </span>
            <span className="text-xs text-rose-500 font-medium">{summary?.criticalIssues || 0} critical</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">SAST, SCA, and Container scans</p>
        </div>
      </div>

      {/* Analytics Charts & Task Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Task Workflow Distribution */}
        <div className="lg:col-span-2 p-5 rounded-xl bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold">Engineering Tasks Distribution</h2>
              <p className="text-xs text-slate-400">Current sprint workload by status</p>
            </div>
            <span className="text-xs text-brand-500 font-semibold">{summary?.totalTasks || 0} Total</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={taskChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    borderColor: '#374151',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Security Vulnerability Ratio */}
        <div className="p-5 rounded-xl bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border shadow-sm flex flex-col">
          <h2 className="text-sm font-bold">Security Posture</h2>
          <p className="text-xs text-slate-400 mb-4">Vulnerability severity ratio</p>

          <div className="flex-1 flex flex-col justify-center items-center">
            <div className="w-32 h-32 rounded-full border-8 border-brand-500/20 border-t-emerald-500 border-r-indigo-500 border-b-rose-500 flex items-center justify-center">
              <span className="text-2xl font-extrabold">{summary?.securityScore || 0}%</span>
            </div>
            <div className="mt-6 w-full space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-rose-500 font-medium">Critical</span>
                <span className="font-bold">{summary?.criticalIssues || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-medium">Total Vulnerabilities</span>
                <span className="font-bold">{summary?.securityIssues || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity Audit Feed */}
      <div className="p-5 rounded-xl bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Activity size={18} className="text-brand-500" />
            <h2 className="text-sm font-bold">Recent System Audit Stream</h2>
          </div>
          <span className="text-xs text-slate-400">Live platform events</span>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-dark-border text-xs">
          {recentLogs.map((log) => (
            <div key={log.id} className="py-3 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-dark-hover font-mono text-[10px] text-brand-500">
                  {log.action}
                </span>
                <span className="text-slate-700 dark:text-slate-300 font-medium">{log.description}</span>
              </div>
              <div className="flex items-center gap-3 text-slate-400">
                <span className="text-slate-500 font-mono text-[11px]">{log.username}</span>
                <span className="text-[10px]">{new Date(log.timestamp).toLocaleTimeString()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

