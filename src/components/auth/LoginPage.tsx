import React, { useState } from 'react';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../ui/select";
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { PremiumCard } from '../ui/PremiumCard';
import { useFinance } from '../store/FinanceContext';
import { ArrowRight, Globe, Loader2, Mail, Lock, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../../src/contexts/LanguageContext';
import { AVAILABLE_LANGUAGES } from '../../src/utils/i18n';
import { motion } from 'motion/react';

interface LoginPageProps {
  onNavigate: (page: 'signup' | 'dashboard' | 'forgot-password') => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigate }) => {
  const { login } = useFinance();
  const { language, setLanguage, t } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const isFormValid = email.trim().length > 3 && password.trim().length >= 6;

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang);
    // Store pending language for syncing to DB after login
    localStorage.setItem('pendingLanguage', lang);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await login(email, password);
      
      // Sync pending language to DB if exists - handled in FinanceContext
    } catch (err: any) {
      setError(err.message || t('login.error') || "Failed to sign in");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-secondary/40 to-background relative" style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}>
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
        className="w-full max-w-[480px]"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl tracking-tight mb-2 text-[32px] text-[rgb(62,75,75)] font-bold">{t('login.title')}</h1>
          <p className="text-muted-foreground">{t('login.subtitle')}</p>
        </div>

        <PremiumCard glow hoverEffect className="space-y-6 p-8">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-md text-red-600 text-sm" role="alert" aria-live="polite">
              {error}
            </div>
          )}
          <form onSubmit={handleLogin} className="space-y-4" aria-busy={loading}>
            <div className="space-y-2">
              <Label htmlFor="email">{t('login.email')}</Label>
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
                  autoComplete="email"
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="password">{t('login.password')}</Label>
                <button 
                  type="button"
                  onClick={() => onNavigate('forgot-password')}
                  className="text-xs text-primary hover:underline"
                >
                  {t('login.forgotPassword') || 'Forgot password?'}
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="password"
                  type={showPassword ? "text" : "password"} 
                  placeholder="••••••••" 
                  className="pl-9 bg-background/50"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 px-3 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={loading || !isFormValid}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('login.button')}...
                </>
              ) : (
                <>
                  {t('login.button')}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          <div className="text-center text-sm text-muted-foreground">
            {t('login.noAccount')}{" "}
            <button 
              onClick={() => onNavigate('signup')}
              className="text-primary font-medium hover:underline"
            >
              {t('login.signUp')}
            </button>
          </div>

          <div className="grid grid-cols-1 gap-3 border-t pt-4 mt-4">
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <ShieldCheck className="h-4 w-4 text-primary" />
              <span>{t('login.securityHint') || 'Multi-device sessions with secure Supabase auth.'}</span>
            </div>
          </div>
        </PremiumCard>
      </motion.div>
    </div>
  );
};