
import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Mail, Lock, ArrowRight, User } from 'lucide-react';
import { motion } from 'motion/react';
import { PremiumCard } from '../ui/PremiumCard';
import { useFinance } from '../store/FinanceContext';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

interface SignUpPageProps {
  onNavigate: (page: 'login' | 'dashboard') => void;
}

export const SignUpPage: React.FC<SignUpPageProps> = ({ onNavigate }) => {
  const { login } = useFinance();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-d9780f4d/signup`, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify({ email, password, name })
      });

      const result = await response.json();

      if (!response.ok) {
          throw new Error(result.error || 'Signup failed');
      }

      // Auto login after signup
      await login(email, password);
      
    } catch (err: any) {
       setError(err.message || "Failed to create account");
    } finally {
       setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Create Account</h1>
          <p className="text-muted-foreground">Start your journey to financial freedom.</p>
        </div>

        <PremiumCard glow className="space-y-6 p-8">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-md text-red-600 text-sm">
              {error}
            </div>
          )}
          <form onSubmit={handleSignup} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="name"
                  placeholder="John Doe" 
                  className="pl-9 bg-background/50"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="email"
                  type="email" 
                  placeholder="you@example.com" 
                  className="pl-9 bg-background/50"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="password"
                  type="password" 
                  placeholder="Create a password" 
                  className="pl-9 bg-background/50"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? "Creating Account..." : "Create Account"}
              {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
            </Button>
          </form>

          <div className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <button 
              onClick={() => onNavigate('login')}
              className="text-primary font-medium hover:underline"
            >
              Sign in
            </button>
          </div>
        </PremiumCard>
      </motion.div>
    </div>
  );
};
