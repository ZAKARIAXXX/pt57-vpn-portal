import React, { useState, useEffect } from 'react';
import { useStore } from '../context/store';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Plus, Trash2, Key } from 'lucide-react';

export const Users: React.FC = () => {
  const { users, currentUser, fetchUsers, addUser, deleteUser } = useStore();
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'SUPER_ADMIN' | 'ADMIN' | 'AUDITOR'>('ADMIN');
  const [dept, setDept] = useState('Engineering');
  const [errorMsg, setErrorMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSubmitting(true);
    try {
      await addUser({ fullName: name, email, password, role, department: dept });
      setName('');
      setEmail('');
      setPassword('');
      setIsOpen(false);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to create user.');
    } finally {
      setSubmitting(false);
    }
  };

  // Only SUPER_ADMIN and ADMIN can create users
  const canModify = currentUser?.role === 'SUPER_ADMIN' || currentUser?.role === 'ADMIN';
  // Only SUPER_ADMIN can delete users
  const canDelete = currentUser?.role === 'SUPER_ADMIN';

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">User Accounts</h2>
          <p className="text-slate-400 font-normal">Manage dashboard administrative roles and VPN client groups.</p>
        </div>
        {canModify && (
          <Button onClick={() => { setErrorMsg(''); setIsOpen(true); }} className="flex items-center gap-2">
            <Plus size={18} /> Add Administrator
          </Button>
        )}
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
                {canDelete && <th className="px-6 py-4 font-semibold text-sm text-slate-400">Actions</th>}
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
                  <td className="px-6 py-4 text-slate-300">{u.peersCount || 0} Peers</td>
                  {canDelete && (
                    <td className="px-6 py-4">
                      {currentUser?.id !== u.id && (
                        <button onClick={() => deleteUser(u.id)} className="p-1.5 hover:bg-accent-ruby/15 hover:text-accent-ruby rounded-lg text-slate-500 transition-colors" title="Delete User">
                          <Trash2 size={18} />
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Create Portal User">
        <form onSubmit={handleAdd} className="space-y-4">
          {errorMsg && (
            <div className="p-3 bg-accent-ruby/10 border border-accent-ruby/20 rounded-lg text-accent-ruby text-xs font-medium">
              {errorMsg}
            </div>
          )}
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase">Full Name</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-obsidian-800 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-accent-emerald mt-1" required />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase">Email Address</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-obsidian-800 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-accent-emerald mt-1" required />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase">Initial Password</label>
            <div className="relative mt-1">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                <Key size={16} />
              </span>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-obsidian-800 border border-white/10 rounded-lg pl-10 pr-4 p-3 text-white focus:outline-none focus:border-accent-emerald" placeholder="Initial access credential" required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase">Authority Role</label>
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
          <Button type="submit" className="w-full py-3 mt-4" disabled={submitting}>
            {submitting ? 'Creating...' : 'Save User Account'}
          </Button>
        </form>
      </Modal>
    </div>
  );
};
