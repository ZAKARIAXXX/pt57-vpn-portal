import React, { useState, useEffect } from 'react';
import { useStore } from '../context/store';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Plus, Download, QrCode, Power, Trash, Key, FileCode, CheckCircle2, AlertTriangle } from 'lucide-react';

export const Peers: React.FC = () => {
  const { peers, users, currentUser, fetchPeers, fetchUsers, addPeer, togglePeerStatus, deletePeer } = useStore();
  const [isOpen, setIsOpen] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [selectedConf, setSelectedConf] = useState('');
  const [name, setName] = useState('');
  const [userId, setUserId] = useState('');
  const [allowedIPs, setAllowedIPs] = useState('10.8.0.5/32');
  
  // Credentials for one-time reveal
  const [newPeerCreds, setNewPeerCreds] = useState<{
    name: string;
    publicKey: string;
    privateKey: string;
    allowedIPs: string;
    configFile: string;
  } | null>(null);

  useEffect(() => {
    fetchPeers();
    fetchUsers();
  }, [fetchPeers, fetchUsers]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    const res = await addPeer({ name, userId, allowedIPs });
    if (res) {
      // Find public key from the newly fetched peers list
      const matchedPeer = useStore.getState().peers.find(p => p.name === name && p.allowedIPs === allowedIPs);
      setNewPeerCreds({
        name,
        publicKey: matchedPeer?.publicKey || 'Generated',
        privateKey: res.privateKey,
        allowedIPs,
        configFile: res.configFile,
      });
      setName('');
      setUserId('');
      setIsOpen(false);
      setSuccessOpen(true);
    }
  };

  const downloadConfig = async (peerId: string, peerName: string) => {
    try {
      const token = localStorage.getItem('pt57_token');
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const res = await fetch(`${API_URL}/peers/${peerId}/config`, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (res.ok) {
        const blob = await res.blob();
        const element = document.createElement("a");
        element.href = URL.createObjectURL(blob);
        element.download = `${peerName.toLowerCase().replace(/ /g, '_')}_wireguard.conf`;
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
      }
    } catch (err) {
      console.error('Failed to download config:', err);
    }
  };

  const downloadRawConfig = (peerName: string, configText: string) => {
    const element = document.createElement("a");
    const file = new Blob([configText], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${peerName.toLowerCase().replace(/ /g, '_')}_wireguard.conf`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // Only SUPER_ADMIN and ADMIN can configure peers
  const canModify = currentUser?.role === 'SUPER_ADMIN' || currentUser?.role === 'ADMIN';

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">WireGuard Devices</h2>
          <p className="text-slate-400 font-normal">Generate secure client certificates, monitor connections, and revoke keys instantly.</p>
        </div>
        {canModify && (
          <Button onClick={() => setIsOpen(true)} className="flex items-center gap-2">
            <Plus size={18} /> Provision Client Device
          </Button>
        )}
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
                  <span className="text-slate-300 font-mono text-xs truncate max-w-[180px]" title={p.publicKey}>
                    {p.publicKey}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-semibold">Dynamic Tx/Rx:</span>
                  <span className="text-slate-300">
                    {(p.txBytes / 1000000).toFixed(2)} MB / {(p.rxBytes / 1000000).toFixed(2)} MB
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-2 justify-end items-center pt-4 border-t border-white/5">
              {canModify && (
                <Button onClick={() => togglePeerStatus(p.id)} variant="ghost" className="p-2" title={p.isActive ? 'Revoke Peer Access' : 'Restore Peer Access'}>
                  <Power size={18} className={p.isActive ? 'text-accent-emerald' : 'text-slate-500'} />
                </Button>
              )}
              <Button onClick={() => { setSelectedConf(p.name); setQrOpen(true); }} variant="secondary" className="p-2" title="Show QR Code">
                <QrCode size={18} />
              </Button>
              <Button onClick={() => downloadConfig(p.id, p.name)} variant="secondary" className="p-2" title="Download Config File">
                <Download size={18} />
              </Button>
              {canModify && (
                <button onClick={() => deletePeer(p.id)} className="p-2 text-slate-500 hover:text-accent-ruby hover:bg-accent-ruby/5 rounded-lg transition-colors" title="Delete Peer">
                  <Trash size={18} />
                </button>
              )}
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
            <select value={userId} onChange={e => setUserId(e.target.value)} className="w-full bg-obsidian-800 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-accent-emerald mt-1" required>
              <option value="">-- Choose User --</option>
              {users.map(u => <option key={u.id} value={u.id}>{u.fullName} ({u.email})</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase">Allocate Tunnel IP</label>
            <input type="text" value={allowedIPs} onChange={e => setAllowedIPs(e.target.value)} className="w-full bg-obsidian-800 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-accent-emerald mt-1 font-mono" required />
          </div>
          <Button type="submit" className="w-full py-3 mt-4">Generate WireGuard Keys & Save</Button>
        </form>
      </Modal>

      {/* Provisioning Success Modal (One-time credentials reveal) */}
      <Modal isOpen={successOpen} onClose={() => setSuccessOpen(false)} title="Client Provisioned Successfully">
        {newPeerCreds && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 p-3 bg-accent-emerald/10 border border-accent-emerald/20 rounded-xl text-accent-emerald text-sm font-semibold">
              <CheckCircle2 size={18} />
              <span>WireGuard keys and parameters generated successfully.</span>
            </div>

            <div className="p-3 bg-accent-ruby/15 border border-accent-ruby/20 rounded-xl flex gap-3 text-xs text-accent-ruby">
              <AlertTriangle className="flex-shrink-0 mt-0.5" size={16} />
              <div>
                <span className="font-bold block uppercase tracking-wider mb-0.5">Security Notice</span>
                The private key shown below is <strong>never stored</strong> in the portal database. It will not be accessible once this window is closed. Please copy it or download the configuration file now.
              </div>
            </div>

            <div className="space-y-3 text-sm pt-2">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase">Device Name</span>
                <div className="p-2.5 bg-obsidian-800 border border-white/5 rounded-lg text-white font-medium mt-1">
                  {newPeerCreds.name}
                </div>
              </div>
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase">Allocated IP</span>
                <div className="p-2.5 bg-obsidian-800 border border-white/5 rounded-lg text-white font-mono mt-1">
                  {newPeerCreds.allowedIPs}
                </div>
              </div>
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase">Public Key</span>
                <div className="p-2.5 bg-obsidian-800 border border-white/5 rounded-lg text-slate-300 font-mono text-xs select-all mt-1 truncate">
                  {newPeerCreds.publicKey}
                </div>
              </div>
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase">Private Key</span>
                <div className="relative mt-1">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                    <Key size={14} />
                  </span>
                  <input
                    type="text"
                    value={newPeerCreds.privateKey}
                    readOnly
                    className="w-full bg-obsidian-800 border border-white/5 rounded-lg pl-9 pr-4 py-2.5 text-accent-ruby font-mono text-xs select-all"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-white/5">
              <Button onClick={() => downloadRawConfig(newPeerCreds.name, newPeerCreds.configFile)} className="flex-1 flex items-center justify-center gap-2 py-3">
                <FileCode size={18} /> Download .conf Profile
              </Button>
              <Button onClick={() => setSuccessOpen(false)} variant="secondary" className="px-6">
                Done
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* QR Code mock modal */}
      <Modal isOpen={qrOpen} onClose={() => setQrOpen(false)} title={`Mobile Config for ${selectedConf}`}>
        <div className="flex flex-col items-center py-6 text-center space-y-4">
          <div className="w-48 h-48 bg-white p-3 rounded-xl flex items-center justify-center">
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
