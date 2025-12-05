import React, { useState } from 'react';
import { useFinance, Account } from '../store/FinanceContext';
import { PremiumCard } from '../ui/PremiumCard';
import { formatCurrency } from '../../lib/finance';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '../ui/dialog';
import { DeleteConfirmation } from '../ui/delete-confirmation';
import { Plus, Trash2, Wallet, ArrowLeft, Pencil, Building2 } from 'lucide-react';
import { useLanguage } from '../../src/contexts/LanguageContext';
import { ImageWithFallback } from '../figma/ImageWithFallback';

interface AccountsPageProps {
  onNavigate: (page: string) => void;
}

const BANKS = [
  "Imagin", "CaixaBank", "BBVA", "Santander", "Sabadell", "Bankinter", "ING", "Openbank", "Abanca", "Revolut", "N26", "Trade Republic", "MyInvestor", "Indexa Capital", "Binance", "Coinbase"
];

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
  return `https://www.google.com/s2/favicons?domain=${institutionName.toLowerCase().replace(/\s+/g, '')}.com&sz=128`;
};

export const AccountsPage: React.FC<AccountsPageProps> = ({ onNavigate }) => {
  const { data, addAccount, updateAccount, deleteAccount } = useFinance();
  const { t } = useLanguage();
  const user = data.user;

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newAccount, setNewAccount] = useState<Partial<Account>>({ 
    name: '', 
    balance: 0, 
    institution: '', 
    type: 'savings', 
    currency: 'EUR', 
    includeInHousehold: true, 
    apy: 0 
  });
  const [customBank, setCustomBank] = useState('');

  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [editingData, setEditingData] = useState<Partial<Account>>({});

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ id: string; name: string } | null>(null);

  if (!user) return null;

  // Filter: only show accounts owned by this user
  const personalAccounts = data.accounts.filter(a => a.ownerId === user.id);
  const totalBalance = personalAccounts.reduce((sum, a) => sum + a.balance, 0);

  const handleAdd = () => {
    if (!newAccount.name || !newAccount.institution) {
      return;
    }

    const accountToAdd: Account = {
      id: crypto.randomUUID(),
      name: newAccount.name,
      balance: newAccount.balance || 0,
      institution: newAccount.institution,
      type: newAccount.type || 'savings',
      currency: newAccount.currency || 'EUR',
      ownerId: data.user!.id,
      includeInHousehold: newAccount.includeInHousehold ?? true,
      apy: newAccount.apy || 0
    };

    addAccount(accountToAdd);
    setNewAccount({ name: '', balance: 0, institution: '', type: 'savings', currency: 'EUR', includeInHousehold: true, apy: 0 });
    setCustomBank('');
    setIsAddOpen(false);
  };

  const handleEdit = () => {
    if (!editingAccount) return;
    updateAccount(editingAccount.id, editingData);
    setEditingAccount(null);
    setEditingData({});
  };

  const handleDelete = () => {
    if (!itemToDelete) return;
    deleteAccount(itemToDelete.id);
    setDeleteConfirmOpen(false);
    setItemToDelete(null);
  };

  const openEditDialog = (account: Account) => {
    setEditingAccount(account);
    setEditingData({ 
      name: account.name, 
      balance: account.balance, 
      institution: account.institution,
      type: account.type,
      apy: account.apy
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
            <h1 className="text-3xl font-bold">{t('personal.accounts')}</h1>
            <p className="text-muted-foreground">{t('personal.accountsSubtitle')}</p>
          </div>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus size={16} />
              {t('personal.addAccount')}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('personal.addPersonalAccount')}</DialogTitle>
              <DialogDescription>{t('personal.connectBankAccount')}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>{t('personal.accountName')}</Label>
                <Input
                  placeholder={t('personal.accountNamePlaceholder')}
                  value={newAccount.name}
                  onChange={(e) => setNewAccount({ ...newAccount, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>{t('personal.institution')}</Label>
                <Select
                  value={newAccount.institution}
                  onValueChange={(value) => setNewAccount({ ...newAccount, institution: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('personal.selectBank')} />
                  </SelectTrigger>
                  <SelectContent>
                    {BANKS.map(bank => (
                      <SelectItem key={bank} value={bank}>{bank}</SelectItem>
                    ))}
                    <SelectItem value="Custom">{t('personal.custom')}</SelectItem>
                  </SelectContent>
                </Select>
                {newAccount.institution === 'Custom' && (
                  <Input
                    placeholder={t('personal.enterBankName')}
                    value={customBank}
                    onChange={(e) => setCustomBank(e.target.value)}
                  />
                )}
              </div>
              <div className="space-y-2">
                <Label>{t('personal.type')}</Label>
                <Select
                  value={newAccount.type}
                  onValueChange={(value) => setNewAccount({ ...newAccount, type: value as Account['type'] })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">{t('accountType.cash')}</SelectItem>
                    <SelectItem value="savings">{t('accountType.savings')}</SelectItem>
                    <SelectItem value="investment">{t('accountType.investment')}</SelectItem>
                    <SelectItem value="crypto">{t('accountType.crypto')}</SelectItem>
                    <SelectItem value="other">{t('accountType.other')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t('personal.currentBalance')}</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={newAccount.balance || ''}
                  onChange={(e) => setNewAccount({ ...newAccount, balance: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label>{t('personal.expectedAnnualReturn')}</Label>
                <Input
                  type="number"
                  step="0.1"
                  placeholder="0"
                  value={newAccount.apy || ''}
                  onChange={(e) => setNewAccount({ ...newAccount, apy: parseFloat(e.target.value) || 0 })}
                />
                <p className="text-xs text-muted-foreground">{t('personal.usedForGoalForecasting')}</p>
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
      <PremiumCard className="border-l-4 border-l-blue-500">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/20 text-blue-600 rounded-lg">
              <Wallet size={24} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">{t('personal.totalBalance')}</p>
              <p className="text-3xl font-bold">{formatCurrency(totalBalance)}</p>
            </div>
          </div>
        </div>
      </PremiumCard>

      {/* Accounts List */}
      <div className="space-y-3">
        {personalAccounts.length === 0 && (
          <PremiumCard className="text-center py-12">
            <div className="text-muted-foreground">
              <Wallet size={48} className="mx-auto mb-4 opacity-20" />
              <p className="text-sm">{t('personal.noAccountsYet')}</p>
              <p className="text-xs mt-2">{t('personal.addFirstAccount')}</p>
            </div>
          </PremiumCard>
        )}

        {personalAccounts.map((account) => (
          <PremiumCard key={account.id} className="flex items-center justify-between hover:border-blue-500/30 transition-colors">
            <div className="flex items-center gap-3 flex-1">
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                <ImageWithFallback
                  src={getBankLogoUrl(account.institution)}
                  alt={account.institution}
                  className="w-full h-full object-cover"
                  fallback={<Building2 size={20} className="text-muted-foreground" />}
                />
              </div>
              <div className="flex-1">
                <p className="font-semibold">{account.name}</p>
                <p className="text-sm text-muted-foreground">{account.institution}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-xl font-bold">{formatCurrency(account.balance)}</p>
                <p className="text-xs text-muted-foreground">{t(`accountType.${account.type}`)}</p>
              </div>
              <Dialog
                open={editingAccount?.id === account.id}
                onOpenChange={(open) => {
                  if (!open) {
                    setEditingAccount(null);
                    setEditingData({});
                  }
                }}
              >
                <DialogTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={() => openEditDialog(account)}>
                    <Pencil size={16} />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{t('personal.editAccountBalance')}</DialogTitle>
                    <DialogDescription>{t('personal.updateBalanceFor', { name: account.name })}</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>{t('personal.accountName')}</Label>
                      <Input
                        value={editingData.name || ''}
                        onChange={(e) => setEditingData({ ...editingData, name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{t('personal.currentBalance')}</Label>
                      <Input
                        type="number"
                        value={editingData.balance || ''}
                        onChange={(e) => setEditingData({ ...editingData, balance: parseFloat(e.target.value) || 0 })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{t('personal.expectedAnnualReturn')}</Label>
                      <Input
                        type="number"
                        step="0.1"
                        value={editingData.apy || ''}
                        onChange={(e) => setEditingData({ ...editingData, apy: parseFloat(e.target.value) || 0 })}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => { setEditingAccount(null); setEditingData({}); }}>
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
                onClick={() => openDeleteDialog(account.id, account.name)}
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
        description={t('delete.description', { type: t('personal.account') })}
      />
    </div>
  );
};