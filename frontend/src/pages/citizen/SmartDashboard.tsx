import React from 'react';
import { useAuthStore } from '../../store/authStore';
import { FarmerDashboard } from './FarmerDashboard';
import { StudentDashboard } from './StudentDashboard';
import { SeniorCitizenDashboard } from './SeniorCitizenDashboard';
import { Dashboard as DefaultDashboard } from './Dashboard';

export const SmartDashboard = () => {
  const user = useAuthStore(state => state.user);
  const userType = (user?.persona || localStorage.getItem('user_type') || '').toLowerCase();

  switch (userType) {
    case 'farmer':
      return <FarmerDashboard />;
    case 'student':
      return <StudentDashboard />;
    case 'senior':
      return <SeniorCitizenDashboard />;
    case 'citizen':
    default:
      return <DefaultDashboard />;
  }
};
