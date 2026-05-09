import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard';
import RequestDetails from './pages/RequestDetails';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-slate-900 text-slate-200 font-sans selection:bg-blue-500/30">
          <Navbar />
          
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Protected User Routes */}
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <UserDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/requests/:id" 
                element={
                  <ProtectedRoute>
                    <RequestDetails />
                  </ProtectedRoute>
                } 
              />

              {/* Protected Admin Routes */}
              <Route 
                path="/admin" 
                element={
                  <ProtectedRoute adminOnly={true}>
                    <AdminDashboard />
                  </ProtectedRoute>
                } 
              />

              {/* Catch all */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>

        <ToastContainer
          position="bottom-right"
          theme="dark"
          toastClassName="bg-slate-800/90 backdrop-blur-md border border-slate-700 text-slate-200"
        />
      </Router>
    </AuthProvider>
  );
}

export default App;
