import React, { useEffect, useState } from 'react';
import api from '../api/client';
import { Notification } from '../types';
import { Bell, CheckCheck, Info, AlertTriangle, ShieldAlert } from 'lucide-react';

export const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/api/notifications');
      setNotifications(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id: number) => {
    try {
      await api.patch(`/api/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.post('/api/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight">System Alerts &amp; Notifications</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Security scan findings, pipeline completions, and task lifecycle alerts.
          </p>
        </div>

        <button
          onClick={handleMarkAllAsRead}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-dark-border hover:bg-slate-100 dark:hover:bg-dark-hover text-xs font-medium transition-colors"
        >
          <CheckCheck size={15} />
          <span>Mark all as read</span>
        </button>
      </div>

      {/* Notifications Feed */}
      <div className="space-y-3">
        {notifications.map((n) => (
          <div
            key={n.id}
            className={`p-4 rounded-xl border transition-colors flex items-start justify-between gap-4 ${
              n.isRead
                ? 'bg-white/40 dark:bg-dark-card/40 border-slate-200 dark:border-dark-border opacity-70'
                : 'bg-white dark:bg-dark-card border-brand-500/30 shadow-sm'
            }`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                  n.type.includes('SECURITY')
                    ? 'bg-rose-500/10 text-rose-500'
                    : n.type.includes('TASK')
                    ? 'bg-indigo-500/10 text-brand-500'
                    : 'bg-emerald-500/10 text-emerald-500'
                }`}
              >
                {n.type.includes('SECURITY') ? (
                  <ShieldAlert size={18} />
                ) : n.type.includes('TASK') ? (
                  <Info size={18} />
                ) : (
                  <Bell size={18} />
                )}
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100">{n.title}</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{n.message}</p>
                <span className="text-[10px] text-slate-400 mt-2 block font-mono">
                  {new Date(n.createdAt).toLocaleString()}
                </span>
              </div>
            </div>

            {!n.isRead && (
              <button
                onClick={() => handleMarkAsRead(n.id)}
                className="text-[11px] text-brand-500 hover:underline shrink-0"
              >
                Mark read
              </button>
            )}
          </div>
        ))}

        {notifications.length === 0 && (
          <p className="text-center text-slate-400 py-12 text-xs">No active notifications.</p>
        )}
      </div>
    </div>
  );
};

