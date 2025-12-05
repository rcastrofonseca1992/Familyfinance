import React, { useState } from 'react';
import { Button } from '../ui/button';
import { PremiumCard } from '../ui/PremiumCard';
import { Mail, RefreshCw, Loader2, CheckCircle } from 'lucide-react';
import { useLanguage } from '../../src/contexts/LanguageContext';
import { motion } from 'motion/react';
import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

interface EmailVerificationScreenProps {
  email: string;
  onLogout: () => void;
}

export const EmailVerificationScreen: React.FC<EmailVerificationScreenProps> = ({ email, onLogout }) => {
  const { t } = useLanguage();
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);
  const [error, setError] = useState('');

  const supabase = createClient(
    `https://${projectId}.supabase.co`,
    publicAnonKey
  );

  const handleResendEmail = async () => {
    setResending(true);
    setError('');
    setResent(false);
    
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      });

      if (error) throw error;
      
      setResent(true);
      setTimeout(() => setResent(false), 5000);
    } catch (err: any) {
      setError(err.message || 'Failed to resend verification email');
      console.error('Resend email error:', err);
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background relative" style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-4"
          >
            <Mail className="h-10 w-10 text-primary" />
          </motion.div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            {t('verification.title') || 'Verify your email'}
          </h1>
          <p className="text-muted-foreground">
            {t('verification.subtitle') || 'Check your inbox to confirm your account'}
          </p>
        </div>

        <PremiumCard glow className="space-y-6 p-8">
          <div className="text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              {t('verification.sentTo') || 'We sent a verification email to:'}
            </p>
            <p className="font-semibold text-lg text-primary break-all">
              {email}
            </p>
            <p className="text-sm text-muted-foreground">
              {t('verification.instructions') || 'Click the link in the email to verify your account and access the dashboard.'}
            </p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="p-3 bg-red-500/10 border border-red-500/20 rounded-md text-red-600 text-sm text-center"
            >
              {error}
            </motion.div>
          )}

          {resent && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="p-3 bg-green-500/10 border border-green-500/20 rounded-md text-green-600 text-sm text-center flex items-center justify-center gap-2"
            >
              <CheckCircle className="h-4 w-4" />
              {t('verification.resent') || 'Verification email sent! Check your inbox.'}
            </motion.div>
          )}

          <div className="space-y-3 pt-4">
            <Button 
              onClick={handleResendEmail}
              variant="outline" 
              className="w-full" 
              size="lg"
              disabled={resending}
            >
              {resending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('verification.resending') || 'Sending'}...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  {t('verification.resend') || 'Resend verification email'}
                </>
              )}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">
                  {t('common.or') || 'or'}
                </span>
              </div>
            </div>

            <Button 
              onClick={onLogout}
              variant="ghost" 
              className="w-full" 
              size="lg"
            >
              {t('verification.logout') || 'Sign out and try another account'}
            </Button>
          </div>

          <div className="pt-4 border-t border-border">
            <p className="text-xs text-center text-muted-foreground">
              {t('verification.spam') || "Can't find the email? Check your spam folder or try resending."}
            </p>
          </div>
        </PremiumCard>
      </motion.div>
    </div>
  );
};
