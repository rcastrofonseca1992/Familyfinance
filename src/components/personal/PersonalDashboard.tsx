import React, { useState } from 'react';
import { useFinance, Account, RecurringCost, IncomeSource } from '../store/FinanceContext';
import { PremiumCard } from '../ui/PremiumCard';
import { formatCurrency } from '../../lib/finance';
import { Switch } from '../ui/switch';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '../ui/dialog';
import { DeleteConfirmation } from '../ui/delete-confirmation';
import { Plus, Trash2, Wallet, TrendingUp, RefreshCw, Briefcase, Building2, PiggyBank, Landmark, Coins, ShieldAlert, Pencil } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../ui/utils';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { toast } from 'sonner';

const SPANISH_BANKS = [
    "Imagin", "CaixaBank", "BBVA", "Santander", "Sabadell", "Bankinter", "ING", "Openbank", "Abanca", "Revolut", "N26", "Trade Republic", "MyInvestor", "Indexa Capital", "Binance", "Coinbase"
];

// Bank logo/favicon mapping using Google's favicon service
const getBankLogoUrl = (institutionName: string): string => {
    const bankDomains: Record<string, string> = {
        'Imagin': 'www.imaginbank.com',
        'CaixaBank': 'www.caixabank.es',
        'BBVA': 'www.bbva.es',
        'Santander': 'www.santander.es',
        'Sabadell': 'www.bancsabadell.com',
        'Bankinter': 'www.bankinter.com',
        'ING': 'www.ing.es',
        'Openbank': 'www.openbank.es',
        'Abanca': 'www.abanca.com',
        'Revolut': 'www.revolut.com',
        'N26': 'n26.com',
        'Trade Republic': 'traderepublic.com',
        'MyInvestor': 'myinvestor.es',
        'Indexa Capital': 'indexacapital.com',
        'Binance': 'www.binance.com',
        'Coinbase': 'www.coinbase.com'
    };
    
    const domain = bankDomains[institutionName];
    if (domain) {
        return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
    }
    // Fallback: try to extract domain from institution name
    return `https://www.google.com/s2/favicons?domain=${institutionName.toLowerCase().replace(/\s+/g, '')}.com&sz=128`;
};

export const PersonalDashboard: React.FC = () => {
  const { 
      data, 
      updateData, 
      getPersonalNetWorth, 
      addAccount, 
      deleteAccount, 
      addRecurringCost, 
      deleteRecurringCost, 
      updateAccount, 
      updateRecurringCost,
      addIncomeSource,
      updateIncomeSource,
      deleteIncomeSource
  } = useFinance();
  const user = data.user;

  // State for new items
  const [isAddAccountOpen, setIsAddAccountOpen] = useState(false);
  const [newAccount, setNewAccount] = useState<Partial<Account>>({ name: '', balance: 0, institution: '', type: 'savings', currency: 'EUR', includeInHousehold: true, apy: 0 });
  const [customBank, setCustomBank] = useState('');

  const [isAddCostOpen, setIsAddCostOpen] = useState(false);
  const [newCost, setNewCost] = useState<Partial<RecurringCost>>({ name: '', amount: 0, category: 'Subscription', includeInHousehold: false });

  const [isAddIncomeOpen, setIsAddIncomeOpen] = useState(false);
  const [newIncome, setNewIncome] = useState<Partial<IncomeSource>>({ name: '', amount: 0 });

  // Edit Account State
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [editAccountBalance, setEditAccountBalance] = useState<number>(0);

  // Edit Cost State
  const [editingCost, setEditingCost] = useState<RecurringCost | null>(null);
  const [editingCostData, setEditingCostData] = useState<Partial<RecurringCost>>({});

  // Delete confirmation states
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{type: 'account' | 'cost' | 'income', id: string, name: string} | null>(null);

  if (!user) return null;

  const personalAccounts = data.accounts.filter(a => a.ownerId === user.id);
  const cashAccounts = personalAccounts.filter(a => a.type === 'cash' || a.type === 'savings');
  const investmentAccounts = personalAccounts.filter(a => a.type === 'investment');
  const debtAccounts = personalAccounts.filter(a => a.type === 'debt');
  
  const personalCosts = data.recurringCosts.filter(c => c.ownerId === user.id);
  const incomeSources = user.incomeSources || []; // Fallback if migration failed somehow
  
  const totalFixedCosts = personalCosts.reduce((sum, cost) => sum + cost.amount, 0);
  const totalDebt = debtAccounts.reduce((sum, acc) => sum + Math.abs(acc.balance), 0);
  
  const handleAddAccount = () => {
      if (!newAccount.name || newAccount.balance === undefined) return;
      
      const institutionName = newAccount.institution === 'Other' ? customBank : newAccount.institution;

      addAccount({
          name: newAccount.name,
          balance: Number(newAccount.balance),
          institution: institutionName || 'Bank',
          type: newAccount.type as any || 'savings',
          currency: 'EUR',
          ownerId: user.id,
          includeInHousehold: newAccount.includeInHousehold || false,
          apy: newAccount.apy || 0
      });
      setIsAddAccountOpen(false);
      setNewAccount({ name: '', balance: 0, institution: '', type: 'savings', currency: 'EUR', includeInHousehold: true, apy: 0 });
      setCustomBank('');
  };

  const handleAddCost = () => {
      if (!newCost.name || !newCost.amount) return;
      addRecurringCost({
          name: newCost.name,
          amount: Number(newCost.amount),
          category: newCost.category || 'Other',
          ownerId: user.id,
          includeInHousehold: newCost.includeInHousehold || false
      });
      setIsAddCostOpen(false);
      setNewCost({ name: '', amount: 0, category: 'Subscription', includeInHousehold: false });
  };

  const handleAddIncome = () => {
      if (!newIncome.name || !newIncome.amount) return;
      addIncomeSource({
          name: newIncome.name,
          amount: Number(newIncome.amount),
          ownerId: user.id
      });
      setIsAddIncomeOpen(false);
      setNewIncome({ name: '', amount: 0 });
  };

  const handleEditAccount = (account: Account) => {
      setEditingAccount(account);
      setEditAccountBalance(account.balance);
  };

  const saveAccountEdit = () => {
        if (editingAccount) {
            updateAccount(editingAccount.id, { balance: editAccountBalance });
            setEditingAccount(null);
        }
  };

  const handleEditCost = (cost: RecurringCost) => {
      setEditingCost(cost);
      setEditingCostData({ ...cost });
  };

  const saveCostEdit = () => {
      if (editingCost && editingCostData.name && editingCostData.amount) {
          updateRecurringCost(editingCost.id, editingCostData);
          setEditingCost(null);
      }
  };

  const handleDelete = (type: 'account' | 'cost' | 'income', id: string, name: string) => {
      setDeleteConfirmOpen(true);
      setItemToDelete({type, id, name});
  };

  const confirmDelete = () => {
      if (itemToDelete) {
          switch (itemToDelete.type) {
              case 'account':
                  deleteAccount(itemToDelete.id);
                  break;
              case 'cost':
                  deleteRecurringCost(itemToDelete.id);
                  break;
              case 'income':
                  deleteIncomeSource(itemToDelete.id);
                  break;
          }
          setDeleteConfirmOpen(false);
          setItemToDelete(null);
      }
  };

  return (
    <div className="space-y-8 md:space-y-12 pb-24">
       {/* Account Edit Dialog */}
       <Dialog open={!!editingAccount} onOpenChange={(open) => !open && setEditingAccount(null)}>
          <DialogContent>
              <DialogHeader>
                  <DialogTitle>Edit Account Balance</DialogTitle>
                  <DialogDescription>Update the current balance for {editingAccount?.name}.</DialogDescription>
              </DialogHeader>
              <div className="py-4">
                  <Label>Current Balance</Label>
                  <div className="relative mt-2">
                      <Input 
                          type="number" 
                          value={isNaN(editAccountBalance) ? '' : editAccountBalance} 
                          onChange={(e) => setEditAccountBalance(parseFloat(e.target.value))}
                          className="font-bold text-lg pr-8" 
                      />
                      <span className="absolute right-3 top-2.5 text-muted-foreground">€</span>
                  </div>
              </div>
              <DialogFooter>
                  <Button onClick={saveAccountEdit}>Save Changes</Button>
              </DialogFooter>
          </DialogContent>
       </Dialog>

       {/* Cost Edit Dialog */}
       <Dialog open={!!editingCost} onOpenChange={(open) => !open && setEditingCost(null)}>
          <DialogContent>
              <DialogHeader>
                  <DialogTitle>Edit Subscription</DialogTitle>
                  <DialogDescription>Update the details for {editingCost?.name}.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                      <Label>Name</Label>
                      <Input value={editingCostData.name} onChange={e => setEditingCostData({...editingCostData, name: e.target.value})} />
                  </div>
                  <div className="grid gap-2">
                      <Label>Monthly Cost</Label>
                      <div className="relative">
                        <Input type="number" value={isNaN(editingCostData.amount || 0) ? '' : editingCostData.amount} onChange={e => setEditingCostData({...editingCostData, amount: parseFloat(e.target.value)})} />
                        <span className="absolute right-3 top-2.5 text-muted-foreground">€</span>
                      </div>
                  </div>
                  <div className="grid gap-2">
                      <Label>Category</Label>
                      <Input value={editingCostData.category} onChange={e => setEditingCostData({...editingCostData, category: e.target.value})} />
                  </div>
              </div>
              <DialogFooter>
                  <Button onClick={saveCostEdit}>Save Changes</Button>
              </DialogFooter>
          </DialogContent>
       </Dialog>

       {/* Delete Confirmation Dialog */}
       <DeleteConfirmation 
           open={deleteConfirmOpen} 
           onOpenChange={setDeleteConfirmOpen} 
           onConfirm={confirmDelete}
           itemName={itemToDelete?.name}
           description={`This will permanently delete this ${itemToDelete?.type}. This action cannot be undone.`}
       />


       {/* Income Section */}
       <PremiumCard className="p-0 border-none shadow-none bg-transparent md:p-6 md:border md:shadow-sm md:bg-card/80">
           <div className="flex items-center justify-between mb-4 md:mb-6 px-1 md:px-0">
               <div className="flex items-center gap-3">
                   <div className="p-2 bg-green-500/10 rounded-lg text-green-500">
                       <Wallet size={24} />
                   </div>
                   <div>
                       <h3 className="font-semibold">Income Sources</h3>
                       <p className="text-sm text-muted-foreground">Monthly net income</p>
                   </div>
               </div>
               
               <Dialog open={isAddIncomeOpen} onOpenChange={setIsAddIncomeOpen}>
                   <DialogTrigger asChild>
                       <Button size="sm" className="bg-[#FDFEFD] hover:bg-[#FDFEFD]/90 text-foreground border border-border shadow-sm"><Plus size={16} className="mr-1" /> Add Income</Button>
                   </DialogTrigger>
                   <DialogContent>
                       <DialogHeader>
                           <DialogTitle>Add Income Source</DialogTitle>
                           <DialogDescription>Enter the details of your new income source.</DialogDescription>
                       </DialogHeader>
                       <div className="grid gap-4 py-4">
                           <div className="grid gap-2">
                               <Label>Source Name</Label>
                               <Input value={newIncome.name} onChange={e => setNewIncome({...newIncome, name: e.target.value})} placeholder="e.g. Salary, Freelance" />
                           </div>
                           <div className="grid gap-2">
                               <Label>Monthly Net Amount</Label>
                               <div className="relative">
                                   <Input type="number" value={isNaN(newIncome.amount || 0) ? '' : newIncome.amount} onChange={e => setNewIncome({...newIncome, amount: parseFloat(e.target.value)})} />
                                   <span className="absolute right-3 top-2.5 text-muted-foreground">€</span>
                               </div>
                           </div>
                       </div>
                       <DialogFooter>
                           <Button onClick={handleAddIncome}>Add Income</Button>
                       </DialogFooter>
                   </DialogContent>
               </Dialog>
           </div>
           
           <div className="space-y-3">
               {incomeSources.map((inc) => (
                   <div key={inc.id} className="flex items-center justify-between p-4 bg-card rounded-xl border shadow-sm">
                       <div className="flex items-center gap-3">
                            <div className="p-2 bg-muted rounded-full border text-muted-foreground">
                                <Briefcase size={16} />
                            </div>
                            <div className="font-medium">{inc.name}</div>
                       </div>
                       <div className="flex items-center gap-4">
                           <div className="relative w-36">
                               <Input 
                                    type="number" 
                                    value={isNaN(inc.amount) ? '' : inc.amount} 
                                    onChange={(e) => updateIncomeSource(inc.id, { amount: parseFloat(e.target.value) || 0 })}
                                    className="text-right pr-8 font-bold bg-transparent border-transparent hover:border-input focus:bg-background transition-all h-8"
                               />
                               <span className="absolute right-3 top-1 text-muted-foreground text-sm">€</span>
                           </div>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-red-500 transition-colors" onClick={() => handleDelete('income', inc.id, inc.name)}>
                               <Trash2 size={14} />
                           </Button>
                       </div>
                   </div>
               ))}
               <div className="flex justify-between items-center px-4 pt-2">
                   <span className="text-sm font-medium text-muted-foreground">Total Monthly Income</span>
                   <span className="text-lg font-bold">{formatCurrency(user.netIncome)}</span>
               </div>
           </div>
       </PremiumCard>

       {/* Accounts Section */}
       <PremiumCard className="p-0 border-none shadow-none bg-transparent md:p-6 md:border md:shadow-sm md:bg-card/80">
           <div className="flex items-center justify-between mb-4 md:mb-6 px-1 md:px-0">
               <div className="flex items-center gap-3">
                   <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
                       <TrendingUp size={24} />
                   </div>
                   <div>
                       <h3 className="font-semibold">My Accounts</h3>
                       <p className="text-sm text-muted-foreground">Assets & Investments</p>
                   </div>
               </div>
               
               <Dialog open={isAddAccountOpen} onOpenChange={setIsAddAccountOpen}>
                   <DialogTrigger asChild>
                       <Button size="sm" className="bg-[#FDFEFD] hover:bg-[#FDFEFD]/90 text-foreground border border-border shadow-sm"><Plus size={16} className="mr-1" /> Add Account</Button>
                   </DialogTrigger>
                   <DialogContent className="sm:max-w-[425px]">
                       <DialogHeader>
                           <DialogTitle>Add Personal Account</DialogTitle>
                           <DialogDescription>Connect a new bank account or manually track an asset.</DialogDescription>
                       </DialogHeader>
                       <div className="grid gap-4 py-4">
                           <div className="grid gap-2">
                               <Label>Account Name</Label>
                               <Input value={newAccount.name} onChange={e => setNewAccount({...newAccount, name: e.target.value})} placeholder="e.g. Main Savings" />
                           </div>
                           
                           <div className="grid gap-2">
                               <Label>Institution</Label>
                               <Select value={newAccount.institution} onValueChange={v => setNewAccount({...newAccount, institution: v})}>
                                   <SelectTrigger><SelectValue placeholder="Select Bank" /></SelectTrigger>
                                   <SelectContent>
                                       {SPANISH_BANKS.map(bank => (
                                           <SelectItem key={bank} value={bank}>{bank}</SelectItem>
                                       ))}
                                       <SelectItem value="Other">Other (Custom)</SelectItem>
                                   </SelectContent>
                               </Select>
                               {newAccount.institution === 'Other' && (
                                   <Input 
                                        value={customBank} 
                                        onChange={e => setCustomBank(e.target.value)} 
                                        placeholder="Enter bank name" 
                                        className="mt-2"
                                   />
                               )}
                           </div>

                           <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label>Type</Label>
                                    <Select value={newAccount.type} onValueChange={v => setNewAccount({...newAccount, type: v as any})}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="savings">Savings</SelectItem>
                                            <SelectItem value="cash">Cash / Checking</SelectItem>
                                            <SelectItem value="investment">Investment</SelectItem>
                                            <SelectItem value="debt">Debt</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid gap-2">
                                    <Label>Currency</Label>
                                    <Input value="EUR" disabled />
                                </div>
                           </div>

                           {newAccount.type === 'investment' && (
                               <div className="grid gap-2">
                                   <Label className="text-blue-500">Expected Annual Return (%)</Label>
                                   <div className="relative">
                                       <Input 
                                            type="number" 
                                            value={isNaN(newAccount.apy || 0) ? '' : newAccount.apy} 
                                            onChange={e => setNewAccount({...newAccount, apy: parseFloat(e.target.value)})} 
                                            placeholder="e.g. 5.0"
                                            className="border-blue-200 bg-blue-50 dark:bg-blue-900/20"
                                        />
                                       <span className="absolute right-3 top-2.5 text-muted-foreground">%</span>
                                   </div>
                                   <p className="text-[10px] text-muted-foreground">Used for goal forecasting.</p>
                               </div>
                           )}

                           <div className="grid gap-2">
                               <Label>Current Balance</Label>
                               <div className="relative">
                                    <Input type="number" value={isNaN(newAccount.balance || 0) ? '' : newAccount.balance} onChange={e => setNewAccount({...newAccount, balance: parseFloat(e.target.value)})} />
                                    <span className="absolute right-3 top-2.5 text-muted-foreground">€</span>
                               </div>
                           </div>
                           
                           <div className="flex items-center justify-between mt-2 p-3 bg-muted/50 rounded-lg">
                               <div className="space-y-0.5">
                                   <Label>Include in Household</Label>
                                   <p className="text-xs text-muted-foreground">Visible to partner & used in goals.</p>
                               </div>
                               <Switch checked={newAccount.includeInHousehold} onCheckedChange={c => setNewAccount({...newAccount, includeInHousehold: c})} />
                           </div>
                       </div>
                       <DialogFooter>
                           <Button onClick={handleAddAccount}>Add Account</Button>
                       </DialogFooter>
                   </DialogContent>
               </Dialog>
           </div>
           
           <div className="space-y-6">
               {/* Cash & Savings Group */}
               <div>
                   <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 pl-1">Cash & Savings</h4>
                   <div className="space-y-3">
                       {cashAccounts.length === 0 && <div className="text-sm text-muted-foreground italic pl-1">No cash accounts.</div>}
                       {cashAccounts.map((acc, i) => (
                           <AccountItem key={acc.id} acc={acc} index={i} updateAccount={updateAccount} onDelete={() => handleDelete('account', acc.id, acc.name)} onEdit={() => handleEditAccount(acc)} />
                       ))}
                   </div>
               </div>

               {/* Investments Group */}
               <div>
                   <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 pl-1 flex items-center gap-2">
                       Investments <TrendingUp size={12} />
                   </h4>
                   <div className="space-y-3">
                       {investmentAccounts.length === 0 && <div className="text-sm text-muted-foreground italic pl-1">No investment accounts.</div>}
                       {investmentAccounts.map((acc, i) => (
                           <AccountItem key={acc.id} acc={acc} index={i} updateAccount={updateAccount} onDelete={() => handleDelete('account', acc.id, acc.name)} onEdit={() => handleEditAccount(acc)} />
                       ))}
                   </div>
               </div>
           </div>
       </PremiumCard>

       {/* Recurring Costs */}
       <PremiumCard className="p-0 border-none shadow-none bg-transparent md:p-6 md:border md:shadow-sm md:bg-card/80">
           <div className="flex items-center justify-between mb-4 md:mb-6">
               <div className="flex items-center gap-3">
                   <div className="p-2 bg-orange-500/10 rounded-lg text-orange-500">
                       <RefreshCw size={24} />
                   </div>
                   <div>
                       <h3 className="font-semibold">Fixed Costs</h3>
                       <p className="text-sm text-muted-foreground">Subscriptions & expenses</p>
                   </div>
               </div>

               <Dialog open={isAddCostOpen} onOpenChange={setIsAddCostOpen}>
                   <DialogTrigger asChild>
                       <Button size="sm" className="bg-[#FDFEFD] hover:bg-[#FDFEFD]/90 text-foreground border border-border shadow-sm"><Plus size={16} className="mr-1" /> Add Cost</Button>
                   </DialogTrigger>
                   <DialogContent>
                       <DialogHeader>
                           <DialogTitle>Add Subscription</DialogTitle>
                           <DialogDescription>Track a new recurring expense or subscription.</DialogDescription>
                       </DialogHeader>
                       <div className="grid gap-4 py-4">
                           <div className="grid gap-2">
                               <Label>Name</Label>
                               <Input value={newCost.name} onChange={e => setNewCost({...newCost, name: e.target.value})} placeholder="e.g. Spotify" />
                           </div>
                           <div className="grid gap-2">
                               <Label>Monthly Cost</Label>
                               <Input type="number" value={isNaN(newCost.amount || 0) ? '' : newCost.amount} onChange={e => setNewCost({...newCost, amount: parseFloat(e.target.value)})} />
                           </div>
                           <div className="grid gap-2">
                               <Label>Category</Label>
                               <Input value={newCost.category} onChange={e => setNewCost({...newCost, category: e.target.value})} placeholder="e.g. Entertainment" />
                           </div>
                           <div className="flex items-center justify-between mt-2">
                               <Label>Share cost with Household?</Label>
                               <Switch checked={newCost.includeInHousehold} onCheckedChange={c => setNewCost({...newCost, includeInHousehold: c})} />
                           </div>
                       </div>
                       <DialogFooter>
                           <Button onClick={handleAddCost}>Add Subscription</Button>
                       </DialogFooter>
                   </DialogContent>
               </Dialog>
           </div>
           
           <div className="space-y-3">
               {personalCosts.map((cost, i) => (
                   <div key={cost.id} className="flex items-center justify-between p-3 md:p-4 bg-muted/30 rounded-xl border">
                       <div>
                           <div className="font-medium">{cost.name}</div>
                           <div className="text-xs text-muted-foreground">{cost.category}</div>
                       </div>
                       <div className="flex items-center gap-4">
                           <span className="font-bold">-{formatCurrency(cost.amount)}</span>
                           <div className="flex items-center gap-2">
                               <Switch 
                                    checked={cost.includeInHousehold} 
                                    onCheckedChange={(c) => updateRecurringCost(cost.id, { includeInHousehold: c })} 
                               />
                               <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={() => handleEditCost(cost)}>
                                   <Pencil size={14} />
                               </Button>
                               <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-red-500" onClick={() => handleDelete('cost', cost.id, cost.name)}>
                                   <Trash2 size={14} />
                               </Button>
                           </div>
                       </div>
                   </div>
               ))}
               <div className="flex justify-between items-center px-4 pt-2">
                   <span className="text-sm font-medium text-muted-foreground">Total Monthly Costs</span>
                   <span className="text-lg font-bold text-orange-600 dark:text-orange-400">-{formatCurrency(totalFixedCosts)}</span>
               </div>
           </div>
       </PremiumCard>

       {/* Debts Section - Only show if user has debt accounts */}
       {debtAccounts.length > 0 && (
        <PremiumCard className="p-0 border-none shadow-none bg-transparent md:p-6 md:border md:shadow-sm md:bg-card/80">
            <div className="flex items-center justify-between mb-4 md:mb-6 px-1 md:px-0">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-500/10 rounded-lg text-red-500">
                        <ShieldAlert size={24} />
                    </div>
                    <div>
                        <h3 className="font-semibold">Debts</h3>
                        <p className="text-sm text-muted-foreground">Loans & credit</p>
                    </div>
                </div>
            </div>
            
            <div className="space-y-3">
                {debtAccounts.map((acc, i) => (
                    <AccountItem key={acc.id} acc={acc} index={i} updateAccount={updateAccount} onDelete={() => handleDelete('account', acc.id, acc.name)} onEdit={() => handleEditAccount(acc)} />
                ))}
                <div className="flex justify-between items-center px-4 pt-2">
                    <span className="text-sm font-medium text-muted-foreground">Total Debt</span>
                    <span className="text-lg font-bold text-red-600 dark:text-red-400">-{formatCurrency(totalDebt)}</span>
                </div>
            </div>
        </PremiumCard>
       )}
     </div>
  );
};

// Sub-component for Account Item to keep clean
const AccountItem = ({ acc, index, updateAccount, onDelete, onEdit }: { acc: Account, index: number, updateAccount: any, onDelete: () => void, onEdit: () => void }) => {
    const isInvestment = acc.type === 'investment';
    const isDebt = acc.type === 'debt';
    return (
        <motion.div 
             initial={{ opacity: 0, y: 10 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: index * 0.05 }}
             className="relative bg-card rounded-xl border shadow-sm hover:shadow-md transition-all cursor-pointer overflow-hidden"
             onClick={onEdit}
        >
            <div className="flex flex-col md:flex-row md:items-center p-4 gap-4 md:gap-0">
                
                {/* Top Section (Mobile) / Left Section (Desktop) */}
                <div className="flex items-start justify-between w-full md:w-auto gap-3">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                        {/* Bank Logo */}
                        <div className={cn(
                            "h-10 w-10 shrink-0 rounded-xl flex items-center justify-center border shadow-sm overflow-hidden",
                            isInvestment 
                                ? "bg-purple-100 border-purple-200 dark:bg-purple-900/20 dark:border-purple-800" 
                                : isDebt 
                                ? "bg-red-100 border-red-200 dark:bg-red-900/20 dark:border-red-800"
                                : "bg-white dark:bg-card border-border"
                        )}>
                            <ImageWithFallback 
                                src={getBankLogoUrl(acc.institution || '')}
                                alt={acc.institution || 'Bank'}
                                className="h-full w-full object-contain p-0"
                            />
                        </div>
                        
                        {/* Name & Institution */}
                        <div className="min-w-0 flex-1">
                            <div className="font-medium truncate flex items-center gap-2">
                                {acc.name}
                            </div>
                            <div className="text-xs text-muted-foreground capitalize truncate">{acc.institution}</div>
                        </div>
                    </div>

                    {/* Mobile Balance Display */}
                    <div className="md:hidden text-right shrink-0">
                        <div className="font-bold text-lg tracking-tight">{formatCurrency(acc.balance)}</div>
                        {isInvestment && acc.apy && acc.apy > 0 && <div className="text-[10px] text-green-600 dark:text-green-400">+{acc.apy}%</div>}
                    </div>
                </div>

                {/* Bottom Section (Mobile) / Right Section (Desktop) */}
                <div className="flex items-center justify-between md:justify-end md:flex-1 md:gap-6 pt-3 md:pt-0 border-t md:border-t-0 border-dashed border-border/60">
                    
                    {/* Desktop Balance */}
                    <div className="hidden md:block text-right">
                        <div className="font-bold">{formatCurrency(acc.balance)}</div>
                        {isInvestment && acc.apy && acc.apy > 0 && <div className="text-[10px] text-green-600 dark:text-green-400">+{acc.apy}%</div>}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between w-full md:w-auto gap-4" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-2">
                             <Switch 
                                  checked={acc.includeInHousehold} 
                                  onCheckedChange={(c) => updateAccount(acc.id, { includeInHousehold: c })}
                                  id={`share-${acc.id}`}
                                  className="data-[state=checked]:bg-primary"
                             />
                             <Label htmlFor={`share-${acc.id}`} className="text-xs font-medium text-muted-foreground cursor-pointer md:hidden">
                                 Share to Household
                             </Label>
                        </div>

                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors" 
                            onClick={() => onDelete()}
                        >
                            <Trash2 size={16} />
                        </Button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};