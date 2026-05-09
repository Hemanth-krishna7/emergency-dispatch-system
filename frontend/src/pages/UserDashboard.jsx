import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { toast } from 'react-toastify';
import GlassCard from '../components/GlassCard';
import StatusBadge from '../components/StatusBadge';
import Loader from '../components/Loader';
import { AlertTriangle, MapPin, Send, History } from 'lucide-react';

const UserDashboard = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ description: '', lat: '', lng: '', address: '' });

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await api.get('/requests');
      setRequests(res.data);
    } catch (error) {
      toast.error('Failed to fetch your requests');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        description: formData.description,
        location: {
          coordinates: [parseFloat(formData.lng), parseFloat(formData.lat)],
          address: formData.address
        }
      };
      const res = await api.post('/requests', payload);
      setRequests([res.data, ...requests]);
      setFormData({ description: '', lat: '', lng: '', address: '' });
      toast.success('Emergency broadcast transmitted successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to transmit emergency');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3 mb-8">
        <div className="bg-blue-500/20 p-2 rounded-lg">
          <AlertTriangle className="h-6 w-6 text-blue-400" />
        </div>
        <h1 className="text-3xl font-bold text-white">Operator Console</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Submit Form */}
        <div className="lg:col-span-1 space-y-6">
          <GlassCard className="p-6 border-red-500/30 shadow-[0_0_30px_rgba(239,68,68,0.1)] relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
              <AlertTriangle className="w-32 h-32 text-red-500" />
            </div>
            
            <h2 className="text-xl font-bold text-white mb-6 flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span>Broadcast Emergency</span>
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Incident Description</label>
                <textarea required rows={4} value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 resize-none transition-all"
                  placeholder="Describe the emergency in detail..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Latitude</label>
                  <input type="number" step="any" required value={formData.lat} onChange={(e) => setFormData({...formData, lat: e.target.value})}
                    className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all" placeholder="34.0522" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Longitude</label>
                  <input type="number" step="any" required value={formData.lng} onChange={(e) => setFormData({...formData, lng: e.target.value})}
                    className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all" placeholder="-118.2437" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Address (Optional)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MapPin className="h-4 w-4 text-slate-500" />
                  </div>
                  <input type="text" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})}
                    className="w-full pl-9 pr-4 py-2 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all" placeholder="123 Main St" />
                </div>
              </div>

              <button type="submit" disabled={isSubmitting}
                className="w-full py-3 px-4 mt-2 bg-red-600 hover:bg-red-500 text-white rounded-xl font-medium shadow-[0_0_15px_rgba(239,68,68,0.3)] transition-all flex items-center justify-center space-x-2 disabled:opacity-70"
              >
                {isSubmitting ? (
                  <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    <span>Initiate Dispatch</span>
                  </>
                )}
              </button>
            </form>
          </GlassCard>
        </div>

        {/* History */}
        <div className="lg:col-span-2">
          <GlassCard className="p-6 h-full flex flex-col">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center space-x-2">
              <History className="h-5 w-5 text-blue-400" />
              <span>Recent Transmissions</span>
            </h2>

            {loading ? (
              <Loader />
            ) : requests.length > 0 ? (
              <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar flex-1">
                {requests.map((req) => (
                  <Link key={req._id} to={`/requests/${req._id}`} className="block">
                    <div className="p-4 bg-slate-900/50 border border-slate-700 hover:border-slate-500 rounded-xl transition-all hover:bg-slate-800/80 group">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex space-x-2">
                          <StatusBadge status={req.status} />
                          {req.priority && <StatusBadge status={req.priority} />}
                        </div>
                        <span className="text-xs text-slate-500">{new Date(req.createdAt).toLocaleString()}</span>
                      </div>
                      <p className="text-slate-300 text-sm line-clamp-2 mb-3">
                        {req.description}
                      </p>
                      <div className="flex items-center justify-between text-xs font-medium">
                        <span className="text-slate-400">
                          Type: <span className="text-blue-400 uppercase">{req.serviceType || 'Pending'}</span>
                        </span>
                        <span className="text-slate-400">
                          Service: <span className={req.assignedService ? 'text-emerald-400' : 'text-orange-400'}>
                            {req.assignedService ? req.assignedService.name : 'Unassigned'}
                          </span>
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-500 space-y-4">
                <History className="h-12 w-12 opacity-20" />
                <p>No recent transmissions found.</p>
              </div>
            )}
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
