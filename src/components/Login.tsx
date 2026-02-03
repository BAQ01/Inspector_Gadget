// src/components/Login.tsx
import { useState } from 'react';
import { supabase } from '../supabase';
import { Lock, Mail } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) alert(error.message);
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-sm">
        <div className="flex justify-center mb-6">
            <div className="bg-emerald-100 p-3 rounded-full">
                <Lock className="text-emerald-600" size={32} />
            </div>
        </div>
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Inloggen Inspectie</h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">E-mail</label>
            <div className="relative">
                <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
                <input 
                    type="email" 
                    required
                    className="w-full pl-10 p-2 border rounded" 
                    placeholder="naam@bedrijf.nl"
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                />
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Wachtwoord</label>
            <input 
                type="password" 
                required
                className="w-full p-2 border rounded" 
                placeholder="••••••••"
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
            />
          </div>
          <button disabled={loading} className="w-full bg-emerald-600 text-white py-2 rounded font-bold hover:bg-emerald-700 transition">
            {loading ? 'Laden...' : 'Inloggen'}
          </button>
        </form>
      </div>
    </div>
  );
}