import React from 'react';
import { Goal, useFinance } from '../store/FinanceContext';
import { formatCurrency, getMarketSentiment } from '../../lib/finance';
import { useLanguage } from '../../src/contexts/LanguageContext';
import { ImageWithFallback } from '../figma/ImageWithFallback';

interface PremiumMortgageCardProps {
    goal: Goal;
    currentAmount: number;
    onClick?: () => void;
    onSimulatorClick?: () => void;
}

export const PremiumMortgageCard: React.FC<PremiumMortgageCardProps> = ({
    goal,
    currentAmount,
    onClick,
    onSimulatorClick
}) => {
    const { t } = useLanguage();
    const { data } = useFinance();
    const { marketData } = data;
    const DEFAULT_APY = 3;
    
    const propertyPrice = goal.propertyValue || goal.targetAmount;
    const displayCurrentAmount = currentAmount;
    const remaining = Math.max(0, goal.targetAmount - displayCurrentAmount);
    const progress = Math.min(100, (displayCurrentAmount / goal.targetAmount) * 100);
    
    // Calculate months until deadline
    const getMonthsUntil = (dateStr: string) => {
        if (!dateStr) return 0;
        const end = new Date(dateStr);
        const now = new Date();
        const months = (end.getFullYear() - now.getFullYear()) * 12 + (end.getMonth() - now.getMonth());
        return Math.max(0, months);
    };
    
    const monthsUntil = getMonthsUntil(goal.deadline);
    
    // Calculate monthly contribution needed
    const calculateMonthlyContribution = (target: number, current: number, months: number, apy: number = DEFAULT_APY) => {
        if (months <= 0) return 0;
        const needed = Math.max(0, target - current);
        if (needed === 0) return 0;
        
        if (apy === 0) return needed / months;
        
        const r = apy / 100 / 12;
        const fvCurrent = current * Math.pow(1 + r, months);
        const remaining = target - fvCurrent;
        
        if (remaining <= 0) return 0;
        
        return remaining * r / (Math.pow(1 + r, months) - 1);
    };
    
    const monthlyContribution = calculateMonthlyContribution(goal.targetAmount, displayCurrentAmount, monthsUntil);
    
    // Get market data
    const euribor = marketData?.euribor12m || 3.5;
    const marketSentiment = getMarketSentiment(euribor);

    return (
        <div 
            onClick={onClick}
            className="relative w-full rounded-3xl overflow-hidden shadow-xl bg-black/5 backdrop-blur-xl border border-white/10 cursor-pointer transition-transform hover:scale-[1.005]"
        >
            {/* Background Price - Large watermark behind content */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
                <span className="text-[120px] font-black text-white/10 tracking-tight select-none -mt-10">
                    {formatCurrency(propertyPrice, false)}
                </span>
            </div>

            {/* Hero Image */}
            <div className="relative">
                <ImageWithFallback
                    src="https://images.unsplash.com/photo-1760434875920-2b7a79ea163a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpc29tZXRyaWMlMjBtaW5pYXR1cmUlMjBob3VzZXxlbnwxfHx8fDE3NjQ4Mzc4NzB8MA&ixlib=rb-4.1.0&q=80&w=1080"
                    alt={goal.name}
                    className="w-full h-60 object-cover rounded-t-3xl"
                />
            </div>

            {/* Glass Overlay Content */}
            <div className="relative mt-[-40px] z-10 mx-4 p-5 rounded-2xl bg-white/60 dark:bg-black/40 backdrop-blur-xl shadow-lg border border-white/20 mr-[16px] mb-[16px] ml-[16px]">
                {/* Tags */}
                <div className="flex gap-2 mb-3">
                    {goal.isMain && (
                        <span className="px-3 py-1 text-xs font-semibold text-emerald-700 bg-emerald-100 rounded-full">
                            {t('goals.mainGoal')}
                        </span>
                    )}
                    {progress < 50 && (
                        <span className="px-3 py-1 text-xs font-semibold text-rose-700 bg-rose-100 rounded-full">
                            {t('goals.lowChance')}
                        </span>
                    )}
                    {progress >= 50 && progress < 80 && (
                        <span className="px-3 py-1 text-xs font-semibold text-amber-700 bg-amber-100 rounded-full">
                            {t('goals.mediumChance')}
                        </span>
                    )}
                    {progress >= 80 && (
                        <span className="px-3 py-1 text-xs font-semibold text-emerald-700 bg-emerald-100 rounded-full">
                            {t('goals.highChance')}
                        </span>
                    )}
                </div>

                {/* Title */}
                <h2 className="text-2xl font-bold text-foreground mb-1">
                    {goal.name} <span className="text-muted-foreground">({progress.toFixed(0)}%)</span>
                </h2>
                <p className="text-lg text-muted-foreground mb-4">{formatCurrency(propertyPrice)}</p>

                {/* Current Savings */}
                <div className="bg-white/70 dark:bg-black/30 shadow-inner rounded-xl p-4 mb-4">
                    <div className="text-xs text-muted-foreground uppercase tracking-wider">{t('goals.currentSavings')}</div>
                    <div className="flex items-baseline gap-1 mt-1">
                        <span className="text-3xl font-bold text-primary">{formatCurrency(displayCurrentAmount)}</span>
                        <span className="text-muted-foreground text-sm">/ {formatCurrency(goal.targetAmount)}</span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-3 bg-primary/10 rounded-full mt-3 overflow-hidden">
                        <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${Math.min(100, progress)}%` }} />
                    </div>

                    {/* Remaining */}
                    <p className="text-xs text-right text-emerald-700 font-semibold mt-2">
                        {formatCurrency(remaining)} {t('goals.remaining')}
                    </p>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-3 gap-3 text-center mb-4">
                    <div>
                        <div className="text-xs text-muted-foreground uppercase tracking-wider">{t('goals.timeLeft')}</div>
                        <div className="text-lg font-semibold">{monthsUntil} {t('common.months')}</div>
                    </div>
                    <div>
                        <div className="text-xs text-muted-foreground uppercase tracking-wider">{t('goals.requiredPerMonth')}</div>
                        <div className="text-lg font-semibold text-primary">{formatCurrency(monthlyContribution)}</div>
                    </div>
                    <div>
                        <div className="text-xs text-muted-foreground uppercase tracking-wider">{t('goals.expAPY')}</div>
                        <div className="text-lg font-semibold">{DEFAULT_APY}%</div>
                    </div>
                </div>

                {/* Euribor & Sentiment */}
                <div className="flex flex-col gap-3 mb-4">
                    <div className="px-3 py-2 bg-primary/10 rounded-lg flex items-center gap-2">
                        <span className="text-primary text-xl">📈</span>
                        <span className="text-sm font-medium">{t('goals.euribor')} {euribor}%</span>
                    </div>

                    <div className="px-3 py-2 bg-muted/30 rounded-lg text-sm font-medium">
                        {t('goals.sentiment')}: <span className="font-semibold">{marketSentiment}</span>
                    </div>
                </div>

                {/* Simulator Button */}
                <button 
                    onClick={(e) => {
                        e.stopPropagation();
                        onSimulatorClick?.();
                    }}
                    className="w-full py-2 rounded-xl bg-primary text-white font-semibold shadow-md hover:bg-primary/90 transition"
                >
                    {t('goals.simulator')}
                </button>
            </div>
        </div>
    );
};