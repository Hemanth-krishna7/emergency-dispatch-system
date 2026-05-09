import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { toast } from 'react-toastify';
import GlassCard from '../components/GlassCard';
import StatusBadge from '../components/StatusBadge';
import Loader from '../components/Loader';
import { ArrowLeft, RefreshCw, MapPin, Truck, Clock, Info } from 'lucide-react';
import useAuth from '../hooks/useAuth';

const RequestDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isReassigning, setIsReassigning] = useState(false);

  useEffect(() => {
    fetchRequest();
  }, [id]);

  const fetchRequest = async () => {
    try {
      const res = await api.get(`/requests/${id}`);
      setRequest(res.data);
    } catch (error) {
      toast.error('Failed to load request details');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleReassign = async () => {
    setIsReassigning(true);
    try {
      const res = await api.post(`/requests/${id}/reassign`);
      setRequest(res.data);
      toast.success('Unit reassignment triggered successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Reassignment failed');
    } finally {
      setIsReassigning(false);
    }
  };

  if (loading) return <Loader size="lg" />;
  if (!request) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center space-x-2 text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Return</span>
      </button>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          Incident <span className="text-slate-500 text-xl font-mono">#{request._id.slice(-6)}</span>
        </h1>
        <div className="flex space-x-3">
          <StatusBadge status={request.priority} />
          <StatusBadge status={request.status} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
            <Info className="h-5 w-5 text-blue-400" />
            <span>Details</span>
          </h3>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-slate-400 mb-1">Description</p>
              <p className="text-slate-200 bg-slate-900/50 p-3 rounded-lg border border-slate-700">{request.description}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-slate-400 mb-1">Type Required</p>
                <p className="text-white font-medium uppercase">{request.serviceType || 'Pending classification'}</p>
              </div>
              <div>
                <p className="text-sm text-slate-400 mb-1">Reporter</p>
                <p className="text-white font-medium">{request.userId?.name || 'Unknown'}</p>
              </div>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
            <MapPin className="h-5 w-5 text-red-400" />
            <span>Location</span>
          </h3>
          <div className="space-y-4">
            {request.location?.address && (
              <div>
                <p className="text-sm text-slate-400 mb-1">Address</p>
                <p className="text-white">{request.location.address}</p>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-slate-400 mb-1">Longitude</p>
                <p className="text-slate-300 font-mono text-sm">{request.location?.coordinates[0]}</p>
              </div>
              <div>
                <p className="text-sm text-slate-400 mb-1">Latitude</p>
                <p className="text-slate-300 font-mono text-sm">{request.location?.coordinates[1]}</p>
              </div>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-6 md:col-span-2 border-emerald-500/20">
          <div className="flex justify-between items-start mb-6">
            <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
              <Truck className="h-5 w-5 text-emerald-400" />
              <span>Assigned Unit</span>
            </h3>
            
            {(user.role === 'admin' || user._id === request.userId?._id) && ['ASSIGNED', 'CLASSIFIED'].includes(request.status) && (
              <button 
                onClick={handleReassign}
                disabled={isReassigning}
                className="flex items-center space-x-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white border border-slate-600 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`h-4 w-4 ${isReassigning ? 'animate-spin' : ''}`} />
                <span>Force Reassign</span>
              </button>
            )}
          </div>

          {request.assignedService ? (
            <div className="flex items-center space-x-4 bg-slate-900/50 p-4 rounded-xl border border-slate-700">
              <div className="h-12 w-12 bg-emerald-500/20 rounded-full flex items-center justify-center border border-emerald-500/30">
                <Truck className="h-6 w-6 text-emerald-400" />
              </div>
              <div>
                <p className="text-lg font-bold text-white">{request.assignedService.name}</p>
                <p className="text-sm text-slate-400 uppercase tracking-wider">{request.assignedService.type}</p>
              </div>
              <div className="ml-auto text-right">
                <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 bg-orange-500/10 text-orange-400 border border-orange-500/20 rounded text-xs font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
                  <span>En Route</span>
                </span>
              </div>
            </div>
          ) : (
            <div className="text-center py-6 bg-slate-900/30 rounded-xl border border-slate-800 border-dashed">
              <Clock className="h-8 w-8 text-slate-500 mx-auto mb-2 opacity-50" />
              <p className="text-slate-400 font-medium">Awaiting unit assignment...</p>
              {request.retryCount > 0 && (
                <p className="text-xs text-red-400 mt-1">Reassignment attempts: {request.retryCount}</p>
              )}
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  );
};

export default RequestDetails;
