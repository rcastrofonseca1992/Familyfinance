import React, { useState } from 'react';
import { useFinance, RecurringCost } from '../../store/FinanceContext';
import { PremiumCard } from '../../ui/PremiumCard';
import { formatCurrency } from '../../lib/finance';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '../../ui/dialog';
import { DeleteConfirmation } from '../../ui/delete-confirmation';
import { Plus, Trash2, Receipt, ArrowLeft, Pencil, RefreshCw } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { toast } from '../../utils/toastManager';

interface FixedCostsPageProps {
  onNavigate: (page: string) => void;
}

export const FixedCostsPage: React.FC<FixedCostsPageProps> = ({ onNavigate }) => {
  const { data, addRecurringCost, updateRecurringCost, deleteRecurringCost } = useFinance();
  const { t } = useLanguage();
  const user = data.user;

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newCost, setNewCost] = useState<Partial<RecurringCost>>({ 
    name: '', 
    amount: 0, 
    category: 'Subscription',
    frequency: 'monthly',
    includeInHousehold: false 
  });

  const [editingCost, setEditingCost] = useState<RecurringCost | null>(null);
  const [editingData, setEditingData] = useState<Partial<RecurringCost>>({});

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ id: string; name: string } | null>(null);

  if (!user) return null;

  // Filter: only show fixed costs owned by this user
  const personalCosts = data.recurringCosts.filter(c => c.ownerId === user.id);
  const totalCosts = personalCosts.reduce((sum, c) => sum + c.amount, 0);

  const handleAdd = () => {
    if (!newCost.name || !newCost.amount || newCost.amount <= 0) {
      return;
    }

    const costToAdd: RecurringCost = {
      id: crypto.randomUUID(),
      name: newCost.name,
      amount: newCost.amount || 0,
      category: newCost.category || 'Subscription',
      frequency: newCost.frequency || 'monthly',
      ownerId: data.user!.id,
      includeInHousehold: newCost.includeInHousehold ?? false
    };

    addRecurringCost(costToAdd);
    setNewCost({ name: '', amount: 0, category: 'Subscription', frequency: 'monthly', includeInHousehold: false });
    setIsAddOpen(false);
  };

  const handleEdit = () => {
    if (!editingCost) return;
    updateRecurringCost(editingCost.id, editingData);
    setEditingCost(null);
    setEditingData({});
  };

  const handleDelete = () => {
    if (!itemToDelete) return;
    deleteRecurringCost(itemToDelete.id);
    setDeleteConfirmOpen(false);
    setItemToDelete(null);
  };

  const openEditDialog = (cost: RecurringCost) => {
    setEditingCost(cost);
    setEditingData({ 
      name: cost.name, 
      amount: cost.amount, 
      category: cost.category,
      frequency: cost.frequency
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
            <h1 className="text-3xl font-bold">{t('personal.fixedCosts')}</h1>
            <p className="text-muted-foreground">{t('personal.fixedCostsSubtitle')}</p>
          </div>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus size={16} />
              {t('personal.addCost')}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('personal.addSubscription')}</DialogTitle>
              <DialogDescription>{t('personal.trackRecurringExpense')}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>{t('personal.name')}</Label>
                <Input
                  placeholder={t('personal.subscriptionNamePlaceholder')}
                  value={newCost.name}
                  onChange={(e) => setNewCost({ ...newCost, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>{t('personal.monthlyCost')}</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={newCost.amount || ''}
                  onChange={(e) => setNewCost({ ...newCost, amount: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label>{t('personal.category')}</Label>
                <Input
                  placeholder={t('personal.categoryPlaceholder')}
                  value={newCost.category}
                  onChange={(e) => setNewCost({ ...newCost, category: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>{t('personal.frequency')}</Label>
                <Select
                  value={newCost.frequency || 'monthly'}
                  onValueChange={(value) => setNewCost({ ...newCost, frequency: value as RecurringCost['frequency'] })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">{t('personal.monthly')}</SelectItem>
                    <SelectItem value="yearly">{t('personal.yearly')}</SelectItem>
                    <SelectItem value="weekly">{t('personal.weekly')}</SelectItem>
                  </SelectContent>
                </Select>
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
      <PremiumCard className="border-l-4 border-l-orange-500">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-orange-100 dark:bg-orange-900/20 text-orange-600 rounded-lg">
              <Receipt size={24} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">{t('personal.totalMonthlyCosts')}</p>
              <p className="text-3xl font-bold">{formatCurrency(totalCosts)}</p>
            </div>
          </div>
        </div>
      </PremiumCard>

      {/* Fixed Costs List */}
      <div className="space-y-3">
        {personalCosts.length === 0 && (
          <PremiumCard className="text-center py-12">
            <div className="text-muted-foreground">
              <Receipt size={48} className="mx-auto mb-4 opacity-20" />
              <p className="text-sm">{t('personal.noCostsYet')}</p>
              <p className="text-xs mt-2">{t('personal.addFirstCost')}</p>
            </div>
          </PremiumCard>
        )}

        {personalCosts.map((cost) => (
          <PremiumCard key={cost.id} className="flex items-center justify-between hover:border-orange-500/30 transition-colors">
            <div className="flex-1 flex items-center gap-3">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/20 text-orange-600 rounded-lg">
                <RefreshCw size={16} />
              </div>
              <div className="flex-1">
                <p className="font-semibold">{cost.name}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{cost.category}</span>
                  <span>•</span>
                  <span className="capitalize">{cost.frequency || 'monthly'}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <p className="text-xl font-bold">{formatCurrency(cost.amount)}</p>
              <Dialog
                open={editingCost?.id === cost.id}
                onOpenChange={(open) => {
                  if (!open) {
                    setEditingCost(null);
                    setEditingData({});
                  }
                }}
              >
                <DialogTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={() => openEditDialog(cost)}>
                    <Pencil size={16} />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{t('personal.editSubscription')}</DialogTitle>
                    <DialogDescription>{t('personal.updateDetailsFor', { name: cost.name })}</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>{t('personal.name')}</Label>
                      <Input
                        value={editingData.name || ''}
                        onChange={(e) => setEditingData({ ...editingData, name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{t('personal.monthlyCost')}</Label>
                      <Input
                        type="number"
                        value={editingData.amount || ''}
                        onChange={(e) => setEditingData({ ...editingData, amount: parseFloat(e.target.value) || 0 })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{t('personal.category')}</Label>
                      <Input
                        value={editingData.category || ''}
                        onChange={(e) => setEditingData({ ...editingData, category: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{t('personal.frequency')}</Label>
                      <Select
                        value={editingData.frequency || 'monthly'}
                        onValueChange={(value) => setEditingData({ ...editingData, frequency: value as RecurringCost['frequency'] })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="monthly">{t('personal.monthly')}</SelectItem>
                          <SelectItem value="yearly">{t('personal.yearly')}</SelectItem>
                          <SelectItem value="weekly">{t('personal.weekly')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => { setEditingCost(null); setEditingData({}); }}>
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
                onClick={() => openDeleteDialog(cost.id, cost.name)}
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
        description={t('delete.description', { type: t('personal.fixedCost') })}
      />
    </div>
  );
};