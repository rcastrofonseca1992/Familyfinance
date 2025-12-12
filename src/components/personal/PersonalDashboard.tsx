import React from 'react';
import { useFinance } from '../../store/FinanceContext';
import { PremiumCard } from '../../ui/PremiumCard';
import { formatCurrency } from '../../lib/finance';
import { Button } from '../../ui/button';
import { Wallet, TrendingUp, CreditCard, Receipt, ArrowRight } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface PersonalDashboardProps {
  onNavigate: (page: string) => void;
}

export const PersonalDashboard: React.FC<PersonalDashboardProps> = ({ onNavigate }) => {
  const { data, getPersonalTotalIncome } = useFinance();
  const { t } = useLanguage();
  const user = data.user;

  if (!user) return null;

  // Calculate personal summaries - filter by owner_id = user.id
  const personalAccounts = data.accounts.filter(a => a.ownerId === user.id);
  const totalBalance = personalAccounts.reduce((sum, a) => sum + a.balance, 0);

  const incomeSources = user.incomeSources || [];
  const totalIncome = getPersonalTotalIncome();

  const personalDebts = data.debts?.filter(d => d.ownerId === user.id) || [];
  const totalDebt = personalDebts.reduce((sum, d) => sum + (d.remainingAmount || d.totalAmount), 0);
  const totalMonthlyDebtPayment = personalDebts.reduce((sum, d) => sum + (d.monthlyPayment || 0), 0);

  const personalFixedCosts = data.recurringCosts.filter(c => c.ownerId === user.id);
  const totalFixedCosts = personalFixedCosts.reduce((sum, c) => sum + c.amount, 0);

  return (
    <div className="space-y-6 pb-24 md:pb-6">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-3xl font-bold">{t('personal.title', { name: user.name })}</h1>
        <p className="text-muted-foreground">{t('personal.subtitle')}</p>
      </div>

      {/* Summary Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* A. Income Summary Card */}
        <PremiumCard 
          onClick={() => onNavigate('me/income')} 
          className="flex flex-col gap-4 cursor-pointer hover:border-green-500/50 transition-colors group"
        >
          <div className="flex items-center justify-between pb-3 border-b border-border/50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/20 text-green-600 rounded-lg group-hover:bg-green-200 dark:group-hover:bg-green-900/30 transition-colors">
                <TrendingUp size={20} />
              </div>
              <div>
                <h3 className="font-semibold">{t('personal.income')}</h3>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">{t('personal.incomeSubtitle')}</p>
              </div>
            </div>
            <ArrowRight size={16} className="text-muted-foreground group-hover:text-green-600 transition-colors" />
          </div>
          
          <div className="space-y-2">
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-bold">{formatCurrency(totalIncome)}</p>
              <p className="text-sm text-muted-foreground">/month</p>
            </div>
            <p className="text-xs text-muted-foreground">
              {incomeSources.length} {incomeSources.length === 1 ? 'source' : 'sources'}
            </p>
          </div>

          <Button variant="outline" size="sm" className="w-full mt-auto group-hover:bg-green-50 dark:group-hover:bg-green-900/10 transition-colors">
            {t('personal.manageIncome')}
          </Button>
        </PremiumCard>

        {/* B. Accounts Summary Card */}
        <PremiumCard 
          onClick={() => onNavigate('me/accounts')} 
          className="flex flex-col gap-4 cursor-pointer hover:border-blue-500/50 transition-colors group"
        >
          <div className="flex items-center justify-between pb-3 border-b border-border/50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/20 text-blue-600 rounded-lg group-hover:bg-blue-200 dark:group-hover:bg-blue-900/30 transition-colors">
                <Wallet size={20} />
              </div>
              <div>
                <h3 className="font-semibold">{t('personal.accounts')}</h3>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">{t('personal.accountsSubtitle')}</p>
              </div>
            </div>
            <ArrowRight size={16} className="text-muted-foreground group-hover:text-blue-600 transition-colors" />
          </div>
          
          <div className="space-y-2">
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-bold">{formatCurrency(totalBalance)}</p>
            </div>
            <p className="text-xs text-muted-foreground">
              {personalAccounts.length} {personalAccounts.length === 1 ? 'account' : 'accounts'}
            </p>
          </div>

          <Button variant="outline" size="sm" className="w-full mt-auto group-hover:bg-blue-50 dark:group-hover:bg-blue-900/10 transition-colors">
            {t('personal.viewAccounts')}
          </Button>
        </PremiumCard>

        {/* C. Debts Summary Card */}
        <PremiumCard 
          onClick={() => onNavigate('me/debts')} 
          className="flex flex-col gap-4 cursor-pointer hover:border-red-500/50 transition-colors group"
        >
          <div className="flex items-center justify-between pb-3 border-b border-border/50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 dark:bg-red-900/20 text-red-600 rounded-lg group-hover:bg-red-200 dark:group-hover:bg-red-900/30 transition-colors">
                <CreditCard size={20} />
              </div>
              <div>
                <h3 className="font-semibold">{t('personal.debts')}</h3>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">{t('personal.loansCredit')}</p>
              </div>
            </div>
            <ArrowRight size={16} className="text-muted-foreground group-hover:text-red-600 transition-colors" />
          </div>
          
          <div className="space-y-2">
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-bold text-red-600">{formatCurrency(totalDebt)}</p>
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{personalDebts.length} {personalDebts.length === 1 ? 'debt' : 'debts'}</span>
              <span className="font-medium">{formatCurrency(totalMonthlyDebtPayment)}/month</span>
            </div>
          </div>

          <Button variant="outline" size="sm" className="w-full mt-auto group-hover:bg-red-50 dark:group-hover:bg-red-900/10 transition-colors">
            {t('personal.viewDebts')}
          </Button>
        </PremiumCard>

        {/* D. Fixed Costs Summary Card */}
        <PremiumCard 
          onClick={() => onNavigate('me/fixed-costs')} 
          className="flex flex-col gap-4 cursor-pointer hover:border-orange-500/50 transition-colors group"
        >
          <div className="flex items-center justify-between pb-3 border-b border-border/50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/20 text-orange-600 rounded-lg group-hover:bg-orange-200 dark:group-hover:bg-orange-900/30 transition-colors">
                <Receipt size={20} />
              </div>
              <div>
                <h3 className="font-semibold">{t('personal.fixedCosts')}</h3>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">{t('personal.fixedCostsSubtitle')}</p>
              </div>
            </div>
            <ArrowRight size={16} className="text-muted-foreground group-hover:text-orange-600 transition-colors" />
          </div>
          
          <div className="space-y-2">
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-bold">{formatCurrency(totalFixedCosts)}</p>
              <p className="text-sm text-muted-foreground">/month</p>
            </div>
            <p className="text-xs text-muted-foreground">
              {personalFixedCosts.length} {personalFixedCosts.length === 1 ? 'cost' : 'costs'}
            </p>
          </div>

          <Button variant="outline" size="sm" className="w-full mt-auto group-hover:bg-orange-50 dark:group-hover:bg-orange-900/10 transition-colors">
            {t('personal.manageFixedCosts')}
          </Button>
        </PremiumCard>
      </div>
    </div>
  );
};
