import React from 'react';
import { useFinance } from '../../store/FinanceContext';
import { PremiumCard } from '../../ui/PremiumCard';
import { formatCurrency } from '../../lib/finance';
import { ArrowLeft, Flame, TrendingUp, Calculator, Lightbulb, Target, Calendar, DollarSign, TrendingDown, Info, CheckCircle2, Sliders, ChevronDown } from 'lucide-react';
import { Button } from '../../ui/button';
import { useLanguage } from '../../contexts/LanguageContext';
import { Progress } from '../../ui/progress';
import { Slider } from '../../ui/slider';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';

interface FIREViewProps {
    onBack: () => void;
}

export const FIREView: React.FC<FIREViewProps> = ({ onBack }) => {
    const { data, getHouseholdIncome } = useFinance();
    const { t } = useLanguage();
    
    // Collapsible state
    const [isWhatIsFIREOpen, setIsWhatIsFIREOpen] = React.useState(false);
    const [isHowCalculatedOpen, setIsHowCalculatedOpen] = React.useState(false);
    const [isBestPracticesOpen, setIsBestPracticesOpen] = React.useState(false);
    const [isConsiderationsOpen, setIsConsiderationsOpen] = React.useState(false);

    // FIRE Calculations
    const calcHouseholdLiquidAssets = () => {
        return data.accounts
          .filter(a => a.includeInHousehold && ['cash', 'savings', 'investment'].includes(a.type))
          .reduce((sum, a) => sum + a.balance, 0);
    };
    
    const calcHouseholdFixedCosts = () => {
        return data.recurringCosts
          .filter(c => c.includeInHousehold)
          .reduce((sum, c) => sum + c.amount, 0);
    };

    const fireMonthlyIncome = getHouseholdIncome();
    const fireLiquidAssets = calcHouseholdLiquidAssets();
    const fireFixedCosts = calcHouseholdFixedCosts();
    const fireVariableSpending = data.variableSpending || 0;
    const fireMonthlyExpenses = fireFixedCosts + fireVariableSpending;
    const fireAnnualExpenses = fireMonthlyExpenses * 12;
    const fireNumber = fireAnnualExpenses * 25;
    const fireMonthlySavings = fireMonthlyIncome - fireMonthlyExpenses;
    
    // Simulator state
    const [simulatedSavings, setSimulatedSavings] = React.useState(fireMonthlySavings);
    const [simulatedReturnRate, setSimulatedReturnRate] = React.useState(5);
    
    // Calculate years to FIRE function
    const calculateYearsToFire = (monthlySavings: number, annualReturn: number) => {
        if (monthlySavings <= 0) return null;
        if (fireLiquidAssets >= fireNumber) return { years: 0, months: 0, reached: true };
        
        const r = annualReturn / 100 / 12;
        const PMT = monthlySavings;
        const PV = fireLiquidAssets;
        
        try {
            const numerator = fireNumber + (PMT / r);
            const denominator = PV + (PMT / r);
            const nMonths = Math.log(numerator / denominator) / Math.log(1 + r);
            const years = nMonths / 12;
            return { years, months: nMonths, reached: false };
        } catch (e) { 
            return null;
        }
    };
    
    // Calculate actual FIRE timeline
    const actualFireResult = calculateYearsToFire(fireMonthlySavings, 5);
    const yearsToFire = actualFireResult?.years || 0;
    const monthsToFire = actualFireResult?.months || 0;
    const fireReached = actualFireResult?.reached || false;
    
    let fireYearStr = "N/A";
    if (fireReached) {
        fireYearStr = t('fire.reached');
    } else if (yearsToFire > 0) {
        const currentYear = new Date().getFullYear();
        fireYearStr = `${Math.floor(currentYear + yearsToFire)}`;
        if (yearsToFire < 1) fireYearStr = t('fire.thisYear');
    }
    
    // Calculate simulated timeline
    const simulatedResult = calculateYearsToFire(simulatedSavings, simulatedReturnRate);
    const simulatedYears = simulatedResult?.years || 0;
    const simulatedReached = simulatedResult?.reached || false;

    const fireProgress = Math.min(100, (fireLiquidAssets / fireNumber) * 100);
    const safeWithdrawalRate = 0.04; // 4% rule
    const monthlyPassiveIncome = (fireLiquidAssets * safeWithdrawalRate) / 12;

    return (
        <div className="space-y-6 pb-24 md:pb-0 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" onClick={onBack}>
                        <ArrowLeft size={20} />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-2">
                            {t('fire.title')}
                        </h1>
                        <p className="text-sm text-muted-foreground">{t('fire.subtitle')}</p>
                    </div>
                </div>
            </div>

            {/* Hero Card - FIRE Progress */}
            <PremiumCard className="border-l-4 border-l-orange-500 relative overflow-hidden">
                <div className="absolute -bottom-12 -right-12 text-orange-500/5 rotate-12">
                    <Flame size={240} />
                </div>
                
                <div className="relative z-10 space-y-6">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">{t('fire.yourFIRENumber')}</p>
                            <h2 className="text-4xl font-bold text-orange-600">{formatCurrency(fireNumber)}</h2>
                        </div>
                        <div className="p-3 bg-orange-100 dark:bg-orange-900/20 rounded-full text-orange-600">
                            <Flame size={32} />
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">{t('fire.currentProgress')}</span>
                            <span className="font-bold text-orange-600">{fireProgress.toFixed(1)}%</span>
                        </div>
                        <div className="relative h-3 w-full overflow-hidden rounded-full bg-orange-500/20">
                            <div 
                                className="h-full bg-orange-500 transition-all duration-500" 
                                style={{ width: `${fireProgress}%` }} 
                            />
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="font-mono">{formatCurrency(fireLiquidAssets)}</span>
                            <span className="font-mono">{formatCurrency(fireNumber)}</span>
                        </div>
                    </div>

                    {!fireReached && yearsToFire > 0 && (
                        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border/50">
                            <div>
                                <p className="text-xs text-muted-foreground uppercase tracking-wider">{t('fire.estimatedYear')}</p>
                                <p className="text-2xl font-bold">{fireYearStr}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground uppercase tracking-wider">{t('fire.timeRemaining')}</p>
                                <p className="text-2xl font-bold">{Math.floor(yearsToFire)}y {Math.floor((yearsToFire % 1) * 12)}m</p>
                            </div>
                        </div>
                    )}

                    {fireReached && (
                        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 flex items-center gap-3">
                            <CheckCircle2 size={24} className="text-green-600 shrink-0" />
                            <div>
                                <p className="font-semibold text-green-800 dark:text-green-200">{t('fire.congratulations')}</p>
                                <p className="text-sm text-green-700 dark:text-green-300">{t('fire.reachedMessage')}</p>
                            </div>
                        </div>
                    )}
                </div>
            </PremiumCard>

            {/* What is FIRE? - Collapsible */}
            <PremiumCard className="cursor-pointer" onClick={() => setIsWhatIsFIREOpen(!isWhatIsFIREOpen)}>
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Lightbulb size={20} className="text-orange-600" />
                            <h3 className="font-semibold">{t('fire.whatIsFIRE')}</h3>
                        </div>
                        <ChevronDown 
                            size={20} 
                            className={`text-muted-foreground transition-transform duration-200 ${isWhatIsFIREOpen ? 'rotate-180' : ''}`}
                        />
                    </div>
                    
                    {isWhatIsFIREOpen && (
                        <div className="space-y-4 pt-2 animate-in fade-in slide-in-from-top-2 duration-200">
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                {t('fire.fireExplanation')}
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div className="bg-muted/30 rounded-lg p-3">
                                    <p className="font-semibold text-sm mb-1 flex items-center gap-2">
                                        <span className="text-orange-600">FI</span> - {t('fire.financialIndependence')}
                                    </p>
                                    <p className="text-xs text-muted-foreground">{t('fire.fiExplanation')}</p>
                                </div>
                                <div className="bg-muted/30 rounded-lg p-3">
                                    <p className="font-semibold text-sm mb-1 flex items-center gap-2">
                                        <span className="text-orange-600">RE</span> - {t('fire.retireEarly')}
                                    </p>
                                    <p className="text-xs text-muted-foreground">{t('fire.reExplanation')}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </PremiumCard>

            {/* FIRE Simulator */}
            {!fireReached && (
                <PremiumCard>
                    <div className="space-y-6">
                        <div className="flex items-center gap-2">
                            <Sliders size={20} className="text-orange-600" />
                            <h3 className="font-semibold">{t('fire.simulator')}</h3>
                        </div>
                        
                        <div className="space-y-6">
                            {/* Monthly Savings Slider */}
                            <div className="space-y-3">
                                <div className="flex justify-between items-baseline">
                                    <Label className="text-sm font-semibold">{t('fire.simulatorMonthlySavings')}</Label>
                                    <div className="flex items-center gap-2">
                                        <Input 
                                            type="number" 
                                            value={simulatedSavings || ''} 
                                            onChange={(e) => setSimulatedSavings(e.target.value ? Number(e.target.value) : 0)}
                                            className="w-32 h-8 text-right font-mono font-bold"
                                            placeholder="0"
                                        />
                                    </div>
                                </div>
                                <Slider 
                                    value={[simulatedSavings]} 
                                    onValueChange={(val) => setSimulatedSavings(val[0])} 
                                    max={fireMonthlyIncome * 2} 
                                    step={100} 
                                    className="py-4"
                                />
                                <div className="flex justify-between text-xs text-muted-foreground">
                                    <span>{formatCurrency(0)}</span>
                                    <span>{formatCurrency(fireMonthlyIncome * 2)}</span>
                                </div>
                            </div>

                            {/* Return Rate Slider */}
                            <div className="space-y-3">
                                <div className="flex justify-between items-baseline">
                                    <Label className="text-sm font-semibold">{t('fire.simulatorReturnRate')}</Label>
                                    <span className="font-bold text-orange-600">{simulatedReturnRate}%</span>
                                </div>
                                <Slider 
                                    value={[simulatedReturnRate]} 
                                    onValueChange={(val) => setSimulatedReturnRate(val[0])} 
                                    min={0}
                                    max={15} 
                                    step={0.5} 
                                    className="py-4"
                                />
                                <div className="flex justify-between text-xs text-muted-foreground">
                                    <span>{t('fire.conservative')}</span>
                                    <span>{t('fire.aggressive')}</span>
                                </div>
                            </div>

                            <div className="h-px bg-border" />

                            {/* Simulated Results */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-muted/30 rounded-lg p-4">
                                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                                        {t('fire.simulatedYears')}
                                    </p>
                                    <p className="text-3xl font-bold text-orange-600">
                                        {simulatedResult && simulatedYears > 0 
                                            ? Math.floor(simulatedYears) 
                                            : '—'
                                        }
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {simulatedResult && simulatedYears > 0 
                                            ? `${Math.floor((simulatedYears % 1) * 12)} ${t('fire.months')}`
                                            : t('fire.invalidScenario')
                                        }
                                    </p>
                                </div>
                                <div className="bg-muted/30 rounded-lg p-4">
                                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                                        {t('fire.targetYear')}
                                    </p>
                                    <p className="text-3xl font-bold text-orange-600">
                                        {simulatedResult && simulatedYears > 0 
                                            ? Math.floor(new Date().getFullYear() + simulatedYears)
                                            : '—'
                                        }
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {simulatedResult && simulatedYears > 0 && yearsToFire > 0
                                            ? `${Math.abs(yearsToFire - simulatedYears).toFixed(1)}y ${yearsToFire > simulatedYears ? t('fire.faster') : t('fire.slower')}`
                                            : ' '
                                        }
                                    </p>
                                </div>
                            </div>

                            {simulatedSavings !== fireMonthlySavings && simulatedResult && simulatedYears > 0 && yearsToFire > 0 && (
                                <div className="bg-muted/30 rounded-lg p-4">
                                    <div className="flex items-start gap-3">
                                        <Info size={16} className="text-orange-600 mt-0.5 shrink-0" />
                                        <div className="text-xs text-muted-foreground">
                                            {simulatedSavings > fireMonthlySavings ? (
                                                <p>
                                                    {t('fire.simulatorIncrease', { 
                                                        increase: formatCurrency(simulatedSavings - fireMonthlySavings),
                                                        years: (yearsToFire - simulatedYears).toFixed(1)
                                                    })}
                                                </p>
                                            ) : (
                                                <p>
                                                    {t('fire.simulatorDecrease', { 
                                                        decrease: formatCurrency(fireMonthlySavings - simulatedSavings),
                                                        years: (simulatedYears - yearsToFire).toFixed(1)
                                                    })}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </PremiumCard>
            )}

            {/* How It's Calculated */}
            <PremiumCard className="cursor-pointer" onClick={() => setIsHowCalculatedOpen(!isHowCalculatedOpen)}>
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Calculator size={20} className="text-orange-600" />
                            <h3 className="font-semibold">{t('fire.howCalculated')}</h3>
                        </div>
                        <ChevronDown 
                            size={20} 
                            className={`text-muted-foreground transition-transform duration-200 ${isHowCalculatedOpen ? 'rotate-180' : ''}`}
                        />
                    </div>
                    
                    {isHowCalculatedOpen && (
                        <div className="space-y-4 pt-2 animate-in fade-in slide-in-from-top-2 duration-200">
                            {/* The 4% Rule */}
                            <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
                                <div className="flex items-start gap-3">
                                    <Info size={18} className="text-orange-600 mt-0.5 shrink-0" />
                                    <div>
                                        <p className="font-semibold text-sm mb-2 text-orange-900 dark:text-orange-100">
                                            {t('fire.the4PercentRule')}
                                        </p>
                                        <p className="text-xs text-orange-800 dark:text-orange-200 leading-relaxed">
                                            {t('fire.fourPercentExplanation')}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Formula */}
                            <div className="space-y-3">
                                <p className="text-sm font-semibold">{t('fire.formula')}</p>
                                <div className="bg-muted/50 rounded-lg p-4 border-2 border-dashed border-border">
                                    <div className="text-center space-y-2">
                                        <p className="font-mono text-lg font-bold">
                                            {t('fire.fireNumber')} = {t('fire.annualExpenses')} × 25
                                        </p>
                                        <p className="text-xs text-muted-foreground">{t('fire.or')}</p>
                                        <p className="font-mono text-sm">
                                            {t('fire.fireNumber')} = {t('fire.annualExpenses')} ÷ 0.04
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Your Calculation */}
                            <div className="space-y-3">
                                <p className="text-sm font-semibold">{t('fire.yourCalculation')}</p>
                                <div className="bg-muted/30 rounded-lg p-4 space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">{t('fire.monthlyFixedCosts')}</span>
                                        <span className="font-mono">{formatCurrency(fireFixedCosts)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">{t('fire.monthlyVariableSpending')}</span>
                                        <span className="font-mono">{formatCurrency(fireVariableSpending)}</span>
                                    </div>
                                    <div className="h-px bg-border" />
                                    <div className="flex justify-between text-sm font-semibold">
                                        <span>{t('fire.totalMonthlyExpenses')}</span>
                                        <span className="font-mono">{formatCurrency(fireMonthlyExpenses)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm font-semibold">
                                        <span>{t('fire.annualExpenses')}</span>
                                        <span className="font-mono">{formatCurrency(fireAnnualExpenses)}</span>
                                    </div>
                                    <div className="h-px bg-border" />
                                    <div className="flex justify-between font-bold">
                                        <span className="text-orange-600">{t('fire.yourFIRENumber')}</span>
                                        <span className="font-mono text-orange-600">{formatCurrency(fireNumber)}</span>
                                    </div>
                                    <p className="text-xs text-muted-foreground text-center pt-2">
                                        {formatCurrency(fireAnnualExpenses)} × 25 = {formatCurrency(fireNumber)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </PremiumCard>

            {/* Current Passive Income */}
            <PremiumCard>
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <DollarSign size={20} className="text-green-600" />
                        <h3 className="font-semibold">{t('fire.currentPassiveIncome')}</h3>
                    </div>
                    <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
                        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                            {t('fire.safeMonthlyWithdrawal')}
                        </p>
                        <p className="text-3xl font-bold text-green-600">
                            {formatCurrency(monthlyPassiveIncome)}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                            {t('fire.basedOn4Percent', { amount: formatCurrency(fireLiquidAssets) })}
                        </p>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{t('fire.coverageRatio')}</span>
                        <span className="font-bold">
                            {fireMonthlyExpenses > 0 
                                ? `${((monthlyPassiveIncome / fireMonthlyExpenses) * 100).toFixed(1)}%`
                                : 'N/A'
                            }
                        </span>
                    </div>
                    <Progress 
                        value={Math.min(100, (monthlyPassiveIncome / fireMonthlyExpenses) * 100)} 
                        className="h-2"
                    />
                </div>
            </PremiumCard>

            {/* Best Practices */}
            <PremiumCard className="cursor-pointer" onClick={() => setIsBestPracticesOpen(!isBestPracticesOpen)}>
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <CheckCircle2 size={20} className="text-green-600" />
                            <h3 className="font-semibold">{t('fire.bestPractices')}</h3>
                        </div>
                        <ChevronDown 
                            size={20} 
                            className={`text-muted-foreground transition-transform duration-200 ${isBestPracticesOpen ? 'rotate-180' : ''}`}
                        />
                    </div>
                    
                    {isBestPracticesOpen && (
                        <div className="space-y-3 pt-2 animate-in fade-in slide-in-from-top-2 duration-200">
                            <div className="flex items-start gap-3 text-sm">
                                <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center shrink-0 mt-0.5">
                                    <CheckCircle2 size={14} className="text-green-600" />
                                </div>
                                <div>
                                    <p className="font-semibold">{t('fire.practice1Title')}</p>
                                    <p className="text-muted-foreground text-xs">{t('fire.practice1Desc')}</p>
                                </div>
                            </div>
                            
                            <div className="flex items-start gap-3 text-sm">
                                <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center shrink-0 mt-0.5">
                                    <CheckCircle2 size={14} className="text-green-600" />
                                </div>
                                <div>
                                    <p className="font-semibold">{t('fire.practice2Title')}</p>
                                    <p className="text-muted-foreground text-xs">{t('fire.practice2Desc')}</p>
                                </div>
                            </div>
                            
                            <div className="flex items-start gap-3 text-sm">
                                <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center shrink-0 mt-0.5">
                                    <CheckCircle2 size={14} className="text-green-600" />
                                </div>
                                <div>
                                    <p className="font-semibold">{t('fire.practice3Title')}</p>
                                    <p className="text-muted-foreground text-xs">{t('fire.practice3Desc')}</p>
                                </div>
                            </div>
                            
                            <div className="flex items-start gap-3 text-sm">
                                <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center shrink-0 mt-0.5">
                                    <CheckCircle2 size={14} className="text-green-600" />
                                </div>
                                <div>
                                    <p className="font-semibold">{t('fire.practice4Title')}</p>
                                    <p className="text-muted-foreground text-xs">{t('fire.practice4Desc')}</p>
                                </div>
                            </div>
                            
                            <div className="flex items-start gap-3 text-sm">
                                <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center shrink-0 mt-0.5">
                                    <CheckCircle2 size={14} className="text-green-600" />
                                </div>
                                <div>
                                    <p className="font-semibold">{t('fire.practice5Title')}</p>
                                    <p className="text-muted-foreground text-xs">{t('fire.practice5Desc')}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </PremiumCard>

            {/* Important Considerations */}
            <PremiumCard className="cursor-pointer" onClick={() => setIsConsiderationsOpen(!isConsiderationsOpen)}>
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Info size={20} className="text-blue-600" />
                            <h3 className="font-semibold">{t('fire.importantConsiderations')}</h3>
                        </div>
                        <ChevronDown 
                            size={20} 
                            className={`text-muted-foreground transition-transform duration-200 ${isConsiderationsOpen ? 'rotate-180' : ''}`}
                        />
                    </div>
                    
                    {isConsiderationsOpen && (
                        <div className="space-y-3 pt-2 text-sm animate-in fade-in slide-in-from-top-2 duration-200">
                            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                                <p className="font-semibold text-yellow-900 dark:text-yellow-100 mb-1">
                                    {t('fire.consideration1Title')}
                                </p>
                                <p className="text-xs text-yellow-800 dark:text-yellow-200">
                                    {t('fire.consideration1Desc')}
                                </p>
                            </div>
                            
                            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                                <p className="font-semibold text-yellow-900 dark:text-yellow-100 mb-1">
                                    {t('fire.consideration2Title')}
                                </p>
                                <p className="text-xs text-yellow-800 dark:text-yellow-200">
                                    {t('fire.consideration2Desc')}
                                </p>
                            </div>
                            
                            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                                <p className="font-semibold text-yellow-900 dark:text-yellow-100 mb-1">
                                    {t('fire.consideration3Title')}
                                </p>
                                <p className="text-xs text-yellow-800 dark:text-yellow-200">
                                    {t('fire.consideration3Desc')}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </PremiumCard>
        </div>
    );
};