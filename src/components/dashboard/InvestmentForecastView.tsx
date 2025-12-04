import React, { useState, useMemo } from 'react';
import { useFinance } from '../store/FinanceContext';
import { PremiumCard } from '../ui/PremiumCard';
import { formatCurrency } from '../../lib/finance';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ArrowLeft, TrendingUp, Wallet, Settings2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Slider } from '../ui/slider';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { useLanguage } from '../../src/contexts/LanguageContext';

interface InvestmentForecastViewProps {
    onBack: () => void;
}

export const InvestmentForecastView: React.FC<InvestmentForecastViewProps> = ({ onBack }) => {
    const { data, viewMode, getHouseholdIncome, getHouseholdFixedCosts } = useFinance();
    const { t } = useLanguage();

    // Default Assumptions
    const DEFAULT_RETURN_RATE = 7; // 7%
    const [monthlyContribution, setMonthlyContribution] = useState<number>(0);
    const [growthRate, setGrowthRate] = useState<number>(DEFAULT_RETURN_RATE);

    // 1. Get Investment Accounts
    const investmentAccounts = useMemo(() => {
        return data.accounts.filter(a => {
            const isIncluded = viewMode === 'personal' ? a.ownerId === data.user?.id : a.includeInHousehold;
            return isIncluded && a.type === 'investment';
        });
    }, [data.accounts, viewMode, data.user]);

    // 2. Initial Principal
    const totalPrincipal = investmentAccounts.reduce((sum, a) => sum + a.balance, 0);

    // 3. Suggest Monthly Contribution based on current cash flow
    // Only set this once on mount if we wanted, but simpler to let user edit.
    // We'll default to 0 or maybe a smart default later.

    // 4. Generate Projection Data (25 Years)
    const projectionData = useMemo(() => {
        const points = [];
        const years = 25;
        let currentAmount = totalPrincipal;
        const r = growthRate / 100;
        
        const today = new Date();
        const currentYear = today.getFullYear();

        // Year 0
        points.push({
            year: 'Now',
            amount: currentAmount,
            invested: currentAmount,
            interest: 0,
            fullYear: currentYear
        });

        let totalInvested = currentAmount;

        for (let i = 1; i <= years; i++) {
            // Convert monthly contribution to annual (12 months)
            const annualContribution = monthlyContribution * 12;
            
            const interestEarned = currentAmount * r;
            currentAmount += interestEarned + annualContribution;
            totalInvested += annualContribution;

            points.push({
                year: `${i}y`, // 5y, 10y labels will be filtered or shown on axis
                amount: Math.round(currentAmount),
                invested: Math.round(totalInvested),
                interest: Math.round(currentAmount - totalInvested),
                fullYear: currentYear + i
            });
        }
        return points;
    }, [totalPrincipal, growthRate, monthlyContribution]);

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-background border border-border p-3 rounded-xl shadow-xl">
                    <p className="font-bold text-sm mb-2">{payload[0].payload.fullYear} ({label})</p>
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm">
                            <div className="w-2 h-2 rounded-full bg-primary" />
                            <span className="text-muted-foreground">{t('forecast.totalValue')}:</span>
                            <span className="font-mono font-bold">{formatCurrency(payload[0].value)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                            <div className="w-2 h-2 rounded-full bg-primary/30" />
                            <span className="text-muted-foreground">{t('forecast.principal')}:</span>
                            <span className="font-mono">{formatCurrency(payload[0].payload.invested)}</span>
                        </div>
                         <div className="flex items-center gap-2 text-xs">
                            <div className="w-2 h-2 rounded-full bg-green-500/50" />
                            <span className="text-muted-foreground">{t('forecast.growth')}:</span>
                            <span className="font-mono text-green-600">{formatCurrency(payload[0].payload.interest)}</span>
                        </div>
                    </div>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="space-y-6 pb-24 md:pb-0 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" onClick={onBack}>
                        <ArrowLeft size={20} />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold">{t('forecast.title')}</h1>
                        <p className="text-sm text-muted-foreground">{t('forecast.subtitle')}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Chart Section */}
                <PremiumCard className="lg:col-span-2 min-h-[400px] flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wider">{t('forecast.projectedWealth')}</p>
                            <h2 className="text-3xl font-bold text-primary mt-1">
                                {formatCurrency(projectionData[projectionData.length - 1].amount)}
                            </h2>
                        </div>
                        <div className="p-3 bg-primary/10 rounded-full text-primary">
                            <TrendingUp size={24} />
                        </div>
                    </div>

                    <div className="flex-1 w-full h-[300px]">
                        {projectionData && projectionData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={projectionData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" opacity={0.5} />
                                    <XAxis 
                                        dataKey="year" 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{ fill: 'var(--color-muted-foreground)', fontSize: 12 }}
                                        interval="preserveStartEnd"
                                        ticks={['Now', '5y', '10y', '15y', '20y', '25y']}
                                    />
                                    <YAxis 
                                        hide={true} // Cleaner look, use tooltip for values
                                    />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Area 
                                        type="monotone" 
                                        dataKey="amount" 
                                        stroke="var(--color-primary)" 
                                        strokeWidth={3}
                                        fill="url(#colorTotal)" 
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-full text-muted-foreground">
                                No data available
                            </div>
                        )}
                    </div>
                </PremiumCard>

                {/* Controls & Details */}
                <div className="space-y-6">
                    <PremiumCard className="space-y-6">
                        <div className="flex items-center gap-2 mb-2">
                            <Settings2 size={18} className="text-muted-foreground" />
                            <h3 className="font-semibold">{t('forecast.settings')}</h3>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <Label>{t('forecast.monthlyContribution')}</Label>
                                    <span className="font-mono font-bold">{formatCurrency(monthlyContribution)}</span>
                                </div>
                                <div className="flex gap-2 items-center">
                                    <Input 
                                        type="number" 
                                        value={monthlyContribution} 
                                        onChange={(e) => setMonthlyContribution(Number(e.target.value))}
                                        className="font-mono"
                                    />
                                </div>
                                <p className="text-xs text-muted-foreground">{t('forecast.contributionHint')}</p>
                            </div>

                            <div className="space-y-2 pt-4 border-t border-border/50">
                                <div className="flex justify-between">
                                    <Label>{t('forecast.expectedReturn')}</Label>
                                    <span className="font-bold">{growthRate}%</span>
                                </div>
                                <Slider 
                                    value={[growthRate]} 
                                    onValueChange={(val) => setGrowthRate(val[0])} 
                                    max={12} 
                                    step={0.5} 
                                    className="py-4"
                                />
                                <div className="flex justify-between text-xs text-muted-foreground">
                                    <span>{t('forecast.conservative')}</span>
                                    <span>{t('forecast.aggressive')}</span>
                                </div>
                            </div>
                        </div>
                    </PremiumCard>

                    <PremiumCard className="space-y-4">
                        <h3 className="font-semibold flex items-center gap-2">
                            <Wallet size={18} className="text-muted-foreground" />
                            {t('forecast.includedAccounts')}
                        </h3>
                        <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
                            {investmentAccounts.length > 0 ? (
                                investmentAccounts.map(acc => (
                                    <div key={acc.id} className="flex justify-between text-sm p-2 bg-muted/30 rounded-lg">
                                        <div className="truncate pr-2">{acc.name}</div>
                                        <div className="font-mono">{formatCurrency(acc.balance)}</div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-sm text-muted-foreground p-2 text-center italic">
                                    {t('forecast.noAccounts')}
                                </div>
                            )}
                            <div className="flex justify-between text-sm font-bold pt-2 border-t border-border">
                                <span>{t('forecast.totalPrincipal')}</span>
                                <span>{formatCurrency(totalPrincipal)}</span>
                            </div>
                        </div>
                    </PremiumCard>
                </div>
            </div>
        </div>
    );
};