import React, { useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Users, Smartphone, Activity, Server, ArrowDownUp } from 'lucide-react';
import { useStore } from '../context/store';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const Dashboard: React.FC = () => {
  const { overviewStats, liveTraffic, fetchStats, fetchPeers, fetchUsers } = useStore();

  useEffect(() => {
    // Initial fetch
    fetchStats();
    fetchPeers();
    fetchUsers();

    // Poll for live stats and bandwidth graphs every 3 seconds
    const interval = setInterval(() => {
      fetchStats();
    }, 3000);

    return () => clearInterval(interval);
  }, [fetchStats, fetchPeers, fetchUsers]);

  // Utility to format bytes
  const formatBytes = (bytes: number) => {
    if (!bytes) return '0.00 MB';
    const mb = bytes / 1000000;
    if (mb >= 1000) {
      return `${(mb / 1000).toFixed(2)} GB`;
    }
    return `${mb.toFixed(2)} MB`;
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-white mb-2">Network Health</h2>
        <p className="text-slate-400">Real-time statistics of secure tunnels and system metrics.</p>
      </div>

      {/* Grid Rows stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card className="flex items-center gap-4">
          <div className="p-3 bg-accent-emerald/10 rounded-xl text-accent-emerald">
            <Server size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-400">VPN Core State</p>
            <h4 className="text-xl font-bold">{overviewStats?.vpnStatus || 'ACTIVE'}</h4>
          </div>
        </Card>
        <Card className="flex items-center gap-4">
          <div className="p-3 bg-accent-blue/10 rounded-xl text-accent-blue">
            <Activity size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-400">Active Tunnels</p>
            <h4 className="text-xl font-bold">
              {overviewStats?.activePeers ?? 0} / {overviewStats?.totalPeers ?? 0}
            </h4>
          </div>
        </Card>
        <Card className="flex items-center gap-4">
          <div className="p-3 bg-white/5 rounded-xl text-slate-300">
            <Smartphone size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-400">Configured Peers</p>
            <h4 className="text-xl font-bold">{overviewStats?.totalPeers ?? 0} Devices</h4>
          </div>
        </Card>
        <Card className="flex items-center gap-4">
          <div className="p-3 bg-accent-amber/10 rounded-xl text-accent-amber">
            <Users size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-400">Managed Accounts</p>
            <h4 className="text-xl font-bold">{overviewStats?.totalUsers ?? 0} Users</h4>
          </div>
        </Card>
        <Card className="flex items-center gap-4">
          <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-400">
            <ArrowDownUp size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-400">Total Network Data</p>
            <h4 className="text-xl font-bold text-indigo-300">
              {formatBytes((overviewStats?.totalTxBytes ?? 0) + (overviewStats?.totalRxBytes ?? 0))}
            </h4>
          </div>
        </Card>
      </div>

      {/* Real-time charting */}
      <Card>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-white">Live Bandwidth</h3>
          <span className="flex items-center gap-2 text-xs font-semibold text-accent-emerald uppercase bg-accent-emerald/10 px-3 py-1.5 rounded-full">
            <span className="w-2 h-2 rounded-full bg-accent-emerald animate-pulse" /> Live
          </span>
        </div>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-emerald-500/5 rounded-lg p-3 border border-emerald-500/10">
            <p className="text-xs text-slate-400 uppercase tracking-wider">Total Ingress</p>
            <p className="text-lg font-bold text-emerald-400">{formatBytes(overviewStats?.totalRxBytes ?? 0)}</p>
          </div>
          <div className="bg-blue-500/5 rounded-lg p-3 border border-blue-500/10">
            <p className="text-xs text-slate-400 uppercase tracking-wider">Total Egress</p>
            <p className="text-lg font-bold text-blue-400">{formatBytes(overviewStats?.totalTxBytes ?? 0)}</p>
          </div>
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
