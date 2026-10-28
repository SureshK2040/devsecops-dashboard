import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  Activity,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Bell,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  CircleHelp,
  CirclePlus,
  ClipboardList,
  Command,
  Filter,
  Gauge,
  LayoutDashboard,
  ListTodo,
  LoaderCircle,
  LogOut,
  Moon,
  MoreHorizontal,
  RefreshCw,
  Search,
  Settings,
  ShieldCheck,
  Sun,
  Target,
  Wifi,
  WifiOff,
  Zap,
} from "lucide-react";
import "./App.css";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8080";

const API_URL = `${API_BASE_URL}/api/tasks`;
const WORKSPACE_API_URL = `${API_BASE_URL}/api/workspaces`;

const navigation = [
  { label: "Overview", icon: LayoutDashboard },
  { label: "My Tasks", icon: ListTodo },
  { label: "Activity", icon: Activity },
];

const statusLabels = {
  TODO: "To do",
  IN_PROGRESS: "In progress",
  COMPLETED: "Completed",
  REVIEW: "In review",
};

function normalizeStatus(status) {
  return String(status || "TODO").toUpperCase().replaceAll(" ", "_");
}

function formatDate(date) {
  if (!date) return "No deadline";

  const parsed = new Date(`${date}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return date;

  return parsed.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function isOverdue(task) {
  if (!task.dueDate || normalizeStatus(task.status) === "COMPLETED") {
    return false;
  }

  const due = new Date(`${task.dueDate}T23:59:59`);
  return !Number.isNaN(due.getTime()) && due < new Date();
}

function getInitials(title) {
  return String(title || "T")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}

function App() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [activeNav, setActiveNav] = useState("Overview");
  const [dark, setDark] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  const [workspaces, setWorkspaces] = useState([]);
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState(
    () => localStorage.getItem("taskflow.workspaceId") || "",
  );
  const [workspaceLoading, setWorkspaceLoading] = useState(true);
  const [workspaceError, setWorkspaceError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function fetchWorkspaces() {
      setWorkspaceLoading(true);
      setWorkspaceError("");

      try {
        const response = await fetch(WORKSPACE_API_URL);

        if (!response.ok) {
          throw new Error(`Workspace API returned HTTP ${response.status}.`);
        }

        const data = await response.json();

        if (!Array.isArray(data)) {
          throw new Error("The workspace API returned an unexpected response.");
        }

        if (cancelled) return;

        setWorkspaces(data);

        const savedId = localStorage.getItem("taskflow.workspaceId");
        const savedWorkspaceExists = data.some(
          (workspace) => String(workspace.id) === String(savedId),
        );

        const nextId = savedWorkspaceExists
          ? String(savedId)
          : data.length > 0
            ? String(data[0].id)
            : "";

        setSelectedWorkspaceId(nextId);

        if (nextId) {
          localStorage.setItem("taskflow.workspaceId", nextId);
        } else {
          localStorage.removeItem("taskflow.workspaceId");
        }
      } catch (err) {
        if (!cancelled) {
          setWorkspaceError(
            err instanceof TypeError
              ? "Couldn't reach the workspace API. Check that Spring Boot is running and CORS is configured."
              : err.message || "Unable to load workspaces.",
          );
        }
      } finally {
        if (!cancelled) {
          setWorkspaceLoading(false);
        }
      }
    }

    fetchWorkspaces();

    return () => {
      cancelled = true;
    };
  }, []);

  const fetchTasks = useCallback(async () => {
    if (!selectedWorkspaceId) {
      setTasks([]);
      setLoading(false);
      setError("");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${API_URL}/workspace/${selectedWorkspaceId}`,
      );

      if (!response.ok) {
        throw new Error(`The server returned HTTP ${response.status}.`);
      }

      const data = await response.json();

      if (!Array.isArray(data)) {
        throw new Error("The task API returned an unexpected response.");
      }

      setTasks(data);
      setLastUpdated(new Date());
    } catch (err) {
      setError(
        err instanceof TypeError
          ? "We couldn't reach the task API. Check that Spring Boot is running and CORS is configured."
          : err.message || "Unable to load your tasks.",
      );
    } finally {
      setLoading(false);
    }
  }, [selectedWorkspaceId]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const counts = useMemo(() => {
    const completed = tasks.filter(
      (task) => normalizeStatus(task.status) === "COMPLETED",
    ).length;

    const inProgress = tasks.filter(
      (task) => normalizeStatus(task.status) === "IN_PROGRESS",
    ).length;

    const overdue = tasks.filter(isOverdue).length;

    return {
      total: tasks.length,
      completed,
      inProgress,
      overdue,
      todo: tasks.filter(
        (task) => normalizeStatus(task.status) === "TODO",
      ).length,
      completion: tasks.length
        ? Math.round((completed / tasks.length) * 100)
        : 0,
    };
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    const query = search.trim().toLowerCase();

    return tasks.filter((task) => {
      const matchesSearch = [
        task.title,
        task.description,
        task.priority,
        task.status,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query));

      const status = normalizeStatus(task.status);

      const matchesFilter =
        filter === "ALL" ||
        (filter === "OVERDUE" && isOverdue(task)) ||
        status === filter;

      return matchesSearch && matchesFilter;
    });
  }, [tasks, search, filter]);

  const statCards = [
    {
      label: "Total tasks",
      value: counts.total,
      icon: ClipboardList,
      tone: "violet",
      note: "Across your workspace",
    },
    {
      label: "In progress",
      value: counts.inProgress,
      icon: Zap,
      tone: "blue",
      note: "Work currently underway",
    },
    {
      label: "Completed",
      value: counts.completed,
      icon: CheckCircle2,
      tone: "green",
      note: `${counts.completion}% completion rate`,
    },
    {
      label: "Overdue",
      value: counts.overdue,
      icon: CalendarDays,
      tone: "orange",
      note: "Tasks past their deadline",
    },
  ];

  return (
    <div className={`app-shell ${dark ? "theme-dark" : ""}`}>
      <aside className="sidebar">
        <a className="brand" href="#overview" aria-label="TaskFlow home">
          <span className="brand-mark">
            <Zap size={21} strokeWidth={2.5} />
          </span>
          <span className="brand-name">
            taskflow<span>.</span>
          </span>
        </a>

        <div className="workspace-switcher">
          <div className="workspace-symbol">
            {(workspaces.find(
              (workspace) =>
                String(workspace.id) === String(selectedWorkspaceId),
            )?.name || "W")
              .charAt(0)
              .toUpperCase()}
          </div>

          <div className="workspace-copy">
            <span className="workspace-label">WORKSPACE</span>
            <select
              aria-label="Select workspace"
              value={selectedWorkspaceId}
              disabled={workspaceLoading || workspaces.length === 0}
              onChange={(event) => {
                const nextId = event.target.value;

                setSelectedWorkspaceId(nextId);
                localStorage.setItem("taskflow.workspaceId", nextId);
                setFilter("ALL");
                setSearch("");
              }}
            >
              {workspaces.length === 0 && (
                <option value="">
                  {workspaceLoading ? "Loading workspaces..." : "No workspaces"}
                </option>
              )}
              {workspaces.map((workspace) => (
                <option key={workspace.id} value={String(workspace.id)}>
                  {workspace.name}
                </option>
              ))}
            </select>

            {workspaceError && (
              <span
                className="workspace-error"
                title={workspaceError}
                role="status"
              >
                Workspace unavailable
              </span>
            )}
          </div>

          <ChevronDown size={16} className="muted-icon" />
        </div>

        <div className="nav-section">
          <p className="nav-heading">WORKSPACE</p>
          {navigation.map(({ label, icon: Icon }) => (
            <button
              key={label}
              className={`nav-item ${activeNav === label ? "active" : ""}`}
              onClick={() => setActiveNav(label)}
            >
              <Icon size={18} strokeWidth={1.8} />
              <span>{label}</span>
              {label === "My Tasks" && counts.inProgress > 0 && (
                <span className="nav-count">{counts.inProgress}</span>
              )}
            </button>
          ))}
        </div>

        <div className="nav-section">
          <p className="nav-heading">MANAGE</p>
          <button
            className={`nav-item ${filter === "TODO" ? "active" : ""}`}
            onClick={() => {
              setActiveNav("My Tasks");
              setFilter("TODO");
            }}
          >
            <Target size={18} strokeWidth={1.8} />
            <span>To do</span>
            <span className="nav-count">{counts.todo}</span>
          </button>
          <button
            className={`nav-item ${filter === "COMPLETED" ? "active" : ""}`}
            onClick={() => {
              setActiveNav("My Tasks");
              setFilter("COMPLETED");
            }}
          >
            <CheckCircle2 size={18} strokeWidth={1.8} />
            <span>Completed</span>
          </button>
        </div>

        <div className="sidebar-spacer" />

        <div className="sidebar-status">
          <div className="status-orbit">
            <ShieldCheck size={20} />
          </div>
          <div className="sidebar-status-copy">
            <strong>Your workspace</strong>
            <span>Stay focused. Ship faster.</span>
          </div>
          <ArrowUpRight size={16} className="muted-icon" />
        </div>

        <div className="sidebar-footer">
          <button className="nav-item" onClick={() => setDark(!dark)}>
            {dark ? <Sun size={18} /> : <Moon size={18} />}
            <span>{dark ? "Light appearance" : "Dark appearance"}</span>
          </button>
          <button className="nav-item" onClick={() => setActiveNav("Settings")}>
            <Settings size={18} />
            <span>Settings</span>
          </button>
          <div className="profile-row">
            <div className="profile-avatar">S</div>
            <div className="profile-copy">
              <strong>Workspace member</strong>
              <span>Developer</span>
            </div>
            <button
              className="icon-button profile-more"
              aria-label="Profile options"
              title="Profile options"
              onClick={() => setActiveNav("Settings")}
            >
              <MoreHorizontal size={19} />
            </button>
          </div>
        </div>
      </aside>

      <main className="main-panel">
        <header className="topbar">
          <div className="breadcrumbs">
            <span>Workspace</span>
            <span className="breadcrumb-slash">/</span>
            <strong>{activeNav}</strong>
          </div>

          <div className="topbar-actions">
            <label className="global-search">
              <Search size={17} />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search anything..."
                aria-label="Search tasks"
              />
              <kbd>
                <Command size={11} /> K
              </kbd>
            </label>

            <span className="topbar-divider" />

            <button
              className="icon-button"
              aria-label="Refresh tasks"
              title="Refresh tasks"
              onClick={fetchTasks}
              disabled={loading}
            >
              <RefreshCw size={18} className={loading ? "spin" : ""} />
            </button>

            <button
              className="icon-button notification-button"
              aria-label="Notifications"
              title="Notifications"
              onClick={() =>
                window.alert("You're all caught up with your notifications.")
              }
            >
              <Bell size={18} />
              <span />
            </button>

            <div className="topbar-avatar">S</div>
          </div>
        </header>

        <div className="page-content">
          <section className="welcome-section">
            <div>
              <div className="eyebrow">
                <span className="eyebrow-dot" />
                YOUR WORKSPACE, AT A GLANCE
              </div>
              <h1>
                {activeNav === "Overview" ? (
                  <>Make room for <span>great work.</span></>
                ) : (
                  <>{activeNav}<span>.</span></>
                )}
              </h1>
              <p>
                Your projects, priorities, and progress â€” all in one place.
              </p>
            </div>

            <button
              className="primary-button"
              onClick={() =>
                window.alert(
                  "Task creation will be connected to your Spring Boot API in the next step.",
                )
              }
            >
              <CirclePlus size={18} />
              New task
            </button>
          </section>

          <section className="connection-strip">
            <div className="connection-left">
              <span className={`connection-indicator ${error ? "offline" : ""}`}>
                {error ? <WifiOff size={15} /> : <Wifi size={15} />}
              </span>
              <div>
                <strong>{error ? "Backend connection issue" : "Task workspace"}</strong>
                <span>
                  {error
                    ? "Your tasks may not be up to date"
                    : loading
                      ? "Syncing your latest tasks..."
                      : "Connected to your task dashboard"}
                </span>
              </div>
            </div>
            <div className="sync-status">
              <span className={`sync-dot ${error ? "offline" : ""}`} />
              {error ? "Connection issue" : loading ? "Syncing" : "Live data"}
            </div>
          </section>

          <section className="stats-grid" aria-label="Task statistics">
            {statCards.map(({ label, value, icon: Icon, tone, note }, index) => (
              <motion.article
                key={label}
                className="stat-card"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.07, duration: 0.3 }}
              >
                <div className="stat-top">
                  <span className={`stat-icon ${tone}`}>
                    <Icon size={19} />
                  </span>
                  <button
                    className="stat-menu"
                    title={`Filter by ${label.toLowerCase()}`}
                    aria-label={`Filter by ${label.toLowerCase()}`}
                    onClick={() =>
                      setFilter(
                        label === "Completed"
                          ? "COMPLETED"
                          : label === "In progress"
                            ? "IN_PROGRESS"
                            : label === "Overdue"
                              ? "OVERDUE"
                              : "ALL",
                      )
                    }
                  >
                    <ArrowUpRight size={17} />
                  </button>
                </div>
                <p className="stat-label">{label}</p>
                <div className="stat-value-row">
                  <strong className="stat-value">{loading ? "â€”" : value}</strong>
                  {label === "Completed" && counts.total > 0 && (
                    <span className="stat-trend">
                      <ArrowUpRight size={14} /> {counts.completion}%
                    </span>
                  )}
                  {label === "Overdue" && value > 0 && (
                    <span className="stat-trend negative">
                      <ArrowDownRight size={14} /> Attention
                    </span>
                  )}
                </div>
                <span className="stat-note">{note}</span>
              </motion.article>
            ))}
          </section>

          <section className="progress-panel">
            <div className="progress-copy">
              <span className="progress-icon">
                <Gauge size={19} />
              </span>
              <div>
                <h2>Workspace progress</h2>
                <p>A quick look at how much work has been completed.</p>
              </div>
            </div>
            <div className="progress-visual">
              <div className="progress-track">
                <motion.div
                  className="progress-fill"
                  initial={{ width: 0 }}
                  animate={{ width: `${counts.completion}%` }}
                  transition={{ duration: 0.7, ease: "easeOut" }}
                />
              </div>
              <strong>{loading ? "â€”" : `${counts.completion}%`}</strong>
            </div>
          </section>

          <section className="tasks-panel">
            <div className="tasks-panel-heading">
              <div>
                <div className="section-title-row">
                  <h2>Tasks overview</h2>
                  <span className="live-label">
                    <span /> LIVE
                  </span>
                </div>
                <p>Keep your next move clear and your priorities in focus.</p>
              </div>
              <button
                className="secondary-button"
                onClick={fetchTasks}
                disabled={loading}
              >
                <RefreshCw size={15} className={loading ? "spin" : ""} />
                Refresh
              </button>
            </div>

            <div className="task-toolbar">
              <div className="filter-tabs" aria-label="Filter tasks">
                {[
                  ["ALL", "All tasks"],
                  ["TODO", "To do"],
                  ["IN_PROGRESS", "In progress"],
                  ["COMPLETED", "Completed"],
                  ["OVERDUE", "Overdue"],
                ].map(([value, label]) => (
                  <button
                    key={value}
                    className={`filter-tab ${filter === value ? "selected" : ""}`}
                    onClick={() => setFilter(value)}
                  >
                    {label}
                    {value === "ALL" && (
                      <span className="tab-count">{tasks.length}</span>
                    )}
                  </button>
                ))}
              </div>
              <button
                className="filter-button"
                onClick={() => setFilter("ALL")}
                title="Clear filters"
              >
                <Filter size={15} />
                Clear
              </button>
            </div>

            <div className="task-table-wrap">
              <div className="task-table-header">
                <span>Task</span>
                <span>Status</span>
                <span>Priority</span>
                <span>Due date</span>
                <span className="table-actions-heading"> </span>
              </div>

              {error && (
                <div className="inline-error">
                  <div className="error-symbol">
                    <WifiOff size={19} />
                  </div>
                  <div className="inline-error-copy">
                    <strong>Couldn't load your tasks</strong>
                    <p>{error}</p>
                    <button onClick={fetchTasks}>Try again <ArrowRight size={14} /></button>
                  </div>
                </div>
              )}

              {!error && loading && (
                <div className="loading-state">
                  {[1, 2, 3].map((item) => (
                    <div className="skeleton-row" key={item}>
                      <span className="skeleton-block" />
                      <span className="skeleton-pill" />
                      <span className="skeleton-pill short" />
                    </div>
                  ))}
                </div>
              )}

              {!error && !loading && filteredTasks.length === 0 && (
                <div className="empty-state">
                  <div className="empty-illustration">
                    {search ? <Search size={25} /> : <ClipboardList size={25} />}
                  </div>
                  <h3>{search ? "No matching tasks" : "A clean slate."}</h3>
                  <p>
                    {search
                      ? "Try another search term or clear your filters."
                      : "Your tasks will appear here as soon as they're available."}
                  </p>
                  {(search || filter !== "ALL") && (
                    <button
                      className="secondary-button"
                      onClick={() => {
                        setSearch("");
                        setFilter("ALL");
                      }}
                    >
                      Clear filters
                    </button>
                  )}
                </div>
              )}

              {!error && !loading && filteredTasks.length > 0 && (
                <AnimatePresence initial={false}>
                  {filteredTasks.map((task, index) => {
                    const status = normalizeStatus(task.status);
                    const priority = String(task.priority || "MEDIUM").toUpperCase();

                    return (
                      <motion.article
                        key={task.id}
                        className="task-row"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        transition={{ delay: index * 0.025, duration: 0.2 }}
                      >
                        <div className="task-cell">
                          <div className={`task-avatar avatar-${index % 4}`}>
                            {getInitials(task.title)}
                          </div>
                          <div className="task-name-copy">
                            <strong>{task.title || `Task #${task.id}`}</strong>
                            <span>
                              {task.description || `Task #${task.id}`}
                            </span>
                          </div>
                        </div>

                        <div className="task-cell">
                          <span className={`status-badge status-${status.toLowerCase()}`}>
                            <span className="status-badge-dot" />
                            {statusLabels[status] || status.replaceAll("_", " ")}
                          </span>
                        </div>

                        <div className="task-cell">
                          <span className={`priority-label priority-${priority.toLowerCase()}`}>
                            <span />
                            {priority}
                          </span>
                        </div>

                        <div className="task-cell due-cell">
                          <CalendarDays size={15} />
                          <span className={isOverdue(task) ? "overdue-date" : ""}>
                            {formatDate(task.dueDate)}
                          </span>
                        </div>

                        <div className="task-cell task-row-actions">
                          <button
                            className="icon-button row-more"
                            aria-label={`Details for ${task.title}`}
                            title={`Task #${task.id}`}
                            onClick={() =>
                              window.alert(
                                `Task #${task.id}\n\n${task.title}\n\n${task.description || "No description provided."}`,
                              )
                            }
                          >
                            <MoreHorizontal size={19} />
                          </button>
                        </div>
                      </motion.article>
                    );
                  })}
                </AnimatePresence>
              )}
            </div>

            <div className="tasks-panel-footer">
              <span>
                Showing <strong>{error || loading ? 0 : filteredTasks.length}</strong> of{" "}
                <strong>{tasks.length}</strong> tasks
              </span>
              <span className="footer-sync">
                <Check size={14} />
                {lastUpdated
                  ? `Synced at ${lastUpdated.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}`
                  : "Waiting for first sync"}
              </span>
            </div>
          </section>

          <footer className="app-footer">
            <span>Built for better workdays.</span>
            <span><CircleHelp size={14} /> TaskFlow workspace</span>
          </footer>
        </div>
      </main>
    </div>
  );
}

export default App;
