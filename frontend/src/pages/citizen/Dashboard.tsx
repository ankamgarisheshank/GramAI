import React from 'react';
import { useAuthStore } from '../../store/authStore';
import { Card } from '../../components/ui/Card';

export const Dashboard = () => {
  const user = useAuthStore(state => state.user);
  
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Namaskaram, {user?.name || 'Citizen'}</h1>
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <h2 className="text-xl font-semibold mb-2">My Saved Schemes</h2>
          <p className="text-slate-500">You have 0 saved schemes.</p>
        </Card>
        <Card>
          <h2 className="text-xl font-semibold mb-2">Profile Status</h2>
          <p className="text-warning font-medium">Incomplete. Complete your profile for better AI matching.</p>
        </Card>
      </div>
    </div>
  );
};
