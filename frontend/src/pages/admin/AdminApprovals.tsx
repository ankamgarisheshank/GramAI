import React from 'react';
import { OfficerApplications } from './OfficerApplications';

export const AdminApprovals: React.FC = () => {
  return <OfficerApplications initialStatus="APPROVED" pageTitle="Approved Applications" />;
};
