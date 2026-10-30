import React, { useEffect, useState } from 'react';
import api from '../api/client';
import { Deployment, Workspace } from '../types';
import { Rocket, CheckCircle2, Clock, Play, Server, X } from 'lucide-react';

export const DeploymentsPage: React.FC = () => {
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  // Form State
  const [workspaceId, setWorkspaceId] = useState<number | ''>('');
  const [environment, setEnvironment] = useState('PRODUCTION');
  const [version, setVersion] = useState('v1.5.0');

  const fetchDeployments = async () => {
    try {
      const [dRes, wRes] = await Promise.all([
        api.get('/api/deployments'),
        api.get('/api/workspaces'),
      ]);
      setDeployments(dRes.data);
      setWorkspaces(wRes.data);
      if (wRes.data.length > 0 && !workspaceId) {
        setWorkspaceId(wRes.data[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeployments();
  }, []);

  const handleDeploy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workspaceId) return;
    try {
      await api.post('/api/deployments', {
        workspaceId: Number(workspaceId),
        environment,
        version,
      });
      setModalOpen(false);
      fetchDeployments();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Multi-Environment Deployments</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Cloud-Native Kubernetes deployment release logs across DEV, STAGING, and PRODUCTION clusters.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition-colors"
        >
          <Rocket size={15} />
          <span>Deploy to Cluster</span>
        </button>
      </div>

      {/* Deployments Stream Table */}
      <div className="bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-dark-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Server size={18} className="text-brand-500" />
            <h3 className="font-bold text-sm">Deployment Release History</h3>
          </div>
          <span className="text-xs text-slate-400">{deployments.length} releases</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-dark-bg text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-dark-border">
              <tr>
                <th className="py-3 px-4">Environment</th>
                <th className="py-3 px-4">Project</th>
                <th className="py-3 px-4">Version</th>
                <th className="py-3 px-4">Commit</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Deployed By</th>
                <th className="py-3 px-4 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-dark-border">
              {deployments.map((d) => (
                <tr key={d.id} className="hover:bg-slate-50 dark:hover:bg-dark-hover transition-colors">
                  <td className="py-3 px-4">
                    <span
                      className={`px-2.5 py-0.5 rounded font-mono font-bold text-[10px] ${
                        d.environment === 'PRODUCTION'
                          ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                          : d.environment === 'STAGING'
                          ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                          : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                      }`}
                    >
                      {d.environment}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-800 dark:text-slate-200">
                    {d.workspace?.name || 'Service'}
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-brand-500">{d.version}</td>
                  <td className="py-3 px-4 font-mono text-slate-400">{d.commitHash || '8f12c3'}</td>
                  <td className="py-3 px-4">
                    <span className="flex items-center gap-1.5 text-emerald-500 font-semibold font-mono text-[11px]">
                      <CheckCircle2 size={13} /> {d.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">{d.deployedBy}</td>
                  <td className="py-3 px-4 text-right text-slate-400">
                    {new Date(d.startedAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Deploy Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-base">Deploy Service to Kubernetes</h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-200">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleDeploy} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-medium">Project</label>
                <select
                  value={workspaceId}
                  onChange={(e) => setWorkspaceId(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-dark-bg border border-slate-200 dark:border-dark-border focus:outline-none focus:ring-1 focus:ring-brand-500"
                >
                  {workspaces.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Target Environment</label>
                <select
                  value={environment}
                  onChange={(e) => setEnvironment(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-dark-bg border border-slate-200 dark:border-dark-border focus:outline-none focus:ring-1 focus:ring-brand-500"
                >
                  <option value="DEV">DEV (Internal Development)</option>
                  <option value="STAGING">STAGING (Pre-production)</option>
                  <option value="PRODUCTION">PRODUCTION (Live Traffic)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Image Version Tag</label>
                <input
                  type="text"
                  required
                  value={version}
                  onChange={(e) => setVersion(e.target.value)}
                  placeholder="v1.0.0"
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-dark-bg border border-slate-200 dark:border-dark-border focus:outline-none focus:ring-1 focus:ring-brand-500 font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-3.5 py-2 rounded-lg border border-slate-200 dark:border-dark-border hover:bg-slate-100 dark:hover:bg-dark-hover"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow"
                >
                  Initiate Deployment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

