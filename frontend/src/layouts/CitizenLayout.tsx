import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Mic } from 'lucide-react';

export const CitizenLayout = () => {
  const logout = useAuthStore(state => state.logout);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Mobile-first bottom nav could be added, using sidebar for now */}
      <aside className="w-full md:w-64 bg-surface shadow-md p-4 flex flex-col gap-4">
        <Link to="/dashboard" className="text-2xl font-bold text-primary mb-8">GramAI</Link>
        <Link to="/dashboard" className="p-3 rounded-lg hover:bg-slate-100 font-medium">Dashboard</Link>
        <Link to="/schemes" className="p-3 rounded-lg hover:bg-slate-100 font-medium">Schemes</Link>
        <Link to="/profile" className="p-3 rounded-lg hover:bg-slate-100 font-medium">Profile</Link>
        <button onClick={handleLogout} className="p-3 rounded-lg text-danger text-left font-medium mt-auto hover:bg-red-50">Logout</button>
      </aside>
      <main className="flex-1 p-6 relative">
        <Outlet />
        {/* Persistent Voice Assistant FAB */}
        <Link to="/voice" className="fixed bottom-6 right-6 bg-primary text-white p-4 rounded-full shadow-xl hover:bg-primary-hover flex items-center justify-center w-16 h-16 z-50">
          <Mic size={28} />
        </Link>
      </main>
    </div>
  );
};
