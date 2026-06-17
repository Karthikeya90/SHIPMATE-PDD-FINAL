import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Package, Mail, Lock, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
export function Login() {
  const [email, setEmail] = useState('alex@example.com'); // Pre-filled for demo
  const [password, setPassword] = useState('password123');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname || '/dashboard';
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await login(email, password);
      navigate(from, {
        replace: true
      });
    } catch (error) {

      // Error is handled in context via toast
    } finally {setIsSubmitting(false);
    }
  };
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
      <motion.div
        initial={{
          opacity: 0,
          y: 20
        }}
        animate={{
          opacity: 1,
          y: 0
        }}
        className="w-full max-w-md">
        
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-primary/10 text-primary mb-6">
            <Package className="h-8 w-8" />
          </div>
          <h1 className="text-3xl font-display font-bold mb-2">Welcome back</h1>
          <p className="text-muted-foreground">
            Enter your details to access your account
          </p>
        </div>

        <div className="bg-card p-8 rounded-3xl border border-border shadow-soft">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl py-3 pl-10 pr-4 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  placeholder="name@example.com"
                  required />
                
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-foreground">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-sm text-primary hover:underline">
                  
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl py-3 pl-10 pr-4 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  placeholder="••••••••"
                  required />
                
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-semibold hover:bg-primary/90 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2">
              
              {isSubmitting ?
              <Loader2 className="h-5 w-5 animate-spin" /> :

              'Log in'
              }
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            Don't have an account?{' '}
            <Link
              to="/signup"
              className="text-primary font-medium hover:underline">
              
              Sign up
            </Link>
          </div>

          {/* Demo helper */}
          <div className="mt-8 p-4 bg-muted/50 rounded-xl border border-border text-xs text-muted-foreground">
            <p className="font-semibold mb-2 text-foreground">Demo Accounts:</p>
            <p>Sender: alex@example.com</p>
            <p>Traveller: sarah@example.com</p>
            <p>Password: any</p>
          </div>
        </div>
      </motion.div>
    </div>);

}