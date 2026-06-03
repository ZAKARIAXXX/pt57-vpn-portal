# PT57 VPN Admin Portal Frontend Implementation Plan

> **For Antigravity:** REQUIRED WORKFLOW: Use `.agent/workflows/execute-plan.md` to execute this plan in single-flow mode.

**Goal:** Create a stunning, ultra-premium, dark-mode administration portal frontend inside `projectfe` for the PT57 Enterprise VPN Server using React, Vite, TypeScript, Tailwind CSS v3, Recharts, and Zustand mock-state.

**Architecture:** A lightweight, single-page application built on a monorepo structure. It uses Zustand to manage reactive frontend state (users, peers, active connections, and audit trails), mimicking backend responses dynamically to make it instantly ready for actual API integration.

**Tech Stack:** React 18, Vite, TypeScript, Tailwind CSS v3, Lucide React (icons), Zustand (state management), Recharts (data visualizations).

---

## Component Checklist

### Task 1: Scaffolding and Initial Setup
**Files:**
- Create: `C:\Users\HP\projectfe\package.json`
- Create: `C:\Users\HP\projectfe\vite.config.ts`

**Step 1: Check create-vite help options first**
Run command with `--help` flag to understand non-interactive setup constraints:
`npx -y create-vite@latest --help`

**Step 2: Scaffold Vite project in non-interactive mode**
Run: `npx -y create-vite@latest ./ --template react-ts` inside `C:\Users\HP\projectfe`

**Step 3: Run verify command**
Verify that `package.json` exists in `C:\Users\HP\projectfe`.

---

### Task 2: Install Package Dependencies
**Files:**
- Modify: `C:\Users\HP\projectfe\package.json`

**Step 1: Install core dependencies (Zustand, Lucide Icons, Recharts)**
Run: `npm install zustand lucide-react recharts`

**Step 2: Install dev dependencies (Tailwind CSS v3, PostCSS, Autoprefixer)**
Run: `npm install -D tailwindcss@3 postcss autoprefixer`

**Step 3: Initialize Tailwind config**
Run: `npx tailwindcss init -p`

**Step 4: Verify package installation**
Check `node_modules` and ensure all packages are registered in `package.json`.

---

### Task 3: Tailwind Config and Global Styling System
**Files:**
- Create: `C:\Users\HP\projectfe\tailwind.config.js`
- Create: `C:\Users\HP\projectfe\src\index.css`

**Step 1: Write Tailwind Config**
Configure template paths and premium dark-mode obsidian visual scheme in `C:\Users\HP\projectfe\tailwind.config.js`:
```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        obsidian: {
          900: '#0B0F19',
          800: '#111827',
          700: '#1F2937',
        },
        surface: {
          DEFAULT: '#161B26',
          light: '#232D3F',
        },
        accent: {
          emerald: '#10B981',
          blue: '#3B82F6',
          ruby: '#EF4444',
          amber: '#F59E0B',
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
```

**Step 2: Define CSS custom classes and keyframes**
Add backdrop blur utilities, Google Fonts imports, custom status pulse keyframes, and global scrolls in `C:\Users\HP\projectfe\src\index.css`:
```css
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    @apply bg-obsidian-900 text-slate-100 font-sans antialiased overflow-x-hidden;
  }
}

.glass-card {
  background: rgba(22, 27, 38, 0.65);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.pulse-glow {
  box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);
  }
  70% {
    transform: scale(1);
    box-shadow: 0 0 0 8px rgba(16, 185, 129, 0);
  }
  100% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(16, 185, 129, 0);
  }
}
```

**Step 3: Run verify command**
Verify styles build correctly by running a compilation command or checks.

---

### Task 4: Zustand State Store (Mocking Backend APIs)
**Files:**
- Create: `C:\Users\HP\projectfe\src\context\store.ts`

**Step 1: Write state schemas, mock databases, and getters/setters**
Implement stores for VPN Users, WireGuard Peers, logs, system resource usage, and auth credentials. Provide triggers for download configs, toggling status, creating peers, and updating stats dynamically:
```typescript
import { create } from 'zustand';

export interface UserItem {
  id: string;
  fullName: string;
  email: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'AUDITOR';
  department: string;
  peersCount: number;
}

export interface PeerItem {
  id: string;
  name: string;
  userName: string;
  publicKey: string;
  allowedIPs: string;
  endpoint?: string;
  isActive: boolean;
  lastHandshake?: string;
  txBytes: number;
  rxBytes: number;
}

export interface LogItem {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
}

interface AppState {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  isAuthenticated: boolean;
  login: (password: string) => boolean;
  logout: () => void;
  users: UserItem[];
  peers: PeerItem[];
  logs: LogItem[];
  addUser: (user: Omit<UserItem, 'id' | 'peersCount'>) => void;
  deleteUser: (id: string) => void;
  addPeer: (peer: Omit<PeerItem, 'id' | 'publicKey' | 'txBytes' | 'rxBytes'>) => void;
  togglePeerStatus: (id: string) => void;
  deletePeer: (id: string) => void;
}

export const useStore = create<AppState>((set, get) => ({
  currentTab: 'dashboard',
  setCurrentTab: (currentTab) => set({ currentTab }),
  isAuthenticated: false,
  login: (password) => {
    if (password === 'admin123') {
      set({ isAuthenticated: true });
      return true;
    }
    return false;
  },
  logout: () => set({ isAuthenticated: false }),
  users: [
    { id: '1', fullName: 'Alice Vance', email: 'alice@enterprise.com', role: 'SUPER_ADMIN', department: 'Engineering', peersCount: 2 },
    { id: '2', fullName: 'Bob Carter', email: 'bob@enterprise.com', role: 'ADMIN', department: 'IT Operations', peersCount: 1 },
    { id: '3', fullName: 'Charlie Davis', email: 'charlie@enterprise.com', role: 'AUDITOR', department: 'Security Audit', peersCount: 0 },
  ],
  peers: [
    { id: 'p1', name: 'MacBook Pro 16', userName: 'Alice Vance', publicKey: 'wg0+A2b8C...xYz19=', allowedIPs: '10.8.0.2/32', endpoint: '198.51.100.42:51820', isActive: true, lastHandshake: '2 minutes ago', txBytes: 4210984, rxBytes: 25489700 },
    { id: 'p2', name: 'iPhone 15', userName: 'Alice Vance', publicKey: 'wg0+K9m1X...tUv45=', allowedIPs: '10.8.0.3/32', endpoint: '198.51.100.42:61902', isActive: true, lastHandshake: '5 minutes ago', txBytes: 852044, rxBytes: 3125400 },
    { id: 'p3', name: 'Linux Server Backup', userName: 'Bob Carter', publicKey: 'wg0+Z6h2Y...qWp10=', allowedIPs: '10.8.0.4/32', isActive: false, txBytes: 0, rxBytes: 0 },
  ],
  logs: [
    { id: 'l1', timestamp: '2026-05-25 12:05:12', user: 'Alice Vance', action: 'Connected from 198.51.100.42', severity: 'INFO' },
    { id: 'l2', timestamp: '2026-05-25 11:42:01', user: 'Bob Carter', action: 'Generated Peer wg0+Z6h2Y...', severity: 'INFO' },
    { id: 'l3', timestamp: '2026-05-25 09:12:45', user: 'Charlie Davis', action: 'Failed Login Attempt from 203.0.113.8', severity: 'WARNING' },
  ],
  addUser: (u) => set((state) => ({
    users: [...state.users, { ...u, id: Date.now().toString(), peersCount: 0 }],
    logs: [{ id: Date.now().toString(), timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19), user: 'System', action: `Added User ${u.fullName}`, severity: 'INFO' }, ...state.logs]
  })),
  deleteUser: (id) => set((state) => ({
    users: state.users.filter(u => u.id !== id),
    logs: [{ id: Date.now().toString(), timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19), user: 'System', action: `Deleted User ID ${id}`, severity: 'WARNING' }, ...state.logs]
  })),
  addPeer: (p) => set((state) => {
    const pubKey = 'wg0+' + Math.random().toString(36).substring(2, 11).toUpperCase() + '...Key=';
    return {
      peers: [...state.peers, { ...p, id: Date.now().toString(), publicKey: pubKey, txBytes: 0, rxBytes: 0 }],
      users: state.users.map(u => u.fullName === p.userName ? { ...u, peersCount: u.peersCount + 1 } : u),
      logs: [{ id: Date.now().toString(), timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19), user: 'System', action: `Created Peer ${p.name} for ${p.userName}`, severity: 'INFO' }, ...state.logs]
    };
  }),
  togglePeerStatus: (id) => set((state) => {
    const peer = state.peers.find(p => p.id === id);
    const newStatus = peer ? !peer.isActive : false;
    return {
      peers: state.peers.map(p => p.id === id ? { ...p, isActive: newStatus, lastHandshake: newStatus ? 'Just now' : undefined } : p),
      logs: [{ id: Date.now().toString(), timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19), user: 'System', action: `${newStatus ? 'Activated' : 'Revoked'} Peer ID ${id}`, severity: newStatus ? 'INFO' : 'CRITICAL' }, ...state.logs]
    };
  }),
  deletePeer: (id) => set((state) => {
    const peer = state.peers.find(p => p.id === id);
    return {
      peers: state.peers.filter(p => p.id !== id),
      users: state.users.map(u => u.fullName === peer?.userName ? { ...u, peersCount: Math.max(0, u.peersCount - 1) } : u),
      logs: [{ id: Date.now().toString(), timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19), user: 'System', action: `Removed Peer ID ${id}`, severity: 'WARNING' }, ...state.logs]
    };
  })
}));
```

**Step 2: Verify Zustand script**
Import store in a dummy file to ensure TypeScript compilation without errors.

---

### Task 5: Core UI Atoms (Shadcn-style Buttons, Inputs, Tables)
**Files:**
- Create: `C:\Users\HP\projectfe\src\components\ui\Button.tsx`
- Create: `C:\Users\HP\projectfe\src\components\ui\Card.tsx`
- Create: `C:\Users\HP\projectfe\src\components\ui\Modal.tsx`

**Step 1: Write Buttons with interactive tailwind classes**
```typescript
// Button.tsx
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ variant = 'primary', children, className = '', ...props }) => {
  const baseStyle = "px-4 py-2 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-obsidian-900";
  const styles = {
    primary: "bg-accent-emerald text-obsidian-900 hover:bg-emerald-400 focus:ring-accent-emerald",
    secondary: "bg-white/10 text-white hover:bg-white/20 focus:ring-white/30",
    danger: "bg-accent-ruby text-white hover:bg-red-500 focus:ring-accent-ruby",
    ghost: "bg-transparent hover:bg-white/5 text-slate-300 hover:text-white"
  };
  return (
    <button className={`${baseStyle} ${styles[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};
```

**Step 2: Write premium Cards**
```typescript
// Card.tsx
import React from 'react';

export const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => {
  return (
    <div className={`glass-card p-6 rounded-xl hover:scale-[1.01] transition-transform duration-200 ${className}`}>
      {children}
    </div>
  );
};
```

**Step 3: Write Modal overlays**
```typescript
// Modal.tsx
import React from 'react';
import { X } from 'lucide-react';

export const Modal: React.FC<{ isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg glass-card border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-white/5 bg-white/[0.02]">
          <h3 className="text-xl font-semibold">{title}</h3>
          <button onClick={onClose} className="p-1.5 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white">
            <X size={20} />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};
```

**Step 4: Verify rendering of custom widgets**

---

### Task 6: Master Dashboard Portal Layout
**Files:**
- Create: `C:\Users\HP\projectfe\src\components\layout\Sidebar.tsx`

**Step 1: Write Sidebar widget and navigation items**
Implement sidebar with dynamic navigation hooks:
```typescript
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
```

**Step 2: Confirm navigation hooks click correctly**

---

### Task 7: Premium Login Portal
**Files:**
- Create: `C:\Users\HP\projectfe\src\pages\Login.tsx`

**Step 1: Write interactive login view with backdrop animated design**
```typescript
import React, { useState } from 'react';
import { ShieldCheck, Lock } from 'lucide-react';
import { useStore } from '../context/store';
import { Button } from '../components/ui/Button';

export const Login: React.FC = () => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useStore();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(false);
    
    setTimeout(() => {
      const success = login(password);
      setLoading(false);
      if (!success) {
        setError(true);
      }
    }, 800);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-obsidian-900 relative overflow-hidden">
      {/* Dynamic backdrop node design */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(16,185,129,0.08),rgba(255,255,255,0))]" />
      
      <div className="w-full max-w-md p-8 glass-card border border-white/5 rounded-2xl shadow-2xl relative z-10 animate-fade-in">
        <div className="flex flex-col items-center mb-8">
          <div className="p-4 bg-accent-emerald/10 rounded-2xl mb-4 border border-accent-emerald/20">
            <ShieldCheck className="text-accent-emerald" size={40} />
          </div>
          <h2 className="text-2xl font-bold text-white mb-1">Welcome to PT57</h2>
          <p className="text-slate-400 text-sm">Enter administrator password to connect</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Master Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                <Lock size={18} />
              </span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={`w-full bg-obsidian-800 border ${error ? 'border-accent-ruby' : 'border-white/10'} rounded-lg pl-10 pr-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-accent-emerald focus:ring-1 focus:ring-accent-emerald transition-colors`}
                required
              />
            </div>
            {error && <p className="text-xs text-accent-ruby font-medium mt-1">Invalid password. Hint: admin123</p>}
          </div>

          <Button type="submit" variant="primary" className="w-full py-3" disabled={loading}>
            {loading ? 'Authenticating...' : 'Establish Secure Connection'}
          </Button>
        </form>
      </div>
    </div>
  );
};
```

**Step 2: Test logins utilizing password "admin123" and incorrect logs**

---

### Task 8: Core Analytics Dashboard Page
**Files:**
- Create: `C:\Users\HP\projectfe\src\pages\Dashboard.tsx`

**Step 1: Write Dashboard view with Recharts graphs and vitals meters**
Configure charts and responsive status lists:
```typescript
import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Shield, Users, Smartphone, Activity, Server } from 'lucide-react';
import { useStore } from '../context/store';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const Dashboard: React.FC = () => {
  const { peers, users } = useStore();
  const [liveTraffic, setLiveTraffic] = useState<{ time: string; rx: number; tx: number }[]>([]);

  useEffect(() => {
    // Generate initial live graph sequence
    const data = [];
    for (let i = 12; i >= 0; i--) {
      data.push({
        time: `${i}s ago`,
        rx: Math.floor(Math.random() * 80) + 20,
        tx: Math.floor(Math.random() * 60) + 10,
      });
    }
    setLiveTraffic(data);

    const interval = setInterval(() => {
      setLiveTraffic(prev => [
        ...prev.slice(1),
        {
          time: 'now',
          rx: Math.floor(Math.random() * 80) + 20,
          tx: Math.floor(Math.random() * 60) + 10,
        }
      ].map((d, index, arr) => d.time === 'now' ? d : { ...d, time: `${arr.length - 1 - index}s ago` }));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const activePeers = peers.filter(p => p.isActive).length;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-white mb-2">Network Health</h2>
        <p className="text-slate-400">Real-time statistics of secure tunnels and system metrics.</p>
      </div>

      {/* Grid Rows stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="flex items-center gap-4">
          <div className="p-3 bg-accent-emerald/10 rounded-xl text-accent-emerald">
            <Server size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-400">VPN Core State</p>
            <h4 className="text-xl font-bold">ACTIVE</h4>
          </div>
        </Card>
        <Card className="flex items-center gap-4">
          <div className="p-3 bg-accent-blue/10 rounded-xl text-accent-blue">
            <Activity size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-400">Active Tunnels</p>
            <h4 className="text-xl font-bold">{activePeers} / {peers.length}</h4>
          </div>
        </Card>
        <Card className="flex items-center gap-4">
          <div className="p-3 bg-white/5 rounded-xl text-slate-300">
            <Smartphone size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-400">Configured Peers</p>
            <h4 className="text-xl font-bold">{peers.length} Devices</h4>
          </div>
        </Card>
        <Card className="flex items-center gap-4">
          <div className="p-3 bg-accent-amber/10 rounded-xl text-accent-amber">
            <Users size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-400">Managed Accounts</p>
            <h4 className="text-xl font-bold">{users.length} Users</h4>
          </div>
        </Card>
      </div>

      {/* Real-time charting */}
      <Card>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-white">Dynamic Port Ingress & Egress</h3>
          <span className="flex items-center gap-2 text-xs font-semibold text-accent-emerald uppercase bg-accent-emerald/10 px-3 py-1.5 rounded-full">
            <span className="w-2 h-2 rounded-full bg-accent-emerald animate-pulse" /> Live Metrics Feed
          </span>
        </div>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={liveTraffic} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRx" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorTx" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="time" stroke="#6B7280" style={{ fontSize: 12 }} />
              <YAxis stroke="#6B7280" style={{ fontSize: 12 }} unit=" Mbps" />
              <Tooltip contentStyle={{ background: '#161B26', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }} />
              <Area type="monotone" dataKey="rx" stroke="#10B981" fillOpacity={1} fill="url(#colorRx)" name="Ingress (Rx)" />
              <Area type="monotone" dataKey="tx" stroke="#3B82F6" fillOpacity={1} fill="url(#colorTx)" name="Egress (Tx)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
};
```

**Step 2: Verify dynamic charting loads and graphs dynamically every 2s**

---

### Task 9: Users Management Page
**Files:**
- Create: `C:\Users\HP\projectfe\src\pages\Users.tsx`

**Step 1: Write users list and department manager**
Include adding database user records dynamically with a form:
```typescript
import React, { useState } from 'react';
import { useStore } from '../context/store';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Plus, Trash2 } from 'lucide-react';

export const Users: React.FC = () => {
  const { users, addUser, deleteUser } = useStore();
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'SUPER_ADMIN' | 'ADMIN' | 'AUDITOR'>('ADMIN');
  const [dept, setDept] = useState('Engineering');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    addUser({ fullName: name, email, role, department: dept });
    setName('');
    setEmail('');
    setIsOpen(false);
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">User Accounts</h2>
          <p className="text-slate-400 font-normal">Manage dashboard administrative roles and VPN client groups.</p>
        </div>
        <Button onClick={() => setIsOpen(true)} className="flex items-center gap-2">
          <Plus size={18} /> Add Administrator
        </Button>
      </div>

      <Card className="overflow-hidden p-0 border border-white/5">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.01]">
                <th className="px-6 py-4 font-semibold text-sm text-slate-400">Full Name</th>
                <th className="px-6 py-4 font-semibold text-sm text-slate-400">Email Address</th>
                <th className="px-6 py-4 font-semibold text-sm text-slate-400">Authority Role</th>
                <th className="px-6 py-4 font-semibold text-sm text-slate-400">Department</th>
                <th className="px-6 py-4 font-semibold text-sm text-slate-400">Active Devices</th>
                <th className="px-6 py-4 font-semibold text-sm text-slate-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-white/[0.01] transition-colors">
                  <td className="px-6 py-4 font-medium text-white">{u.fullName}</td>
                  <td className="px-6 py-4 text-slate-300">{u.email}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                      u.role === 'SUPER_ADMIN' ? 'bg-accent-ruby/15 text-accent-ruby' :
                      u.role === 'ADMIN' ? 'bg-accent-blue/15 text-accent-blue' : 'bg-slate-400/15 text-slate-300'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-300">{u.department}</td>
                  <td className="px-6 py-4 text-slate-300">{u.peersCount} Peers</td>
                  <td className="px-6 py-4">
                    <button onClick={() => deleteUser(u.id)} className="p-1.5 hover:bg-accent-ruby/15 hover:text-accent-ruby rounded-lg text-slate-500 transition-colors">
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Create Portal User">
        <form onSubmit={handleAdd} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase">Full Name</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-obsidian-800 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-accent-emerald mt-1" required />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-obsidian-800 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-accent-emerald mt-1" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase">Role</label>
              <select value={role} onChange={e => setRole(e.target.value as any)} className="w-full bg-obsidian-800 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-accent-emerald mt-1">
                <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                <option value="ADMIN">ADMIN</option>
                <option value="AUDITOR">AUDITOR</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase">Department</label>
              <input type="text" value={dept} onChange={e => setDept(e.target.value)} className="w-full bg-obsidian-800 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-accent-emerald mt-1" required />
            </div>
          </div>
          <Button type="submit" className="w-full py-3 mt-4">Save User</Button>
        </form>
      </Modal>
    </div>
  );
};
```

**Step 2: Confirm adding and removing users correctly adjusts reactive state counter**

---

### Task 10: Devices & Peers Console Page
**Files:**
- Create: `C:\Users\HP\projectfe\src\pages\Peers.tsx`

**Step 1: Write card decks rendering active wireguard client configurations**
Enable generating config parameters, toggling active states, showing simulated QR code generators:
```typescript
import React, { useState } from 'react';
import { useStore } from '../context/store';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Plus, Download, QrCode, Power, Trash } from 'lucide-react';

export const Peers: React.FC = () => {
  const { peers, users, addPeer, togglePeerStatus, deletePeer } = useStore();
  const [isOpen, setIsOpen] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);
  const [selectedConf, setSelectedConf] = useState('');
  const [name, setName] = useState('');
  const [userName, setUserName] = useState('');
  const [allowedIPs, setAllowedIPs] = useState('10.8.0.5/32');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    addPeer({ name, userName, allowedIPs, isActive: true });
    setName('');
    setIsOpen(false);
  };

  const downloadConfig = (peerName: string, ip: string, pub: string) => {
    const config = `[Interface]\nPrivateKey = <CLIENT_PRIVATE_KEY>\nAddress = ${ip}\nDNS = 1.1.1.1\n\n[Peer]\nPublicKey = <SERVER_PUBLIC_KEY>\nEndpoint = vpn.enterprise.com:51820\nAllowedIPs = 0.0.0.0/0\nPersistentKeepalive = 25`;
    const element = document.createElement("a");
    const file = new Blob([config], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `${peerName.toLowerCase().replace(/ /g, '_')}_wireguard.conf`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">WireGuard Devices</h2>
          <p className="text-slate-400 font-normal">Generate secure client certificates, monitor connections, and revoke keys instantly.</p>
        </div>
        <Button onClick={() => setIsOpen(true)} className="flex items-center gap-2">
          <Plus size={18} /> Provision Client Device
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {peers.map(p => (
          <Card key={p.id} className={`relative flex flex-col justify-between h-72 border ${
            p.isActive ? 'border-white/5' : 'border-accent-ruby/25 bg-accent-ruby/[0.01]'
          }`}>
            <div>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="font-bold text-lg text-white">{p.name}</h4>
                  <p className="text-xs text-slate-400">User: {p.userName}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${p.isActive ? 'bg-accent-emerald animate-pulse' : 'bg-slate-500'}`} />
                  <span className="text-xs font-semibold uppercase text-slate-400">{p.isActive ? 'Secure' : 'Revoked'}</span>
                </div>
              </div>

              <div className="space-y-2.5 text-sm my-4">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-semibold">Allocated IP:</span>
                  <span className="text-slate-300 font-mono">{p.allowedIPs}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-semibold">Active Keys:</span>
                  <span className="text-slate-300 font-mono text-xs">{p.publicKey}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-semibold">Dynamic Tx/Rx:</span>
                  <span className="text-slate-300">{(p.txBytes / 1000000).toFixed(2)} MB / {(p.rxBytes / 1000000).toFixed(2)} MB</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2 justify-end items-center pt-4 border-t border-white/5">
              <Button onClick={() => togglePeerStatus(p.id)} variant="ghost" className="p-2" title={p.isActive ? 'Revoke Peer Access' : 'Restore Peer Access'}>
                <Power size={18} className={p.isActive ? 'text-accent-emerald' : 'text-slate-500'} />
              </Button>
              <Button onClick={() => { setSelectedConf(p.name); setQrOpen(true); }} variant="secondary" className="p-2" title="Show QR Code">
                <QrCode size={18} />
              </Button>
              <Button onClick={() => downloadConfig(p.name, p.allowedIPs, p.publicKey)} variant="secondary" className="p-2" title="Download Config File">
                <Download size={18} />
              </Button>
              <button onClick={() => deletePeer(p.id)} className="p-2 text-slate-500 hover:text-accent-ruby hover:bg-accent-ruby/5 rounded-lg transition-colors">
                <Trash size={18} />
              </button>
            </div>
          </Card>
        ))}
      </div>

      {/* Provision peer client modal */}
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Provision WireGuard Client">
        <form onSubmit={handleAdd} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase">Friendly Device Name</label>
            <input type="text" placeholder="e.g., Jane's iPad" value={name} onChange={e => setName(e.target.value)} className="w-full bg-obsidian-800 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-accent-emerald mt-1" required />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase">Associate with User</label>
            <select value={userName} onChange={e => setUserName(e.target.value)} className="w-full bg-obsidian-800 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-accent-emerald mt-1" required>
              <option value="">-- Choose User --</option>
              {users.map(u => <option key={u.id} value={u.fullName}>{u.fullName}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase">Allocate Tunnel IP</label>
            <input type="text" value={allowedIPs} onChange={e => setAllowedIPs(e.target.value)} className="w-full bg-obsidian-800 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-accent-emerald mt-1 font-mono" required />
          </div>
          <Button type="submit" className="w-full py-3 mt-4">Generate WireGuard Keys & Save</Button>
        </form>
      </Modal>

      {/* QR Code mock modal */}
      <Modal isOpen={qrOpen} onClose={() => setQrOpen(false)} title={`Mobile Config for ${selectedConf}`}>
        <div className="flex flex-col items-center py-6 text-center space-y-4">
          <div className="w-48 h-48 bg-white p-3 rounded-xl flex items-center justify-center">
            {/* Simple static representation of QR code */}
            <svg viewBox="0 0 100 100" className="w-full h-full text-black">
              <rect x="0" y="0" width="100" height="100" fill="white" />
              <rect x="10" y="10" width="30" height="30" fill="black" />
              <rect x="15" y="15" width="20" height="20" fill="white" />
              <rect x="18" y="18" width="14" height="14" fill="black" />
              <rect x="60" y="10" width="30" height="30" fill="black" />
              <rect x="65" y="15" width="20" height="20" fill="white" />
              <rect x="68" y="18" width="14" height="14" fill="black" />
              <rect x="10" y="60" width="30" height="30" fill="black" />
              <rect x="15" y="65" width="20" height="20" fill="white" />
              <rect x="60" y="60" width="15" height="15" fill="black" />
              <rect x="75" y="75" width="15" height="15" fill="black" />
              <rect x="60" y="80" width="10" height="10" fill="black" />
              <rect x="80" y="60" width="10" height="10" fill="black" />
            </svg>
          </div>
          <p className="text-sm text-slate-400 px-4">Scan this QR Code using the official iOS or Android WireGuard App to import tunnel credentials instantly.</p>
        </div>
      </Modal>
    </div>
  );
};
```

**Step 2: Confirm config downloads triggers client downloads and QR code renders**

---

### Task 11: Audit and Logging Console Page
**Files:**
- Create: `C:\Users\HP\projectfe\src\pages\Logs.tsx`

**Step 1: Write filter logs and live connection monitor view**
```typescript
import React, { useState } from 'react';
import { useStore } from '../context/store';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ShieldAlert, Info, AlertTriangle } from 'lucide-react';

export const Logs: React.FC = () => {
  const { logs } = useStore();
  const [filter, setFilter] = useState<'ALL' | 'INFO' | 'WARNING' | 'CRITICAL'>('ALL');

  const filteredLogs = logs.filter(l => filter === 'ALL' || l.severity === filter);

  const exportCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8,ID,Timestamp,User,Action,Severity\n" 
      + logs.map(l => `"${l.id}","${l.timestamp}","${l.user}","${l.action}","${l.severity}"`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "pt57_vpn_audit_logs.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Audit Logs</h2>
          <p className="text-slate-400 font-normal">Review administrator activities, dynamic peer handshake allocations, and security triggers.</p>
        </div>
        <Button onClick={exportCSV} variant="secondary">Export CSV Report</Button>
      </div>

      <div className="flex gap-2">
        {(['ALL', 'INFO', 'WARNING', 'CRITICAL'] as const).map(sev => (
          <button
            key={sev}
            onClick={() => setFilter(sev)}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              filter === sev ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {sev}
          </button>
        ))}
      </div>

      <Card className="p-0 overflow-hidden border border-white/5">
        <div className="divide-y divide-white/5">
          {filteredLogs.map(l => (
            <div key={l.id} className="p-4 flex gap-4 items-start hover:bg-white/[0.01] transition-colors">
              <div className="mt-1">
                {l.severity === 'CRITICAL' && <ShieldAlert className="text-accent-ruby" size={18} />}
                {l.severity === 'WARNING' && <AlertTriangle className="text-accent-amber" size={18} />}
                {l.severity === 'INFO' && <Info className="text-accent-blue" size={18} />}
              </div>
              <div className="flex-1 flex justify-between items-center text-sm">
                <div>
                  <span className="font-semibold text-white">{l.user}</span>
                  <span className="text-slate-400 ml-2 font-normal">{l.action}</span>
                </div>
                <span className="text-slate-500 font-mono text-xs">{l.timestamp}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
```

**Step 2: Test CSV export triggers properly**

---

### Task 12: System Settings and Server Variables Page
**Files:**
- Create: `C:\Users\HP\projectfe\src\pages\Settings.tsx`

**Step 1: Write static system configurations, key rotates and theme switches**
```typescript
import React from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

export const Settings: React.FC = () => {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-white mb-2">Portal Settings</h2>
        <p className="text-slate-400">Configure global enterprise networking and secure firewall presets.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="space-y-6">
          <h3 className="text-lg font-bold text-white border-b border-white/5 pb-4">WireGuard Core Network</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase">Server CIDR Subnet</label>
                <input type="text" value="10.8.0.1/24" className="w-full bg-obsidian-800 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-accent-emerald mt-1 font-mono text-sm" readOnly />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase">Server Endpoint Port</label>
                <input type="text" value="51820" className="w-full bg-obsidian-800 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-accent-emerald mt-1 font-mono text-sm" readOnly />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase">DNS Resolver Allocations</label>
              <input type="text" value="1.1.1.1, 8.8.8.8" className="w-full bg-obsidian-800 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-accent-emerald mt-1 font-mono text-sm" readOnly />
            </div>
            <div className="pt-2">
              <Button variant="secondary">Rotate Server Key pair</Button>
            </div>
          </div>
        </Card>

        <Card className="space-y-6">
          <h3 className="text-lg font-bold text-white border-b border-white/5 pb-4">Security Policies</h3>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase">Allowed Subnet Routing (AllowedIPs)</label>
              <input type="text" value="0.0.0.0/0, ::/0 (Full Tunneling Enabled)" className="w-full bg-obsidian-800 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-accent-emerald mt-1 font-mono text-sm" readOnly />
            </div>
            <div className="flex items-center justify-between border-t border-white/5 pt-4 mt-6">
              <div>
                <h4 className="text-sm font-semibold text-white">Strict Routing Isolation</h4>
                <p className="text-xs text-slate-400">Prevent client-to-client data leakage across peers.</p>
              </div>
              <input type="checkbox" defaultChecked className="w-4 h-4 text-accent-emerald bg-obsidian-800 border-white/10 rounded focus:ring-accent-emerald focus:ring-1" />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
```

**Step 2: Verify alignment and styling structures**

---

### Task 13: Core Assembler and Route Wireframe Setup
**Files:**
- Create: `C:\Users\HP\projectfe\src\App.tsx`
- Create: `C:\Users\HP\projectfe\src\main.tsx`

**Step 1: Write routing hooks, context bindings, and sidebar layouts in App.tsx**
Assemble auth states and dashboard structures in `C:\Users\HP\projectfe\src\App.tsx`:
```typescript
import React from 'react';
import { useStore } from './context/store';
import { Login } from './pages/Login';
import { Sidebar } from './components/layout/Sidebar';
import { Dashboard } from './pages/Dashboard';
import { Users } from './pages/Users';
import { Peers } from './pages/Peers';
import { Logs } from './pages/Logs';
import { Settings } from './pages/Settings';

const App: React.FC = () => {
  const { isAuthenticated, currentTab } = useStore();

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <div className="min-h-screen w-full bg-obsidian-900 text-slate-100 flex">
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
```

**Step 2: Bind App to index root**
```typescript
// main.tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

**Step 3: Run verify command**
Run the Dev build or validation:
`npm run dev` or `npm run build`
Expected: Compiles with 0 warnings.
