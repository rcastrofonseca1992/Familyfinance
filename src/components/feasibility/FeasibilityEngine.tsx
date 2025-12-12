
import React, { useState, useEffect } from 'react';
import { useFinance } from '../../store/FinanceContext';
import { 
  computeFeasibility, 
  mortgageMonthlyPayment, 
  maxMortgagePrincipalFromPayment,
  formatCurrency,
  EMERGENCY_FUND_TARGET,
  HOUSE_TARGET,
  CASH_RATIO_FOR_HOUSE,
  DTI_LIMIT,
  DEFAULT_LOAN_YEARS,
  DEFAULT_INTEREST
} from '../../lib/finance';
import { PremiumCard } from '../../ui/PremiumCard';
import { Slider } from '../../ui/slider';
import { AlertTriangle, CheckCircle, TrendingUp, Wallet, Building, Calculator, Landmark, Home, RefreshCw } from 'lucide-react';
import { cn } from '../../ui/utils';

// Simple SVG Curve for goal progress
const ProgressCurve = ({ progress }: { progress: number }) => {
    const clamped = Math.min(100, Math.max(0, progress));
    
    return (
        <svg viewBox="0 0 100 40" className="w-full h-20 opacity-50" preserveAspectRatio="none">
            <path d="M0,40 Q50,40 100,20" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted-foreground/20" />
            <path 
                d={`M0,40 Q${clamped/2},40 ${clamped},${40 - (clamped * 0.4)}`} 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="3" 
                className="text-primary"
                strokeLinecap="round"
            />
        </svg>
    );
};

interface FeasibilityEngineProps {
    targetAmount?: number; // This is the CASH TARGET (Down payment)
    currentAmount?: number;
    propertyValue?: number; // This is the FULL HOUSE PRICE
    className?: string;
}

type SimMode = 'price' | 'mortgage';

export const FeasibilityEngine: React.FC<FeasibilityEngineProps> = ({ targetAmount, currentAmount, propertyValue, className }) => {
  const { data, getHouseholdIncome, getPersonalTotalIncome, getHouseholdSavings, getHouseholdFixedCosts, getWeightedInvestmentReturn, viewMode } = useFinance();
  const { marketData } = data;
  
  const householdIncome = viewMode === 'personal' ? getPersonalTotalIncome() : getHouseholdIncome();
  // Use passed currentAmount if available, else total savings
  const totalSavings = currentAmount !== undefined ? currentAmount : getHouseholdSavings();
  const otherDebtPayments = 0; 
  
  const avgMonthlySavings = householdIncome - getHouseholdFixedCosts() - data.variableSpending;
  const weightedReturn = getWeightedInvestmentReturn() / 100; // Convert % to decimal
  
  // If propertyValue is provided, use it. Else, infer from targetAmount (Cash Needed / 0.30).
  // If neither, use default constant.
  const effectiveHousePrice = propertyValue || (targetAmount ? targetAmount / CASH_RATIO_FOR_HOUSE : HOUSE_TARGET);
  const effectiveCashTarget = targetAmount || effectiveHousePrice * CASH_RATIO_FOR_HOUSE;

  // Simulator State
  const [simMode, setSimMode] = useState<SimMode>('price');
  const [simPrice, setSimPrice] = useState(effectiveHousePrice);
  const [simMortgageAmount, setSimMortgageAmount] = useState(effectiveHousePrice * (1 - CASH_RATIO_FOR_HOUSE));
  const [simDuration, setSimDuration] = useState(30);
  // Initialize simInterest with BDE data if available, else default
  const [simInterest, setSimInterest] = useState(DEFAULT_INTEREST * 100);
  
  // Update local interest state when marketData changes (on load)
  useEffect(() => {
      if (marketData && marketData.avgFixedRate) {
          setSimInterest(marketData.avgFixedRate);
      }
  }, [marketData]);

  // Feasibility Result based on EFFECTIVE HOUSE PRICE (Full Value)
  // computeFeasibility expects 'houseTarget' to be the Price, and it derives required cash from that.
  const feasibility = computeFeasibility({
      incomeRicardo: householdIncome / 2, 
      incomeMaria: householdIncome / 2,
      fixedCosts: getHouseholdFixedCosts(),
      otherDebtPayments,
      savingsTotal: totalSavings,
      avgMonthlySavings
  }, {
      emergencyFund: data.emergencyFundGoal || EMERGENCY_FUND_TARGET,
      houseTarget: effectiveHousePrice, 
      cashRatio: CASH_RATIO_FOR_HOUSE,
      dtiLimit: DTI_LIMIT,
      annualRate: simInterest / 100, // Use Simulator State
      years: simDuration, // Use Simulator State
      savingsReturnRate: weightedReturn
  });

  // Simulator Calculations
  // Mode A: House Price Mode
  // "simPrice" is the full house price the user is simulating.
  const simCashNeeded = simPrice * CASH_RATIO_FOR_HOUSE; // 30% of Sim Price
  const simLoanAmountA = simPrice * (1 - CASH_RATIO_FOR_HOUSE); // 70%
  
  // Mode B: Mortgage Only Mode
  // User inputs simMortgageAmount directly
  
  // Derived Values based on Mode
  const effectiveLoanAmount = simMode === 'price' ? simLoanAmountA : simMortgageAmount;
  const effectiveMonthlyPayment = mortgageMonthlyPayment(effectiveLoanAmount, simInterest / 100, simDuration);
  const effectiveDTI = householdIncome > 0 ? effectiveMonthlyPayment / householdIncome : 0;
  
  // Feasibility Logic
  // Do we have enough cash for the simulated price?
  const simCashDeficit = Math.max(0, simCashNeeded - (getHouseholdSavings() - data.emergencyFundGoal));
  
  const isFeasibleA = effectiveDTI <= DTI_LIMIT && simCashDeficit === 0;
  const isFeasibleB = effectiveDTI <= DTI_LIMIT; // Only DTI matters for strict mortgage check

  const isSimFeasible = simMode === 'price' ? isFeasibleA : isFeasibleB;

  // Max Mortgage Calculation for Mode B display
  const maxSafeMortgage = maxMortgagePrincipalFromPayment(householdIncome * DTI_LIMIT, simInterest / 100, simDuration);

  // Visual Progress Logic
  // We want to show progress towards the DOWN PAYMENT (Cash Target), not the full house price.
  const visualCashTarget = effectiveCashTarget; // This is the goal.targetAmount passed in
  const visualCurrent = currentAmount !== undefined ? currentAmount : feasibility.availableForHouse; 
  
  // Progress % toward the CASH TARGET
  const progressPercent = visualCashTarget > 0 ? (visualCurrent / visualCashTarget) * 100 : 0;
  
  const maxHouseByCash = (feasibility.availableForHouse / CASH_RATIO_FOR_HOUSE);
  const maxHouseByDTI = feasibility.maxAffordableHouse; // Already computed by lib logic

  return (
    <div className={cn("space-y-8", className)}>
      <header className="space-y-2">
        <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            Feasibility Engine
            {marketData.source === 'BDE' && (
                <span className="text-[10px] font-normal bg-primary/10 text-primary px-2 py-0.5 rounded-full border border-primary/20 flex items-center gap-1">
                    <RefreshCw size={10} /> Live BDE Data
                </span>
            )}
        </h2>
        <p className="text-muted-foreground">Based on household income, savings & market rates.</p>
      </header>

      {/* 1. Two Limits + Safe Budget */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         {/* Savings Limit Card - REBRANDED to be clearer */}
         <PremiumCard className="space-y-4 border-l-4 border-l-blue-500">
            <div className="flex items-center justify-between">
                <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Max Price (Savings)</h3>
                <Wallet className="h-5 w-5 text-blue-500" />
            </div>
            <div>
                <div className="text-2xl font-bold">{formatCurrency(maxHouseByCash)}</div>
                <p className="text-xs text-muted-foreground mt-1">Limit based on 30% down payment available.</p>
            </div>
         </PremiumCard>

         {/* DTI Limit Card - REBRANDED */}
         <PremiumCard className="space-y-4 border-l-4 border-l-purple-500">
            <div className="flex items-center justify-between">
                <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Max Price (Income)</h3>
                <Building className="h-5 w-5 text-purple-500" />
            </div>
            <div>
                <div className="text-2xl font-bold">{formatCurrency(maxHouseByDTI)}</div>
                <p className="text-xs text-muted-foreground mt-1">Limit based on 35% DTI.</p>
            </div>
         </PremiumCard>
         
         {/* Result Card */}
         <PremiumCard glow className="md:col-span-1 bg-primary/5 border-primary/20">
            <div className="space-y-2">
                <h3 className="text-sm font-medium text-primary uppercase tracking-wider">Mortgage Potential</h3>
                <div className="text-3xl font-bold tracking-tighter">
                    {formatCurrency(feasibility.maxAffordableHouse)}
                </div>
                <p className="text-sm text-muted-foreground">
                    You can likely get a mortgage for a home up to this price.
                </p>
            </div>
         </PremiumCard>
      </div>

      {/* 2. Goal Progress - Focused on CASH */}
      <PremiumCard className="relative overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
              <div className="space-y-6">
                  <div>
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                          <TrendingUp className="h-5 w-5 text-green-500" />
                          Road to {formatCurrency(effectiveHousePrice)} Home
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                          Targeting <span className="font-bold text-foreground">{formatCurrency(visualCashTarget)}</span> in cash (Down Payment + Fees)
                      </p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="p-3 bg-background/50 rounded-lg">
                          <span className="text-muted-foreground block text-xs uppercase">Cash Goal</span>
                          <span className="font-semibold text-lg">{formatCurrency(visualCashTarget)}</span>
                      </div>
                      <div className="p-3 bg-background/50 rounded-lg">
                          <span className="text-muted-foreground block text-xs uppercase">Current Cash</span>
                          <span className={cn("font-semibold text-lg", visualCurrent >= visualCashTarget ? "text-green-500" : "text-orange-500")}>
                              {formatCurrency(visualCurrent)}
                          </span>
                      </div>
                  </div>
                  
                  <div>
                      <div className="flex justify-between text-sm mb-2">
                          <span className="text-muted-foreground">Gap</span>
                          <span className="font-medium">{formatCurrency(Math.max(0, visualCashTarget - visualCurrent))}</span>
                      </div>
                  </div>
              </div>

              <div className="flex flex-col justify-end">
                  <div className="h-32 w-full relative flex items-end">
                       <ProgressCurve progress={progressPercent} />
                       <div className="absolute bottom-0 right-0 text-4xl font-bold text-primary/20">
                           {progressPercent.toFixed(0)}%
                       </div>
                  </div>
                  <p className="text-xs text-muted-foreground text-center mt-4">
                      At current savings rate ({formatCurrency(avgMonthlySavings)}/mo)
                      {weightedReturn > 0 && (
                          <span className="text-green-600 dark:text-green-400"> + {Math.round(weightedReturn * 100)}% investment return</span>
                      )}
                      , you'll have the down payment by {
                          feasibility.monthsToTarget !== Infinity 
                          ? new Date(Date.now() + feasibility.monthsToTarget * 30 * 24 * 60 * 60 * 1000).toLocaleDateString(undefined, {month: 'long', year: 'numeric'})
                          : "..."
                      }
                  </p>
              </div>
          </div>
      </PremiumCard>

      {/* 3. Simulator */}
      <PremiumCard className="space-y-8">
        <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
                <h3 className="text-xl font-semibold">Simulator</h3>
                <p className="text-muted-foreground">Test different scenarios.</p>
            </div>
            
            {/* Toggle Component */}
            <div className="flex p-1 bg-muted rounded-lg">
                <button 
                    onClick={() => setSimMode('price')}
                    className={cn(
                        "px-4 py-1.5 text-sm font-medium rounded-md transition-all flex items-center gap-2",
                        simMode === 'price' ? "bg-background shadow text-primary" : "text-muted-foreground hover:text-foreground"
                    )}
                >
                    <Home size={16} />
                    House Price
                </button>
                <button 
                    onClick={() => setSimMode('mortgage')}
                    className={cn(
                        "px-4 py-1.5 text-sm font-medium rounded-md transition-all flex items-center gap-2",
                        simMode === 'mortgage' ? "bg-background shadow text-primary" : "text-muted-foreground hover:text-foreground"
                    )}
                >
                    <Calculator size={16} />
                    Mortgage Amount
                </button>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Controls */}
            <div className="space-y-8">
                {simMode === 'price' ? (
                    <div className="space-y-4">
                        <div className="flex justify-between">
                            <label className="font-medium">Property Price</label>
                            <span className="font-mono text-primary">{formatCurrency(simPrice)}</span>
                        </div>
                        <Slider 
                            value={[simPrice]} 
                            onValueChange={(v) => setSimPrice(v[0])} 
                            min={100000} 
                            max={1000000} 
                            step={5000}
                        />
                        <p className="text-xs text-muted-foreground">
                            Calculates a {((1-CASH_RATIO_FOR_HOUSE)*100).toFixed(0)}% mortgage loan.
                        </p>
                    </div>
                ) : (
                     <div className="space-y-4">
                        <div className="flex justify-between">
                            <label className="font-medium">Mortgage Amount</label>
                            <span className="font-mono text-primary">{formatCurrency(simMortgageAmount)}</span>
                        </div>
                        <Slider 
                            value={[simMortgageAmount]} 
                            onValueChange={(v) => setSimMortgageAmount(v[0])} 
                            min={50000} 
                            max={800000} 
                            step={5000}
                        />
                        <p className="text-xs text-muted-foreground">
                            Simulate a specific loan amount directly.
                        </p>
                    </div>
                )}

                <div className="space-y-4">
                    <div className="flex justify-between">
                        <label className="font-medium">Duration (Years)</label>
                        <span className="font-mono text-primary">{simDuration} Years</span>
                    </div>
                    <Slider 
                        value={[simDuration]} 
                        onValueChange={(v) => setSimDuration(v[0])} 
                        min={10} 
                        max={35} 
                        step={1}
                    />
                </div>

                <div className="space-y-4">
                    <div className="flex justify-between">
                        <label className="font-medium flex items-center gap-2">
                            Interest Rate
                            {marketData.source === 'BDE' && <span className="text-[10px] font-normal text-green-500 bg-green-500/10 px-1.5 py-0.5 rounded">Synced with BDE</span>}
                        </label>
                        <span className="font-mono text-primary">{simInterest}%</span>
                    </div>
                    <Slider 
                        value={[simInterest]} 
                        onValueChange={(v) => setSimInterest(v[0])} 
                        min={1.0} 
                        max={7.0} 
                        step={0.05}
                    />
                </div>
            </div>

            {/* Results */}
            <div className="bg-muted/30 rounded-2xl p-6 space-y-6 border border-border">
                <div className="flex items-center justify-between pb-4 border-b border-border">
                    <span className="text-muted-foreground">Monthly Payment</span>
                    <span className="text-3xl font-bold">{formatCurrency(effectiveMonthlyPayment)}</span>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="space-y-1">
                        <span className="text-muted-foreground">DTI Ratio</span>
                        <div className={cn("font-bold", effectiveDTI > DTI_LIMIT ? "text-red-500" : "text-green-500")}>
                            {(effectiveDTI * 100).toFixed(1)}%
                        </div>
                        <span className="text-[10px] text-muted-foreground">Limit: {(DTI_LIMIT * 100).toFixed(0)}%</span>
                    </div>
                    {simMode === 'price' && (
                        <div className="space-y-1">
                             <span className="text-muted-foreground">Cash Needed</span>
                             <div className="font-bold">{formatCurrency(simCashNeeded)}</div>
                        </div>
                    )}
                     {simMode === 'mortgage' && (
                        <div className="space-y-1">
                             <span className="text-muted-foreground">Approval Likelihood</span>
                             <div className={cn("font-bold", effectiveDTI <= DTI_LIMIT ? "text-green-500" : "text-red-500")}>
                                {effectiveDTI <= DTI_LIMIT ? "High" : "Low"}
                             </div>
                        </div>
                    )}
                </div>

                <div className={cn(
                    "p-4 rounded-xl border flex gap-3 items-start transition-colors",
                    isSimFeasible 
                        ? "bg-green-500/10 border-green-500/20 text-green-700 dark:text-green-400" 
                        : "bg-red-500/10 border-red-500/20 text-red-700 dark:text-red-400"
                )}>
                    {isSimFeasible ? <CheckCircle className="shrink-0 mt-0.5" size={20} /> : <AlertTriangle className="shrink-0 mt-0.5" size={20} />}
                    <div>
                        <h4 className="font-bold">{isSimFeasible ? "Bank Viable" : "Not Viable"}</h4>
                        <p className="text-sm mt-1 opacity-90">
                             {simMode === 'price' && simCashDeficit > 0 && `Short ${formatCurrency(simCashDeficit)} cash. `}
                             {effectiveDTI > DTI_LIMIT && `DTI too high (${(effectiveDTI * 100).toFixed(1)}% > 35%). `}
                             {isSimFeasible && "You meet all requirements."}
                             {!isSimFeasible && effectiveDTI <= DTI_LIMIT && simMode === 'price' && simCashDeficit === 0 && "Check other constraints."}
                        </p>
                    </div>
                </div>
                
                {simMode === 'mortgage' && (
                    <div className="pt-4 border-t border-border text-sm">
                        <div className="flex justify-between items-center">
                            <span className="text-muted-foreground flex items-center gap-2">
                                <Landmark size={14} /> Max safe mortgage today:
                            </span>
                            <span className="font-bold">{formatCurrency(maxSafeMortgage)}</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
      </PremiumCard>
    </div>
  );
};
