import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { PublicLayout } from './layouts/PublicLayout';
import { CitizenLayout } from './layouts/CitizenLayout';
import { AdminLayout } from './layouts/AdminLayout';

import { Landing } from './pages/public/Landing';
import { About } from './pages/public/About';
import { Features } from './pages/public/Features';
import { Contact } from './pages/public/Contact';
import { PrivacyPolicy } from './pages/public/PrivacyPolicy';
import { Terms } from './pages/public/Terms';
import { Login } from './pages/public/Login';
import { Register } from './pages/public/Register';
import { ForgotPassword } from './pages/public/ForgotPassword';
import { ResetPassword } from './pages/public/ResetPassword';
import { Dashboard } from './pages/citizen/Dashboard';
import { VoiceAssistant } from './pages/citizen/VoiceAssistant';
import { useAuthStore } from './store/authStore';

// Simple guard
const Protected = ({ children, role }: { children: React.ReactNode, role?: string }) => {
  const token = useAuthStore(state => state.token);
  if (!token) return <Navigate to="/login" />;
  return <>{children}</>;
};

import { Toaster } from './components/ui/Toast';

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<PublicLayout />}>
            <Route index element={<Landing />} />
            <Route path="about" element={<About />} />
            <Route path="features" element={<Features />} />
            <Route path="contact" element={<Contact />} />
            <Route path="privacy-policy" element={<PrivacyPolicy />} />
            <Route path="terms" element={<Terms />} />
          </Route>
          
          {/* Auth Routes (Standalone, without PublicLayout navigation) */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          
          <Route path="/dashboard" element={<Protected><CitizenLayout /></Protected>}>
            <Route index element={<Dashboard />} />
            <Route path="/dashboard/schemes" element={<div>Schemes View</div>} />
            <Route path="/dashboard/profile" element={<div>Profile View</div>} />
          </Route>
          
          <Route path="/voice" element={<Protected><CitizenLayout /></Protected>}>
            <Route index element={<VoiceAssistant />} />
          </Route>

          <Route path="/admin" element={<Protected role="admin"><AdminLayout /></Protected>}>
            <Route path="dashboard" element={<div>Admin Dashboard</div>} />
            <Route path="users" element={<div>Admin Users</div>} />
            <Route path="schemes" element={<div>Admin Schemes</div>} />
          </Route>
        </Routes>
      </BrowserRouter>
      <Toaster />
    </>
  );
}

export default App;
