import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export const AdminLayout = () => {
  const logout = useAuthStore(state => state.logout);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex">
      <aside className="w-64 bg-slate-900 text-white p-4 flex flex-col gap-2">
        <h2 className="text-xl font-bold mb-8 p-2">GramAI Admin</h2>
        <Link to="/admin/dashboard" className="p-2 rounded hover:bg-slate-800">Dashboard</Link>
        <Link to="/admin/users" className="p-2 rounded hover:bg-slate-800">Users</Link>
        <Link to="/admin/schemes" className="p-2 rounded hover:bg-slate-800">Schemes</Link>
        <button onClick={() => { logout(); navigate('/admin/login'); }} className="p-2 rounded hover:bg-danger text-left mt-auto">Logout</button>
      </aside>
      <main className="flex-1 p-6 bg-slate-50 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};
