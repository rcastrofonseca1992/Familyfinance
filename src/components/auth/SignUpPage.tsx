import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { useFinance } from '../store/FinanceContext';
import { ArrowRight, Mail, Lock, User, Sparkles, Globe, Loader2 } from 'lucide-react';
import { useLanguage } from '../../src/contexts/LanguageContext';
import { motion } from 'motion/react';

interface SignUpPageProps {
  onNavigate: (page: 'login' | 'dashboard') => void;
}

export const SignUpPage: React.FC<SignUpPageProps> = ({ onNavigate }) => {
  const { login } = useFinance();
  const { language, setLanguage, t } = useLanguage();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang);
    localStorage.setItem('pendingLanguage', lang);
  };

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
    <div className="min-h-screen flex items-center justify-center p-4 bg-background relative" style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}>
      {/* Language Switcher - Fixed Top Right */}
      <div className="fixed top-4 right-4 z-50" style={{ top: 'calc(1rem + env(safe-area-inset-top))' }}>
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Select value={language} onValueChange={handleLanguageChange}>
            <SelectTrigger className="w-[180px] bg-card/80 backdrop-blur-md border-border/50 shadow-sm hover:bg-card transition-colors">
              <Globe className="mr-2 h-4 w-4 text-primary" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent align="end">
              {AVAILABLE_LANGUAGES.map(lang => (
                <SelectItem key={lang.code} value={lang.code}>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{lang.flag}</span>
                    <span>{lang.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </motion.div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">{t('signup.createAccount')}</h1>
          <p className="text-muted-foreground">{t('signup.startJourney')}</p>
        </div>

        <form onSubmit={handleSignup} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="name">{t('signup.fullName')}</Label>
            <div className="relative">
              <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                  id="name"
                  placeholder={t('placeholder.name')} 
                  className="pl-9 bg-background/50"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">{t('signup.email')}</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                  id="email"
                  type="email" 
                  placeholder={t('placeholder.email')} 
                  className="pl-9 bg-background/50"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">{t('signup.password')}</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                  id="password"
                  type="password" 
                  placeholder={t('placeholder.createPassword')} 
                  className="pl-9 bg-background/50"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <Button type="submit" className="w-full" size="lg" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('common.loading') || "Creating Account"}...
              </>
            ) : (
              <>
                {t('signup.button')}
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </form>

        <div className="text-center text-sm text-muted-foreground mt-6">
          {t('signup.alreadyHaveAccount')}{" "}
          <button 
            onClick={() => onNavigate('login')}
            className="text-primary font-medium hover:underline"
          >
            {t('signup.signIn')}
          </button>
        </div>
      </motion.div>
    </div>
  );
};