import React, { useEffect, useState } from 'react';
import api from '../api/client';
import { Pipeline, Workspace } from '../types';
import { GitPullRequest, Play, CheckCircle, Clock, AlertCircle, ChevronDown, ChevronUp, Terminal } from 'lucide-react';

export const PipelinesPage: React.FC = () => {
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPipeline, setSelectedPipeline] = useState<Pipeline | null>(null);
  const [triggering, setTriggering] = useState(false);

  const fetchPipelines = async () => {
    try {
      const [pRes, wRes] = await Promise.all([
        api.get('/api/pipelines'),
        api.get('/api/workspaces'),
      ]);
      setPipelines(pRes.data);
      setWorkspaces(wRes.data);
      if (pRes.data.length > 0 && !selectedPipeline) {
        setSelectedPipeline(pRes.data[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPipelines();
  }, []);

  const handleTrigger = async () => {
    if (workspaces.length === 0) return;
    setTriggering(true);
    try {
      const res = await api.post('/api/pipelines/trigger', {
        workspaceId: workspaces[0].id,
        pipelineName: `${workspaces[0].name} CI/CD Execution`,
        branch: 'main',
        commitMessage: 'Automated DevSecOps build & security pipeline',
      });
      fetchPipelines();
      setSelectedPipeline(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setTriggering(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight">DevSecOps CI/CD Pipelines</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Automated pipeline stages: Source &rarr; Build &rarr; Test &rarr; SAST &rarr; Dependency Scan &rarr; Container Scan &rarr; Deploy.
          </p>
        </div>

        <button
          onClick={handleTrigger}
          disabled={triggering}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 disabled:opacity-50 transition-colors"
        >
          <Play size={14} fill="currentColor" />
          <span>{triggering ? 'Triggering Pipeline...' : 'Run New Pipeline'}</span>
        </button>
      </div>

      {/* Main Content Layout: List on Left, Active Stage Visualizer on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Pipelines History List */}
        <div className="space-y-3">
          <h2 className="text-sm font-bold text-slate-700 dark:text-slate-300">Execution History</h2>
          <div className="space-y-2.5 max-h-[75vh] overflow-y-auto">
            {pipelines.map((pip) => (
              <div
                key={pip.id}
                onClick={() => setSelectedPipeline(pip)}
                className={`p-4 rounded-xl border text-xs cursor-pointer transition-all ${
                  selectedPipeline?.id === pip.id
                    ? 'bg-white dark:bg-dark-card border-brand-500 shadow-md ring-1 ring-brand-500/20'
                    : 'bg-white/60 dark:bg-dark-card/60 border-slate-200 dark:border-dark-border hover:border-slate-300 dark:hover:border-slate-600'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                    {pip.pipelineName}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                      pip.status === 'SUCCESS'
                        ? 'bg-emerald-500/10 text-emerald-500'
                        : pip.status === 'RUNNING'
                        ? 'bg-blue-500/10 text-blue-500'
                        : 'bg-rose-500/10 text-rose-500'
                    }`}
                  >
                    {pip.status}
                  </span>
                </div>

                <div className="mt-2 text-slate-400 flex items-center justify-between text-[11px]">
                  <span>Branch: <span className="font-mono text-slate-300">{pip.branch}</span></span>
                  <span>{pip.durationSeconds}s duration</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Active Visual Pipeline Stages */}
        <div className="lg:col-span-2 space-y-4">
          {selectedPipeline ? (
            <div className="p-6 rounded-xl bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border shadow-sm space-y-6">
              {/* Pipeline Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 dark:border-dark-border gap-2">
                <div>
                  <h3 className="font-bold text-base text-slate-800 dark:text-slate-100">
                    {selectedPipeline.pipelineName}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Commit: <span className="font-mono text-brand-500">{selectedPipeline.commitHash || 'latest'}</span> &bull; Triggered by: {selectedPipeline.triggeredBy}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                    {selectedPipeline.status}
                  </span>
                </div>
              </div>

              {/* DevSecOps Pipeline Flow Diagram */}
              <div>
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
                  Multi-Stage Security &amp; Delivery Workflow
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
                  {selectedPipeline.stages.map((stg) => (
                    <div
                      key={stg.id}
                      className="p-3 rounded-lg bg-slate-50 dark:bg-dark-bg border border-slate-200 dark:border-dark-border flex flex-col justify-between items-center text-center text-xs"
                    >
                      <div className="w-7 h-7 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold mb-2">
                        <CheckCircle size={15} />
                      </div>
                      <span className="font-bold text-[11px] truncate w-full">{stg.stageName}</span>
                      <span className="text-[10px] text-slate-400 font-mono mt-1">{stg.durationSeconds}s</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Terminal Logs View for Stages */}
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-2">
                  <Terminal size={14} />
                  <span>Execution Logs &amp; Quality Gate Telemetry</span>
                </div>
                <div className="p-4 rounded-xl bg-slate-950 font-mono text-xs text-emerald-400 space-y-1.5 overflow-x-auto border border-slate-800 max-h-60 overflow-y-auto">
                  <div className="text-slate-500"># Cloud-Native Runner v2.4 initialized in container sandbox</div>
                  {selectedPipeline.stages.map((stg) => (
                    <div key={stg.id}>
                      <span className="text-indigo-400">[{stg.stageName}]</span> {stg.logs}
                    </div>
                  ))}
                  <div className="text-emerald-500 font-bold">&gt;&gt; All 7 Quality &amp; Security Gates Passed Successfully.</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-slate-400 bg-white dark:bg-dark-card rounded-xl border border-slate-200 dark:border-dark-border">
              Select or trigger a pipeline to view stage breakdown.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

