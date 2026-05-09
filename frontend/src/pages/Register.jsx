import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import GlassCard from '../components/GlassCard';
import { UserPlus, Mail, Lock, User } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'user' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const user = await register(formData);
      navigate(user.role === 'admin' ? '/admin' : '/dashboard');
    } catch (error) {
      // Handled in context
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-600/10 rounded-full blur-[120px] -z-10" />
      
      <GlassCard className="w-full max-w-md p-8 relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-500/20 blur-2xl rounded-full" />
        
        <div className="text-center mb-8 relative z-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-slate-800 border border-slate-700 mb-4">
            <UserPlus className="h-8 w-8 text-emerald-400" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">Request Clearance</h2>
          <p className="text-slate-400">Join the Nexus Dispatch Network</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Full Name</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-slate-500" />
              </div>
              <input type="text" required name="name" value={formData.name} onChange={handleChange}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                placeholder="John Doe" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-slate-500" />
              </div>
              <input type="email" required name="email" value={formData.email} onChange={handleChange}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                placeholder="operator@nexus.gov" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-slate-500" />
              </div>
              <input type="password" required name="password" value={formData.password} onChange={handleChange}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                placeholder="••••••••" />
            </div>
          </div>

          <div className="pt-2">
            <button type="submit" disabled={isSubmitting}
              className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-medium shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all flex items-center justify-center disabled:opacity-70"
            >
              {isSubmitting ? <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Submit Credentials'}
            </button>
          </div>
        </form>

        <p className="mt-6 text-center text-slate-400 text-sm">
          Already authorized?{' '}
          <Link to="/login" className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors">
            Access Terminal
          </Link>
        </p>
      </GlassCard>
    </div>
  );
};

export default Register;
