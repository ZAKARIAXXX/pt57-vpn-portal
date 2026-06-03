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
  userEmail?: string;
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

export interface OverviewStats {
  vpnStatus: string;
  totalUsers: number;
  totalPeers: number;
  activePeers: number;
  totalTxBytes: number;
  totalRxBytes: number;
}

export interface LiveTrafficPoint {
  time: string;
  rx: number;
  tx: number;
  timestamp?: number;
}

interface AppState {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  isAuthenticated: boolean;
  isCheckingAuth: boolean;
  currentUser: { id: string; email: string; fullName: string; role: string } | null;
  users: UserItem[];
  peers: PeerItem[];
  logs: LogItem[];
  overviewStats: OverviewStats | null;
  liveTraffic: LiveTrafficPoint[];

  checkAuth: () => Promise<void>;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;

  fetchUsers: () => Promise<void>;
  addUser: (user: Omit<UserItem, 'id' | 'peersCount'> & { password?: string }) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;

  fetchPeers: () => Promise<void>;
  addPeer: (peer: { name: string; userId: string; allowedIPs: string }) => Promise<{ privateKey: string; configFile: string } | null>;
  togglePeerStatus: (id: string) => Promise<void>;
  deletePeer: (id: string) => Promise<void>;

  fetchLogs: (severity?: string) => Promise<void>;
  fetchStats: () => Promise<void>;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getHeaders = () => {
  const token = localStorage.getItem('pt57_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const useStore = create<AppState>((set, get) => ({
  currentTab: 'dashboard',
  setCurrentTab: (currentTab) => set({ currentTab }),
  isAuthenticated: false,
  isCheckingAuth: true,
  currentUser: null,
  users: [],
  peers: [],
  logs: [],
  overviewStats: null,
  liveTraffic: [],

  checkAuth: async () => {
    set({ isCheckingAuth: true });
    const token = localStorage.getItem('pt57_token');
    if (!token) {
      set({ isAuthenticated: false, currentUser: null, isCheckingAuth: false });
      return;
    }
    try {
      const res = await fetch(`${API_URL}/auth/me`, {
        headers: getHeaders(),
      });
      if (res.ok) {
        const user = await res.json();
        set({ isAuthenticated: true, currentUser: user });
      } else {
        localStorage.removeItem('pt57_token');
        set({ isAuthenticated: false, currentUser: null });
      }
    } catch {
      localStorage.removeItem('pt57_token');
      set({ isAuthenticated: false, currentUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  login: async (email, password) => {
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('pt57_token', data.token);
        set({ isAuthenticated: true, currentUser: data.user, currentTab: 'dashboard' });
        // Fetch fresh data immediately
        get().fetchStats();
        get().fetchUsers();
        get().fetchPeers();
        get().fetchLogs();
        return true;
      }
      return false;
    } catch {
      return false;
    }
  },

  logout: async () => {
    try {
      await fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        headers: getHeaders(),
      });
    } catch {
      // Ignore network errors on logout
    }
    localStorage.removeItem('pt57_token');
    set({ isAuthenticated: false, currentUser: null, users: [], peers: [], logs: [], overviewStats: null, liveTraffic: [] });
  },

  fetchUsers: async () => {
    try {
      const res = await fetch(`${API_URL}/users`, { headers: getHeaders() });
      if (res.ok) {
        const data = await res.json();
        set({ users: data });
      }
    } catch (err) {
      console.error('Failed to fetch users:', err);
    }
  },

  addUser: async (u) => {
    try {
      const res = await fetch(`${API_URL}/users`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ ...u, password: u.password || 'user123' }),
      });
      if (res.ok) {
        await get().fetchUsers();
        await get().fetchLogs();
      } else {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to add user');
      }
    } catch (err) {
      console.error(err);
      throw err;
    }
  },

  deleteUser: async (id) => {
    try {
      const res = await fetch(`${API_URL}/users/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      if (res.ok) {
        await get().fetchUsers();
        await get().fetchPeers();
        await get().fetchLogs();
      }
    } catch (err) {
      console.error('Failed to delete user:', err);
    }
  },

  fetchPeers: async () => {
    try {
      const res = await fetch(`${API_URL}/peers`, { headers: getHeaders() });
      if (res.ok) {
        const data = await res.json();
        set({ peers: data });
      }
    } catch (err) {
      console.error('Failed to fetch peers:', err);
    }
  },

  addPeer: async (p) => {
    try {
      const res = await fetch(`${API_URL}/peers`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(p),
      });
      if (res.ok) {
        const data = await res.json();
        await get().fetchPeers();
        await get().fetchUsers();
        await get().fetchLogs();
        return { privateKey: data.privateKey, configFile: data.configFile };
      }
      return null;
    } catch (err) {
      console.error('Failed to add peer:', err);
      return null;
    }
  },

  togglePeerStatus: async (id) => {
    try {
      const res = await fetch(`${API_URL}/peers/${id}/status`, {
        method: 'PUT',
        headers: getHeaders(),
      });
      if (res.ok) {
        await get().fetchPeers();
        await get().fetchLogs();
      }
    } catch (err) {
      console.error('Failed to toggle peer status:', err);
    }
  },

  deletePeer: async (id) => {
    try {
      const res = await fetch(`${API_URL}/peers/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      if (res.ok) {
        await get().fetchPeers();
        await get().fetchUsers();
        await get().fetchLogs();
      }
    } catch (err) {
      console.error('Failed to delete peer:', err);
    }
  },

  fetchLogs: async (severity = 'ALL') => {
    try {
      const url = severity === 'ALL' ? `${API_URL}/logs` : `${API_URL}/logs?severity=${severity}`;
      const res = await fetch(url, { headers: getHeaders() });
      if (res.ok) {
        const data = await res.json();
        // Format dates nicely as YYYY-MM-DD HH:mm:ss
        const formatted = data.map((l: any) => ({
          id: l.id,
          timestamp: new Date(l.timestamp).toISOString().replace('T', ' ').substring(0, 19),
          user: l.user,
          action: l.action,
          severity: l.severity,
        }));
        set({ logs: formatted });
      }
    } catch (err) {
      console.error('Failed to fetch logs:', err);
    }
  },

  fetchStats: async () => {
    try {
      // 1. Fetch overview counts
      const resOverview = await fetch(`${API_URL}/stats/overview`, { headers: getHeaders() });
      if (resOverview.ok) {
        const overview = await resOverview.json();
        set({ overviewStats: overview });
      }

      // 2. Fetch traffic log series
      const resTraffic = await fetch(`${API_URL}/stats/traffic`, { headers: getHeaders() });
      if (resTraffic.ok) {
        const traffic = await resTraffic.json();
        set({ liveTraffic: traffic });
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  },
}));
