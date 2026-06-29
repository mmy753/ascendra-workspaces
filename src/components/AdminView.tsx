import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchFleetMetrics, fetchAllVMs, fetchTemplates } from '../api/mockApi';
import { Server, Users, Activity, DollarSign, Search, AlertTriangle, Box } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const chartData = [
  { time: '00:00', cpu: 30, memory: 45 }, { time: '04:00', cpu: 25, memory: 40 },
  { time: '08:00', cpu: 65, memory: 70 }, { time: '12:00', cpu: 85, memory: 80 },
  { time: '16:00', cpu: 90, memory: 85 }, { time: '20:00', cpu: 45, memory: 55 },
];

export const AdminView = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'templates'>('overview');
  const [search, setSearch] = useState('');

  const { data: metrics, isLoading: metricsLoading } = useQuery({ queryKey: ['fleetMetrics'], queryFn: fetchFleetMetrics });
  const { data: vms } = useQuery({ queryKey: ['allVMs'], queryFn: fetchAllVMs });
  const { data: templates } = useQuery({ queryKey: ['templates'], queryFn: fetchTemplates });

  const filteredVms = vms?.filter(vm => vm.name.toLowerCase().includes(search.toLowerCase()) || vm.ownerId.toLowerCase().includes(search.toLowerCase()));

  if (metricsLoading) return <div className="p-8 flex justify-center text-slate-500 animate-pulse">Loading fleet data...</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Infrastructure Admin</h1>
          <p className="text-slate-500 text-sm mt-1">Global infrastructure health, utilization, and templates.</p>
        </div>
        <div className="flex bg-slate-200 p-1 rounded-lg">
          <button onClick={() => setActiveTab('overview')} className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${activeTab === 'overview' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-600 hover:text-slate-900'}`}>Fleet Overview</button>
          <button onClick={() => setActiveTab('templates')} className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${activeTab === 'templates' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-600 hover:text-slate-900'}`}>VM Templates</button>
        </div>
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <MetricCard icon={<Server />} title="Total VMs" value={metrics?.totalVms} subtext={`${metrics?.runningVms} currently running`} />
            <MetricCard icon={<Users />} title="Total Users" value={metrics?.totalUsers} subtext="Active this month" />
            <MetricCard icon={<Activity />} title="Avg CPU Utilization" value={`${metrics?.avgCpuUtilizationPercent}%`} subtext={`Peak: ${metrics?.peakCpuUtilizationPercent}%`} />
            <MetricCard icon={<DollarSign />} title="Projected Cost" value={`$${metrics?.projectedMonthlyCost.toLocaleString()}`} subtext={`MTD: $${metrics?.monthToDateCost.toLocaleString()}`} />
          </div>
          
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-80">
            <h3 className="text-sm font-bold text-slate-600 mb-4">Aggregate Fleet Utilization (Last 24h)</h3>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="time" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `${val}%`} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Area type="monotone" dataKey="cpu" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorCpu)" name="CPU Usage" />
                <Area type="monotone" dataKey="memory" stroke="#8b5cf6" strokeWidth={2} fillOpacity={0.1} fill="#8b5cf6" name="Memory Usage" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-800">VM Inventory</h3>
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" placeholder="Search by name or owner..." 
                  value={search} onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 pr-4 py-1.5 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <table className="w-full text-sm text-left text-slate-600">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3">VM Name</th>
                  <th className="px-6 py-3">Owner</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">CPU / RAM</th>
                  <th className="px-6 py-3">Alerts</th>
                </tr>
              </thead>
              <tbody>
                {filteredVms?.map((vm) => (
                  <tr key={vm.id} className="bg-white border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-6 py-4 font-medium text-slate-900">{vm.name}</td>
                    <td className="px-6 py-4">{vm.ownerId}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${vm.status === 'running' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'}`}>{vm.status}</span>
                    </td>
                    <td className="px-6 py-4">{vm.cpuUsagePercent}% / {vm.memoryUsagePercent}%</td>
                    <td className="px-6 py-4">
                      {vm.status === 'running' && vm.cpuUsagePercent < 5 && (
                        <span className="flex items-center gap-1 text-amber-600 text-xs font-medium bg-amber-50 px-2 py-1 rounded-md w-fit">
                          <AlertTriangle size={14} /> Idle 
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'templates' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {templates?.map((tpl) => (
            <div key={tpl.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Box size={20} /></div>
                <h3 className="font-bold text-slate-800">{tpl.name}</h3>
              </div>
              <p className="text-sm text-slate-500 mb-4">{tpl.description}</p>
              <div className="grid grid-cols-3 gap-2 text-sm text-slate-700">
                <div className="bg-slate-50 p-2 rounded text-center"><strong>{tpl.vCpu}</strong><br/><span className="text-xs text-slate-400">vCPU</span></div>
                <div className="bg-slate-50 p-2 rounded text-center"><strong>{tpl.memoryGb}GB</strong><br/><span className="text-xs text-slate-400">RAM</span></div>
                <div className="bg-slate-50 p-2 rounded text-center"><strong>{tpl.diskSizeGb}GB</strong><br/><span className="text-xs text-slate-400">Disk</span></div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const MetricCard = ({ icon, title, value, subtext }: any) => (
  <div className="bg-white/60 backdrop-blur-xl p-6 rounded-2xl border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 flex flex-col gap-3 group relative overflow-hidden">
    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-50/50 to-transparent rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
    <div className="flex items-center gap-3 text-slate-500 relative z-10">
      <div className="p-2.5 bg-white/80 rounded-xl border border-white shadow-sm text-blue-600">
        {React.cloneElement(icon, { size: 18, strokeWidth: 2.5 })}
      </div>
      <h3 className="text-sm font-semibold tracking-wide uppercase text-slate-500">{title}</h3>
    </div>
    <div className="relative z-10">
      <div className="text-4xl font-extrabold text-slate-800 tracking-tight">{value}</div>
      <div className="text-xs text-slate-500 mt-2 font-medium">{subtext}</div>
    </div>
  </div>
);