import React, { useEffect, useState } from 'react';
import api from '../api/client';
import { Workspace } from '../types';
import { FolderGit2, Plus, ExternalLink, Calendar, ShieldCheck, X } from 'lucide-react';

export const ProjectsPage: React.FC = () => {
  const [projects, setProjects] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [repositoryUrl, setRepositoryUrl] = useState('');

  const fetchProjects = async () => {
    try {
      const res = await api.get('/api/workspaces');
      setProjects(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/api/workspaces', {
        name,
        description,
        repositoryUrl,
        status: 'ACTIVE',
      });
      setModalOpen(false);
      setName('');
      setDescription('');
      setRepositoryUrl('');
      fetchProjects();
    } catch (err) {
      console.error('Failed to create project', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Workspaces & Projects</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Manage your Git repositories, microservices, and infrastructure workspaces.
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition-colors"
        >
          <Plus size={16} />
          <span>New Project</span>
        </button>
      </div>

      {/* Grid of Projects */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-44 rounded-xl bg-slate-200 dark:bg-dark-card border border-slate-200 dark:border-dark-border"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map((proj) => (
            <div
              key={proj.id}
              className="p-5 rounded-xl bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border shadow-sm flex flex-col justify-between hover:border-brand-500/50 transition-colors group"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-brand-500/10 text-brand-500 flex items-center justify-center">
                      <FolderGit2 size={18} />
                    </div>
                    <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 group-hover:text-brand-500 transition-colors">
                      {proj.name}
                    </h3>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-mono bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                    {proj.status}
                  </span>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 mt-3 line-clamp-2">
                  {proj.description || 'No description provided.'}
                </p>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 dark:border-dark-border flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1 text-[11px]">
                  <Calendar size={13} /> {new Date(proj.createdAt).toLocaleDateString()}
                </span>
                {proj.repositoryUrl && (
                  <a
                    href={proj.repositoryUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-brand-500 hover:underline"
                  >
                    <span>Repo</span>
                    <ExternalLink size={12} />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* New Project Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-base">Create New Project</h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-200">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-medium">Project Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Order Processing Service"
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-dark-bg border border-slate-200 dark:border-dark-border focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1 font-medium">Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Overview of this service..."
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-dark-bg border border-slate-200 dark:border-dark-border focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1 font-medium">Repository URL</label>
                <input
                  type="url"
                  value={repositoryUrl}
                  onChange={(e) => setRepositoryUrl(e.target.value)}
                  placeholder="https://github.com/org/repo"
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-dark-bg border border-slate-200 dark:border-dark-border focus:outline-none focus:ring-1 focus:ring-brand-500"
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
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

