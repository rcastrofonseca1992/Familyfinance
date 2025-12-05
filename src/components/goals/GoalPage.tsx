import React, { useState, useEffect } from 'react';
import { ArrowLeft, Edit, Calendar, TrendingUp, Target, DollarSign, Clock, AlertCircle, CheckCircle, Zap, PiggyBank, Calculator, TrendingDown } from 'lucide-react';
import { formatCurrency } from '../../lib/finance';
import { Button } from '../ui/button';
import { useLanguage } from '../../src/contexts/LanguageContext';
import { PremiumCard } from '../ui/PremiumCard';
import { Tabs, TabsList, TabsTrigger } from '../ui/tabs';
import { FeasibilityEngine } from '../feasibility/FeasibilityEngine';
import { motion } from 'motion/react';


interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  category: string;
  isMain?: boolean;
  image?: string;
  propertyValue?: number;
  loanToValue?: number;
  requiredMonthlyContribution?: number;
}

interface GoalPageProps {
  goal: Goal;
  onBack: () => void;
  onEdit?: () => void;
}

export const GoalPage: React.FC<GoalPageProps> = ({ goal, onBack, onEdit }) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('details');
  
  // Calculate progress
  const progress = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
  const remaining = goal.targetAmount - goal.currentAmount;
  
  // Calculate time remaining
  const deadline = new Date(goal.deadline);
  const today = new Date();
  const monthsRemaining = Math.max(0, 
    (deadline.getFullYear() - today.getFullYear()) * 12 + 
    (deadline.getMonth() - today.getMonth())
  );
  
  // Financial calculations
  const DEFAULT_APY = 3.0;
  const weeksRemaining = Math.ceil(monthsRemaining * 4.33);
  const daysRemaining = Math.ceil(monthsRemaining * 30.44);
  
  // Required daily/weekly contributions
  const requiredDaily = monthsRemaining > 0 ? remaining / daysRemaining : 0;
  const requiredWeekly = monthsRemaining > 0 ? remaining / weeksRemaining : 0;
  
  // Compound interest projections
  const calculateFutureValue = (current: number, monthly: number, months: number, apy: number = DEFAULT_APY) => {
    const r = apy / 100 / 12;
    const fvCurrent = current * Math.pow(1 + r, months);
    const fvContributions = monthly * ((Math.pow(1 + r, months) - 1) / r);
    return fvCurrent + fvContributions;
  };
  
  // Calculate if on track
  const monthlyRequired = goal.requiredMonthlyContribution || 0;
  const projectedFinalAmount = calculateFutureValue(goal.currentAmount, monthlyRequired, monthsRemaining);
  const onTrack = projectedFinalAmount >= goal.targetAmount;
  
  // Calculate surplus/shortfall
  const surplus = projectedFinalAmount - goal.targetAmount;
  
  // Calculate average monthly savings so far
  const goalAge = Math.max(1, monthsRemaining > 0 ? 12 : 1); // Approximate
  const avgMonthlySavings = goal.currentAmount / goalAge;
  
  // Feasibility assessment
  const feasibilityScore = Math.min(100, (goal.currentAmount / goal.targetAmount) * 100 + (monthsRemaining / 12) * 10);
  const feasibilityLabel = feasibilityScore >= 70 ? 'High' : feasibilityScore >= 40 ? 'Medium' : 'Low';
  const feasibilityColor = feasibilityScore >= 70 ? 'emerald' : feasibilityScore >= 40 ? 'amber' : 'rose';
  
  // Get category icon and color
  const getCategoryInfo = (category: string) => {
    switch (category) {
      case 'mortgage':
      case 'home':
        return { icon: '🏡', label: t('category.mortgage'), color: 'blue' };
      case 'trip':
        return { icon: '✈️', label: t('category.trip'), color: 'purple' };
      case 'emergency':
        return { icon: '🛡️', label: t('category.emergency'), color: 'orange' };
      case 'car':
        return { icon: '🚗', label: t('category.car'), color: 'green' };
      case 'kids':
        return { icon: '👨‍👩‍👧‍👦', label: t('category.kids'), color: 'pink' };
      default:
        return { icon: '🎯', label: t('category.other') || category, color: 'gray' };
    }
  };

  const categoryInfo = getCategoryInfo(goal.category);
  
  // Default image for goals
  const heroImage = goal.image || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1200&q=80';

  const isHomeGoal = goal.category === 'mortgage' || goal.category === 'home';

  return (
    <div className="fixed inset-0 z-50 bg-background animate-in fade-in duration-300">
      {/* Hero Image - Fixed - Extends to top including status bar - BULLETPROOF PATTERN */}
      <div className="fixed inset-x-0 top-0 h-[50vh] overflow-hidden">
        <motion.img 
          layoutId={`goal-hero-${goal.id}`}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          src={heroImage} 
          alt={goal.name}
          className="absolute inset-0 w-full object-cover"
          style={{ 
            top: `calc(-1 * env(safe-area-inset-top))`,
            height: `calc(100% + env(safe-area-inset-top))`
          }}
        />
        {/* Dark Gradient Overlay for Legibility */}
        <div 
          className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/10 to-transparent pointer-events-none"
          style={{ 
            top: `calc(-1 * env(safe-area-inset-top))`,
            height: `calc(100% + env(safe-area-inset-top))`
          }}
        />
      </div>

      {/* Floating Header */}
      <header className="fixed top-0 inset-x-0 z-50 px-4 pt-[calc(1rem+env(safe-area-inset-top))] pb-4 flex justify-between items-center pointer-events-none">
        <button 
          onClick={onBack}
          className="pointer-events-auto p-3 rounded-full bg-black/30 backdrop-blur-md text-white hover:bg-black/50 transition-all"
        >
          <ArrowLeft size={20} />
        </button>
        
        {onEdit && (
          <button 
            onClick={onEdit}
            className="pointer-events-auto p-3 rounded-full bg-black/30 backdrop-blur-md text-white hover:bg-black/50 transition-all"
          >
            <Edit size={20} />
          </button>
        )}
      </header>

      {/* Scrollable Content Sheet */}
      <div className="relative z-10 h-screen overflow-y-auto">
        {/* Spacer to push content below hero */}
        <div className="h-[45vh]" />
        
        {/* Content Sheet */}
        <div className="bg-background rounded-t-[32px] shadow-[0_-10px_40px_rgba(0,0,0,0.15)] min-h-[60vh] animate-in slide-in-from-bottom duration-500">
          <div className="p-6 pt-10 pb-20 max-w-2xl mx-auto">
            {/* Header Section */}
            <div className="space-y-4">
              {/* Category Badge */}
              <div className="flex items-center gap-2">
                <span className="text-2xl">{categoryInfo.icon}</span>
                <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                  {categoryInfo.label}
                </span>
                {goal.isMain && (
                  <span className="ml-2 px-3 py-1 text-xs font-semibold text-blue-700 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300 rounded-full">
                    {t('goals.mainGoal')}
                  </span>
                )}
              </div>

              {/* Goal Name */}
              <h1 className="text-3xl font-bold mt-[0px] mr-[0px] mb-[8px] ml-[0px] m-[0px]">
                {goal.name}
              </h1>

              {/* Property Value for Mortgage Goals */}
              {isHomeGoal && goal.propertyValue && (
                <p className="text-lg text-muted-foreground">
                  {formatCurrency(goal.propertyValue)}
                </p>
              )}

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {formatCurrency(goal.currentAmount)}
                  </span>
                  <span className="font-semibold text-blue-700 dark:text-blue-400">
                    {progress.toFixed(0)}%
                  </span>
                </div>
                <div className="h-3 w-full bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500 rounded-full"
                    style={{ width: `${progress}%` }} 
                  />
                </div>
              </div>
            </div>

            {/* Tabs (Only for Home/Mortgage Goals) */}
            {isHomeGoal && (
              <>
                <div className="my-8 border-b border-border" />
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="w-full grid grid-cols-2 mb-6">
                    <TabsTrigger value="details">Details</TabsTrigger>
                    <TabsTrigger value="simulator">Simulator</TabsTrigger>
                  </TabsList>
                </Tabs>
              </>
            )}

            {/* Content based on active tab */}
            {(!isHomeGoal || activeTab === 'details') && (
              <>
                {!isHomeGoal && <div className="my-8 border-b border-border" />}

                {/* Key Metrics Grid */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Target Amount */}
                  <PremiumCard className="space-y-2 h-full p-4">
                    <p className="text-[11px] text-muted-foreground uppercase tracking-wider">
                      {t('goals.target')}
                    </p>
                    <p className="text-xl font-bold">
                      {formatCurrency(goal.targetAmount)}
                    </p>
                  </PremiumCard>

                  {/* Remaining */}
                  <PremiumCard className="space-y-2 h-full p-4">
                    <p className="text-[11px] text-muted-foreground uppercase tracking-wider">
                      {t('goals.remaining')}
                    </p>
                    <p className="text-xl font-bold">
                      {formatCurrency(remaining)}
                    </p>
                  </PremiumCard>

                  {/* Deadline */}
                  <PremiumCard className="space-y-2 h-full p-4">
                    <p className="text-[11px] text-muted-foreground uppercase tracking-wider">
                      {t('goals.deadline')}
                    </p>
                    <p className="text-xl font-bold">
                      {new Date(goal.deadline).toLocaleDateString('pt-PT', { 
                        month: 'short', 
                        year: 'numeric' 
                      })}
                    </p>
                  </PremiumCard>

                  {/* Time Remaining */}
                  <PremiumCard className="space-y-2 h-full p-4">
                    <p className="text-[11px] text-muted-foreground uppercase tracking-wider">
                      {t('goals.timeLeft')}
                    </p>
                    <p className="text-xl font-bold">
                      {monthsRemaining} {monthsRemaining === 1 ? t('goals.month') : t('goals.months')}
                    </p>
                  </PremiumCard>
                </div>

                {/* Monthly Contribution Section */}
                {goal.requiredMonthlyContribution && goal.requiredMonthlyContribution > 0 && (
                  <>
                    <div className="my-8 border-b border-border" />
                    
                    <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/20 dark:to-blue-900/10 rounded-2xl border border-blue-200/50 dark:border-blue-800/30">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-blue-500 rounded-xl">
                          <DollarSign size={24} className="text-white" />
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                            {t('goals.requiredMonthly')}
                          </p>
                          <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">
                            {formatCurrency(goal.requiredMonthlyContribution)}
                          </p>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {t('goals.requiredMonthlyDescription')}
                      </p>
                    </div>
                  </>
                )}

                {/* Achievement Status */}
                <div className="mt-8 p-6 bg-gradient-to-br from-muted/50 to-muted/30 rounded-2xl">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-background rounded-xl">
                      <TrendingUp size={24} className="text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold mb-2">{t('goals.progressStatus')}</h4>
                      <p className="text-sm text-muted-foreground">
                        {progress >= 80 
                          ? t('goals.nearlyThere')
                          : progress >= 50
                          ? t('goals.halfwayThere')
                          : progress >= 25
                          ? t('goals.goodStart')
                          : t('goals.keepGoing')
                        }
                      </p>
                    </div>
                  </div>
                </div>

                {/* Financial Analysis Section */}
                {monthsRemaining > 0 && remaining > 0 && (
                  <>
                    <div className="my-8 border-b border-border" />
                    
                    <PremiumCard>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-blue-50 dark:bg-blue-950/30 rounded-xl">
                          <Calculator size={20} className="text-blue-600 dark:text-blue-400" />
                        </div>
                        <h3 className="font-semibold text-lg">Financial Analysis</h3>
                      </div>

                      {/* Contribution Breakdown */}
                      <div className="space-y-3 mb-6">
                        <div className="p-4 bg-blue-50/50 dark:bg-blue-950/10 rounded-xl">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Required Per Week</span>
                            <span className="font-bold text-blue-700 dark:text-blue-400">{formatCurrency(requiredWeekly)}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Required Per Day</span>
                            <span className="font-bold text-blue-700 dark:text-blue-400">{formatCurrency(requiredDaily)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Projection with Compound Interest */}
                      {monthlyRequired > 0 && (
                        <div className="p-4 rounded-xl border border-border bg-gradient-to-br from-background to-muted/20">
                          <div className="flex items-center gap-2 mb-3">
                            <Zap size={16} className="text-amber-500" />
                            <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                              Projected Final Amount (3% APY)
                            </span>
                          </div>
                          <div className="flex items-baseline gap-2 mb-2">
                            <span className="text-2xl font-bold">{formatCurrency(projectedFinalAmount)}</span>
                            {onTrack ? (
                              <CheckCircle size={20} className="text-emerald-600" />
                            ) : (
                              <AlertCircle size={20} className="text-rose-600" />
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {onTrack ? (
                              <span className="text-emerald-700 dark:text-emerald-400 font-medium">
                                On track! Projected surplus: {formatCurrency(surplus)}
                              </span>
                            ) : (
                              <span className="text-rose-700 dark:text-rose-400 font-medium">
                                Shortfall: {formatCurrency(Math.abs(surplus))} - Consider increasing monthly contributions
                              </span>
                            )}
                          </p>
                        </div>
                      )}
                    </PremiumCard>

                    {/* Feasibility Assessment */}
                    <div className="mt-6">
                      <PremiumCard>
                        <div className="flex items-center gap-3 mb-4">
                          <div className="p-2 bg-purple-50 dark:bg-purple-950/30 rounded-xl">
                            <Target size={20} className="text-purple-600 dark:text-purple-400" />
                          </div>
                          <h3 className="font-semibold text-lg">Feasibility Assessment</h3>
                        </div>
                        
                        <div className={`p-4 rounded-xl bg-${feasibilityColor}-50/50 dark:bg-${feasibilityColor}-950/20 border border-${feasibilityColor}-200 dark:border-${feasibilityColor}-800/30`}>
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Likelihood</span>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold bg-${feasibilityColor}-100 dark:bg-${feasibilityColor}-900/30 text-${feasibilityColor}-700 dark:text-${feasibilityColor}-400`}>
                              {feasibilityLabel}
                            </span>
                          </div>
                          
                          <div className="space-y-2 text-sm text-muted-foreground">
                            <p>• You've saved {progress.toFixed(0)}% of your target</p>
                            <p>• {monthsRemaining} months remaining until deadline</p>
                            {avgMonthlySavings > 0 && (
                              <p>• Historical avg: {formatCurrency(avgMonthlySavings)}/month</p>
                            )}
                          </div>
                        </div>
                      </PremiumCard>
                    </div>

                    {/* Recommendations */}
                    <div className="mt-6">
                      <PremiumCard>
                        <div className="flex items-center gap-3 mb-4">
                          <div className="p-2 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl">
                            <PiggyBank size={20} className="text-emerald-600 dark:text-emerald-400" />
                          </div>
                          <h3 className="font-semibold text-lg">Expert Recommendations</h3>
                        </div>
                        
                        <div className="space-y-3">
                          {progress < 50 && monthsRemaining < 12 && (
                            <div className="flex gap-3 p-4 bg-rose-50/50 dark:bg-rose-950/20 rounded-xl border border-rose-200 dark:border-rose-800/30">
                              <AlertCircle size={20} className="text-rose-600 flex-shrink-0 mt-0.5" />
                              <div className="text-sm">
                                <p className="font-semibold text-rose-900 dark:text-rose-300 mb-1">Deadline is approaching</p>
                                <p className="text-muted-foreground">Consider extending your deadline or increasing monthly contributions to stay on track.</p>
                              </div>
                            </div>
                          )}
                          
                          {progress >= 50 && onTrack && (
                            <div className="flex gap-3 p-4 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-xl border border-emerald-200 dark:border-emerald-800/30">
                              <CheckCircle size={20} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                              <div className="text-sm">
                                <p className="font-semibold text-emerald-900 dark:text-emerald-300 mb-1">You're on track!</p>
                                <p className="text-muted-foreground">Maintaining your current savings rate will help you reach your goal. Consider setting up automatic transfers to stay consistent.</p>
                              </div>
                            </div>
                          )}
                          
                          {monthlyRequired > 0 && (
                            <div className="flex gap-3 p-4 bg-blue-50/50 dark:bg-blue-950/20 rounded-xl border border-blue-200 dark:border-blue-800/30">
                              <Calculator size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
                              <div className="text-sm">
                                <p className="font-semibold text-blue-900 dark:text-blue-300 mb-1">Optimize with compound interest</p>
                                <p className="text-muted-foreground">Investing your savings with a conservative {DEFAULT_APY}% annual return could help you reach your goal with less monthly contribution.</p>
                              </div>
                            </div>
                          )}
                          
                          {goal.category === 'emergency' && progress < 100 && (
                            <div className="flex gap-3 p-4 bg-amber-50/50 dark:bg-amber-950/20 rounded-xl border border-amber-200 dark:border-amber-800/30">
                              <AlertCircle size={20} className="text-amber-600 flex-shrink-0 mt-0.5" />
                              <div className="text-sm">
                                <p className="font-semibold text-amber-900 dark:text-amber-300 mb-1">Emergency fund priority</p>
                                <p className="text-muted-foreground">Financial experts recommend 3-6 months of expenses in an emergency fund. Prioritize this goal to protect against unexpected events.</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </PremiumCard>
                    </div>
                  </>
                )}
              </>
            )}

            {/* Simulator Tab Content */}
            {isHomeGoal && activeTab === 'simulator' && (
              <div className="mt-6">
                <FeasibilityEngine 
                  targetAmount={goal.targetAmount}
                  propertyValue={goal.propertyValue}
                  currentAmount={goal.currentAmount}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};