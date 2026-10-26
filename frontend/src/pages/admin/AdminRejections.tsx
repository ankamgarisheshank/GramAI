import React from 'react';
import { OfficerApplications } from './OfficerApplications';

export const AdminRejections: React.FC = () => {
  return <OfficerApplications initialStatus="REJECTED" pageTitle="Rejected Applications" />;
};
