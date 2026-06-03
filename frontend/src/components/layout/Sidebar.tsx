import React from 'react';
import { LayoutDashboard, Users, Smartphone, ShieldCheck, FileText, Settings, LogOut } from 'lucide-react';
import { useStore } from '../../context/store';

export const Sidebar: React.FC = () => {
  const { currentTab, setCurrentTab, logout } = useStore();
  
  const menuItems = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
    { id: 'users', name: 'Users Management', icon: Users },
    { id: 'peers', name: 'Devices & Peers', icon: Smartphone },
    { id: 'logs', name: 'Audit & Connections', icon: FileText },
    { id: 'settings', name: 'Portal Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-obsidian-800 border-r border-white/5 min-h-screen flex flex-col justify-between p-6">
      <div>
        <div className="flex items-center gap-3 mb-10 px-2">
          <ShieldCheck className="text-accent-emerald" size={32} />
          <div>
            <h1 className="font-bold text-lg leading-tight tracking-wider text-white">PT57 VPN</h1>
            <p className="text-xs text-slate-400">Enterprise Admin Console</p>
          </div>
        </div>
        
        <nav className="space-y-1">
          {menuItems.map(item => {
            const Icon = item.icon;
            const active = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  active 
                    ? 'bg-accent-emerald text-obsidian-900 shadow-lg shadow-accent-emerald/10' 
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon size={18} />
                {item.name}
              </button>
            );
          })}
        </nav>
      </div>

      <div>
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-accent-ruby hover:bg-accent-ruby/5 rounded-lg text-sm font-medium transition-colors"
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </div>
    </aside>
  );
};
