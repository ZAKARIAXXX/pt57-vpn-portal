import React, { useState, useEffect } from 'react';
import { useStore } from '../context/store';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ShieldAlert, Info, AlertTriangle } from 'lucide-react';

export const Logs: React.FC = () => {
  const { logs, fetchLogs } = useStore();
  const [filter, setFilter] = useState<'ALL' | 'INFO' | 'WARNING' | 'CRITICAL'>('ALL');

  useEffect(() => {
    fetchLogs(filter);
  }, [filter, fetchLogs]);

  const exportCSV = async () => {
    try {
      const token = localStorage.getItem('pt57_token');
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const res = await fetch(`${API_URL}/logs/export`, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (res.ok) {
        const blob = await res.blob();
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "pt57_vpn_audit_logs.csv";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (err) {
      console.error('Failed to export logs:', err);
    }
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
          {logs.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-500 font-medium">
              No audit logs recorded for this classification.
            </div>
          ) : (
            logs.map(l => (
              <div key={l.id} className="p-4 flex gap-4 items-start hover:bg-white/[0.01] transition-colors animate-fade-in">
                <div className="mt-1 flex-shrink-0">
                  {l.severity === 'CRITICAL' && <ShieldAlert className="text-accent-ruby" size={18} />}
                  {l.severity === 'WARNING' && <AlertTriangle className="text-accent-amber" size={18} />}
                  {l.severity === 'INFO' && <Info className="text-accent-blue" size={18} />}
                </div>
                <div className="flex-1 flex justify-between items-center text-sm">
                  <div>
                    <span className="font-semibold text-white">{l.user}</span>
                    <span className="text-slate-400 ml-2 font-normal">{l.action}</span>
                  </div>
                  <span className="text-slate-500 font-mono text-xs ml-4 flex-shrink-0">{l.timestamp}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
};
