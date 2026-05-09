import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { Activity, ShieldAlert, Zap, Globe } from 'lucide-react';
import GlassCard from '../components/GlassCard';

const Landing = () => {
  const { user } = useAuth();

  if (user) {
    return <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace />;
  }

  return (
    <div className="min-h-[80vh] flex flex-col justify-center items-center relative">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-600/20 rounded-full blur-[100px] -z-10" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[100px] -z-10" />

      <div className="text-center max-w-3xl mb-16 animate-fade-in">
        <div className="flex justify-center mb-6">
          <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50">
            <ShieldAlert className="h-16 w-16 text-red-500 animate-pulse" />
          </div>
        </div>
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-6">
          <span className="text-white">Smart City</span>
          <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500">
            Emergency Dispatch
          </span>
        </h1>
        <p className="text-xl text-slate-400 mb-10 leading-relaxed">
          AI-powered classification, ultra-fast Haversine spatial allocation, and real-time coordination for modern emergency response units.
        </p>
        <div className="flex justify-center gap-4">
          <Link
            to="/register"
            className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-lg transition-all shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:shadow-[0_0_30px_rgba(37,99,235,0.6)] hover:-translate-y-1"
          >
            Get Started
          </Link>
          <Link
            to="/login"
            className="px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 rounded-xl font-bold text-lg transition-all hover:-translate-y-1"
          >
            Sign In
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">
        <GlassCard className="p-6 hover:-translate-y-1 transition-transform">
          <div className="bg-blue-500/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
            <Zap className="h-6 w-6 text-blue-400" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Instant Classification</h3>
          <p className="text-slate-400">
            Automated NLP routing immediately flags high-priority threats and dispatches appropriate forces.
          </p>
        </GlassCard>

        <GlassCard className="p-6 hover:-translate-y-1 transition-transform border-red-500/20">
          <div className="bg-red-500/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
            <Activity className="h-6 w-6 text-red-400" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Live Tracking</h3>
          <p className="text-slate-400">
            Monitor distress signals and assigned units in real-time through an interactive mission control.
          </p>
        </GlassCard>

        <GlassCard className="p-6 hover:-translate-y-1 transition-transform">
          <div className="bg-emerald-500/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
            <Globe className="h-6 w-6 text-emerald-400" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Spatial Allocation</h3>
          <p className="text-slate-400">
            Haversine geodesic algorithms guarantee that the closest available responder is assigned instantly.
          </p>
        </GlassCard>
      </div>
    </div>
  );
};

export default Landing;
