import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';
import { Leaf, ArrowLeft, AlertCircle, CheckCircle2 } from 'lucide-react';
import { AuthAPI } from '../../lib/api';

export const ForgotPassword = () => {
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;

    setLoading(true);
    setError('');
    try {
      await AuthAPI.forgotPassword(email);
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to send reset link.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-10 px-4 sm:px-6 relative overflow-hidden">
      <div className="absolute top-[20%] left-[20%] w-[30%] h-[30%] rounded-full bg-primary/10 blur-[120px] pointer-events-none" />

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

        {error && (
          <div className="mb-6 p-4 bg-destructive/10 text-destructive text-sm rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {success ? (
          <div className="mb-6 p-6 bg-success/10 text-success-foreground text-center rounded-2xl flex flex-col items-center gap-3 border border-success/20">
             <CheckCircle2 className="w-10 h-10 text-success" />
             <p className="font-medium">Check your inbox!</p>
             <p className="text-sm">We've sent a password reset link to your email.</p>
          </div>
        ) : (
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                name="email"
                type="email"
                className="h-12 text-base px-4 rounded-xl bg-muted/50 border-transparent focus:border-primary focus:bg-background" 
                required 
              />
            </div>

            <Button type="submit" disabled={loading} className="w-full h-14 text-lg rounded-xl shadow-lg shadow-primary/20">
              {loading ? 'Sending...' : 'Send Reset Link'}
            </Button>
          </form>
        )}

        <div className="mt-8 text-center">
          <Link to="/login" className="inline-flex items-center text-primary font-medium hover:underline text-sm">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to log in
          </Link>
        </div>
      </motion.div>
    </div>
  );
};
