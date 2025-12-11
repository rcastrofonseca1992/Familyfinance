import { useEffect, useState } from 'react';

/**
 * Detects whether the app is running in PWA standalone mode.
 */
export function useIsPWA() {
  const [isPWA, setIsPWA] = useState<boolean>(() =>
    window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true
  );

  useEffect(() => {
    const media = window.matchMedia('(display-mode: standalone)');
    const handler = () => setIsPWA(media.matches || (window.navigator as any).standalone === true);
    media.addEventListener('change', handler);
    return () => media.removeEventListener('change', handler);
  }, []);

  return isPWA;
}
