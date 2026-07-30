import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';
import { Leaf, ArrowLeft } from 'lucide-react';

export const ForgotPassword = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-10 px-4 sm:px-6 relative overflow-hidden">
      <div className="absolute top-[20%] left-[20%] w-[30%] h-[30%] rounded-full bg-emerald-500/10 blur-[120px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }} 
        animate={{ opacity: 1, scale: 1 }} 
        transition={{ duration: 0.5 }}
        className="w-full max-w-md mx-auto bg-card rounded-3xl border shadow-xl p-8 relative z-10"
      >
        <div className="flex justify-center mb-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
            <Leaf className="h-6 w-6" />
          </div>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold tracking-tight mb-2">Reset your password</h1>
          <p className="text-muted-foreground">
            Enter the email or phone number associated with your account and we'll send you a link to reset your password.
          </p>
        </div>

        <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
          <div className="space-y-2">
            <Label htmlFor="email">Email or Phone Number</Label>
            <Input 
              id="email" 
              className="h-12 text-base px-4 rounded-xl bg-muted/50 border-transparent focus:border-primary focus:bg-background" 
              required 
            />
          </div>

          <Button type="submit" className="w-full h-14 text-lg rounded-xl shadow-lg shadow-primary/20">
            Send Reset Link
          </Button>
        </form>

        <div className="mt-8 text-center">
          <Link to="/login" className="inline-flex items-center text-primary font-medium hover:underline text-sm">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to log in
          </Link>
        </div>
      </motion.div>
    </div>
  );
};
