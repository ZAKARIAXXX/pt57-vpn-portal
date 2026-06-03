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
