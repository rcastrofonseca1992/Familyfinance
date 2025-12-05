import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { PremiumCard } from '../ui/PremiumCard';
import { Lock, CheckCircle, Loader2, KeyRound } from 'lucide-react';
import { useLanguage } from '../../src/contexts/LanguageContext';
import { motion } from 'motion/react';
import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

interface ResetPasswordPageProps {
  onSuccess: () => void;
}

export const ResetPasswordPage: React.FC<ResetPasswordPageProps> = ({ onSuccess }) => {
  const { t } = useLanguage();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [hasSession, setHasSession] = useState(false);

  const supabase = createClient(
    `https://${projectId}.supabase.co`,
    publicAnonKey
  );

  // Check if we have a valid session (user came from reset email link)
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setHasSession(!!session);
      
      if (!session) {
        setError(t('resetPassword.noSession') || 'No active reset session. Please request a new password reset link.');
      }
    };
    
    checkSession();
  }, []);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    // Validation
    if (newPassword.length < 6) {
      setError(t('resetPassword.passwordTooShort') || 'Password must be at least 6 characters long');
      setLoading(false);
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setError(t('resetPassword.passwordMismatch') || 'Passwords do not match');
      setLoading(false);
      return;
    }
    
    try {
      // Update user password using Supabase's updateUser
      // This works because Supabase automatically creates a session when user clicks reset link
      const { data, error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) throw updateError;
      
      setSuccess(true);
      
      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        onSuccess();
      }, 2000);
      
    } catch (err: any) {
      setError(err.message || t('resetPassword.error') || 'Failed to reset password');
      console.error('Password reset error:', err);
    } finally {
      setLoading(false);
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
            <KeyRound className="h-10 w-10 text-primary" />
          </motion.div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            {t('resetPassword.title') || 'Reset Your Password'}
          </h1>
          <p className="text-muted-foreground">
            {t('resetPassword.subtitle') || 'Enter your new password below'}
          </p>
        </div>

        <PremiumCard glow className="space-y-6 p-8">
          {!hasSession && !loading && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="p-4 bg-red-500/10 border border-red-500/20 rounded-md text-red-600 text-sm text-center"
            >
              {error}
            </motion.div>
          )}

          {success ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-8 space-y-4"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/10 mb-2">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">
                  {t('resetPassword.success') || 'Password Updated!'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {t('resetPassword.redirecting') || 'Redirecting you to the dashboard...'}
                </p>
              </div>
            </motion.div>
          ) : hasSession ? (
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

              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="new-password">
                    {t('resetPassword.newPassword') || 'New Password'}
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="new-password"
                      type="password" 
                      placeholder={t('resetPassword.newPasswordPlaceholder') || 'Enter new password'}
                      className="pl-9 bg-background/50"
                      required
                      minLength={6}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      disabled={loading}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {t('resetPassword.passwordRequirement') || 'Minimum 6 characters'}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password">
                    {t('resetPassword.confirmPassword') || 'Confirm Password'}
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="confirm-password"
                      type="password" 
                      placeholder={t('resetPassword.confirmPasswordPlaceholder') || 'Confirm new password'}
                      className="pl-9 bg-background/50"
                      required
                      minLength={6}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      disabled={loading}
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full" size="lg" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t('resetPassword.updating') || 'Updating'}...
                    </>
                  ) : (
                    <>
                      <KeyRound className="mr-2 h-4 w-4" />
                      {t('resetPassword.button') || 'Reset Password'}
                    </>
                  )}
                </Button>
              </form>
            </>
          ) : null}
        </PremiumCard>
      </motion.div>
    </div>
  );
};
