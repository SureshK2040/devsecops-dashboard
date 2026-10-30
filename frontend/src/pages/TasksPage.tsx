import React, { useEffect, useState } from 'react';
import api from '../api/client';
import { Task, Workspace } from '../types';
import { Plus, CheckCircle, Clock, AlertTriangle, User, Calendar, X, Filter } from 'lucide-react';

const COLUMNS = [
  { id: 'TODO', label: 'To Do', color: 'border-slate-400' },
  { id: 'IN_PROGRESS', label: 'In Progress', color: 'border-blue-500' },
  { id: 'IN_REVIEW', label: 'In Review', color: 'border-amber-500' },
  { id: 'BLOCKED', label: 'Blocked', color: 'border-rose-500' },
  { id: 'DONE', label: 'Done', color: 'border-emerald-500' },
];

export const TasksPage: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [filterWorkspace, setFilterWorkspace] = useState<string>('');

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('TODO');
  const [priority, setPriority] = useState('MEDIUM');
  const [workspaceId, setWorkspaceId] = useState<number | ''>('');
  const [storyPoints, setStoryPoints] = useState(3);

  const fetchTasks = async () => {
    try {
      const [tRes, wRes] = await Promise.all([
        api.get('/api/tasks?all=true'),
        api.get('/api/workspaces'),
      ]);
      setTasks(tRes.data);
      setWorkspaces(wRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleStatusChange = async (taskId: number, newStatus: string) => {
    try {
      await api.patch(`/api/tasks/${taskId}/status`, { status: newStatus });
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, status: newStatus as any } : t))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/api/tasks', {
        title,
        description,
        status,
        priority,
        workspaceId: workspaceId ? Number(workspaceId) : null,
        storyPoints,
      });
      setModalOpen(false);
      setTitle('');
      setDescription('');
      fetchTasks();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredTasks = filterWorkspace
    ? tasks.filter((t) => t.workspace?.id === Number(filterWorkspace))
    : tasks;

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Engineering Tasks & Sprint Kanban</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Track agile user stories, DevSecOps vulnerabilities, and feature tickets across sprints.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Workspace Filter */}
          <div className="flex items-center gap-2 bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border px-3 py-1.5 rounded-lg text-xs">
            <Filter size={14} className="text-slate-400" />
            <select
              value={filterWorkspace}
              onChange={(e) => setFilterWorkspace(e.target.value)}
              className="bg-transparent border-none text-xs focus:outline-none"
            >
              <option value="">All Projects</option>
              {workspaces.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition-colors"
          >
            <Plus size={16} />
            <span>Create Task</span>
          </button>
        </div>
      </div>

      {/* Kanban Board Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 overflow-x-auto pb-4">
        {COLUMNS.map((col) => {
          const colTasks = filteredTasks.filter((t) => t.status === col.id);
          return (
            <div
              key={col.id}
              className="bg-slate-100/70 dark:bg-dark-card/60 border border-slate-200/80 dark:border-dark-border/80 rounded-xl p-3 flex flex-col min-w-[250px]"
            >
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200 dark:border-dark-border">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full border-2 ${col.color}`}></span>
                  <span className="font-bold text-xs uppercase tracking-wider">{col.label}</span>
                </div>
                <span className="text-[11px] font-semibold text-slate-400 px-1.5 py-0.5 rounded bg-slate-200 dark:bg-dark-hover">
                  {colTasks.length}
                </span>
              </div>

              {/* Tasks List within column */}
              <div className="space-y-3 flex-1 overflow-y-auto max-h-[70vh]">
                {colTasks.map((task) => (
                  <div
                    key={task.id}
                    className="p-3.5 rounded-lg bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border shadow-sm hover:border-brand-500/50 transition-all text-xs flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <span
                          className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${
                            task.priority === 'CRITICAL'
                              ? 'bg-rose-500/10 text-rose-500'
                              : task.priority === 'HIGH'
                              ? 'bg-amber-500/10 text-amber-500'
                              : 'bg-slate-200 dark:bg-slate-700 text-slate-400'
                          }`}
                        >
                          {task.priority}
                        </span>
                        {task.storyPoints ? (
                          <span className="text-[10px] font-mono text-slate-400 font-bold">
                            {task.storyPoints} pts
                          </span>
                        ) : null}
                      </div>

                      <h4 className="font-semibold text-slate-800 dark:text-slate-100 mt-2">
                        {task.title}
                      </h4>
                      {task.description && (
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                          {task.description}
                        </p>
                      )}
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-dark-border flex items-center justify-between text-slate-400 text-[10px]">
                      <span className="font-medium text-brand-500 truncate max-w-[120px]">
                        {task.workspace?.name || 'General'}
                      </span>
                      {/* Quick Move Status select */}
                      <select
                        value={task.status}
                        onChange={(e) => handleStatusChange(task.id, e.target.value)}
                        className="bg-transparent border border-slate-200 dark:border-dark-border rounded px-1.5 py-0.5 text-[10px] text-slate-400 focus:outline-none"
                      >
                        {COLUMNS.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Task Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-base">Create New Task</h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-200">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreateTask} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-medium">Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Implement OIDC token exchange"
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-dark-bg border border-slate-200 dark:border-dark-border focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Project</label>
                <select
                  value={workspaceId}
                  onChange={(e) => setWorkspaceId(e.target.value ? Number(e.target.value) : '')}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-dark-bg border border-slate-200 dark:border-dark-border focus:outline-none focus:ring-1 focus:ring-brand-500"
                >
                  <option value="">Select Project</option>
                  {workspaces.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-dark-bg border border-slate-200 dark:border-dark-border focus:outline-none focus:ring-1 focus:ring-brand-500"
                  >
                    {COLUMNS.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-dark-bg border border-slate-200 dark:border-dark-border focus:outline-none focus:ring-1 focus:ring-brand-500"
                  >
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                    <option value="CRITICAL">CRITICAL</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Story Pts</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={storyPoints}
                    onChange={(e) => setStoryPoints(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-dark-bg border border-slate-200 dark:border-dark-border focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Task scope and acceptance criteria..."
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
                  Save Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

