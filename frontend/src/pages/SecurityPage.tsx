import React, { useEffect, useState } from 'react';
import api from '../api/client';
import { SecuritySummary, Vulnerability, Workspace } from '../types';
import { ShieldCheck, ShieldAlert, AlertTriangle, Play, CheckCircle2, FileText, Bug } from 'lucide-react';

export const SecurityPage: React.FC = () => {
  const [summary, setSummary] = useState<SecuritySummary | null>(null);
  const [vulnerabilities, setVulnerabilities] = useState<Vulnerability[]>([]);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);

  const fetchSecurityData = async () => {
    try {
      const [sumRes, vulRes, wsRes] = await Promise.all([
        api.get('/api/security/summary'),
        api.get('/api/security/vulnerabilities'),
        api.get('/api/workspaces'),
      ]);
      setSummary(sumRes.data);
      setVulnerabilities(vulRes.data);
      setWorkspaces(wsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSecurityData();
  }, []);

  const handleTriggerScan = async () => {
    if (workspaces.length === 0) return;
    setScanning(true);
    try {
      await api.post(`/api/security/scan/${workspaces[0].id}?scanType=SAST_SEMGREP`);
      fetchSecurityData();
    } catch (err) {
      console.error(err);
    } finally {
      setScanning(false);
    }
  };

  const handleUpdateStatus = async (id: number, status: string) => {
    try {
      await api.patch(`/api/security/vulnerabilities/${id}/status?status=${status}`);
      fetchSecurityData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight">DevSecOps Security &amp; Vulnerability Management</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Static Application Security Testing (SAST), Software Composition Analysis (SCA), and Container Vulnerability Scans.
          </p>
        </div>

        <button
          onClick={handleTriggerScan}
          disabled={scanning}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 disabled:opacity-50 transition-colors"
        >
          <Play size={14} fill="currentColor" />
          <span>{scanning ? 'Running Semgrep SAST...' : 'Run On-Demand SAST Scan'}</span>
        </button>
      </div>

      {/* KPI Severity Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="p-4 rounded-xl bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border shadow-sm">
          <span className="text-xs text-slate-400 font-medium">Security Score</span>
          <div className="text-2xl font-black text-emerald-500 mt-1">{summary?.overallScore || 0}%</div>
          <span className="text-[11px] text-slate-400">Target: &gt;90%</span>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border shadow-sm">
          <span className="text-xs text-rose-500 font-medium">Critical CVEs</span>
          <div className="text-2xl font-black text-rose-500 mt-1">{summary?.criticalVulnerabilities || 0}</div>
          <span className="text-[11px] text-slate-400">Immediate fix required</span>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border shadow-sm">
          <span className="text-xs text-amber-500 font-medium">High Severity</span>
          <div className="text-2xl font-black text-amber-500 mt-1">{summary?.highVulnerabilities || 0}</div>
          <span className="text-[11px] text-slate-400">Fix before release</span>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border shadow-sm">
          <span className="text-xs text-blue-500 font-medium">Medium Severity</span>
          <div className="text-2xl font-black text-blue-500 mt-1">{summary?.mediumVulnerabilities || 0}</div>
          <span className="text-[11px] text-slate-400">Review within sprint</span>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border shadow-sm">
          <span className="text-xs text-slate-400 font-medium">Low Severity</span>
          <div className="text-2xl font-black text-slate-400 mt-1">{summary?.lowVulnerabilities || 0}</div>
          <span className="text-[11px] text-slate-400">Informational notes</span>
        </div>
      </div>

      {/* Vulnerabilities Table */}
      <div className="bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-dark-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bug size={18} className="text-brand-500" />
            <h3 className="font-bold text-sm">Detected Security Findings &amp; CVEs</h3>
          </div>
          <span className="text-xs text-slate-400">{vulnerabilities.length} findings recorded</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-dark-bg text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-dark-border">
              <tr>
                <th className="py-3 px-4">Severity</th>
                <th className="py-3 px-4">CVE / Finding</th>
                <th className="py-3 px-4">Package / File</th>
                <th className="py-3 px-4">Installed</th>
                <th className="py-3 px-4">Fixed In</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-dark-border">
              {vulnerabilities.map((v) => (
                <tr key={v.id} className="hover:bg-slate-50 dark:hover:bg-dark-hover transition-colors">
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded font-bold uppercase text-[10px] ${
                        v.severity === 'CRITICAL'
                          ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                          : v.severity === 'HIGH'
                          ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                          : 'bg-blue-500/10 text-blue-500 border border-blue-500/20'
                      }`}
                    >
                      {v.severity}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-800 dark:text-slate-200">{v.cveId || 'CODE-ISSUE'}</div>
                    <div className="text-[11px] text-slate-400">{v.title}</div>
                  </td>
                  <td className="py-3 px-4 font-mono text-[11px] text-slate-600 dark:text-slate-300">
                    {v.packageName || v.filePath || 'src/'}
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-400">{v.installedVersion || '-'}</td>
                  <td className="py-3 px-4 font-mono text-emerald-500 font-bold">{v.fixedVersion || 'N/A'}</td>
                  <td className="py-3 px-4">
                    <span className="font-mono text-[10px] text-slate-400 bg-slate-100 dark:bg-dark-bg px-2 py-0.5 rounded">
                      {v.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <select
                      value={v.status}
                      onChange={(e) => handleUpdateStatus(v.id, e.target.value)}
                      className="bg-transparent border border-slate-200 dark:border-dark-border rounded px-2 py-1 text-[11px] focus:outline-none"
                    >
                      <option value="OPEN">OPEN</option>
                      <option value="IN_REVIEW">IN_REVIEW</option>
                      <option value="RESOLVED">RESOLVED</option>
                      <option value="FALSE_POSITIVE">FALSE_POSITIVE</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

