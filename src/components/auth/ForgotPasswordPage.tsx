import React, { useState } from 'react';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { PremiumCard } from '../../ui/PremiumCard';
import { Mail, ArrowLeft, CheckCircle, Loader2 } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { motion } from 'motion/react';
import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

interface ForgotPasswordPageProps {
  onBack: () => void;
}

export const ForgotPasswordPage: React.FC<ForgotPasswordPageProps> = ({ onBack }) => {
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const supabase = createClient(
    `https://${projectId}.supabase.co`,
    publicAnonKey
  );

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);
    
    try {
      // Always call the API, but don't reveal if email exists or not
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      // Security: Don't reveal if email exists - always show success
      // Supabase won't throw error for non-existent emails anyway (by design)
      // But we'll catch any other errors silently
      
      setSuccess(true);
      
    } catch (err: any) {
      // Security: Even on error, show success to prevent email enumeration
      // Only log the error internally for debugging
      console.error('Password reset request error:', err);
      setSuccess(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background relative" style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}>
      {/* Back Button */}
      <button 
        onClick={onBack}
        className="fixed top-4 left-4 z-50 p-3 rounded-full bg-card/80 backdrop-blur-md border border-border/50 shadow-sm hover:bg-card transition-colors"
        style={{ top: 'calc(1rem + env(safe-area-inset-top))' }}
      >
        <ArrowLeft size={20} />
      </button>

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
            {t('forgotPassword.title') || 'Forgot Password?'}
          </h1>
          <p className="text-muted-foreground">
            {t('forgotPassword.subtitle') || 'Enter your email to receive a reset link'}
          </p>
        </div>

        <PremiumCard glow className="space-y-6 p-8">
          {success ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-6 space-y-4"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/10 mb-2">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">
                  {t('forgotPassword.success') || 'Check Your Email'}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {t('forgotPassword.successMessageGeneric') || 'If an account exists with'}
                </p>
                <p className="font-semibold text-primary break-all mb-4">
                  {email}
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  {t('forgotPassword.successMessageGeneric2') || 'you will receive a password reset link shortly.'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t('forgotPassword.checkSpam') || "Can't find it? Check your spam folder."}
                </p>
              </div>
              <Button onClick={onBack} variant="outline" className="w-full mt-6">
                <ArrowLeft className="mr-2 h-4 w-4" />
                {t('common.backToLogin') || 'Back to Login'}
              </Button>
            </motion.div>
          ) : (
            <>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="p-3 bg-red-500/10 border border-red-500/20 rounded-md text-red-600 text-sm text-center"
                >
                  {error}
                </motion.div>
              )}

              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">
                    {t('forgotPassword.email') || 'Email'}
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="email"
                      type="email" 
                      placeholder={t('forgotPassword.emailPlaceholder') || 'Enter your email'}
                      className="pl-9 bg-background/50"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={loading}
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full" size="lg" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t('forgotPassword.sending') || 'Sending'}...
                    </>
                  ) : (
                    <>
                      <Mail className="mr-2 h-4 w-4" />
                      {t('forgotPassword.button') || 'Send Reset Link'}
                    </>
                  )}
                </Button>
              </form>

              <div className="text-center text-sm text-muted-foreground pt-2">
                {t('forgotPassword.rememberPassword') || 'Remember your password?'}{" "}
                <button 
                  onClick={onBack}
                  className="text-primary font-medium hover:underline"
                >
                  {t('common.backToLogin') || 'Back to Login'}
                </button>
              </div>
            </>
          )}
        </PremiumCard>
      </motion.div>
    </div>
  );
};