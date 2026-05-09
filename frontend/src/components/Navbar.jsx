import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { ShieldAlert, LogOut, User, LayoutDashboard } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-50 w-full bg-slate-900/80 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2 group">
            <ShieldAlert className="h-8 w-8 text-red-500 group-hover:text-red-400 transition-colors" />
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-orange-400">
              Nexus Dispatch
            </span>
          </Link>

          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <Link
                  to={user.role === 'admin' ? '/admin' : '/dashboard'}
                  className="flex items-center space-x-1 text-slate-300 hover:text-white px-3 py-2 rounded-md transition-colors"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  <span>Dashboard</span>
                </Link>
                
                <div className="flex items-center space-x-3 pl-4 border-l border-slate-700">
                  <div className="flex items-center space-x-2">
                    <div className="bg-slate-800 p-1.5 rounded-full border border-slate-700">
                      <User className="h-4 w-4 text-slate-400" />
                    </div>
                    <span className="text-sm font-medium text-slate-300 hidden sm:block">
                      {user.name}
                    </span>
                  </div>
                  
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-1 text-red-400 hover:text-red-300 bg-red-400/10 hover:bg-red-400/20 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    <span className="text-sm font-medium hidden sm:block">Logout</span>
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-slate-300 hover:text-white px-3 py-2 font-medium transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-[0_0_15px_rgba(37,99,235,0.3)]"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
