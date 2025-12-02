
import React, { useState, useEffect } from 'react';
import { useFinance } from '../store/FinanceContext';
import { cn } from '../ui/utils';
import { PremiumCard } from '../ui/PremiumCard';
import { formatCurrency, HOUSE_TARGET, CASH_RATIO_FOR_HOUSE } from '../../lib/finance';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { ArrowUpRight, ArrowDownRight, ArrowRight, Wallet, PiggyBank, CreditCard, AlertCircle, PlayCircle, Calendar, TrendingUp, User, Users, Flame, Sunrise, ChevronRight, Info } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '../ui/dialog';
import { Label } from '../ui/label';
import { ProgressCurve } from '../ui/ProgressCurve';
import { Switch } from '../ui/switch';
import { Tabs, TabsList, TabsTrigger } from '../ui/tabs';

interface HomeDashboardProps {
    onNavigate: (page: string) => void;
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({ onNavigate }) => {
  const { data, updateData, getHouseholdIncome, getPersonalTotalIncome, getHouseholdFixedCosts, getHouseholdNetWorth, getHouseholdTotalCash, getMonthlyComparison, viewMode, setViewMode } = useFinance();
  const [isEmergencyEditOpen, setIsEmergencyEditOpen] = useState(false);
  const [newEmergencyTarget, setNewEmergencyTarget] = useState(data.emergencyFundGoal);
  const [isVariableIncomeLocal, setIsVariableIncomeLocal] = useState(data.isVariableIncome);
  
  // Sync local state when dialog opens or data changes
  useEffect(() => {
      if (isEmergencyEditOpen) {
          setNewEmergencyTarget(data.emergencyFundGoal);
          setIsVariableIncomeLocal(data.isVariableIncome || false);
      }
  }, [isEmergencyEditOpen, data.emergencyFundGoal, data.isVariableIncome]);

  const currentIncome = viewMode === 'personal' ? getPersonalTotalIncome() : getHouseholdIncome();
  const fixedCosts = getHouseholdFixedCosts();
  // If viewMode is personal, we might want to scale variableSpending or assume it's personal. 
  // For now, we use the global variableSpending but practically it should be split.
  const totalExpenses = fixedCosts + data.variableSpending; 
  const monthlySavings = currentIncome - totalExpenses;
  
  const netWorth = getHouseholdNetWorth();
  const totalCash = getHouseholdTotalCash();
  
  // Monthly Comparison
  const comparison = getMonthlyComparison();
  const percentChange = comparison.percentChange;
  
  // Emergency Fund Recommendations
  const householdSize = data.household?.members.length || 1;
  let emergencyFactor = 1;
  if (householdSize > 2) emergencyFactor = 1.25;
  if (data.isVariableIncome) emergencyFactor *= 1.5;

  const emergencyMin = fixedCosts * 3 * emergencyFactor;
  const emergencyMax = fixedCosts * 6 * emergencyFactor;

  // Calculate Liquid Assets (Cash + Savings + Investments) for automated Emergency Fund & Goal Allocation
  // We exclude debt and illiquid assets for this calculation to be realistic
  const liquidAssets = data.accounts
    .filter(a => {
        if (viewMode === 'personal') return a.ownerId === data.user?.id;
        return a.includeInHousehold;
    })
    .filter(a => ['cash', 'savings', 'investment'].includes(a.type))
    .reduce((sum, a) => sum + a.balance, 0);

  // Investment Assets for Forecast
  const investmentAssets = data.accounts
    .filter(a => {
        if (viewMode === 'personal') return a.ownerId === data.user?.id;
        return a.includeInHousehold;
    })
    .filter(a => a.type === 'investment')
    .reduce((sum, a) => sum + a.balance, 0);

  // Automated Emergency Fund Logic
  // 1. Fill Emergency Fund first from Liquid Assets
  const currentEmergencyAmount = Math.min(liquidAssets, data.emergencyFundGoal);
  const isEmergencyFullyFunded = currentEmergencyAmount >= data.emergencyFundGoal;
  const emergencyProgress = Math.min(100, (currentEmergencyAmount / data.emergencyFundGoal) * 100);

  // 2. Allocate Remainder to Goals
  const availableForGoals = Math.max(0, liquidAssets - data.emergencyFundGoal);

  // Calculate Progress for Main Goal (Home Down Payment)
  // Default to standard house target if no specific goal set
  const homeGoal = data.goals.find(g => g.category === 'home');
  const targetCash = homeGoal ? homeGoal.targetAmount : (HOUSE_TARGET * CASH_RATIO_FOR_HOUSE);
  
  const progressPercent = targetCash > 0 ? Math.min(100, (availableForGoals / targetCash) * 100) : 0;

  const householdAccounts = data.accounts.filter(a => {
      if (viewMode === 'personal') return a.ownerId === data.user?.id;
      return a.includeInHousehold;
  });


  // --- FIRE Calculations (Global) ---
  // Re-implementing logic from SavingsRecommendations for dashboard view
  
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

  let fireYearStr = "N/A";
  let yearsToFire = 0;
  if (fireMonthlySavings > 0) {
      if (fireLiquidAssets >= fireNumber) {
          fireYearStr = "Reached!";
      } else {
          const r = 0.05 / 12;
          const PMT = fireMonthlySavings;
          const PV = fireLiquidAssets;
          try {
            const numerator = fireNumber + (PMT / r);
            const denominator = PV + (PMT / r);
            const nMonths = Math.log(numerator / denominator) / Math.log(1 + r);
            yearsToFire = nMonths / 12;
            const currentYear = new Date().getFullYear();
            fireYearStr = `Year ${Math.floor(currentYear + yearsToFire)}`;
            if (yearsToFire < 1) fireYearStr = "This Year";
          } catch (e) { fireYearStr = "Calc Error"; }
      }
  }

  // Date Formatting
  const today = new Date();
  const dateStr = today.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <div className="space-y-6 pb-24 md:pb-0">
      {/* Header & Date */}
      

      {/* Main Net Worth Card with Chart */}
      <PremiumCard glow className="overflow-hidden min-h-[300px] flex flex-col">
        <div className="relative z-10 flex justify-between items-start">
            <div>
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest">
                    {viewMode === 'personal' ? 'Personal Net Worth' : 'Household Net Worth'}
                </p>
                <h2 className="text-4xl md:text-5xl font-bold mt-2 tracking-tighter">
                    {formatCurrency(netWorth)}
                </h2>
                {/* Comparison Logic: Only show if history exists */}
                {comparison.hasData ? (
                <div className={cn("flex items-center gap-2 mt-2", 
                    percentChange > 0 ? "text-green-600 dark:text-green-400" : 
                    percentChange < 0 ? "text-red-600 dark:text-red-400" : 
                    "text-muted-foreground"
                )}>
                    <div className={cn("p-1 rounded-full",
                        percentChange > 0 ? "bg-green-500/20" : 
                        percentChange < 0 ? "bg-red-500/20" : 
                        "bg-muted/50"
                    )}>
                        {percentChange > 0 ? <ArrowUpRight size={16} /> : 
                         percentChange < 0 ? <ArrowDownRight size={16} /> :
                         <ArrowRight size={16} />}
                    </div>
                    <span className="font-bold">{percentChange > 0 ? '+' : ''}{percentChange.toFixed(1)}%</span>
                    <span className="text-muted-foreground text-sm">vs last month</span>
                </div>
                ) : (
                <div className="flex items-center gap-2 mt-2 text-muted-foreground">
                    <div className="p-1 rounded-full bg-muted/50">
                        <ArrowRight size={16} />
                    </div>
                    <span className="text-sm">No comparison data yet</span>
                </div>
                )}
            </div>
            <div className="p-3 bg-primary/10 rounded-full">
                <Wallet className="text-primary" size={24} />
            </div>
        </div>

        <div className="flex-1 mt-6 px-2">
             <div className="h-32 w-full relative flex items-end">
                <ProgressCurve progress={progressPercent} />
                <div className="absolute bottom-0 right-0 text-4xl font-bold text-primary/20">
                    {progressPercent.toFixed(0)}%
                </div>
             </div>
        </div>
      </PremiumCard>

      {/* KPIs Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
         <Dialog>
            <DialogTrigger asChild>
                <div className="cursor-pointer hover:opacity-80 transition-opacity">
                    <PremiumCard className="space-y-2 bg-muted/30 border-none shadow-none h-full">
                        <p className="text-xs text-muted-foreground uppercase">Total Cash</p>
                        <p className="text-xl font-bold">{formatCurrency(totalCash)}</p>
                    </PremiumCard>
                </div>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Total Cash Breakdown</DialogTitle>
                    <DialogDescription>Sum of all cash and savings accounts.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    {data.accounts.filter(a => {
                        if (viewMode === 'personal') return a.ownerId === data.user?.id;
                        return a.includeInHousehold;
                    }).filter(a => ['cash', 'savings'].includes(a.type)).map(acc => (
                        <div key={acc.id} className="flex justify-between text-sm border-b pb-2 last:border-0 border-border/50">
                            <span>{acc.name}</span>
                            <span className="font-mono">{formatCurrency(acc.balance)}</span>
                        </div>
                    ))}
                     <div className="flex justify-between font-bold pt-2 border-t border-border">
                        <span>Total</span>
                        <span>{formatCurrency(totalCash)}</span>
                    </div>
                </div>
            </DialogContent>
         </Dialog>

         <Dialog>
            <DialogTrigger asChild>
                <div className="cursor-pointer hover:opacity-80 transition-opacity">
                    <PremiumCard className="space-y-2 bg-muted/30 border-none shadow-none h-full">
                        <div className="flex items-center justify-between">
                            <p className="text-xs text-muted-foreground uppercase">{viewMode === 'personal' ? 'Your Income' : 'Combined Income'}</p>
                        </div>
                        <p className="text-xl font-bold">{formatCurrency(currentIncome)}</p>
                    </PremiumCard>
                </div>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Income Breakdown</DialogTitle>
                    <DialogDescription>Monthly net income sources.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                     {(viewMode === 'personal' || !data.household) ? (
                         data.user?.incomeSources?.map(src => (
                            <div key={src.id} className="flex justify-between text-sm border-b pb-2 last:border-0 border-border/50">
                                <span>{src.name}</span>
                                <span className="font-mono">{formatCurrency(src.amount)}</span>
                            </div>
                         ))
                     ) : (
                         data.household.members.map(m => {
                             const memberIncome = m.incomeSources?.reduce((sum, s) => sum + s.amount, 0) || m.netIncome || 0;
                             return (
                                <div key={m.id} className="flex justify-between text-sm border-b pb-2 last:border-0 border-border/50">
                                    <span>{m.name}</span>
                                    <span className="font-mono">{formatCurrency(memberIncome)}</span>
                                </div>
                             );
                         })
                     )}
                     <div className="flex justify-between font-bold pt-2 border-t border-border">
                        <span>Total</span>
                        <span>{formatCurrency(currentIncome)}</span>
                    </div>
                </div>
            </DialogContent>
         </Dialog>

         <Dialog>
            <DialogTrigger asChild>
                <div className="cursor-pointer hover:opacity-80 transition-opacity">
                    <PremiumCard className="space-y-2 bg-muted/30 border-none shadow-none h-full">
                        <div className="flex items-center justify-between">
                            <p className="text-xs text-muted-foreground uppercase">Savings Rate</p>
                        </div>
                        <p className="text-xl font-bold text-green-600">
                            {currentIncome > 0 ? ((monthlySavings / currentIncome) * 100).toFixed(1) : 0}%
                        </p>
                    </PremiumCard>
                </div>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Savings Rate Calculation</DialogTitle>
                    <DialogDescription>
                        Your savings rate shows the percentage of your income that remains after expenses.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="p-4 bg-muted/50 rounded-lg space-y-3">
                        <div className="flex justify-between text-sm">
                            <span>Total Income</span>
                            <span className="font-mono text-green-600">+{formatCurrency(currentIncome)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span>Fixed Costs</span>
                            <span className="font-mono text-red-500">-{formatCurrency(fixedCosts)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span>Variable Spending</span>
                            <span className="font-mono text-red-500">-{formatCurrency(data.variableSpending)}</span>
                        </div>
                        <div className="h-px bg-border my-2" />
                        <div className="flex justify-between font-semibold">
                            <span>Monthly Savings</span>
                            <span className="font-mono">{formatCurrency(monthlySavings)}</span>
                        </div>
                    </div>
                    
                    <div className="text-center p-4 border rounded-lg">
                        <p className="text-sm text-muted-foreground mb-1">Formula</p>
                        <p className="font-mono text-sm sm:text-base font-medium">
                            (Savings ÷ Income) × 100 = <span className="text-primary">{currentIncome > 0 ? ((monthlySavings / currentIncome) * 100).toFixed(1) : 0}%</span>
                        </p>
                    </div>
                </div>
            </DialogContent>
         </Dialog>

         <Dialog>
            <DialogTrigger asChild>
                <div className="cursor-pointer hover:opacity-80 transition-opacity">
                    <PremiumCard className="space-y-2 bg-muted/30 border-none shadow-none h-full">
                        <p className="text-xs text-muted-foreground uppercase">Free Cash Flow</p>
                        <p className="text-xl font-bold">{formatCurrency(monthlySavings)}</p>
                    </PremiumCard>
                </div>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Free Cash Flow</DialogTitle>
                    <DialogDescription>Money left over after all expenses.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="p-4 bg-muted/50 rounded-lg space-y-3">
                        <div className="flex justify-between text-sm">
                            <span>Total Income</span>
                            <span className="font-mono text-green-600">+{formatCurrency(currentIncome)}</span>
                        </div>
                         <div className="flex justify-between text-sm">
                            <span>Fixed Costs</span>
                            <span className="font-mono text-red-500">-{formatCurrency(fixedCosts)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span>Variable Spending</span>
                            <span className="font-mono text-red-500">-{formatCurrency(data.variableSpending)}</span>
                        </div>
                         <div className="h-px bg-border my-2" />
                        <div className="flex justify-between font-semibold">
                            <span>Net Cash Flow</span>
                            <span className="font-mono">{formatCurrency(monthlySavings)}</span>
                        </div>
                    </div>
                </div>
            </DialogContent>
         </Dialog>
      </div>

      {/* Two Column Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Emergency Fund */}
        <div className="md:col-span-1 space-y-6"><PremiumCard className={`flex flex-col gap-4 border-l-4 ${isEmergencyFullyFunded ? 'border-l-green-500' : 'border-l-orange-500'} transition-colors duration-500`}>
            <div className="flex items-center justify-between pb-3 border-b border-border/50">
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${isEmergencyFullyFunded ? 'bg-green-100 dark:bg-green-900/20 text-green-600' : 'bg-orange-100 dark:bg-orange-900/20 text-orange-600'} transition-colors`}>
                        <AlertCircle size={20} />
                    </div>
                    <div>
                        <h3 className="font-semibold">Emergency Fund</h3>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider">Safety Net</p>
                    </div>
                </div>
                <Dialog open={isEmergencyEditOpen} onOpenChange={setIsEmergencyEditOpen}>
                    <DialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 px-2 text-muted-foreground">
                            Edit
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Emergency Fund Target</DialogTitle>
                            <DialogDescription>
                                Set the amount you want to reserve as a safety net.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="py-4 space-y-6">
                            <div className="space-y-2">
                                <Label>Target Amount</Label>
                                <div className="relative">
                                    <Input 
                                        type="number" 
                                        value={newEmergencyTarget} 
                                        onChange={(e) => setNewEmergencyTarget(parseFloat(e.target.value))}
                                        className="font-bold text-lg pr-8" 
                                    />
                                    <span className="absolute right-3 top-2.5 text-muted-foreground">€</span>
                                </div>
                            </div>
                            
                            <div className="flex items-center justify-between bg-muted/50 p-3 rounded-lg">
                                <div className="space-y-0.5">
                                    <Label>My income varies month to month</Label>
                                    <p className="text-xs text-muted-foreground">Increases recommended safety net.</p>
                                </div>
                                <Switch 
                                    checked={isVariableIncomeLocal}
                                    onCheckedChange={setIsVariableIncomeLocal}
                                />
                            </div>
                            
                            <div className="space-y-3 pt-2 border-t">
                                <p className="text-sm font-medium text-muted-foreground uppercase">Recommended Range</p>
                                <div className="flex gap-2">
                                    <div 
                                        className="flex-1 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800 cursor-pointer hover:bg-blue-100 transition-colors"
                                        onClick={() => setNewEmergencyTarget(emergencyMin)}
                                    >
                                        <p className="text-xs text-blue-600 dark:text-blue-400 font-bold mb-1">MINIMUM</p>
                                        <p className="text-lg font-bold text-blue-700 dark:text-blue-300">{formatCurrency(emergencyMin)}</p>
                                        <p className="text-[10px] text-muted-foreground">3 months expenses</p>
                                    </div>
                                    <div 
                                        className="flex-1 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-100 dark:border-purple-800 cursor-pointer hover:bg-purple-100 transition-colors"
                                        onClick={() => setNewEmergencyTarget(emergencyMax)}
                                    >
                                        <p className="text-xs text-purple-600 dark:text-purple-400 font-bold mb-1">MAXIMUM</p>
                                        <p className="text-lg font-bold text-purple-700 dark:text-purple-300">{formatCurrency(emergencyMax)}</p>
                                        <p className="text-[10px] text-muted-foreground">6 months expenses</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button onClick={() => {
                                updateData({ 
                                    emergencyFundGoal: newEmergencyTarget,
                                    isVariableIncome: isVariableIncomeLocal
                                });
                                setIsEmergencyEditOpen(false);
                            }}>Save Settings</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
            <div>
                <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">{formatCurrency(currentEmergencyAmount)} / {formatCurrency(data.emergencyFundGoal)}</span>
                    <span className={`font-bold ${isEmergencyFullyFunded ? 'text-green-600' : ''}`}>{emergencyProgress.toFixed(0)}%</span>
                </div>
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <div 
                        className={`h-full transition-all duration-500 ${isEmergencyFullyFunded ? 'bg-green-500' : 'bg-orange-500'}`}
                        style={{ width: `${emergencyProgress}%` }} 
                    />
                </div>
            </div>
            {isEmergencyFullyFunded ? (
                 <div className="text-xs text-green-800 dark:text-green-300 bg-green-50 dark:bg-green-900/20 p-3 rounded-lg flex items-start gap-2">
                    <TrendingUp size={14} className="mt-0.5 shrink-0" />
                    <span>Fully funded! Surplus is allocated to goals.</span>
                </div>
            ) : (
                <div className="text-xs text-orange-800 dark:text-orange-300 bg-orange-50 dark:bg-orange-900/20 p-3 rounded-lg flex items-start gap-2">
                    <TrendingUp size={14} className="mt-0.5 shrink-0" />
                    <span>Gap of {formatCurrency(data.emergencyFundGoal - currentEmergencyAmount)}. Suggest adding €500/mo.</span>
                </div>
            )}
        </PremiumCard>

        {/* Forecast Card */}
        <PremiumCard onClick={() => onNavigate('forecast')} className="flex flex-col gap-4 cursor-pointer hover:border-primary/50 transition-colors group overflow-hidden">
             <div className="flex items-center justify-between pb-3 border-b border-border/50">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/20 text-purple-600 rounded-lg group-hover:bg-purple-200 transition-colors">
                        <TrendingUp size={20} />
                    </div>
                    <div>
                        <h3 className="font-semibold">Wealth Forecast</h3>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider">25-Year Projection</p>
                    </div>
                </div>
                <ArrowRight size={16} className="text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
            
            <div className="h-[100px] w-full mt-2">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={[0, 5, 10, 15, 20, 25].map(y => ({ y, v: investmentAssets * Math.pow(1.07, y) }))} margin={{top: 5, right: 0, bottom: 0, left: 0}}>
                        <defs>
                            <linearGradient id="forecastGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <Area 
                            type="monotone" 
                            dataKey="v" 
                            stroke="var(--color-primary)" 
                            strokeWidth={2} 
                            fill="url(#forecastGradient)" 
                            isAnimationActive={false}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border/50">
                <div>
                    <p className="text-[10px] text-muted-foreground uppercase">Now</p>
                    <p className="font-bold text-xs">{formatCurrency(investmentAssets, 'EUR', 0)}</p>
                </div>
                 <div className="text-center">
                    <p className="text-[10px] text-muted-foreground uppercase">10 Years</p>
                    <p className="font-bold text-xs">{formatCurrency(investmentAssets * Math.pow(1.07, 10), 'EUR', 0)}</p>
                </div>
                 <div className="text-right">
                    <p className="text-[10px] text-muted-foreground uppercase">25 Years</p>
                    <p className="font-bold text-xs text-primary">{formatCurrency(investmentAssets * Math.pow(1.07, 25), 'EUR', 0)}</p>
                </div>
            </div>
        </PremiumCard>

        {/* FIRE Card */}
        <PremiumCard className="flex flex-col gap-4 border-l-4 border-l-orange-500 relative overflow-hidden">
             <div className="flex items-center justify-between pb-3 border-b border-border/50 relative z-10">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-100 dark:bg-orange-900/20 text-orange-600 rounded-lg">
                        <Flame size={20} />
                    </div>
                    <div>
                        <h3 className="font-semibold">Financial Freedom</h3>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider">Household Goal</p>
                    </div>
                </div>
            </div>
            
            <div className="space-y-1 relative z-10">
                <p className="text-3xl font-bold tracking-tight">{fireYearStr}</p>
                <p className="text-sm text-muted-foreground">Estimated Retirement</p>
            </div>
            
            <div className="relative z-10 mt-auto pt-2">
                 <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground text-xs font-medium uppercase tracking-wider">Target</span>
                    <span className="font-bold text-xs">{formatCurrency(fireNumber)}</span>
                </div>
                 <div className="h-2 w-full bg-muted/50 rounded-full overflow-hidden mb-1">
                    <div 
                        className="h-full bg-orange-500 transition-all duration-500"
                        style={{ width: `${Math.min(100, (fireLiquidAssets / fireNumber) * 100)}%` }} 
                    />
                </div>
                <div className="flex justify-end">
                    <span className="text-xs text-muted-foreground">{((fireLiquidAssets / fireNumber) * 100).toFixed(1)}% Achieved</span>
                </div>
            </div>

             {/* Subtle background decoration */}
             <div className="absolute -bottom-6 -right-6 text-orange-500/5 rotate-12">
                <Sunrise size={120} />
             </div>
        </PremiumCard>
        </div>

        {/* Accounts Summary */}
        <PremiumCard className="md:col-span-2 md:self-start flex flex-col gap-4">
             <div className="flex items-center justify-between pb-3 border-b border-border/50">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/20 text-blue-600 rounded-lg">
                        <PiggyBank size={20} />
                    </div>
                    <div>
                        <h3 className="font-semibold">Household Accounts</h3>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider">Assets Overview</p>
                    </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => onNavigate('personal')} className="text-muted-foreground hover:text-primary">
                    <ChevronRight size={20} />
                </Button>
            </div>
            <div className="space-y-1">
                {householdAccounts.map(account => (
                    <div key={account.id} className="flex items-center justify-between p-2 -mx-2 hover:bg-muted/50 rounded-xl transition-colors cursor-pointer group">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground group-hover:bg-white group-hover:shadow-sm transition-all">
                                {account.type === 'investment' ? <ArrowUpRight size={18} /> : <CreditCard size={18} />}
                            </div>
                            <div>
                                <p className="font-medium">{account.name}</p>
                                <div className="flex items-center gap-2">
                                    <p className="text-xs text-muted-foreground">{account.institution}</p>
                                    {account.ownerId !== 'joint' && (
                                        <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded-full flex items-center gap-1 text-muted-foreground">
                                            <User size={8} /> {account.ownerId === data.user?.id ? data.user?.name : (data.household?.members?.find(m => m.id === account.ownerId)?.name || 'Partner')}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                        <p className="font-bold">{formatCurrency(account.balance)}</p>
                    </div>
                ))}
                {householdAccounts.length === 0 && (
                    <div className="text-center text-muted-foreground text-sm py-8 bg-muted/20 rounded-xl border-dashed border-2 border-muted">
                        {viewMode === 'personal' 
                           ? "No personal accounts found. Add one in the Personal tab."
                           : "No shared accounts yet. Go to Personal to share accounts."}
                    </div>
                )}
            </div>
        </PremiumCard>
      </div>
    </div>
  );
};