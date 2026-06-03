import React, { useEffect } from 'react';
import { useStore } from './context/store';
import { Login } from './pages/Login';
import { Sidebar } from './components/layout/Sidebar';
import { Dashboard } from './pages/Dashboard';
import { Users } from './pages/Users';
import { Peers } from './pages/Peers';
import { Logs } from './pages/Logs';
import { Settings } from './pages/Settings';
import { ShieldCheck } from 'lucide-react';

const App: React.FC = () => {
  const { isAuthenticated, isCheckingAuth, checkAuth, currentTab } = useStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-obsidian-900 text-slate-100">
        <div className="flex flex-col items-center space-y-4">
          <div className="p-4 bg-accent-emerald/10 rounded-2xl border border-accent-emerald/20 animate-pulse">
            <ShieldCheck className="text-accent-emerald" size={48} />
          </div>
          <p className="text-sm font-semibold tracking-wider text-slate-400 uppercase animate-pulse">
            Verifying secure session credentials...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <div className="min-h-screen w-full bg-obsidian-900 text-slate-100 flex font-sans antialiased">
      {/* PERSISTENT SIDEBAR */}
      <Sidebar />

      {/* INTERACTIVE WORKSPACE VIEWPORT */}
      <main className="flex-1 p-10 overflow-y-auto max-h-screen">
        {currentTab === 'dashboard' && <Dashboard />}
        {currentTab === 'users' && <Users />}
        {currentTab === 'peers' && <Peers />}
        {currentTab === 'logs' && <Logs />}
        {currentTab === 'settings' && <Settings />}
      </main>
    </div>
  );
};

export default App;
