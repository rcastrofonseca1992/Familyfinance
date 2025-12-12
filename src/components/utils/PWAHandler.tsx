
import React, { useEffect, useState } from 'react';
import { WifiOff, Download } from 'lucide-react';
import { toast } from '../../utils/toastManager';
import { Button } from '../../ui/button';

export const PWAHandler: React.FC = () => {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const handleOnline = () => {
        setIsOffline(false);
        toast.success("Back online");
    };
    const handleOffline = () => {
        setIsOffline(true);
        toast.error("You are offline", {
            description: "Changes will sync when you reconnect.",
            icon: <WifiOff className="h-4 w-4" />,
            duration: Infinity,
        });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Install Prompt
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        setDeferredPrompt(e);
    });

    // Update theme color for PWA status bar
    const updateThemeColor = () => {
        // Get the computed background color from the body
        // We wait a tick to ensure styles are applied
        requestAnimationFrame(() => {
            const style = getComputedStyle(document.body);
            const bgColor = style.backgroundColor;
            
            let metaThemeColor = document.querySelector('meta[name="theme-color"]');
            if (!metaThemeColor) {
                metaThemeColor = document.createElement('meta');
                metaThemeColor.setAttribute('name', 'theme-color');
                document.head.appendChild(metaThemeColor);
            }
            metaThemeColor.setAttribute('content', bgColor);
            
            // iOS specific
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
    
    // Watch for theme changes if using a class observer
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
        observer.disconnect();
    };
  }, []);

  const handleInstall = () => {
      if (deferredPrompt) {
          deferredPrompt.prompt();
          deferredPrompt.userChoice.then((choiceResult: any) => {
              if (choiceResult.outcome === 'accepted') {
                  console.log('User accepted the install prompt');
              }
              setDeferredPrompt(null);
          });
      }
  };

  if (!deferredPrompt) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 md:bottom-4 md:left-auto md:right-4 md:w-auto z-50">
        <div className="bg-background border border-border p-4 rounded-xl shadow-xl flex items-center gap-4 animate-in slide-in-from-bottom-5">
            <div className="bg-primary/10 p-2 rounded-lg text-primary">
                <Download size={20} />
            </div>
            <div className="flex-1">
                <div className="font-bold text-sm">Install App</div>
                <div className="text-xs text-muted-foreground">Add to home screen for offline access</div>
            </div>
            <Button size="sm" onClick={handleInstall}>Install</Button>
        </div>
    </div>
  );
};
