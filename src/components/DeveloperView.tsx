import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Play, Square, Terminal, Globe, Cpu, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import { fetchMyVMs, toggleVmStatus } from '../api/mockApi';

export const DeveloperView = () => {
  const queryClient = useQueryClient();
  const [expandedVm, setExpandedVm] = useState<string | null>(null);
  const { data: vms, isLoading, error } = useQuery({ queryKey: ['myVMs'], queryFn: fetchMyVMs });

  const mutation = useMutation({
    mutationFn: ({ id, action }: { id: string, action: "start" | "stop" | "restart" }) => toggleVmStatus(id, action as any),
    onMutate: async ({ id, action }) => {
      await queryClient.cancelQueries({ queryKey: ['myVMs'] });
      const previousVMs = queryClient.getQueryData(['myVMs']);
      queryClient.setQueryData(['myVMs'], (old: any) => 
        old?.map((vm: any) => vm.id === id ? { ...vm, status: action === 'stop' ? 'stopping' : 'starting' } : vm)
      );
      return { previousVMs };
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['myVMs'] }),
  });

  if (isLoading) return <div className="p-8 flex justify-center text-slate-500 animate-pulse">Loading your workspaces...</div>;
  if (error) return <div className="p-8 text-red-500">Failed to load machines.</div>;

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Machines</h1>
          <p className="text-slate-500 text-sm mt-1">Manage and connect to your developer environments.</p>
        </div>
      </div>

      <div className="grid gap-4">
        {vms?.map((vm) => {
          const isBusy = vm.status === 'starting' || vm.status === 'stopping';
          const isExpanded = expandedVm === vm.id;

          return (
            <div key={vm.id} className="bg-white/60 backdrop-blur-xl border border-white/80 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 overflow-hidden">
              <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-6">
                
                {/* Header & Meta */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-slate-800">{vm.name}</h3>
                    <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full border flex items-center gap-1 ${
                      vm.status === 'running' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 
                      isBusy ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-slate-100 text-slate-600 border-slate-200'
                    }`}>
                      {isBusy && <RefreshCw size={12} className="animate-spin" />}
                      {vm.status.charAt(0).toUpperCase() + vm.status.slice(1)}
                    </span>
                  </div>
                  
                 <div className="flex items-center gap-4 text-xs text-slate-500 font-medium mt-1">
  <span className="flex items-center gap-1.5"><Globe size={14} className="text-slate-400"/> {vm.region}</span>
  <span className="flex items-center gap-1.5"><Cpu size={14} className="text-slate-400"/> {vm.templateId}</span>
  <span className="flex items-center gap-1.5 px-2 py-0.5 bg-slate-100/80 rounded border border-slate-200/60 font-mono text-[10px]">
    192.168.{Math.floor(Math.random() * 255)}.{Math.floor(Math.random() * 255)}
  </span>
</div>
                </div>
                <div className="flex-1 grid grid-cols-3 gap-4 w-full md:max-w-md">
                  <ResourceBar label="CPU" percent={vm.cpuUsagePercent} color="bg-blue-500" />
                  <ResourceBar label="RAM" percent={vm.memoryUsagePercent} color="bg-purple-500" />
                  <ResourceBar label="Disk" percent={vm.diskUsagePercent} color="bg-amber-500" />
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 border-t md:border-t-0 pt-4 md:pt-0">
                  <button 
                    className={`px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors ${
                      vm.status === 'running' ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm' : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    }`}
                    disabled={vm.status !== 'running'}
                  >
                    <Terminal size={16} /> IDE
                  </button>
                  
                  <div className="flex border border-slate-200 rounded-lg overflow-hidden shadow-sm">
                    <button 
                      onClick={() => mutation.mutate({ id: vm.id, action: vm.status === 'stopped' ? 'start' : 'stop' })} 
                      disabled={isBusy}
                      className="p-2 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition-colors"
                      title={vm.status === 'stopped' ? "Start" : "Stop"}
                    >
                      {vm.status === 'stopped' ? <Play size={18} className="text-emerald-600"/> : <Square size={18} className="text-red-600"/>}
                    </button>
                    <button 
                      onClick={() => mutation.mutate({ id: vm.id, action: 'restart' })} 
                      disabled={vm.status !== 'running' || isBusy}
                      className="p-2 bg-white text-slate-600 border-l border-slate-200 hover:bg-slate-50 disabled:opacity-50 transition-colors"
                      title="Restart"
                    >
                      <RefreshCw size={18} />
                    </button>
                  </div>
                  
                  <button onClick={() => setExpandedVm(isExpanded ? null : vm.id)} className="p-2 text-slate-400 hover:text-slate-600 ml-2">
                    {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </button>
                </div>
              </div>
              {isExpanded && (
                <div className="bg-slate-50 border-t border-slate-200 p-5 grid grid-cols-2 gap-6 animate-in slide-in-from-top-2">
                  <div>
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Machine Metadata</h4>
                    <div className="space-y-2 text-sm text-slate-700">
                      <div className="flex justify-between border-b border-slate-200 pb-1"><span>Created At:</span> <span>{new Date(vm.createdAt).toLocaleDateString()}</span></div>
                      <div className="flex justify-between border-b border-slate-200 pb-1"><span>Last Active:</span> <span>{new Date(vm.lastActiveAt).toLocaleString()}</span></div>
                      <div className="flex justify-between pb-1"><span>Hourly Cost:</span> <span className="font-medium text-emerald-600">${vm.hourlyCost}/hr</span></div>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Historical Usage (24h)</h4>
                    <div className="h-16 flex items-end gap-1 opacity-50">
                       {/* Mock Sparkline purely with CSS for speed */}
                      {[30, 45, 20, 60, 80, 50, 40, 90, 75, 40, 20, 10].map((h, i) => (
                        <div key={i} className="bg-blue-400 w-full rounded-t-sm" style={{ height: `${h}%` }}></div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const ResourceBar = ({ label, percent, color }: { label: string, percent: number, color: string }) => (
  <div className="flex flex-col gap-1.5 w-full">
    <div className="flex justify-between text-xs font-semibold text-slate-600">
      <span>{label}</span>
      <span>{percent}%</span>
    </div>
    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
      <div className={`h-full rounded-full ${color} transition-all duration-500`} style={{ width: `${percent}%` }} />
    </div>
  </div>
);