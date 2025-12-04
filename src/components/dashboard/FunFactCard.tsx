import React, { useState, useEffect } from 'react';
import { X, Sparkles, RefreshCw } from 'lucide-react';
import { Button } from '../ui/button';
import { motion, AnimatePresence } from 'motion/react';
import { getFunFact } from '../../src/lib/getFunFact';
import { useLanguage } from '../../src/contexts/LanguageContext';

export const FunFactCard: React.FC = () => {
  const [fact, setFact] = useState<string>('');
  const [source, setSource] = useState<string>('');
  const [isVisible, setIsVisible] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);
  const { language } = useLanguage();

  // Check if user has dismissed the card
  useEffect(() => {
    const dismissed = localStorage.getItem('funFactCard_dismissed');
    if (dismissed === 'true') {
      setIsVisible(false);
    } else {
      fetchFunFact();
    }
  }, []);

  const fetchFunFact = async () => {
    setIsLoading(true);
    setError(false);
    try {
      const data = await getFunFact(language);
      setFact(data.fact);
      setSource(data.source);
    } catch (err) {
      console.error('Failed to fetch fun fact:', err);
      setError(true);
      // Set fallback text based on language
      if (language === 'pt' || language === 'pt-PT') {
        setFact('Não foi possível carregar uma curiosidade. Tenta novamente.');
      } else {
        setFact('Could not load a fun fact. Try again.');
      }
      setSource('');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('funFactCard_dismissed', 'true');
  };

  const handleRefresh = () => {
    fetchFunFact();
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.3 }}
        className="relative"
      >
        <div className="relative overflow-hidden rounded-lg border border-purple-200 dark:border-purple-900/50 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-purple-950/20 dark:via-pink-950/20 dark:to-blue-950/20 p-4 shadow-sm">
          {/* Decorative background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-20 h-20 bg-purple-400 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-16 h-16 bg-pink-400 rounded-full blur-2xl" />
          </div>

          {/* Content */}
          <div className="relative flex items-start gap-3">
            <motion.div
              animate={{ rotate: [0, 15, -15, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              className="flex-shrink-0 p-2 bg-white dark:bg-gray-800 rounded-full shadow-sm"
            >
              <Sparkles size={16} className="text-purple-600 dark:text-purple-400" />
            </motion.div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-1">
                <h3 className="font-semibold text-purple-900 dark:text-purple-100">
                  {language === 'pt' || language === 'pt-PT' ? 'Curiosidade do dia' : 'Fun fact of the day'}
                </h3>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleRefresh}
                    disabled={isLoading}
                    className="h-6 w-6 text-purple-600 hover:text-purple-700 hover:bg-purple-100 dark:text-purple-400 dark:hover:bg-purple-900/30"
                  >
                    <RefreshCw size={12} className={isLoading ? 'animate-spin' : ''} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleDismiss}
                    className="h-6 w-6 text-purple-600 hover:text-purple-700 hover:bg-purple-100 dark:text-purple-400 dark:hover:bg-purple-900/30"
                  >
                    <X size={12} />
                  </Button>
                </div>
              </div>

              <p className="text-sm text-purple-800 dark:text-purple-200 leading-relaxed">
                {isLoading ? (
                  <span className="animate-pulse">
                    {language === 'pt' || language === 'pt-PT' ? 'A carregar curiosidade...' : 'Loading fun fact...'}
                  </span>
                ) : (
                  fact
                )}
              </p>
              {source && !error && (
                <p className="text-xs text-purple-600/50 dark:text-purple-400/50 mt-1 opacity-50">
                  {language === 'pt' || language === 'pt-PT' ? 'fonte' : 'source'}: {source}
                </p>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};