import React from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';
import { Badge } from '../../components/ui/Badge';
import { Alert, AlertDescription } from '../../components/ui/Alert';
import { Leaf, Eye, EyeOff, ShieldCheck, Lock, Fingerprint } from 'lucide-react';
import { AuthAPI } from '../../api/auth';
import { useAuthStore } from '../../store/authStore';
import { GovEmblem } from '../../components/custom/GovEmblem';
import { useGoogleLogin } from '@react-oauth/google';

import { queryClient } from '../../lib/queryClient';

export const Login = () => {
  const [showPassword, setShowPassword] = React.useState(false);
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const setAuth = useAuthStore((state) => state.setAuth);

  const message = location.state?.message;

  const handleAuthSuccess = async (token: string, isGoogle = false) => {
    // 1. Purge stale cache from previous sessions
    queryClient.clear();
    localStorage.removeItem('user_type');

    // 2. Set token and fetch verified current user details from backend
    localStorage.setItem('access_token', token);
    const userRes = await AuthAPI.me();
    const user = userRes.data;
    setAuth(token, user);

    // 3. Persist verified persona from backend
    if (user?.persona) {
      localStorage.setItem('user_type', user.persona);
    }

    // 4. Authorize based on verified backend role_id:
    // Role 1 = Super Admin -> /admin/dashboard
    // Role 2, 3, 5 = Officer -> /admin/applications
    // Role 4 = Citizen (Farmer, Student, Senior, General) -> /dashboard
    if (user?.role_id === 1) {
      navigate('/admin/dashboard');
    } else if (user?.role_id === 2 || user?.role_id === 3 || user?.role_id === 5) {
      navigate('/admin/applications');
    } else {
      // Safe fallback: Citizen Dashboard
      navigate('/dashboard');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await AuthAPI.login({ username, password });
      await handleAuthSuccess(response.data.access_token);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        setLoading(true);
        const res = await AuthAPI.googleLogin({ token: tokenResponse.access_token });
        await handleAuthSuccess(res.data.access_token, true);
      } catch (err: any) {
        setError(err.response?.data?.detail || 'Google Login Failed');
      } finally {
        setLoading(false);
      }
    },
    onError: () => {
      setError('Google Login Failed');
    }
  });

  return (
    <div className="min-h-screen flex bg-background font-sans">
      {/* Left Side - Official Branding & Illustration */}
      <div className="hidden lg:flex lg:w-[45%] relative bg-muted overflow-hidden flex-col justify-between p-12 border-r">
        {/* Background Video & Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src="/login-bg.png" 
            alt="GramAI Citizens" 
            className="absolute w-full h-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-background/50 mix-blend-multiply"></div>
          <div className="absolute inset-0 bg-gradient-to-tr from-background via-background/60 to-primary/30"></div>
        </div>
        
        {/* Top Header */}
        <div className="relative z-10 flex items-center gap-4">
          <GovEmblem size="lg" className="bg-background shadow-md" />
          <div>
            <h2 className="text-xl font-bold font-heading text-foreground">Telangana Government</h2>
            <p className="text-sm text-muted-foreground font-medium uppercase tracking-widest">Official Portal</p>
          </div>
        </div>

        {/* Center Content */}
        <div className="relative z-10 text-foreground max-w-md mt-16">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
            <Badge variant="outline" className="mb-6 bg-background text-primary border-primary/20 shadow-sm">Secure Authentication</Badge>
            <h1 className="text-4xl font-bold font-heading mb-6 leading-tight">
              Access your <br/>
              <span className="text-primary">Citizen Dashboard</span>
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed mb-8">
              GramAI uses enterprise-grade security to protect your identity. Login to manage your schemes, applications, and digital profile securely.
            </p>
            
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="flex items-center gap-3 bg-background p-3 rounded-xl shadow-sm border">
                <ShieldCheck className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">End-to-End Encrypted</span>
              </div>
              <div className="flex items-center gap-3 bg-background p-3 rounded-xl shadow-sm border">
                <Lock className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">Privacy Guaranteed</span>
              </div>
            </div>

            {/* CM Profile */}
            <div className="flex items-center gap-4 bg-background/60 p-4 rounded-2xl backdrop-blur-sm border border-border/50 shadow-sm inline-flex">
              <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-primary/20 shrink-0 shadow-inner bg-muted">
                <img 
                  src="/cm.png" 
                  alt="Hon'ble Chief Minister" 
                  className="w-full h-full object-cover object-top"
                />
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">Sri A. Revanth Reddy</p>
                <p className="text-xs text-primary font-semibold tracking-wide uppercase mt-0.5">Hon'ble Chief Minister</p>
                <p className="text-xs text-muted-foreground">Govt. of Telangana</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bottom Footer */}
        <div className="relative z-10 text-xs text-muted-foreground">
          © {new Date().getFullYear()} GramAI, Government of Telangana.
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-20 xl:px-32 relative bg-background">
        <Link to="/" className="absolute top-8 left-6 sm:left-8 flex items-center gap-3 lg:hidden">
          <GovEmblem size="sm" />
          <span className="text-xl font-bold font-heading tracking-tight text-foreground">GramAI</span>
        </Link>

        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.6 }}
          className="w-full max-w-md mx-auto"
        >
          <div className="mb-10 text-center lg:text-left">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-primary/10 text-primary mb-6 lg:hidden">
              <Fingerprint className="h-6 w-6" />
            </div>
            <h2 className="text-3xl font-bold font-heading tracking-tight mb-3">Welcome Back</h2>
            <p className="text-muted-foreground text-base">Verify your identity to continue.</p>
          </div>

          {message && (
            <Alert variant="success" className="mb-6 bg-success/10 border-success/20">
              <AlertDescription className="font-medium text-success">{message}</AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription className="font-medium">{error}</AlertDescription>
            </Alert>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-semibold">Email or Phone Number</Label>
              <Input 
                id="email" 
                type="text" 
                placeholder="citizen@telangana.gov.in" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="h-12 bg-muted/30 focus-visible:bg-background transition-colors"
                required
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-semibold">Password</Label>
                <Link to="/forgot-password" className="text-sm font-medium text-primary hover:underline transition-all">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input 
                  id="password" 
                  type={showPassword ? "text" : "password"} 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 bg-muted/30 focus-visible:bg-background transition-colors pr-10"
                  required
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <Button type="submit" disabled={loading} className="w-full h-12 text-base rounded-xl shadow-md group">
              {loading ? 'Authenticating...' : 'Secure Login'}
              {!loading && <ShieldCheck className="ml-2 h-4 w-4 opacity-70 group-hover:opacity-100 transition-opacity" />}
            </Button>
          </form>

          <div className="my-8 flex items-center">
            <div className="flex-1 border-t border-border"></div>
            <span className="px-4 text-xs text-muted-foreground font-semibold uppercase tracking-wider">Or authenticate via</span>
            <div className="flex-1 border-t border-border"></div>
          </div>

          <Button 
            type="button" 
            onClick={() => googleLogin()} 
            disabled={loading} 
            variant="outline" 
            className="w-full h-12 text-base rounded-xl font-medium hover:bg-muted/50 transition-colors shadow-sm flex items-center justify-center gap-3"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              <path d="M1 1h22v22H1z" fill="none" />
            </svg>
            Continue with Google
          </Button>

          <p className="mt-10 text-center text-muted-foreground text-sm">
            Don't have an account yet?{' '}
            <Link to="/register" className="font-semibold text-primary hover:underline transition-all">
              Register as Citizen
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};
