import React from 'react';
import { Wallet } from 'lucide-react';
import { useLanguage } from '../../src/contexts/LanguageContext';

export const LoadingScreen: React.FC = () => {
  const { t } = useLanguage();
  
  return (
    <div className="fixed inset-0 z-50 bg-background flex items-center justify-center animate-in fade-in duration-300">
      <div className="w-full max-w-md mx-auto px-6 space-y-8">
        {/* Logo + Brand */}
        <div className="flex flex-col items-center justify-center space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="relative">
            {/* Pulsing background ring */}
            <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" style={{ animationDuration: '2s' }} />
            
            {/* Icon container */}
            <div className="relative p-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 shadow-2xl">
              <Wallet size={40} className="text-white" />
            </div>
          </div>
          
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Noti</span>
              <span style={{ color: '#FBBF24' }}>now</span>
            </h2>
            <p className="text-sm text-muted-foreground animate-pulse">
              {t('common.loadingDashboard')}
            </p>
          </div>
        </div>

        {/* Skeleton Cards - Staggered Animation */}
        <div className="space-y-4">
          {/* Card 1 */}
          <div 
            className="h-32 rounded-2xl bg-gradient-to-br from-muted/50 to-muted/30 border border-border overflow-hidden relative animate-in fade-in slide-in-from-bottom-2 duration-500"
            style={{ animationDelay: '200ms' }}
          >
            <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/10 to-transparent" 
                 style={{ animationDuration: '2s', animationIterationCount: 'infinite' }} 
            />
            <div className="p-6 space-y-3">
              <div className="h-4 w-24 bg-muted-foreground/20 rounded animate-pulse" />
              <div className="h-8 w-40 bg-muted-foreground/30 rounded animate-pulse" style={{ animationDelay: '100ms' }} />
              <div className="h-3 w-32 bg-muted-foreground/20 rounded animate-pulse" style={{ animationDelay: '200ms' }} />
            </div>
          </div>

          {/* Card 2 */}
          <div 
            className="h-32 rounded-2xl bg-gradient-to-br from-muted/50 to-muted/30 border border-border overflow-hidden relative animate-in fade-in slide-in-from-bottom-2 duration-500"
            style={{ animationDelay: '400ms' }}
          >
            <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/10 to-transparent" 
                 style={{ animationDuration: '2s', animationIterationCount: 'infinite', animationDelay: '400ms' }} 
            />
            <div className="p-6 space-y-3">
              <div className="h-4 w-28 bg-muted-foreground/20 rounded animate-pulse" />
              <div className="h-8 w-36 bg-muted-foreground/30 rounded animate-pulse" style={{ animationDelay: '100ms' }} />
              <div className="h-3 w-28 bg-muted-foreground/20 rounded animate-pulse" style={{ animationDelay: '200ms' }} />
            </div>
          </div>

          {/* Card 3 */}
          <div 
            className="h-32 rounded-2xl bg-gradient-to-br from-muted/50 to-muted/30 border border-border overflow-hidden relative animate-in fade-in slide-in-from-bottom-2 duration-500"
            style={{ animationDelay: '600ms' }}
          >
            <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/10 to-transparent" 
                 style={{ animationDuration: '2s', animationIterationCount: 'infinite', animationDelay: '800ms' }} 
            />
            <div className="p-6 space-y-3">
              <div className="h-4 w-20 bg-muted-foreground/20 rounded animate-pulse" />
              <div className="h-8 w-44 bg-muted-foreground/30 rounded animate-pulse" style={{ animationDelay: '100ms' }} />
              <div className="h-3 w-36 bg-muted-foreground/20 rounded animate-pulse" style={{ animationDelay: '200ms' }} />
            </div>
          </div>
        </div>

        {/* Loading Dots */}
        <div className="flex justify-center items-center gap-2 animate-in fade-in duration-700" style={{ animationDelay: '800ms' }}>
          <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
};