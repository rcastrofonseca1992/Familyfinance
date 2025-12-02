import React, { useState, useMemo } from 'react';
import { useFinance, Goal } from '../store/FinanceContext';
import { PremiumCard } from '../ui/PremiumCard';
import { formatCurrency, computeFeasibility, calculateGoalDelay, getMarketSentiment, getMortgageAdvice, HOUSE_TARGET, CASH_RATIO_FOR_HOUSE, DTI_LIMIT, DEFAULT_LOAN_YEARS, DEFAULT_INTEREST, EMERGENCY_FUND_TARGET } from '../../lib/finance';
import { FeasibilityEngine } from '../feasibility/FeasibilityEngine';
import { SavingsRecommendations } from './SavingsRecommendations';
import { Target, Plane, Home, ShieldAlert, Plus, Trash2, Calendar, Save, X, AlertTriangle, TrendingUp, Info, CheckCircle, RefreshCw, Star, Calculator } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogFooter } from '../ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '../ui/sheet';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Switch } from '../ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { cn } from '../ui/utils';
import { toast } from 'sonner@2.0.3';
import { useLanguage } from '../../src/contexts/LanguageContext';

const DEFAULT_APY_ESTIMATE = 3.0; // 3% Conservative estimate

const getMonthsUntil = (dateStr: string) => {
    if (!dateStr) return 0;
    const end = new Date(dateStr);
    const now = new Date();
    const months = (end.getFullYear() - now.getFullYear()) * 12 + (end.getMonth() - now.getMonth());
    return Math.max(0, months);
};

const calculateMonthlyContribution = (target: number, current: number, months: number, apy: number = DEFAULT_APY_ESTIMATE) => {
    if (months <= 0) return 0;
    const needed = Math.max(0, target - current);
    if (needed === 0) return 0;
    
    if (apy === 0) return needed / months;
    
    const r = apy / 100 / 12;
    // PMT = (Target - Current*(1+r)^n) * r / ((1+r)^n - 1)
    const fvCurrent = current * Math.pow(1 + r, months);
    const remaining = target - fvCurrent;
    
    if (remaining <= 0) return 0;
    
    return remaining * r / (Math.pow(1 + r, months) - 1);
};

export interface GoalsViewProps {
    isAddOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
}

export const GoalsView: React.FC<GoalsViewProps> = ({ isAddOpen: propIsAddOpen, onOpenChange }) => {
  const { data, addGoal, updateGoal, deleteGoal, getHouseholdIncome, getPersonalTotalIncome, getHouseholdSavings, getHouseholdFixedCosts, viewMode } = useFinance();
  const { marketData } = data;
  
  // Add Goal State
  const [localIsAddOpen, setLocalIsAddOpen] = useState(false);
  
  const isAddOpen = propIsAddOpen !== undefined ? propIsAddOpen : localIsAddOpen;
  const setIsAddOpen = onOpenChange || setLocalIsAddOpen;

  const [newGoal, setNewGoal] = useState<Partial<Goal>>({
      name: '',
      targetAmount: 0,
      deadline: '',
      category: 'other',
      isMain: false
  });
  // Temporary state for Property Price input when category is Home
  const [newPropertyPrice, setNewPropertyPrice] = useState<string>('');

  // Edit Goal State (Sheet)
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('details');
  
  // Delete confirmation state
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [goalToDelete, setGoalToDelete] = useState<Goal | null>(null);

  const activeTabName = activeTab; // avoid lint unused var if needed, or activeTab is used in Tabs value prop
  
  const activeMainGoals = data.goals.filter(g => g.isMain);
  const activeOtherGoals = data.goals.filter(g => !g.isMain);
  // Re-filtered vars for logic below to keep names
  const mainGoals = activeMainGoals;
  const otherGoals = activeOtherGoals;

  const primaryMainGoal = mainGoals.length > 0 ? mainGoals[0] : null;
  
  const householdIncome = viewMode === 'personal' ? getPersonalTotalIncome() : getHouseholdIncome();
  const householdSavings = getHouseholdSavings();
  const fixedCosts = getHouseholdFixedCosts();
  const avgMonthlySavings = householdIncome - fixedCosts - data.variableSpending;
  const emergencyFundTarget = data.emergencyFundGoal || EMERGENCY_FUND_TARGET;

  // Auto-calculated savings for Main Goal (Total Liquid - Emergency Fund)
  // We ensure we don't go below zero
  const netAllocatableSavings = Math.max(0, householdSavings - emergencyFundTarget);

  // Risk Calculation for New Goal
  const delayRisk = useMemo(() => {
      if (!newGoal.targetAmount || !primaryMainGoal) return null;
      
      // Calculate missing cash for main goal
      // For Home goals, the targetAmount IS the cash target.
      const availableForHouse = Math.max(householdSavings - (data.emergencyFundGoal || EMERGENCY_FUND_TARGET), 0);
      const missingCash = Math.max(primaryMainGoal.targetAmount - availableForHouse, 0);
      
      const monthsDelayed = calculateGoalDelay(Number(newGoal.targetAmount), avgMonthlySavings, missingCash);
      return monthsDelayed;
  }, [newGoal.targetAmount, primaryMainGoal, householdSavings, avgMonthlySavings, data.emergencyFundGoal]);

  // Feasibility Status Helper
  const getFeasibilityStatus = (goal: Goal) => {
      if (goal.category !== 'home') return null;
      
      // For main goal, use auto-calculated savings (Gross Household Savings)
      // For others, use the specific pot allocated
      const savingsInput = goal.isMain ? householdSavings : goal.currentAmount;

      const result = computeFeasibility({
          incomeRicardo: householdIncome / 2, // simplified split
          incomeMaria: householdIncome / 2,
          fixedCosts,
          otherDebtPayments: 0,
          savingsTotal: savingsInput,
          avgMonthlySavings
      }, {
          emergencyFund: data.emergencyFundGoal || EMERGENCY_FUND_TARGET,
          houseTarget: goal.propertyValue || (goal.targetAmount / CASH_RATIO_FOR_HOUSE), 
          cashRatio: CASH_RATIO_FOR_HOUSE,
          dtiLimit: DTI_LIMIT,
          annualRate: marketData.avgFixedRate / 100, // Use BDE Data
          years: DEFAULT_LOAN_YEARS
      });

      // Determine High/Med/Low
      if (result.fullyReadyForTarget) return { label: 'High', color: 'text-green-500', bg: 'bg-green-500/10' };
      if (result.dtiOkForTarget && result.missingCashTarget < 20000) return { label: 'Medium', color: 'text-yellow-500', bg: 'bg-yellow-500/10' };
      return { label: 'Low', color: 'text-red-500', bg: 'bg-red-500/10' };
  };

  const getIcon = (cat: string) => {
    switch(cat) {
        case 'home': return <Home size={20} />;
        case 'trip': return <Plane size={20} />;
        case 'emergency': return <ShieldAlert size={20} />;
        case 'kids': return <Target size={20} className="text-pink-500" />;
        default: return <Target size={20} />;
    }
  };

  const handleAddGoal = () => {
      if (!newGoal.name || !newGoal.deadline) return;
      
      // Special handling for Home goals
      let finalTargetAmount = Number(newGoal.targetAmount);
      let finalPropertyValue = undefined;

      if (newGoal.category === 'home' && newPropertyPrice) {
          const price = parseFloat(newPropertyPrice);
          if (!isNaN(price)) {
              finalPropertyValue = price;
              // Default target is cash needed (30%)
              finalTargetAmount = price * CASH_RATIO_FOR_HOUSE; 
          }
      }

      if (!finalTargetAmount) return;

      // Warn if multiple main goals
      if (newGoal.isMain && mainGoals.length > 0) {
          toast("You now have multiple main goals. We'll track all of them, but recommend focusing on one.", {
              icon: <Info size={16} className="text-blue-500" />
          });
      }

      addGoal({
          name: newGoal.name,
          targetAmount: finalTargetAmount,
          deadline: newGoal.deadline,
          category: (newGoal.category as any) || 'other',
          isMain: newGoal.isMain,
          propertyValue: finalPropertyValue
      });
      setIsAddOpen(false);
      setNewGoal({ name: '', targetAmount: 0, deadline: '', category: 'other', isMain: false });
      setNewPropertyPrice('');
      toast.success("Goal created successfully");
  };

  const handleSaveEdit = () => {
      if (!selectedGoal) return;
      updateGoal(selectedGoal.id, {
          name: selectedGoal.name,
          targetAmount: Number(selectedGoal.targetAmount),
          currentAmount: Number(selectedGoal.currentAmount),
          deadline: selectedGoal.deadline,
          category: selectedGoal.category,
          isMain: selectedGoal.isMain,
          propertyValue: selectedGoal.propertyValue // Persist changes if edited (though UI for editing prop price is not added yet for simplicity, could add)
      });
      toast.success("Goal updated");
      setIsEditOpen(false);
  };

  const openGoalDetail = (goal: Goal, tab = 'details') => {
      setSelectedGoal({ ...goal });
      setActiveTab(tab);
      setIsEditOpen(true);
  };

  // Handler for changing property price in add/edit
  const onPropertyPriceChange = (val: string) => {
      setNewPropertyPrice(val);
      const price = parseFloat(val);
      if (!isNaN(price)) {
           setNewGoal(prev => ({ ...prev, targetAmount: price * CASH_RATIO_FOR_HOUSE }));
      }
  };

  const { t } = useLanguage();

  return (
    <div className="space-y-8 pb-24">
        {/* Header moved to global AppShell */}
        {/* Add Goal Dialog */}
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                {/* Hidden Trigger if controlled externally, but we keep logic here for simplicity */}
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create New Goal</DialogTitle>
                        <DialogDescription>
                            Set a target amount and deadline for your goal.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label>Category</Label>
                            <Select value={newGoal.category} onValueChange={v => setNewGoal({...newGoal, category: v as any})}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="home">Home (Main)</SelectItem>
                                    <SelectItem value="trip">Travel</SelectItem>
                                    <SelectItem value="emergency">Emergency Fund</SelectItem>
                                    <SelectItem value="kids">Family/Kids</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid gap-2">
                            <Label>Goal Name</Label>
                            <Input value={newGoal.name} onChange={e => setNewGoal({...newGoal, name: e.target.value})} placeholder={newGoal.category === 'home' ? "e.g. Dream House" : "e.g. Japan Trip"} />
                        </div>
                        
                        {newGoal.category === 'home' ? (
                            <div className="grid gap-2 p-3 bg-muted/30 rounded-lg border">
                                <Label>Property Price</Label>
                                <div className="relative">
                                    <Input type="number" value={newPropertyPrice} onChange={e => onPropertyPriceChange(e.target.value)} placeholder="500000" />
                                    <span className="absolute right-3 top-2.5 text-muted-foreground">€</span>
                                </div>
                                <div className="flex justify-between text-xs text-muted-foreground mt-1 px-1">
                                    <span>Estimated Cash Needed (30%):</span>
                                    <span className="font-bold text-foreground">{formatCurrency(Number(newGoal.targetAmount))}</span>
                                </div>
                                <p className="text-[10px] text-muted-foreground mt-1 px-1">Includes 20% down payment + ~10% taxes/fees.</p>
                            </div>
                        ) : (
                            <div className="grid gap-2">
                                <Label>Target Amount</Label>
                                <Input type="number" value={newGoal.targetAmount} onChange={e => setNewGoal({...newGoal, targetAmount: parseFloat(e.target.value)})} />
                            </div>
                        )}

                        {/* Risk Warning */}
                        {delayRisk !== null && delayRisk > 0 && !newGoal.isMain && (
                            <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-3 flex items-start gap-3 text-sm text-orange-700 dark:text-orange-400">
                                <AlertTriangle size={16} className="mt-0.5 shrink-0" />
                                <div>
                                    <span className="font-semibold">Impact on Main Goal:</span>
                                    <p>This expense could delay your house purchase by approximately <span className="font-bold">{delayRisk} months</span>.</p>
                                </div>
                            </div>
                        )}

                        <div className="grid gap-2">
                            <Label>Target Date</Label>
                            <Input type="date" value={newGoal.deadline} onChange={e => setNewGoal({...newGoal, deadline: e.target.value})} />
                        </div>
                        
                        <div className="flex items-center justify-between mt-2 p-3 bg-muted/50 rounded-lg">
                            <div className="space-y-0.5">
                                <Label>Set as Main Goal?</Label>
                                <p className="text-xs text-muted-foreground">Prioritize this goal in your financial plan.</p>
                            </div>
                            <Switch checked={newGoal.isMain} onCheckedChange={c => setNewGoal({...newGoal, isMain: c})} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={handleAddGoal}>Create Goal</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

        {/* Main Goals Section */}
        {mainGoals.length > 0 && (
            <section className="space-y-6">
                <div className="grid gap-8">
                    {mainGoals.map(goal => {
                        // Derive current amount for display if it's main
                        const displayCurrentAmount = netAllocatableSavings;
                        const progress = Math.min(100, (displayCurrentAmount / goal.targetAmount) * 100);

                        return (
                        <div key={goal.id} className="relative">
                            <PremiumCard glow className="border-primary/20 transition-transform hover:scale-[1.005] bg-emerald-50/50 dark:bg-emerald-950/10 p-6 md:p-8 px-[16px] py-[24px]">
                                <div className="space-y-8 cursor-pointer" onClick={() => openGoalDetail(goal, 'details')}>
                                    
                                    {/* 1. Tags */}
                                    <div className="flex items-center gap-3">
                                        <span className="px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-emerald-100/60 text-emerald-700 border border-emerald-200/60 shadow-sm">
                                            Main Goal
                                        </span>
                                        {getFeasibilityStatus(goal) && (
                                            <span className={cn("px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border shadow-sm", getFeasibilityStatus(goal)?.bg, getFeasibilityStatus(goal)?.color)}>
                                                {getFeasibilityStatus(goal)?.label} Chance
                                            </span>
                                        )}
                                    </div>

                                    {/* 2. Name + Price */}
                                    <div>
                                        <div className="flex flex-wrap items-baseline gap-x-3 mb-1">
                                            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground">
                                                {goal.name}
                                            </h2>
                                            <span className="text-2xl md:text-4xl font-light text-muted-foreground">({progress.toFixed(0)}%)</span>
                                        </div>
                                        <p className="text-2xl md:text-4xl font-light text-foreground/80">
                                            {goal.category === 'home' && goal.propertyValue 
                                                ? formatCurrency(goal.propertyValue) 
                                                : formatCurrency(goal.targetAmount)}
                                        </p>
                                    </div>

                                    {/* 3. Progress Section */}
                                    <div className="bg-white/60 dark:bg-black/20 rounded-2xl p-6 border border-emerald-100/50 shadow-sm space-y-6">
                                        <div className="flex justify-between items-end">
                                            <div>
                                                <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Current Savings</p>
                                                <div className="flex items-baseline gap-2">
                                                    <span className="text-3xl font-medium text-emerald-900 dark:text-emerald-100">{formatCurrency(displayCurrentAmount)}</span>
                                                    <span className="text-sm text-muted-foreground">
                                                        / {formatCurrency(goal.targetAmount)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div>
                                            <div className="h-3 bg-emerald-100/50 rounded-full overflow-hidden mb-2">
                                                <div className="h-full bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all duration-1000" style={{ width: `${progress}%` }} />
                                            </div>
                                            <div className="flex justify-between text-xs text-muted-foreground">
                                                <span>*Allocated from surplus</span>
                                                <span className="font-medium text-emerald-700 dark:text-emerald-400">{formatCurrency(Math.max(0, goal.targetAmount - displayCurrentAmount))} remaining</span>
                                            </div>
                                        </div>

                                        {/* Analysis Grid */}
                                        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-emerald-100/50">
                                            <div>
                                                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-0.5">Time Left</p>
                                                <p className="text-sm font-medium text-foreground">
                                                    {goal.deadline ? `${getMonthsUntil(goal.deadline)} months` : 'No deadline'}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-0.5">Required/Mo</p>
                                                <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
                                                    {goal.deadline 
                                                        ? formatCurrency(calculateMonthlyContribution(goal.targetAmount, displayCurrentAmount, getMonthsUntil(goal.deadline)))
                                                        : '-'}
                                                </p>
                                            </div>
                                            <div>
                                                 <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-0.5">Exp. APY</p>
                                                 <p className="text-sm font-medium text-foreground">{DEFAULT_APY_ESTIMATE}%</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* 4. Market Context (Horizontal Strip) */}
                                    <div className="pt-2 border-t border-emerald-200/40 flex flex-col md:flex-row gap-6 md:items-center justify-between">
                                        <div className="flex flex-col gap-4 min-w-[120px]">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-emerald-100/50 rounded-lg text-emerald-700 shadow-sm">
                                                    <TrendingUp size={16} />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] uppercase text-muted-foreground font-bold leading-none mb-1">Euribor</p>
                                                    <p className="text-lg font-semibold text-emerald-900 dark:text-emerald-100 leading-none">{marketData.euribor12m}%</p>
                                                </div>
                                            </div>
                                            <div className="pl-1">
                                                <p className="text-[10px] uppercase text-muted-foreground font-bold mb-1">Sentiment</p>
                                                <p className="text-sm font-medium text-emerald-800 dark:text-emerald-200 bg-emerald-100/30 px-2 py-0.5 rounded-md inline-block border border-emerald-200/30">
                                                    {getMarketSentiment(marketData.euribor12m)}
                                                </p>
                                            </div>
                                        </div>

                                        <p className="text-xs text-muted-foreground flex-1 max-w-xl leading-relaxed hidden md:block">
                                            {getMortgageAdvice(marketData.euribor12m)}
                                        </p>

                                        <Button 
                                            onClick={(e) => { e.stopPropagation(); openGoalDetail(goal, 'simulator'); }} 
                                            variant="ghost" 
                                            className="gap-2 text-emerald-700 hover:text-emerald-800 hover:bg-emerald-100/50 whitespace-nowrap"
                                        >
                                            <Calculator size={16} /> Simulator
                                        </Button>
                                    </div>
                                </div>
                            </PremiumCard>
                        </div>
                        );
                    })}
                </div>
            </section>
        )}

        <section>
            <SavingsRecommendations />
        </section>

        {/* Other Goals Grid */}
        <section>
             <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Target size={20} />
                Personal & Other Goals
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {otherGoals.map(goal => {
                    const progress = Math.min(100, (goal.currentAmount / goal.targetAmount) * 100);
                    const daysLeft = Math.ceil((new Date(goal.deadline).getTime() - Date.now()) / (1000 * 3600 * 24));
                    const monthsLeft = Math.ceil(daysLeft / 30);
                    const requiredMonthly = monthsLeft > 0 ? (goal.targetAmount - goal.currentAmount) / monthsLeft : 0;

                    return (
                        <div key={goal.id} onClick={() => openGoalDetail(goal)} className="cursor-pointer transition-transform hover:scale-[1.02] active:scale-[0.98]">
                            <PremiumCard hoverEffect className="relative h-full flex flex-col p-[16px]">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-2 bg-primary/5 rounded-xl">
                                        {getIcon(goal.category)}
                                    </div>
                                    <span className="text-xs font-mono bg-muted px-2 py-1 rounded-md text-muted-foreground flex items-center gap-1">
                                        <Calendar size={12} />
                                        {new Date(goal.deadline).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                                    </span>
                                </div>
                                
                                <h3 className="text-xl font-bold mb-1">{goal.name}</h3>
                                <div className="flex flex-col gap-1 mb-6">
                                     {goal.category === 'home' && goal.propertyValue ? (
                                         <>
                                            <p className="text-xs text-muted-foreground">Price: {formatCurrency(goal.propertyValue)}</p>
                                            <p className="text-sm text-muted-foreground">Cash: {formatCurrency(goal.targetAmount)}</p>
                                         </>
                                     ) : (
                                        <p className="text-sm text-muted-foreground">Target: {formatCurrency(goal.targetAmount)}</p>
                                     )}
                                </div>
                                
                                <div className="space-y-2 mt-auto">
                                    <div className="flex justify-between text-sm">
                                        <span className="font-medium">{formatCurrency(goal.currentAmount)}</span>
                                        <span className="text-muted-foreground">{progress.toFixed(0)}%</span>
                                    </div>
                                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                                        <div className="h-full bg-primary" style={{ width: `${progress}%` }} />
                                    </div>
                                </div>

                                {progress < 100 && requiredMonthly > 0 && (
                                    <div className="mt-4 pt-4 border-t border-border/50 text-xs text-muted-foreground">
                                        To reach goal: <span className="font-medium text-foreground">{formatCurrency(requiredMonthly)}/mo</span>
                                    </div>
                                )}
                            </PremiumCard>
                        </div>
                    );
                })}
                
                <button 
                    onClick={() => setIsAddOpen(true)}
                    className="group border-2 border-dashed border-muted-foreground/20 rounded-2xl p-6 flex flex-col items-center justify-center text-muted-foreground hover:text-emerald-700 hover:border-emerald-500/50 transition-all min-h-[200px]"
                >
                    <Plus size={32} className="mb-3 opacity-50 group-hover:opacity-100 transition-opacity" />
                    <span className="font-medium">Create New Goal</span>
                </button>
            </div>
        </section>

        {/* Goal Detail Sheet with Tabs */}
        <Sheet open={isEditOpen} onOpenChange={setIsEditOpen}>
            <SheetContent className="sm:max-w-2xl w-full overflow-y-auto p-0 gap-0">
                <SheetHeader className="p-6 pb-2">
                    <SheetTitle className="text-2xl flex items-center gap-2">
                        {selectedGoal && getIcon(selectedGoal.category)}
                        {selectedGoal?.name}
                    </SheetTitle>
                    <SheetDescription>
                        Manage details and track progress.
                    </SheetDescription>
                </SheetHeader>

                {selectedGoal && (
                    <div className="px-6 pb-6">
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mt-6">
                            {selectedGoal.category === 'home' && (
                                <TabsList className="w-full grid grid-cols-2 mb-6">
                                    <TabsTrigger value="details">Details & Edit</TabsTrigger>
                                    <TabsTrigger value="simulator">Simulator</TabsTrigger>
                                </TabsList>
                            )}

                            <TabsContent value="details" className="space-y-6">
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Name</Label>
                                        <Input 
                                            value={selectedGoal.name} 
                                            onChange={e => setSelectedGoal({...selectedGoal, name: e.target.value})} 
                                        />
                                    </div>

                                    {selectedGoal.category === 'home' ? (
                                        <>
                                            <div className="space-y-2">
                                                <Label>Property Price</Label>
                                                <Input 
                                                    type="number" 
                                                    value={selectedGoal.propertyValue || ''} 
                                                    onChange={e => {
                                                        const p = parseFloat(e.target.value);
                                                        setSelectedGoal({...selectedGoal, propertyValue: p, targetAmount: p ? p * CASH_RATIO_FOR_HOUSE : 0});
                                                    }} 
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Target (Cash Needed)</Label>
                                                <Input 
                                                    type="number" 
                                                    value={selectedGoal.targetAmount} 
                                                    disabled
                                                    className="bg-muted/50"
                                                />
                                                <p className="text-[10px] text-muted-foreground">Calculated as 30% of Price.</p>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="space-y-2">
                                            <Label>Target Amount</Label>
                                            <Input 
                                                type="number" 
                                                value={selectedGoal.targetAmount} 
                                                onChange={e => setSelectedGoal({...selectedGoal, targetAmount: parseFloat(e.target.value)})} 
                                            />
                                        </div>
                                    )}

                                    <div className="space-y-2">
                                        <Label>Current Savings Allocation</Label>
                                        {selectedGoal.isMain ? (
                                            <div className="space-y-1">
                                                <Input 
                                                    value={formatCurrency(netAllocatableSavings)} 
                                                    disabled 
                                                    className="bg-muted/50 font-bold text-primary"
                                                />
                                                <p className="text-[10px] text-muted-foreground">
                                                    Auto-calculated: Total Liquid Savings ({formatCurrency(householdSavings)}) - Emergency Fund ({formatCurrency(emergencyFundTarget)}).
                                                </p>
                                            </div>
                                        ) : (
                                            <Input 
                                                type="number" 
                                                value={selectedGoal.currentAmount} 
                                                onChange={e => setSelectedGoal({...selectedGoal, currentAmount: parseFloat(e.target.value)})} 
                                            />
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Target Date</Label>
                                        <Input 
                                            type="date" 
                                            value={selectedGoal.deadline} 
                                            onChange={e => setSelectedGoal({...selectedGoal, deadline: e.target.value})} 
                                        />
                                    </div>
                                </div>
                                
                                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border">
                                    <div className="space-y-0.5">
                                        <Label className="text-base">Main Goal</Label>
                                        <p className="text-xs text-muted-foreground">Is this a primary financial objective?</p>
                                    </div>
                                    <Switch 
                                        checked={selectedGoal.isMain} 
                                        onCheckedChange={(c) => setSelectedGoal({...selectedGoal, isMain: c})} 
                                    />
                                </div>
                            </div>

                            {/* Projections */}
                             <PremiumCard className="bg-muted/30">
                                 <div className="text-center py-6">
                                     <p className="text-muted-foreground mb-2">Projected Monthly Savings Needed</p>
                                     <div className="text-3xl font-bold text-primary">
                                         {(() => {
                                             const daysLeft = Math.ceil((new Date(selectedGoal.deadline).getTime() - Date.now()) / (1000 * 3600 * 24));
                                             const monthsLeft = Math.max(1, Math.ceil(daysLeft / 30));
                                             const current = selectedGoal.isMain ? netAllocatableSavings : selectedGoal.currentAmount;
                                             const needed = Math.max(0, selectedGoal.targetAmount - current);
                                             return formatCurrency(needed / monthsLeft);
                                         })()} / mo
                                     </div>
                                     <p className="text-xs text-muted-foreground mt-2">for the next {
                                         Math.ceil((new Date(selectedGoal.deadline).getTime() - Date.now()) / (1000 * 3600 * 24 * 30))
                                     } months</p>
                                 </div>
                             </PremiumCard>

                            <div className="flex gap-2 pt-4 border-t w-full">
                                 <Button variant="destructive" className="flex-1" onClick={() => {
                                     setDeleteConfirmOpen(true);
                                     setGoalToDelete(selectedGoal);
                                 }}>
                                    <Trash2 size={16} className="mr-2" /> Delete Goal
                                </Button>
                                <Button onClick={handleSaveEdit} className="flex-1">
                                    <Save size={16} className="mr-2" /> Save Changes
                                </Button>
                            </div>
                        </TabsContent>

                        <TabsContent value="simulator">
                            <FeasibilityEngine 
                                targetAmount={selectedGoal.targetAmount} // This is Cash Target
                                propertyValue={selectedGoal.propertyValue} // This is full Price
                                currentAmount={selectedGoal.isMain ? undefined : selectedGoal.currentAmount}
                            />
                        </TabsContent>
                    </Tabs>
                    </div>
                )}
            </SheetContent>
        </Sheet>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Are you sure?</DialogTitle>
                    <DialogDescription>
                        This action cannot be undone. This will permanently delete the goal.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)}>
                        Cancel
                    </Button>
                    <Button variant="destructive" onClick={() => {
                        if (goalToDelete) {
                            deleteGoal(goalToDelete.id);
                            setIsEditOpen(false);
                            toast.success("Goal deleted");
                        }
                        setDeleteConfirmOpen(false);
                    }}>
                        Delete
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    </div>
  );
};