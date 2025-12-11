import { useEffect, useState } from 'react';

export type DeviceInfo = {
  userAgent: string;
  isStandalone: boolean;
  prefersReducedMotion: boolean;
};

/**
 * Provides a small set of device signals useful for adaptive behavior without affecting UI layout.
 */
export function useDeviceInfo() {
  const [info, setInfo] = useState<DeviceInfo>(() => ({
    userAgent: navigator.userAgent,
    isStandalone: window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true,
    prefersReducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  }));

  useEffect(() => {
    const mediaStandalone = window.matchMedia('(display-mode: standalone)');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    const update = () => {
      setInfo({
        userAgent: navigator.userAgent,
        isStandalone: mediaStandalone.matches || (window.navigator as any).standalone === true,
        prefersReducedMotion: reducedMotion.matches,
      });
    };

    mediaStandalone.addEventListener('change', update);
    reducedMotion.addEventListener('change', update);

    return () => {
      mediaStandalone.removeEventListener('change', update);
      reducedMotion.removeEventListener('change', update);
    };
  }, []);

  return info;
}
