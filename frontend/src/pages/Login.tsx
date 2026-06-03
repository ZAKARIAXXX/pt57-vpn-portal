import React, { useState } from 'react';
import { ShieldCheck, Lock, Mail } from 'lucide-react';
import { useStore } from '../context/store';
import { Button } from '../components/ui/Button';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('admin@enterprise.com');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(false);
    
    // Call the login endpoint
    const success = await login(email, password);
    setLoading(false);
    if (!success) {
      setError(true);
    }
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
          <p className="text-slate-400 text-sm">Enter administrator credentials to connect</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Email Address</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                <Mail size={18} />
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@enterprise.com"
                className={`w-full bg-obsidian-800 border ${error ? 'border-accent-ruby' : 'border-white/10'} rounded-lg pl-10 pr-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-accent-emerald focus:ring-1 focus:ring-accent-emerald transition-colors`}
                required
              />
            </div>
          </div>

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
            {error && <p className="text-xs text-accent-ruby font-medium mt-1">Invalid credentials. Hint: admin@enterprise.com / admin123</p>}
          </div>

          <Button type="submit" variant="primary" className="w-full py-3" disabled={loading}>
            {loading ? 'Authenticating...' : 'Establish Secure Connection'}
          </Button>
        </form>
      </div>
    </div>
  );
};
