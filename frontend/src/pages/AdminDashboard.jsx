import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { toast } from 'react-toastify';
import GlassCard from '../components/GlassCard';
import StatusBadge from '../components/StatusBadge';
import Loader from '../components/Loader';
import { ShieldCheck, Activity, Users, Truck, AlertOctagon } from 'lucide-react';

const AdminDashboard = () => {
  const [requests, setRequests] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ active: 0, completed: 0, high: 0 });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [reqsRes, servsRes] = await Promise.all([
        api.get('/requests'),
        api.get('/services')
      ]);
      
      const allReqs = reqsRes.data;
      setRequests(allReqs);
      setServices(servsRes.data);

      setStats({
        active: allReqs.filter(r => !['COMPLETED'].includes(r.status)).length,
        completed: allReqs.filter(r => r.status === 'COMPLETED').length,
        high: allReqs.filter(r => r.priority === 'HIGH' && r.status !== 'COMPLETED').length
      });
    } catch (error) {
      toast.error('Failed to load command center data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader size="lg" />;

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3 mb-8">
        <div className="bg-red-500/20 p-2 rounded-lg">
          <ShieldCheck className="h-6 w-6 text-red-400" />
        </div>
        <h1 className="text-3xl font-bold text-white">Central Command</h1>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <GlassCard className="p-6 flex items-center justify-between border-blue-500/20">
          <div>
            <p className="text-slate-400 text-sm font-medium mb-1">Active Incidents</p>
            <p className="text-3xl font-bold text-white">{stats.active}</p>
          </div>
          <div className="h-12 w-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
            <Activity className="h-6 w-6 text-blue-400" />
          </div>
        </GlassCard>

        <GlassCard className="p-6 flex items-center justify-between border-red-500/20">
          <div>
            <p className="text-slate-400 text-sm font-medium mb-1">High Priority</p>
            <p className="text-3xl font-bold text-white">{stats.high}</p>
          </div>
          <div className="h-12 w-12 bg-red-500/20 rounded-xl flex items-center justify-center">
            <AlertOctagon className="h-6 w-6 text-red-400 animate-pulse" />
          </div>
        </GlassCard>

        <GlassCard className="p-6 flex items-center justify-between border-emerald-500/20">
          <div>
            <p className="text-slate-400 text-sm font-medium mb-1">Active Units</p>
            <p className="text-3xl font-bold text-white">{services.filter(s => !s.available).length} / {services.length}</p>
          </div>
          <div className="h-12 w-12 bg-emerald-500/20 rounded-xl flex items-center justify-center">
            <Truck className="h-6 w-6 text-emerald-400" />
          </div>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Main Feed */}
        <div className="xl:col-span-2">
          <GlassCard className="p-6">
            <h2 className="text-xl font-bold text-white mb-6">Global Incident Feed</h2>
            <div className="space-y-3">
              {requests.map(req => (
                <div key={req._id} className="p-4 bg-slate-900/50 border border-slate-700 rounded-xl flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between group">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <StatusBadge status={req.priority} />
                      <StatusBadge status={req.status} />
                      <span className="text-xs text-slate-500">{new Date(req.createdAt).toLocaleTimeString()}</span>
                    </div>
                    <p className="text-sm text-slate-300 font-medium mb-1">{req.description}</p>
                    <p className="text-xs text-slate-500">Reporter: {req.userId?.name || 'Unknown'}</p>
                  </div>
                  <div className="flex flex-col items-end space-y-2 min-w-[120px]">
                    <span className="text-xs font-medium px-2 py-1 bg-slate-800 rounded text-blue-400 uppercase">
                      {req.serviceType || 'PENDING'}
                    </span>
                    <Link to={`/requests/${req._id}`} className="text-xs font-medium text-white bg-slate-700 hover:bg-slate-600 px-3 py-1.5 rounded transition-colors w-full text-center">
                      View details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <GlassCard className="p-6">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center space-x-2">
              <Truck className="h-5 w-5 text-emerald-400" />
              <span>Unit Status</span>
            </h2>
            <div className="space-y-3">
              {services.map(srv => (
                <div key={srv._id} className="flex items-center justify-between p-3 bg-slate-900/50 border border-slate-700 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-slate-200">{srv.name}</p>
                    <p className="text-xs text-slate-500 uppercase">{srv.type}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="relative flex h-3 w-3">
                      {srv.available ? (
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      ) : null}
                      <span className={`relative inline-flex rounded-full h-3 w-3 ${srv.available ? 'bg-emerald-500' : 'bg-orange-500'}`}></span>
                    </span>
                    <span className="text-xs font-medium text-slate-400">
                      {srv.available ? 'Ready' : 'Dispatched'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
