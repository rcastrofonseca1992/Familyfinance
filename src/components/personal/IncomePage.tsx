import React, { useState } from 'react';
import { useFinance, IncomeSource } from '../store/FinanceContext';
import { PremiumCard } from '../ui/PremiumCard';
import { formatCurrency } from '../../lib/finance';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '../ui/dialog';
import { DeleteConfirmation } from '../ui/delete-confirmation';
import { Plus, Trash2, TrendingUp, ArrowLeft, Pencil } from 'lucide-react';
import { useLanguage } from '../../src/contexts/LanguageContext';
import { toast } from 'sonner';

interface IncomePageProps {
  onNavigate: (page: string) => void;
}

export const IncomePage: React.FC<IncomePageProps> = ({ onNavigate }) => {
  const { data, addIncomeSource, updateIncomeSource, deleteIncomeSource, getPersonalTotalIncome } = useFinance();
  const { t } = useLanguage();
  const user = data.user;

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newIncome, setNewIncome] = useState<Partial<IncomeSource>>({ name: '', amount: 0 });

  const [editingIncome, setEditingIncome] = useState<IncomeSource | null>(null);
  const [editingData, setEditingData] = useState<Partial<IncomeSource>>({});

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ id: string; name: string } | null>(null);

  if (!user) return null;

  // Filter: only show income sources for this user
  const incomeSources = user.incomeSources || [];
  const totalIncome = getPersonalTotalIncome();

  const handleAdd = () => {
    if (!newIncome.name || !newIncome.amount || newIncome.amount <= 0) {
      toast.error(t('personal.fillAllFields'));
      return;
    }
    addIncomeSource(newIncome as IncomeSource);
    setNewIncome({ name: '', amount: 0 });
    setIsAddOpen(false);
    toast.success(t('personal.incomeAdded'));
  };

  const handleEdit = () => {
    if (!editingIncome) return;
    updateIncomeSource(editingIncome.id, editingData);
    setEditingIncome(null);
    setEditingData({});
    toast.success(t('personal.incomeUpdated'));
  };

  const handleDelete = () => {
    if (!itemToDelete) return;
    deleteIncomeSource(itemToDelete.id);
    setDeleteConfirmOpen(false);
    setItemToDelete(null);
    toast.success(t('personal.incomeDeleted'));
  };

  const openEditDialog = (income: IncomeSource) => {
    setEditingIncome(income);
    setEditingData({ name: income.name, amount: income.amount });
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
            <h1 className="text-3xl font-bold">{t('personal.income')}</h1>
            <p className="text-muted-foreground">{t('personal.incomeSubtitle')}</p>
          </div>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus size={16} />
              {t('personal.addIncome')}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('personal.addIncomeSource')}</DialogTitle>
              <DialogDescription>{t('personal.enterIncomeDetails')}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>{t('personal.sourceName')}</Label>
                <Input
                  placeholder={t('personal.sourceNamePlaceholder')}
                  value={newIncome.name}
                  onChange={(e) => setNewIncome({ ...newIncome, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>{t('personal.monthlyNetAmount')}</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={newIncome.amount || ''}
                  onChange={(e) => setNewIncome({ ...newIncome, amount: parseFloat(e.target.value) || 0 })}
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

      {/* Total Summary Card */}
      <PremiumCard className="border-l-4 border-l-green-500">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 dark:bg-green-900/20 text-green-600 rounded-lg">
              <TrendingUp size={24} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">{t('personal.totalMonthlyIncome')}</p>
              <p className="text-3xl font-bold">{formatCurrency(totalIncome)}</p>
            </div>
          </div>
        </div>
      </PremiumCard>

      {/* Income Sources List */}
      <div className="space-y-3">
        {incomeSources.length === 0 && (
          <PremiumCard className="text-center py-12">
            <div className="text-muted-foreground">
              <TrendingUp size={48} className="mx-auto mb-4 opacity-20" />
              <p className="text-sm">{t('personal.noIncomeYet')}</p>
              <p className="text-xs mt-2">{t('personal.addFirstIncome')}</p>
            </div>
          </PremiumCard>
        )}

        {incomeSources.map((income) => (
          <PremiumCard key={income.id} className="flex items-center justify-between hover:border-green-500/30 transition-colors">
            <div className="flex-1">
              <p className="font-semibold">{income.name}</p>
              <p className="text-sm text-muted-foreground">{t('personal.monthly')}</p>
            </div>
            <div className="flex items-center gap-3">
              <p className="text-xl font-bold">{formatCurrency(income.amount)}</p>
              <Dialog
                open={editingIncome?.id === income.id}
                onOpenChange={(open) => {
                  if (!open) {
                    setEditingIncome(null);
                    setEditingData({});
                  }
                }}
              >
                <DialogTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={() => openEditDialog(income)}>
                    <Pencil size={16} />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{t('personal.editIncome')}</DialogTitle>
                    <DialogDescription>{t('personal.updateIncomeDetails')}</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>{t('personal.sourceName')}</Label>
                      <Input
                        value={editingData.name || ''}
                        onChange={(e) => setEditingData({ ...editingData, name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{t('personal.monthlyNetAmount')}</Label>
                      <Input
                        type="number"
                        value={editingData.amount || ''}
                        onChange={(e) => setEditingData({ ...editingData, amount: parseFloat(e.target.value) || 0 })}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => { setEditingIncome(null); setEditingData({}); }}>
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
                onClick={() => openDeleteDialog(income.id, income.name)}
              >
                <Trash2 size={16} />
              </Button>
            </div>
          </PremiumCard>
        ))}
      </div>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmation
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        onConfirm={handleDelete}
        title={t('delete.title')}
        description={t('delete.description', { type: 'income source' })}
      />
    </div>
  );
};
