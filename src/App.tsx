import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DeveloperView } from './components/DeveloperView';
import { AdminView } from './components/AdminView';
import { LayoutDashboard } from 'lucide-react';

const queryClient = new QueryClient();

export default function App() {
  const [role, setRole] = useState<"developer" | "admin">("developer");

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-indigo-50/30 font-sans text-slate-900 selection:bg-blue-200">
  <nav className="bg-white/70 backdrop-blur-md border-b border-white/80 px-6 py-3 flex justify-between items-center sticky top-0 z-10 shadow-[0_4px_20px_rgb(0,0,0,0.03)]">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-1.5 rounded-lg">
              <LayoutDashboard className="text-white" size={20} />
            </div>
            <div className="font-bold text-lg text-slate-800 tracking-tight">Ascendra Workspaces</div>
          </div>
          
          <div className="flex items-center gap-3 text-sm font-medium text-slate-600">
            <span>Viewing as:</span>
            <select 
              value={role} 
              onChange={(e) => setRole(e.target.value as any)}
              className="bg-slate-50 border border-slate-200 text-slate-800 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow cursor-pointer"
            >
              <option value="developer">Developer</option>
              <option value="admin">DevOps Admin</option>
            </select>
          </div>
        </nav>
        <main className="pb-12">
          {role === "developer" ? <DeveloperView /> : <AdminView />}
        </main>
      </div>
    </QueryClientProvider>
  );
}
