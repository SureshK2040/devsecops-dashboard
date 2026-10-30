import React, { useEffect, useState } from 'react';
import api from '../api/client';
import { AuditLog } from '../types';
import { History, Shield, Filter, Search } from 'lucide-react';

export const AuditPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState('');
  const [searchUser, setSearchUser] = useState('');

  const fetchLogs = async () => {
    try {
      let url = '/api/audit';
      if (actionFilter) {
        url += `?action=${actionFilter}`;
      } else if (searchUser) {
        url += `?username=${searchUser}`;
      }
      const res = await api.get(url);
      setLogs(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [actionFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchLogs();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Enterprise Audit &amp; Compliance Logs</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Immutable audit record of authentication, deployments, task state mutations, and access control actions.
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3">
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              value={searchUser}
              onChange={(e) => setSearchUser(e.target.value)}
              placeholder="Filter by username..."
              className="pl-8 pr-3 py-1.5 text-xs rounded-lg bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          </form>

          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-lg bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border focus:outline-none"
          >
            <option value="">All Actions</option>
            <option value="USER_LOGIN">USER_LOGIN</option>
            <option value="PROJECT_CREATED">PROJECT_CREATED</option>
            <option value="TASK_CREATED">TASK_CREATED</option>
            <option value="TASK_STATUS_CHANGED">TASK_STATUS_CHANGED</option>
            <option value="PIPELINE_TRIGGERED">PIPELINE_TRIGGERED</option>
            <option value="DEPLOYMENT_COMPLETED">DEPLOYMENT_COMPLETED</option>
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-dark-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History size={18} className="text-brand-500" />
            <h3 className="font-bold text-sm">Security &amp; Operational Audit Trail</h3>
          </div>
          <span className="text-xs text-slate-400">{logs.length} logged events</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-dark-bg text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-dark-border">
              <tr>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Entity</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4">IP Address</th>
                <th className="py-3 px-4 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-dark-border">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-dark-hover transition-colors">
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded font-mono font-bold text-[10px] bg-slate-100 dark:bg-dark-hover text-brand-500">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-800 dark:text-slate-200 font-mono">
                    {log.username}
                  </td>
                  <td className="py-3 px-4 text-slate-400">
                    {log.entityType} #{log.entityId}
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                    {log.description}
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-400 text-[11px]">
                    {log.ipAddress || '127.0.0.1'}
                  </td>
                  <td className="py-3 px-4 text-right text-slate-400 font-mono text-[11px]">
                    {new Date(log.timestamp).toLocaleString()}
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

