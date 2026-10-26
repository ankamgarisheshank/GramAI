import React from 'react';
import { OfficerApplications } from './OfficerApplications';

export const AdminPending: React.FC = () => {
  return <OfficerApplications initialStatus="SUBMITTED" pageTitle="Pending Applications" />;
};
