import React from 'react';
import { Account, RecurringCost, Debt } from '../store/FinanceContext';
import { formatCurrency } from '../../lib/finance';
import { Button } from '../ui/button';
import { PremiumCard } from '../ui/PremiumCard';
import { TrendingUp, AlertTriangle, Calendar, Calculator, DollarSign, Pencil, Trash2 } from 'lucide-react';
import { cn } from '../ui/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Switch } from '../ui/switch';

// Section Container
export const SectionContainer: React.FC<{ title: string; subtitle?: string; icon?: React.ReactNode; action?: React.ReactNode; children: React.ReactNode; className?: string }> = ({ title, subtitle, icon, action, children, className }) => (
    <PremiumCard className={cn("p-0 border-none shadow-none bg-transparent md:p-6 md:border md:shadow-sm md:bg-card/80", className)}>
        <div className="flex items-center justify-between mb-6 px-1 md:px-0">
            <div className="flex items-center gap-3">
                {icon && <div className="p-2 bg-primary/10 rounded-lg text-primary">{icon}</div>}
                <div>
                    <h3 className="font-semibold text-lg">{title}</h3>
                    {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
                </div>
            </div>
            {action}
        </div>
        <div className="space-y-4">
            {children}
        </div>
    </PremiumCard>
);

// Metric Card
export const MetricCard: React.FC<{ label: string; value: string; trend?: string; color?: string }> = ({ label, value, trend, color }) => (
    <div className="bg-muted/30 rounded-xl p-4 border flex-1 min-w-[140px]">
        <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">{label}</p>
        <p className={cn("text-xl font-bold", color)}>{value}</p>
        {trend && <p className="text-xs text-muted-foreground mt-1">{trend}</p>}
    </div>
);

// Debt Card
export const DebtCard: React.FC<{ debt: Debt; onEdit: () => void; onDelete: () => void }> = ({ debt, onEdit, onDelete }) => {
    // Calculate Analytics
    const r = (debt.apr || 0) / 100 / 12;
    const n = debt.remainingTerm || 0;
    const p = debt.remainingBalance || 0;
    
    let monthlyPayment = 0;
    if (r === 0 || n === 0) {
        monthlyPayment = n > 0 ? p / n : 0;
    } else {
        monthlyPayment = (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    }
    
    const totalInterest = (monthlyPayment * n) - p;
    const payoffDate = new Date();
    payoffDate.setMonth(payoffDate.getMonth() + n);

    return (
        <div className="bg-card rounded-xl border shadow-sm p-4 space-y-4">
            <div className="flex justify-between items-start">
                <div>
                    <h4 className="font-semibold text-lg">{debt.name}</h4>
                    <p className="text-sm text-muted-foreground">{debt.institution}</p>
                </div>
                <div className="text-right">
                    <p className="font-bold text-xl">{formatCurrency(debt.remainingBalance)}</p>
                    <p className="text-xs text-muted-foreground">{debt.apr}% APR</p>
                </div>
            </div>
            
            {/* Analytics Box */}
            <div className="bg-muted/30 rounded-lg p-3 grid grid-cols-3 gap-2 text-sm">
                <div>
                    <p className="text-[10px] text-muted-foreground uppercase font-bold">Monthly</p>
                    <p className="font-medium">{formatCurrency(monthlyPayment)}</p>
                </div>
                <div>
                    <p className="text-[10px] text-muted-foreground uppercase font-bold">Interest</p>
                    <p className="font-medium text-orange-600">{formatCurrency(Math.max(0, totalInterest))}</p>
                </div>
                <div>
                    <p className="text-[10px] text-muted-foreground uppercase font-bold">Payoff</p>
                    <p className="font-medium">{payoffDate.toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}</p>
                </div>
            </div>

             <div className="flex justify-end gap-2">
                <Button variant="ghost" size="sm" onClick={onEdit} className="h-8"><Pencil size={14} className="mr-1"/> Edit</Button>
                <Button variant="ghost" size="sm" className="h-8 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50" onClick={onDelete}><Trash2 size={14} className="mr-1"/> Delete</Button>
            </div>
        </div>
    );
};

// Fixed Cost Card
export const FixedCostCard: React.FC<{ cost: RecurringCost; onEdit: () => void; onDelete: () => void; onToggleHousehold: (v: boolean) => void; onFrequencyChange: (v: string) => void }> = ({ cost, onEdit, onDelete, onToggleHousehold, onFrequencyChange }) => {
    return (
        <div className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-card rounded-xl border shadow-sm gap-4">
            <div className="flex-1">
                <div className="font-medium">{cost.name}</div>
                <div className="text-xs text-muted-foreground">{cost.category}</div>
            </div>
            
            <div className="flex flex-wrap items-center gap-4">
                <div className="w-32">
                     <Select value={cost.frequency || 'monthly'} onValueChange={onFrequencyChange}>
                        <SelectTrigger className="h-8 text-xs">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="monthly">Monthly</SelectItem>
                            <SelectItem value="weekly">Weekly</SelectItem>
                            <SelectItem value="quarterly">Quarterly</SelectItem>
                            <SelectItem value="yearly">Yearly</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="font-bold text-lg">-{formatCurrency(cost.amount)}</div>

                <div className="flex items-center gap-2 pl-2 md:border-l">
                     <Switch checked={cost.includeInHousehold} onCheckedChange={onToggleHousehold} />
                     <span className="text-xs text-muted-foreground hidden md:inline">Shared</span>
                </div>

                <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onEdit}><Pencil size={14} /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50" onClick={onDelete}><Trash2 size={14} /></Button>
                </div>
            </div>
        </div>
    );
};
