
import React, { useState } from 'react';
import { PremiumCard } from '../ui/PremiumCard';
import { Switch } from '../ui/switch';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Moon, Sun, CloudOff, Database, Bell, Users, User, Download, Upload, AlertCircle, ShieldCheck, Home } from 'lucide-react';
import { useFinance } from '../store/FinanceContext';
import { toast } from 'sonner@2.0.3';

interface SettingsViewProps {
  onNavigate: (tab: string) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ onNavigate }) => {
  const { data, updateData, logout, updateHouseholdSettings, leaveHousehold } = useFinance();
  const [householdName, setHouseholdName] = useState(data.household?.name || '');
  const isOwner = data.user?.role === 'owner';

  const handleSaveHousehold = async () => {
      if (data.household && householdName) {
          try {
              await updateHouseholdSettings({ name: householdName });
          } catch (e) {
              // Toast handled in context
          }
      }
  };

  const handleExport = () => {
    try {
        const dataStr = JSON.stringify(data, null, 2);
        const blob = new Blob([dataStr], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `finance_backup_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        toast.success("Backup downloaded successfully");
    } catch (e) {
        toast.error("Failed to export data");
    }
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const parsed = JSON.parse(content);
        
        // Basic validation check
        if (!parsed.user || !Array.isArray(parsed.accounts)) {
             throw new Error("Invalid backup structure");
        }
        
        // Preserve session if needed, but here we overwrite
        updateData(parsed);
        toast.success("Data restored successfully! Please refresh if needed.");
      } catch (err) {
        console.error(err);
        toast.error("Failed to restore: Invalid backup file");
      }
    };
    reader.readAsText(file);
    // Reset input
    event.target.value = '';
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-24">
        {/* Header moved to AppShell */}
        
        <div className="space-y-6">
            {/* Household Settings */}
            <PremiumCard className="space-y-6">
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                    <Home className="h-5 w-5 text-primary" /> Household
                </h3>
                
                <div className="space-y-2">
                    <label className="text-sm font-medium">Household Name</label>
                    <div className="flex gap-2">
                        <Input 
                            value={householdName} 
                            onChange={(e) => setHouseholdName(e.target.value)} 
                            placeholder="The Smiths"
                            disabled={!isOwner}
                        />
                        {isOwner && <Button onClick={handleSaveHousehold} variant="outline">Save</Button>}
                    </div>
                    {!isOwner && <p className="text-xs text-muted-foreground">Only the owner can rename the household.</p>}
                </div>

                <div className="pt-4 border-t border-border">
                    {isOwner ? (
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="font-medium text-sm">Join Code</p>
                                <p className="text-xs text-muted-foreground">Share this with your partner</p>
                            </div>
                            <div className="bg-muted px-3 py-1 rounded-md font-mono font-bold tracking-widest">
                                {data.household?.joinCode || '----'}
                            </div>
                        </div>
                    ) : (
                        <p className="text-xs text-muted-foreground italic">
                            Only the household owner can invite new members.
                        </p>
                    )}
                </div>
            </PremiumCard>

            {/* Household Management */}
            <PremiumCard className="space-y-6">
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    {isOwner ? "Household Management" : "Household Members"}
                </h3>
                
                <div className="flex items-center justify-between">
                     <div>
                        <p className="font-medium">{isOwner ? "Manage Members" : "View Members"}</p>
                        <p className="text-xs text-muted-foreground">
                            {isOwner ? "Add, remove, or change permissions" : "View household members and roles"}
                        </p>
                    </div>
                    <Button 
                        variant="outline" 
                        onClick={() => onNavigate('household-management')}
                    >
                        {isOwner ? "Manage" : "View Members"}
                    </Button>
                </div>

                <div className="pt-4 border-t border-border flex items-center justify-between">
                     <div>
                        <p className="font-medium">Switch Household</p>
                        <p className="text-xs text-muted-foreground">
                            Leave current household to join or create another
                        </p>
                    </div>
                    <Button 
                        variant="outline" 
                        onClick={leaveHousehold}
                    >
                        Switch
                    </Button>
                </div>
            </PremiumCard>

            {/* App Settings - Appearance */}
            <PremiumCard className="space-y-6">
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                    <Sun className="h-5 w-5 text-primary" /> Appearance
                </h3>
                <div className="flex items-center justify-between w-full">
                     <span className={data.theme === 'light' ? "font-bold" : "text-muted-foreground"}>Light Mode</span>
                     <Switch 
                        checked={data.theme === 'dark'} 
                        onCheckedChange={(checked) => updateData({ theme: checked ? 'dark' : 'light' })}
                    />
                    <span className={data.theme === 'dark' ? "font-bold" : "text-muted-foreground"}>Dark Mode</span>
                </div>
            </PremiumCard>

            {/* Data Management */}
            <PremiumCard className="space-y-6">
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                    <Database className="h-5 w-5 text-primary" /> Data Management
                </h3>
                
                <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <div className="text-sm text-green-800 dark:text-green-200">
                        <p className="font-bold mb-1">Cloud Sync Active</p>
                        <p>Your data is now synchronized across your devices securely. You can still export a local backup if needed.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button variant="outline" className="h-auto py-4 justify-start" onClick={handleExport}>
                        <Download className="mr-3 h-5 w-5 text-primary" />
                        <div className="text-left">
                            <div className="font-medium">Export Backup</div>
                            <div className="text-xs text-muted-foreground">Save data as JSON file</div>
                        </div>
                    </Button>

                    <div className="relative">
                        <input 
                            type="file" 
                            id="restore-file" 
                            className="hidden" 
                            accept=".json" 
                            onChange={handleImport}
                        />
                        <Button variant="outline" className="w-full h-auto py-4 justify-start" onClick={() => document.getElementById('restore-file')?.click()}>
                            <Upload className="mr-3 h-5 w-5 text-orange-500" />
                            <div className="text-left">
                                <div className="font-medium">Restore Backup</div>
                                <div className="text-xs text-muted-foreground">Import from JSON file</div>
                            </div>
                        </Button>
                    </div>
                </div>
            </PremiumCard>

            {/* Account */}
            <PremiumCard className="space-y-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                        <User className="h-5 w-5 text-primary" /> Account
                    </h3>
                    <div className="flex items-center gap-1 text-green-600 text-xs font-medium bg-green-100 dark:bg-green-900/20 px-2 py-1 rounded-full">
                        <ShieldCheck size={12} />
                        Secured
                    </div>
                </div>
                 <div className="flex items-center justify-between">
                     <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                            {data.user?.name?.charAt(0) || 'U'}
                        </div>
                        <div>
                            <p className="font-medium text-base">{data.user?.name}</p>
                            <p className="text-xs text-muted-foreground">{data.user?.email}</p>
                            <div className="flex items-center gap-2 mt-1">
                                <p className="text-[10px] text-muted-foreground/70 font-mono">ID: {data.user?.id?.slice(0, 8)}...</p>
                                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium capitalize ${
                                    data.user?.role === 'owner' 
                                    ? 'bg-primary/10 text-primary' 
                                    : 'bg-muted text-muted-foreground'
                                }`}>
                                    {data.user?.role || 'Partner'}
                                </span>
                            </div>
                        </div>
                    </div>
                    <Button variant="destructive" size="sm" onClick={logout}>Log Out</Button>
                </div>
            </PremiumCard>

            <div className="text-center pt-4">
                <p className="text-xs text-muted-foreground">FamilyFinance v1.1.0</p>
            </div>
        </div>
    </div>
  );
};
