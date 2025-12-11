
import React, { useEffect, useState } from 'react';
import { WifiOff, Download } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import { useLanguage } from '../../src/contexts/LanguageContext';

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
};

export const PWAHandler: React.FC = () => {
  const { t } = useLanguage();
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState(
    window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    const handleDisplayModeChange = () => {
      setIsStandalone(mediaQuery.matches || (window.navigator as any).standalone === true);
      setDeferredPrompt(null);
    };

    mediaQuery.addEventListener('change', handleDisplayModeChange);
    return () => mediaQuery.removeEventListener('change', handleDisplayModeChange);
  }, []);

  useEffect(() => {
    const handleOnline = () => {
      if (isOffline) {
        setIsOffline(false);
        toast.success(t('pwa.backOnline'));
      }
    };
    const handleOffline = () => {
      if (!isOffline) {
        setIsOffline(true);
        toast.error(t('pwa.offlineTitle'), {
          description: t('pwa.offlineDescription'),
          icon: <WifiOff className="h-4 w-4" />,
          duration: Infinity,
        });
      }
    };

    const handleBeforeInstall = (event: BeforeInstallPromptEvent) => {
      if (isStandalone) return;
      event.preventDefault();
      setDeferredPrompt(event);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('beforeinstallprompt', handleBeforeInstall as EventListener);

    const updateThemeColor = () => {
      requestAnimationFrame(() => {
        const rootStyle = getComputedStyle(document.documentElement);
        const bgColor = rootStyle.getPropertyValue('--background')?.trim() || getComputedStyle(document.body).backgroundColor;

        let metaThemeColor = document.querySelector('meta[name="theme-color"]');
        if (!metaThemeColor) {
          metaThemeColor = document.createElement('meta');
          metaThemeColor.setAttribute('name', 'theme-color');
          document.head.appendChild(metaThemeColor);
        }
        metaThemeColor.setAttribute('content', bgColor);

        let metaApple = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]');
        if (!metaApple) {
          metaApple = document.createElement('meta');
          metaApple.setAttribute('name', 'apple-mobile-web-app-status-bar-style');
          document.head.appendChild(metaApple);
        }
        metaApple.setAttribute('content', 'default');
      });
    };

    updateThemeColor();

    const schemeWatcher = window.matchMedia('(prefers-color-scheme: dark)');
    schemeWatcher.addEventListener('change', updateThemeColor);

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          updateThemeColor();
        }
      });
    });

    observer.observe(document.documentElement, { attributes: true });

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall as EventListener);
      schemeWatcher.removeEventListener('change', updateThemeColor);
      observer.disconnect();
    };
  }, [isOffline, isStandalone]);

  const handleInstall = () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        toast.success(t('pwa.installSuccess'));
      }
      setDeferredPrompt(null);
    });
  };

  if (!deferredPrompt || isStandalone) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 md:bottom-4 md:left-auto md:right-4 md:w-auto z-50">
        <div className="bg-background border border-border p-4 rounded-xl shadow-lg flex items-center gap-4 animate-in slide-in-from-bottom-5">
          <div className="bg-primary/10 p-2 rounded-lg text-primary">
                <Download size={20} />
            </div>
            <div className="flex-1">
                <div className="font-bold text-sm">{t('pwa.installTitle')}</div>
                <div className="text-xs text-muted-foreground">{t('pwa.installDescription')}</div>
            </div>
            <Button size="sm" onClick={handleInstall}>{t('pwa.installButton')}</Button>
        </div>
    </div>
  );
};
