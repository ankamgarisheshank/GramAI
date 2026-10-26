import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';
import { Alert, AlertDescription } from '../../components/ui/Alert';
import { 
  Tractor, GraduationCap, Building2, User, 
  ChevronRight, ChevronLeft, MapPin, ShieldCheck, 
  FileText, CheckCircle2 
} from 'lucide-react';
import { AuthAPI } from '../../api/auth';
import api from '../../lib/api';
import { useAuthStore } from '../../store/authStore';
import { GovEmblem } from '../../components/custom/GovEmblem';
import { useGoogleLogin } from '@react-oauth/google';

export const Register = () => {
  const [step, setStep] = useState(1);
  const [role, setRole] = useState<string | null>(null);
  
  // Form State
  const [name, setName] = useState('');
  const [district, setDistrict] = useState('');
  const [village, setVillage] = useState('');
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const roles = [
    { id: 'farmer', title: 'Farmer', icon: Tractor, desc: 'Agriculture, Subsidies & Loans' },
    { id: 'student', title: 'Student', icon: GraduationCap, desc: 'Scholarships & Education' },
    { id: 'citizen', title: 'Senior / Citizen', icon: User, desc: 'Pensions & General Benefits' },
    { id: 'officer', title: 'Gov Officer', icon: Building2, desc: 'Administration Access' }
  ];

  const steps = [
    { num: 1, title: 'Profile Type' },
    { num: 2, title: 'Personal Details' },
    { num: 3, title: 'Location' },
    { num: 4, title: 'Authentication' }
  ];

  const handleNext = () => {
    setError('');
    if (step === 1 && !role) {
      setError('Please select a profile type.');
      return;
    }
    if (step === 2 && !name) {
      setError('Please enter your full name.');
      return;
    }
    if (step === 3 && (!district || !village)) {
      setError('Please provide your district and village.');
      return;
    }
    setStep((s) => s + 1);
  };

  const handleBack = () => {
    setError('');
    setStep((s) => s - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }

    const trimmedEmailOrPhone = emailOrPhone.trim();
    if (!trimmedEmailOrPhone) {
      setError('Must provide either email or phone number');
      return;
    }

    setLoading(true);
    try {
      const isEmail = trimmedEmailOrPhone.includes('@');
      
      // Role is ALWAYS Citizen (4) for citizens, farmers, students, seniors.
      // Only Government Officer applicants are assigned Village Admin (3).
      let role_id = 4;
      if (role === 'officer') role_id = 3;

      const persona = role || 'citizen';

      const requestData = {
        password,
        role_id,
        persona,
        full_name: name.trim() || undefined,
        district: district.trim() || undefined,
        village: village.trim() || undefined,
        ...(isEmail ? { email: trimmedEmailOrPhone } : { phone_number: trimmedEmailOrPhone })
      };

      await AuthAPI.register(requestData);
      
      localStorage.setItem('user_type', persona);
      
      navigate('/login', { state: { message: 'Registration successful. Please log in.' } });
    } catch (err: any) {
      if (err.message === 'Network Error' || !err.response) {
        setError(`Network Error: Cannot connect to backend API at ${api.defaults.baseURL}. If this is a live deployment, please ensure your Render backend is running and VITE_API_URL is set in Vercel.`);
      } else {
        setError(err.response?.data?.detail || err.message || 'Registration failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        setLoading(true);
        let role_id = 4;
        if (role === 'officer') role_id = 3;
        
        const res = await AuthAPI.googleLogin({ token: tokenResponse.access_token, role_id });
        
        if (role) localStorage.setItem('user_type', role);
        localStorage.setItem('access_token', res.data.access_token);
        
        const userRes = await AuthAPI.me();
        setAuth(res.data.access_token, userRes.data);
        
        navigate('/dashboard');
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
    <div className="min-h-screen flex bg-muted/20 font-sans">
      
      {/* Left Sidebar - Guidelines & Progress */}
      <div className="hidden lg:flex w-[35%] bg-primary text-primary-foreground flex-col justify-between p-10 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-[100px]"></div>

        <div className="relative z-10">
          <Link to="/" className="flex items-center gap-3 mb-16">
            <GovEmblem size="md" className="bg-background text-foreground shadow-lg" />
            <span className="text-2xl font-bold font-heading tracking-tight">GramAI Portal</span>
          </Link>

          <h2 className="text-3xl font-bold font-heading mb-8 leading-snug">
            Citizen Registration <br/> & Onboarding
          </h2>

          <div className="space-y-8 relative">
            <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-primary-foreground/20"></div>
            {steps.map((s) => (
              <div key={s.num} className="flex items-start gap-4 relative z-10">
                <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors border-2 ${
                  step >= s.num 
                    ? 'bg-primary-foreground text-primary border-primary-foreground shadow-[0_0_15px_rgba(255,255,255,0.5)]' 
                    : 'bg-primary text-primary-foreground/50 border-primary-foreground/30'
                }`}>
                  {step > s.num ? <CheckCircle2 className="h-5 w-5" /> : s.num}
                </div>
                <div className="pt-1">
                  <h4 className={`font-semibold ${step >= s.num ? 'text-primary-foreground' : 'text-primary-foreground/50'}`}>
                    {s.title}
                  </h4>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 mt-auto pt-10 border-t border-primary-foreground/20">
          <div className="flex items-start gap-3 bg-primary-foreground/10 p-4 rounded-xl border border-primary-foreground/10 backdrop-blur-sm">
            <ShieldCheck className="h-6 w-6 text-success shrink-0" />
            <div>
              <h5 className="font-semibold text-sm mb-1 text-primary-foreground">Official Government Guidelines</h5>
              <p className="text-xs text-primary-foreground/80 leading-relaxed">
                Provide accurate information as per your Aadhaar/Ration card. Your data is encrypted and strictly used for scheme eligibility checking.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Content - Form Steps */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-8 lg:px-24 xl:px-32 py-12 relative bg-background shadow-[-20px_0_40px_rgba(0,0,0,0.03)] z-10">
        <Link to="/" className="absolute top-6 left-6 flex items-center gap-2 lg:hidden">
          <GovEmblem size="sm" />
          <span className="text-lg font-bold font-heading text-foreground">GramAI</span>
        </Link>

        <div className="w-full max-w-xl mx-auto">
          {error && (
            <Alert variant="destructive" className="mb-6 animate-in slide-in-from-top-2">
              <AlertDescription className="font-medium">{error}</AlertDescription>
            </Alert>
          )}

          <div className="mb-8">
            <div className="text-sm font-semibold text-primary mb-2 tracking-wider uppercase">Step {step} of {steps.length}</div>
            <h2 className="text-3xl font-bold font-heading text-foreground mb-2">{steps[step - 1].title}</h2>
            <p className="text-muted-foreground">Please provide the required details to continue.</p>
          </div>

          <form onSubmit={step === 4 ? handleSubmit : (e) => { e.preventDefault(); handleNext(); }}>
            <AnimatePresence mode="wait">
              
              {/* STEP 1: ROLE */}
              {step === 1 && (
                <motion.div 
                  key="step1"
                  initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  <div className="grid sm:grid-cols-2 gap-4">
                    {roles.map((r) => (
                      <div 
                        key={r.id} 
                        onClick={() => setRole(r.id)}
                        className={`p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                          role === r.id 
                            ? 'border-primary bg-primary/5 shadow-md' 
                            : 'border-border bg-card hover:border-primary/50 hover:bg-muted/30'
                        }`}
                      >
                        <r.icon className={`h-8 w-8 mb-4 ${role === r.id ? 'text-primary' : 'text-muted-foreground'}`} />
                        <h3 className={`font-bold text-lg mb-1 ${role === r.id ? 'text-primary' : 'text-foreground'}`}>{r.title}</h3>
                        <p className="text-sm text-muted-foreground">{r.desc}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* STEP 2: PERSONAL */}
              {step === 2 && (
                <motion.div 
                  key="step2"
                  initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div className="space-y-2">
                    <Label className="text-base font-semibold">Full Name (As per Aadhaar)</Label>
                    <Input 
                      placeholder="e.g. Ramudu P" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="h-14 bg-muted/30 text-lg"
                      autoFocus
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-base font-semibold">Aadhaar Number (Optional for Beta)</Label>
                    <Input 
                      placeholder="XXXX-XXXX-XXXX" 
                      className="h-14 bg-muted/30 text-lg"
                    />
                  </div>
                </motion.div>
              )}

              {/* STEP 3: LOCATION */}
              {step === 3 && (
                <motion.div 
                  key="step3"
                  initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div className="space-y-2">
                    <Label className="text-base font-semibold">District</Label>
                    <Input 
                      placeholder="e.g. Karimnagar" 
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      className="h-14 bg-muted/30 text-lg"
                      autoFocus
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-base font-semibold">Mandal / Village</Label>
                    <Input 
                      placeholder="e.g. Huzurabad" 
                      value={village}
                      onChange={(e) => setVillage(e.target.value)}
                      className="h-14 bg-muted/30 text-lg"
                    />
                  </div>
                  <div className="bg-info/10 border border-info/20 p-4 rounded-xl flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-info shrink-0 mt-0.5" />
                    <p className="text-sm text-foreground">
                      Your location helps GramAI find highly specific local and district-level schemes available to you.
                    </p>
                  </div>
                </motion.div>
              )}

              {/* STEP 4: AUTHENTICATION */}
              {step === 4 && (
                <motion.div 
                  key="step4"
                  initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div className="space-y-2">
                    <Label className="text-base font-semibold">Email or Phone Number</Label>
                    <Input 
                      placeholder="citizen@telangana.gov.in" 
                      value={emailOrPhone}
                      onChange={(e) => setEmailOrPhone(e.target.value)}
                      className="h-14 bg-muted/30 text-lg"
                      required
                    />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-base font-semibold">Create Password</Label>
                      <Input 
                        type="password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="h-14 bg-muted/30 text-lg"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-base font-semibold">Confirm Password</Label>
                      <Input 
                        type="password" 
                        value={confirm}
                        onChange={(e) => setConfirm(e.target.value)}
                        className="h-14 bg-muted/30 text-lg"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="my-6 flex items-center">
                    <div className="flex-1 border-t border-border"></div>
                    <span className="px-4 text-xs text-muted-foreground font-semibold uppercase tracking-wider">Or register via</span>
                    <div className="flex-1 border-t border-border"></div>
                  </div>

                  <Button 
                    type="button" 
                    onClick={() => googleLogin()} 
                    disabled={loading} 
                    variant="outline" 
                    className="w-full h-14 text-base rounded-xl font-medium hover:bg-muted/50 transition-colors shadow-sm flex items-center justify-center gap-3"
                  >
                    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                      <path d="M1 1h22v22H1z" fill="none" />
                    </svg>
                    Google Registration
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="mt-12 flex items-center justify-between pt-6 border-t">
              {step > 1 ? (
                <Button type="button" variant="ghost" onClick={handleBack} className="text-muted-foreground hover:text-foreground">
                  <ChevronLeft className="mr-2 h-4 w-4" /> Back
                </Button>
              ) : (
                <div /> // Spacer
              )}
              
              {step < 4 ? (
                <Button type="button" onClick={handleNext} className="h-12 px-8 rounded-full shadow-md">
                  Continue <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button type="submit" disabled={loading} className="h-12 px-8 rounded-full shadow-md shadow-primary/20 bg-success hover:bg-success/90 text-success-foreground">
                  {loading ? 'Registering...' : 'Complete Registration'}
                </Button>
              )}
            </div>
          </form>

          <p className="mt-10 text-center text-foreground font-medium">
            Already have an account? <Link to="/login" className="text-primary hover:underline transition-all">Log in here</Link>
          </p>
        </div>
      </div>
    </div>
  );
};
