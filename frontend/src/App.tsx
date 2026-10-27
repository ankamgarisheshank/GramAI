import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { PublicLayout } from './layouts/PublicLayout';
import { CitizenLayout } from './layouts/CitizenLayout';
import { AdminLayout } from './layouts/AdminLayout';
import { Toaster } from './components/ui/Toast';
import { useAuthStore } from './store/authStore';
import { trackPageView } from './lib/analytics';

// Lazy loading pages for better performance
const Landing = lazy(() => import('./pages/public/Landing').then(m => ({ default: m.Landing })));
const About = lazy(() => import('./pages/public/About').then(m => ({ default: m.About })));
const Features = lazy(() => import('./pages/public/Features').then(m => ({ default: m.Features })));
const Contact = lazy(() => import('./pages/public/Contact').then(m => ({ default: m.Contact })));
const PrivacyPolicy = lazy(() => import('./pages/public/PrivacyPolicy').then(m => ({ default: m.PrivacyPolicy })));
const Terms = lazy(() => import('./pages/public/Terms').then(m => ({ default: m.Terms })));
const Login = lazy(() => import('./pages/public/Login').then(m => ({ default: m.Login })));
const Register = lazy(() => import('./pages/public/Register').then(m => ({ default: m.Register })));
const ForgotPassword = lazy(() => import('./pages/public/ForgotPassword').then(m => ({ default: m.ForgotPassword })));
const ResetPassword = lazy(() => import('./pages/public/ResetPassword').then(m => ({ default: m.ResetPassword })));
const SmartDashboard = lazy(() => import('./pages/citizen/SmartDashboard').then(m => ({ default: m.SmartDashboard })));
const CitizenSchemes = lazy(() => import('./pages/citizen/CitizenSchemes').then(m => ({ default: m.CitizenSchemes })));
const SchemeDetails = lazy(() => import('./pages/citizen/SchemeDetails').then(m => ({ default: m.SchemeDetails })));
const CitizenProfile = lazy(() => import('./pages/citizen/CitizenProfile').then(m => ({ default: m.CitizenProfile })));
const CitizenApplications = lazy(() => import('./pages/citizen/CitizenApplications').then(m => ({ default: m.CitizenApplications })));
const CitizenApplication = lazy(() => import('./pages/citizen/CitizenApplication').then(m => ({ default: m.CitizenApplication })));
const VoiceAssistant = lazy(() => import('./pages/citizen/VoiceAssistant').then(m => ({ default: m.VoiceAssistant })));
const NotFound = lazy(() => import('./pages/public/NotFound').then(m => ({ default: m.NotFound })));

const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const AdminSearch = lazy(() => import('./pages/admin/AdminSearch').then(m => ({ default: m.AdminSearch })));
const AdminPending = lazy(() => import('./pages/admin/AdminPending').then(m => ({ default: m.AdminPending })));
const AdminVerification = lazy(() => import('./pages/admin/AdminVerification').then(m => ({ default: m.AdminVerification })));
const AdminApprovals = lazy(() => import('./pages/admin/AdminApprovals').then(m => ({ default: m.AdminApprovals })));
const AdminRejections = lazy(() => import('./pages/admin/AdminRejections').then(m => ({ default: m.AdminRejections })));
const AdminReports = lazy(() => import('./pages/admin/AdminReports').then(m => ({ default: m.AdminReports })));
const AdminSchemes = lazy(() => import('./pages/admin/AdminSchemes').then(m => ({ default: m.AdminSchemes })));
const AdminProfile = lazy(() => import('./pages/admin/AdminProfile').then(m => ({ default: m.AdminProfile })));
const OfficerApplications = lazy(() => import('./pages/admin/OfficerApplications').then(m => ({ default: m.OfficerApplications })));
const OfficerApplicationReview = lazy(() => import('./pages/admin/OfficerApplicationReview').then(m => ({ default: m.OfficerApplicationReview })));

// Simple guard
const Protected = ({ children, requiredRoles }: { children: React.ReactNode, requiredRoles?: number[] }) => {
  const { token, user } = useAuthStore();
  
  if (!token) return <Navigate to="/login" replace />;
  
  if (requiredRoles) {
    if (!user || !requiredRoles.includes(user.role_id)) {
      return <Navigate to="/dashboard" replace />; 
    }
  }
  
  return <>{children}</>;
};

// Global fallback skeleton
const PageSkeleton = () => (
  <div className="flex h-screen w-full items-center justify-center bg-background">
    <div className="flex flex-col items-center space-y-4">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      <p className="text-muted-foreground animate-pulse">Loading GramAI...</p>
    </div>
  </div>
);

const RouteTracker = () => {
  const location = useLocation();
  React.useEffect(() => {
    trackPageView(location.pathname);
  }, [location.pathname]);
  return null;
};

function App() {
  return (
    <>
      <BrowserRouter>
        <RouteTracker />
        <Suspense fallback={<PageSkeleton />}>
          <Routes>
            <Route path="/" element={<PublicLayout />}>
              <Route index element={<Landing />} />
              <Route path="about" element={<About />} />
              <Route path="features" element={<Features />} />
              <Route path="contact" element={<Contact />} />
              <Route path="privacy-policy" element={<PrivacyPolicy />} />
              <Route path="terms" element={<Terms />} />
            </Route>
            
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            
            <Route path="/dashboard" element={<Protected><CitizenLayout /></Protected>}>
              <Route index element={<SmartDashboard />} />
              <Route path="schemes" element={<CitizenSchemes />} />
              <Route path="schemes/:schemeId" element={<SchemeDetails />} />
              <Route path="applications" element={<CitizenApplications />} />
              <Route path="applications/:applicationId" element={<CitizenApplication />} />
              <Route path="profile" element={<CitizenProfile />} />
            </Route>
            
            <Route path="/voice" element={<Protected><CitizenLayout /></Protected>}>
              <Route index element={<VoiceAssistant />} />
            </Route>

            <Route path="/admin" element={<Protected requiredRoles={[1, 2, 3, 5]}><AdminLayout /></Protected>}>
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="search" element={<AdminSearch />} />
              <Route path="pending" element={<AdminPending />} />
              <Route path="verification" element={<AdminVerification />} />
              <Route path="approvals" element={<AdminApprovals />} />
              <Route path="rejections" element={<AdminRejections />} />
              <Route path="applications" element={<OfficerApplications />} />
              <Route path="applications/:applicationId" element={<OfficerApplicationReview />} />
              <Route path="reports" element={<AdminReports />} />
              <Route path="schemes" element={<AdminSchemes />} />
              <Route path="profile" element={<AdminProfile />} />
            </Route>

            <Route path="/officer" element={<Protected requiredRoles={[1, 2, 3, 5]}><AdminLayout /></Protected>}>
              <Route path="applications" element={<OfficerApplications />} />
              <Route path="applications/:applicationId" element={<OfficerApplicationReview />} />
            </Route>

            {/* Catch all 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
      <Toaster />
    </>
  );
}

export default App;
