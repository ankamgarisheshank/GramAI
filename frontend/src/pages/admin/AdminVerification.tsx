import React from 'react';
import { OfficerApplications } from './OfficerApplications';

export const AdminVerification: React.FC = () => {
  return <OfficerApplications initialStatus="UNDER_REVIEW" pageTitle="Document Verification Queue" />;
};
