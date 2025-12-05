import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { useFinance } from '../store/FinanceContext';
import { ArrowRight, Sparkles, Globe, Loader2 } from 'lucide-react';
import { useLanguage } from '../../src/contexts/LanguageContext';
import { motion } from 'motion/react';

interface LoginPageProps {
  onNavigate: (page: 'signup' | 'dashboard') => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigate }) => {
  const { login } = useFinance();
  const { language, setLanguage, t } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
          <h1 className="text-3xl tracking-tight mb-2 text-[32px] text-[rgb(62,75,75)] font-bold">{t('login.title')}</h1>
          <p className="text-muted-foreground">{t('login.subtitle')}</p>
        </div>

        <PremiumCard glow className="space-y-6 p-8">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-md text-red-600 text-sm">
              {error}
            </div>
          )}
          <form onSubmit={handleLogin} className="space-y-4">
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
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{t('login.password')}</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="password"
                  type="password" 
                  placeholder="••••••••" 
                  className="pl-9 bg-background/50"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={loading}>
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
        </PremiumCard>
      </motion.div>
    </div>
  );
};