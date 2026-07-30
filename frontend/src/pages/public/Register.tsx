import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';
import { Leaf, Tractor, GraduationCap, Building2, User } from 'lucide-react';

export const Register = () => {
  const [role, setRole] = React.useState<string | null>(null);

  const roles = [
    { id: 'farmer', title: 'Farmer', icon: Tractor, desc: 'Agriculture & Subsidies' },
    { id: 'student', title: 'Student', icon: GraduationCap, desc: 'Scholarships & Education' },
    { id: 'citizen', title: 'Citizen', icon: User, desc: 'General Benefits' },
    { id: 'officer', title: 'Officer', icon: Building2, desc: 'Government Access' }
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col py-10 px-4 sm:px-6 relative overflow-hidden">
      {/* Background Ornaments */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-accent/10 blur-[120px] pointer-events-none" />

      <div className="flex justify-center mb-8 relative z-10">
        <Link to="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-emerald-500 text-white shadow-sm">
            <Leaf className="h-6 w-6" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-primary">GramAI</span>
        </Link>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.6 }}
        className="w-full max-w-2xl mx-auto bg-card rounded-3xl border shadow-xl p-6 sm:p-10 relative z-10"
      >
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold tracking-tight mb-3">Create your account</h1>
          <p className="text-muted-foreground text-lg">Join GramAI and discover benefits tailored for you.</p>
        </div>

        <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
          <div className="space-y-4">
            <Label className="text-base font-semibold">I am a...</Label>
            <div className="grid grid-cols-2 gap-4">
              {roles.map((r) => (
                <div 
                  key={r.id} 
                  onClick={() => setRole(r.id)}
                  className={`relative p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                    role === r.id 
                      ? 'border-primary bg-primary/5 shadow-md scale-[1.02]' 
                      : 'border-border bg-background hover:border-primary/50'
                  }`}
                >
                  <r.icon className={`h-8 w-8 mb-3 ${role === r.id ? 'text-primary' : 'text-muted-foreground'}`} />
                  <h3 className={`font-bold ${role === r.id ? 'text-primary' : 'text-foreground'}`}>{r.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{r.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6 pt-4 border-t">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-base">Full Name</Label>
              <Input id="name" placeholder="E.g., Ramudu" className="h-12 text-base px-4 rounded-xl bg-muted/50 border-transparent focus:border-primary focus:bg-background" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email" className="text-base">Email or Phone Number</Label>
              <Input id="email" placeholder="Your contact detail" className="h-12 text-base px-4 rounded-xl bg-muted/50 border-transparent focus:border-primary focus:bg-background" />
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="password" className="text-base">Password</Label>
                <Input id="password" type="password" className="h-12 text-base px-4 rounded-xl bg-muted/50 border-transparent focus:border-primary focus:bg-background" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm" className="text-base">Confirm Password</Label>
                <Input id="confirm" type="password" className="h-12 text-base px-4 rounded-xl bg-muted/50 border-transparent focus:border-primary focus:bg-background" />
              </div>
            </div>
          </div>

          <Button type="submit" size="lg" className="w-full h-14 text-lg rounded-xl shadow-lg shadow-primary/20" disabled={!role}>
            Create Account
          </Button>
          
          <div className="my-6 flex items-center">
            <div className="flex-1 border-t border-border"></div>
            <span className="px-4 text-sm text-muted-foreground font-medium uppercase tracking-wider">Or</span>
            <div className="flex-1 border-t border-border"></div>
          </div>

          <Button variant="outline" className="w-full h-14 text-base rounded-xl font-medium bg-background hover:bg-muted/50 transition-colors border-border shadow-sm flex items-center justify-center gap-3">
            <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              <path d="M1 1h22v22H1z" fill="none" />
            </svg>
            Sign up with Google
          </Button>
        </form>

        <p className="mt-8 text-center text-muted-foreground text-sm max-w-sm mx-auto">
          By registering, you agree to our <Link to="/terms" className="text-primary hover:underline">Terms of Service</Link> and <Link to="/privacy-policy" className="text-primary hover:underline">Privacy Policy</Link>.
        </p>

        <p className="mt-6 text-center text-foreground font-medium">
          Already have an account? <Link to="/login" className="text-primary hover:underline">Log in</Link>
        </p>
      </motion.div>
    </div>
  );
};
