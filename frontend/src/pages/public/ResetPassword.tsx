import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';
import { CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export const ResetPassword = () => {
  const [success, setSuccess] = React.useState(false);

  if (success) {
    return (
      <div className="min-h-screen bg-background flex flex-col justify-center items-center py-10 px-4 sm:px-6 relative overflow-hidden">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center bg-card p-10 rounded-3xl border shadow-xl max-w-sm">
          <div className="mx-auto w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h2 className="text-2xl font-bold mb-3">Password Updated</h2>
          <p className="text-muted-foreground mb-8">Your password has been reset successfully. You can now log in with your new password.</p>
          <Button asChild className="w-full h-12 rounded-xl">
            <Link to="/login">Proceed to Login</Link>
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-10 px-4 sm:px-6 relative overflow-hidden">
      <div className="absolute top-[20%] left-[20%] w-[30%] h-[30%] rounded-full bg-emerald-500/10 blur-[120px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }} 
        animate={{ opacity: 1, scale: 1 }} 
        transition={{ duration: 0.5 }}
        className="w-full max-w-md mx-auto bg-card rounded-3xl border shadow-xl p-8 relative z-10"
      >
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold tracking-tight mb-2">Create new password</h1>
          <p className="text-muted-foreground">
            Your new password must be different from previous used passwords.
          </p>
        </div>

        <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); setSuccess(true); }}>
          <div className="space-y-2">
            <Label htmlFor="password">New Password</Label>
            <Input 
              id="password" 
              type="password"
              className="h-12 text-base px-4 rounded-xl bg-muted/50 border-transparent focus:border-primary focus:bg-background" 
              required 
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="confirm">Confirm New Password</Label>
            <Input 
              id="confirm" 
              type="password"
              className="h-12 text-base px-4 rounded-xl bg-muted/50 border-transparent focus:border-primary focus:bg-background" 
              required 
            />
          </div>

          <Button type="submit" className="w-full h-14 text-lg rounded-xl shadow-lg shadow-primary/20">
            Reset Password
          </Button>
        </form>
      </motion.div>
    </div>
  );
};
