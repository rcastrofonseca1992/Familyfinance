import React, { useState } from 'react';
import { useFinance } from '../store/FinanceContext';
import { PremiumCard } from '../ui/PremiumCard';
import { formatCurrency } from '../../lib/finance';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '../ui/dialog';
import { DeleteConfirmation } from '../ui/delete-confirmation';
import { Plus, Trash2, CreditCard, ArrowLeft, Pencil, AlertCircle } from 'lucide-react';
import { useLanguage } from '../../src/contexts/LanguageContext';
import { toast } from 'sonner';

interface DebtsPageProps {
  onNavigate: (page: string) => void;
}

export interface Debt {
  id: string;
  name: string;
  totalAmount: number;
  remainingAmount: number;
  monthlyPayment: number;
  interestRate: number;
  ownerId: string;
}

export const DebtsPage: React.FC<DebtsPageProps> = ({ onNavigate }) => {
  const { data, updateData } = useFinance();
  const { t } = useLanguage();
  const user = data.user;

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newDebt, setNewDebt] = useState<Partial<Debt>>({ 
    name: '', 
    totalAmount: 0,
    remainingAmount: 0,
    monthlyPayment: 0,
    interestRate: 0
  });

  const [editingDebt, setEditingDebt] = useState<Debt | null>(null);
  const [editingData, setEditingData] = useState<Partial<Debt>>({});

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ id: string; name: string } | null>(null);

  if (!user) return null;

  // Filter: only show debts owned by this user
  const personalDebts = (data.debts || []).filter(d => d.ownerId === user.id);
  const totalDebt = personalDebts.reduce((sum, d) => sum + (d.remainingAmount || d.totalAmount), 0);
  const totalMonthlyPayment = personalDebts.reduce((sum, d) => sum + (d.monthlyPayment || 0), 0);

  const handleAdd = () => {
    if (!newDebt.name || !newDebt.totalAmount || newDebt.totalAmount <= 0) {
      toast.error(t('personal.fillAllFields'));
      return;
    }

    const debtToAdd: Debt = {
      id: Date.now().toString(),
      name: newDebt.name!,
      totalAmount: newDebt.totalAmount!,
      remainingAmount: newDebt.remainingAmount || newDebt.totalAmount!,
      monthlyPayment: newDebt.monthlyPayment || 0,
      interestRate: newDebt.interestRate || 0,
      ownerId: user.id // Set owner_id automatically
    };

    const updatedDebts = [...(data.debts || []), debtToAdd];
    updateData({ debts: updatedDebts });
    setNewDebt({ name: '', totalAmount: 0, remainingAmount: 0, monthlyPayment: 0, interestRate: 0 });
    setIsAddOpen(false);
    toast.success(t('personal.debtAdded'));
  };

  const handleEdit = () => {
    if (!editingDebt) return;
    
    const updatedDebts = (data.debts || []).map(d => 
      d.id === editingDebt.id ? { ...d, ...editingData } : d
    );
    updateData({ debts: updatedDebts });
    setEditingDebt(null);
    setEditingData({});
    toast.success(t('personal.debtUpdated'));
  };

  const handleDelete = () => {
    if (!itemToDelete) return;
    
    const updatedDebts = (data.debts || []).filter(d => d.id !== itemToDelete.id);
    updateData({ debts: updatedDebts });
    setDeleteConfirmOpen(false);
    setItemToDelete(null);
    toast.success(t('personal.debtDeleted'));
  };

  const openEditDialog = (debt: Debt) => {
    setEditingDebt(debt);
    setEditingData({ 
      name: debt.name,
      totalAmount: debt.totalAmount,
      remainingAmount: debt.remainingAmount,
      monthlyPayment: debt.monthlyPayment,
      interestRate: debt.interestRate
    });
  };

  const openDeleteDialog = (id: string, name: string) => {
    setItemToDelete({ id, name });
    setDeleteConfirmOpen(true);
  };

  return (
    <div className="space-y-6 pb-24 md:pb-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => onNavigate('personal')}>
            <ArrowLeft size={20} />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{t('personal.debts')}</h1>
            <p className="text-muted-foreground">{t('personal.loansCredit')}</p>
          </div>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus size={16} />
              {t('personal.addDebt')}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('personal.addNewDebt')}</DialogTitle>
              <DialogDescription>{t('personal.enterDebtDetails')}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>{t('personal.debtName')}</Label>
                <Input
                  placeholder={t('personal.debtNamePlaceholder')}
                  value={newDebt.name}
                  onChange={(e) => setNewDebt({ ...newDebt, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>{t('personal.totalAmount')}</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={newDebt.totalAmount || ''}
                  onChange={(e) => setNewDebt({ ...newDebt, totalAmount: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label>{t('personal.remainingAmount')}</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={newDebt.remainingAmount || ''}
                  onChange={(e) => setNewDebt({ ...newDebt, remainingAmount: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label>{t('personal.monthlyPayment')}</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={newDebt.monthlyPayment || ''}
                  onChange={(e) => setNewDebt({ ...newDebt, monthlyPayment: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label>{t('personal.interestRate')}</Label>
                <Input
                  type="number"
                  step="0.1"
                  placeholder="0"
                  value={newDebt.interestRate || ''}
                  onChange={(e) => setNewDebt({ ...newDebt, interestRate: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddOpen(false)}>
                {t('common.cancel')}
              </Button>
              <Button onClick={handleAdd}>{t('common.save')}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Total Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <PremiumCard className="border-l-4 border-l-red-500">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-red-100 dark:bg-red-900/20 text-red-600 rounded-lg">
                <AlertCircle size={24} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">{t('personal.totalDebt')}</p>
                <p className="text-3xl font-bold text-red-600">{formatCurrency(totalDebt)}</p>
              </div>
            </div>
          </div>
        </PremiumCard>

        <PremiumCard className="border-l-4 border-l-orange-500">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-orange-100 dark:bg-orange-900/20 text-orange-600 rounded-lg">
                <CreditCard size={24} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">{t('personal.monthlyPayments')}</p>
                <p className="text-3xl font-bold">{formatCurrency(totalMonthlyPayment)}</p>
              </div>
            </div>
          </div>
        </PremiumCard>
      </div>

      {/* Debts List */}
      <div className="space-y-3">
        {personalDebts.length === 0 && (
          <PremiumCard className="text-center py-12">
            <div className="text-muted-foreground">
              <CreditCard size={48} className="mx-auto mb-4 opacity-20" />
              <p className="text-sm">{t('personal.noDebtsYet')}</p>
              <p className="text-xs mt-2">{t('personal.debtFreeGreat')}</p>
            </div>
          </PremiumCard>
        )}

        {personalDebts.map((debt) => {
          const remaining = debt.remainingAmount || debt.totalAmount;
          const progress = debt.totalAmount > 0 ? ((debt.totalAmount - remaining) / debt.totalAmount) * 100 : 0;

          return (
            <PremiumCard key={debt.id} className="hover:border-red-500/30 transition-colors">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{debt.name}</h3>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <span>{t('personal.monthly')}: <span className="font-semibold text-foreground">{formatCurrency(debt.monthlyPayment)}</span></span>
                      <span>{t('personal.rate')}: <span className="font-semibold text-foreground">{debt.interestRate}%</span></span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Dialog
                      open={editingDebt?.id === debt.id}
                      onOpenChange={(open) => {
                        if (!open) {
                          setEditingDebt(null);
                          setEditingData({});
                        }
                      }}
                    >
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="icon" onClick={() => openEditDialog(debt)}>
                          <Pencil size={16} />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>{t('personal.editDebt')}</DialogTitle>
                          <DialogDescription>{t('personal.updateDebtDetails')}</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label>{t('personal.debtName')}</Label>
                            <Input
                              value={editingData.name || ''}
                              onChange={(e) => setEditingData({ ...editingData, name: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>{t('personal.totalAmount')}</Label>
                            <Input
                              type="number"
                              value={editingData.totalAmount || ''}
                              onChange={(e) => setEditingData({ ...editingData, totalAmount: parseFloat(e.target.value) || 0 })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>{t('personal.remainingAmount')}</Label>
                            <Input
                              type="number"
                              value={editingData.remainingAmount || ''}
                              onChange={(e) => setEditingData({ ...editingData, remainingAmount: parseFloat(e.target.value) || 0 })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>{t('personal.monthlyPayment')}</Label>
                            <Input
                              type="number"
                              value={editingData.monthlyPayment || ''}
                              onChange={(e) => setEditingData({ ...editingData, monthlyPayment: parseFloat(e.target.value) || 0 })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>{t('personal.interestRate')}</Label>
                            <Input
                              type="number"
                              step="0.1"
                              value={editingData.interestRate || ''}
                              onChange={(e) => setEditingData({ ...editingData, interestRate: parseFloat(e.target.value) || 0 })}
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => { setEditingDebt(null); setEditingData({}); }}>
                            {t('common.cancel')}
                          </Button>
                          <Button onClick={handleEdit}>{t('common.save')}</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                      onClick={() => openDeleteDialog(debt.id, debt.name)}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t('personal.remaining')}</span>
                    <span className="font-bold text-red-600">{formatCurrency(remaining)}</span>
                  </div>
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-green-500 transition-all duration-500"
                      style={{ width: `${progress}%` }} 
                    />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{progress.toFixed(0)}% {t('personal.paidOff')}</span>
                    <span>{t('personal.total')}: {formatCurrency(debt.totalAmount)}</span>
                  </div>
                </div>
              </div>
            </PremiumCard>
          );
        })}
      </div>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmation
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        onConfirm={handleDelete}
        title={t('delete.title')}
        description={t('delete.description', { type: 'debt' })}
      />
    </div>
  );
};
