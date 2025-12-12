import React, { useState } from 'react';
import { useFinance } from '../../store/FinanceContext';
import { PremiumCard } from '../../ui/PremiumCard';
import { formatCurrency } from '../../lib/finance';
import { Info, ChevronDown, ChevronUp, ShieldCheck, TrendingUp, Zap, Flame, Sunrise } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../../ui/accordion';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '../../ui/dialog';
import { cn } from '../../ui/utils';

export const SavingsRecommendations: React.FC = () => {
  const { data, getHouseholdIncome, getPersonalTotalIncome, getHouseholdFixedCosts, getHouseholdTotalCash, getHouseholdNetWorth, viewMode } = useFinance();
  
  const calculateHouseholdLiquidAssets = () => {
      return data.accounts
        .filter(a => a.includeInHousehold && ['cash', 'savings', 'investment'].includes(a.type))
        .reduce((sum, a) => sum + a.balance, 0);
  };
  
  const calculateHouseholdFixedCosts = () => {
      return data.recurringCosts
        .filter(c => c.includeInHousehold)
        .reduce((sum, c) => sum + c.amount, 0);
  };

  // --- FIRE Calculations (ALWAYS Household) ---
  // We use the strict household helpers
  const totalMonthlyIncome = getHouseholdIncome(); // Now strictly household
  const totalFixedCosts = calculateHouseholdFixedCosts();
  const totalLiquidAssets = calculateHouseholdLiquidAssets();
  
  // Legacy variable spending is tricky as it's a single number. We assume it represents the household.
  const totalVariableSpending = data.variableSpending || 0;

  // --- Standard Recommendations (Respects View Mode) ---
  const currentViewIncome = viewMode === 'personal' ? getPersonalTotalIncome() : getHouseholdIncome();
  const currentViewFixedCosts = getHouseholdFixedCosts();
  const currentViewDisposable = Math.max(0, currentViewIncome - currentViewFixedCosts);

  const msc = Math.max(0.05 * currentViewIncome, 0.10 * currentViewDisposable);
  const rsr = 0.20 * currentViewIncome;
  const owr = Math.min(0.40 * currentViewIncome, 0.50 * currentViewDisposable);

  // --- FIRE Calculations Logic ---
  const monthlyExpenses = totalFixedCosts + totalVariableSpending; 
  const annualExpenses = monthlyExpenses * 12;
  const fireNumber = annualExpenses * 25; 
  
  const monthlySavings = totalMonthlyIncome - monthlyExpenses;
  
  let yearsToFire = 0;
  let fireYearStr = "N/A";
  
  if (monthlySavings <= 0) {
      fireYearStr = "Never (Save more!)";
  } else if (totalLiquidAssets >= fireNumber) {
      fireYearStr = "Reached!";
  } else {
      const r = 0.05 / 12; // 5% real return
      const PMT = monthlySavings;
      const PV = totalLiquidAssets;
      
      try {
        const numerator = fireNumber + (PMT / r);
        const denominator = PV + (PMT / r);
        const nMonths = Math.log(numerator / denominator) / Math.log(1 + r);
        yearsToFire = nMonths / 12;
        
        const currentYear = new Date().getFullYear();
        const retireYear = Math.floor(currentYear + yearsToFire);
        fireYearStr = `Year ${retireYear}`;
        if (yearsToFire < 1) fireYearStr = "This Year";
      } catch (e) {
        fireYearStr = "Calc Error";
      }
  }

  const formatVal = (val: number) => isNaN(val) ? '—' : formatCurrency(val);

  const recommendations = [
    {
        id: 'msc',
        title: 'Minimum Safety Contribution',
        subtitle: 'Baseline amount to build financial protection',
        amount: msc,
        formula: 'Max(5% of Income, 10% of Disposable)',
        icon: <ShieldCheck className="text-blue-500" size={24} />,
        color: 'bg-blue-500/10 text-blue-600',
        description: 'This is the absolute minimum you should aim to save each month to build a safety net against unexpected expenses.'
    },
    {
        id: 'rsr',
        title: 'Recommended Savings Rate',
        subtitle: 'Healthy savings target for long-term growth',
        amount: rsr,
        formula: '20% of Monthly Income',
        icon: <TrendingUp className="text-green-500" size={24} />,
        color: 'bg-green-500/10 text-green-600',
        description: 'The 50/30/20 rule suggests saving 20% of your income. Achieving this consistently puts you on track for financial independence.'
    },
    {
        id: 'owr',
        title: 'Optimal Savings Rate',
        subtitle: 'Aggressive savings to accelerate your goals',
        amount: owr,
        formula: 'Min(40% of Income, 50% of Disposable)',
        icon: <Zap className="text-purple-500" size={24} />,
        color: 'bg-purple-500/10 text-purple-600',
        description: 'For those who want to retire early or reach major goals faster. This aggressive rate requires keeping expenses low.'
    },
    {
        id: 'fire',
        title: 'Financial Independence (FIRE)',
        subtitle: `Targeting ${fireYearStr} (~${yearsToFire.toFixed(1)} years)`,
        amount: fireNumber,
        formula: 'Annual Expenses × 25',
        icon: <Flame className="text-orange-500" size={24} />,
        color: 'bg-orange-500/10 text-orange-600',
        description: 'The FIRE number represents the invested amount needed to cover your expenses indefinitely using a safe withdrawal rate of 4%.',
        isFire: true
    }
  ];

  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="savings-rec" className="border-none">
        <AccordionTrigger className="hover:no-underline py-0 mb-4">
            <div className="flex items-center gap-2">
                <Zap className="text-yellow-500 fill-yellow-500" size={20} />
                <h3 className="text-xl font-semibold">Savings Recommendations</h3>
            </div>
        </AccordionTrigger>
        <AccordionContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {recommendations.map((rec) => (
                    <PremiumCard key={rec.id} className="flex flex-col h-full relative group hover:border-primary/30 transition-colors">
                        <div className="flex justify-between items-start mb-3">
                            <div className={cn("p-2 rounded-xl", rec.color)}>
                                {rec.icon}
                            </div>
                            <Dialog>
                                <DialogTrigger asChild>
                                    <button className="text-muted-foreground hover:text-foreground transition-colors">
                                        <Info size={16} />
                                    </button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>{rec.title}</DialogTitle>
                                        <DialogDescription>{rec.subtitle}</DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-4 py-4">
                                        <div className="p-4 bg-muted rounded-lg space-y-2">
                                            <p className="text-sm font-medium text-muted-foreground uppercase">Formula</p>
                                            <p className="font-mono text-lg">{rec.formula}</p>
                                        </div>
                                        <div className="space-y-2">
                                            <p className="text-sm font-medium text-muted-foreground uppercase">{rec.isFire ? 'Target Amount' : 'Current Value'}</p>
                                            <p className="text-3xl font-bold">{formatVal(rec.amount)}</p>
                                        </div>
                                        {rec.isFire && (
                                            <div className="space-y-2 p-3 bg-orange-50 dark:bg-orange-900/10 rounded-lg border border-orange-100 dark:border-orange-900/30">
                                                <div className="flex items-center gap-2">
                                                    <Sunrise size={18} className="text-orange-600" />
                                                    <p className="font-semibold text-orange-700 dark:text-orange-400">Estimated Freedom: {fireYearStr}</p>
                                                </div>
                                                <p className="text-xs text-muted-foreground">Based on saving {formatCurrency(monthlySavings)}/mo at 5% real return.</p>
                                            </div>
                                        )}
                                        <p className="text-sm text-muted-foreground leading-relaxed">
                                            {rec.description}
                                        </p>
                                    </div>
                                </DialogContent>
                            </Dialog>
                        </div>
                        
                        <div className="mt-auto space-y-1">
                            <p className="text-3xl font-bold tracking-tight">{formatVal(rec.amount)}</p>
                            <p className="text-sm font-medium text-foreground">{rec.title}</p>
                            <p className="text-xs text-muted-foreground line-clamp-1">{rec.subtitle}</p>
                        </div>
                    </PremiumCard>
                ))}
            </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

