import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Users, ArrowRight, Home, LogOut, ArrowUpRight } from 'lucide-react';
import { motion } from 'motion/react';
import { PremiumCard } from '../ui/PremiumCard';
import { useFinance, Household } from '../store/FinanceContext';
import { toast } from 'sonner@2.0.3';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { useLanguage } from '../../src/contexts/LanguageContext';

export const HouseholdSetup: React.FC = () => {
  const { createHousehold, joinHousehold, logout, data, checkServerHousehold, enterHousehold } = useFinance();
  const { t } = useLanguage();
  const [mode, setMode] = useState<'choose' | 'create' | 'join'>('choose');
  const [name, setName] = useState('My Family');
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingHousehold, setIsCheckingHousehold] = useState(true);
  const [foundHousehold, setFoundHousehold] = useState<Household | null>(null);

  React.useEffect(() => {
      const checkForHousehold = async () => {
          if (!data.user) {
              setIsCheckingHousehold(false);
              return;
          }

          setIsCheckingHousehold(true);
          const result = await checkServerHousehold();
          if (result.found && result.household) {
              setFoundHousehold(result.household);
          }
          setIsCheckingHousehold(false);
      };
      checkForHousehold();
  }, [data.user]);

  const handleEnterFoundHousehold = async () => {
      if (foundHousehold) {
          setIsLoading(true);
          try {
              await enterHousehold(foundHousehold);
              toast.success(`Welcome back to ${foundHousehold.name}!`);
          } catch (error) {
              console.error("Error entering household:", error);
              toast.error("Failed to enter household. Please try again.");
          } finally {
              setIsLoading(false);
          }
      }
  };

  const handleCreate = async () => {
      if (!name.trim()) {
          toast.error("Please enter a household name");
          return;
      }
      setIsLoading(true);
      try {
          await createHousehold(name);
          toast.success("Household created successfully!");
      } catch (error) {
          console.error("Create household error:", error);
          toast.error("Failed to create household. Please try again.");
      } finally {
          setIsLoading(false);
      }
  };

  const handleJoin = async () => {
      if (!code.trim()) {
          toast.error("Please enter an invite code");
          return;
      }
      setIsLoading(true);
      try {
          await joinHousehold(code);
          toast.success("Joined household successfully!");
      } catch (error: any) {
          console.error("Join household error:", error);
          // Extract error message if available
          const message = error.message || "Failed to join household";
          toast.error(message === "Invalid join code" ? "Invalid invite code. Please check and try again." : message);
      } finally {
          setIsLoading(false);
      }
  };

  const UserProfileHeader = () => (
    <div className="absolute top-4 right-4 flex items-center gap-3 z-10">
        <div className="flex items-center gap-2 bg-background/50 backdrop-blur-sm p-2 rounded-full border pr-4 shadow-sm">
            <Avatar className="h-8 w-8 border border-background">
                <AvatarImage src="" />
                <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                    {data.user?.name?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium text-muted-foreground">
                {data.user?.name || 'User'}
            </span>
        </div>
        <Button 
            variant="ghost" 
            size="icon"
            className="text-muted-foreground hover:text-destructive transition-colors"
            onClick={() => logout()}
            title="Logout"
        >
            <LogOut className="h-4 w-4" />
        </Button>
    </div>
  );

  if (mode === 'choose') {
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-background relative" style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}>
            <UserProfileHeader />
            <motion.div  
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-2xl"
            >
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold tracking-tight mb-[16px] mt-[80px] mr-[0px] ml-[0px]">{t('household.welcomeTitle')}</h1>
                    <p className="text-xl text-muted-foreground">{t('household.chooseOption')}</p>
                </div>

                {isCheckingHousehold && (
                    <PremiumCard
                        className="mb-8 p-8"
                        glow
                        aria-busy="true"
                    >
                        <div className="flex items-center gap-4">
                            <div className="relative h-12 w-12 rounded-xl bg-muted overflow-hidden">
                                <span className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-white/40 to-transparent" />
                            </div>
                            <div className="flex-1 space-y-3">
                                <div className="relative h-3 w-1/3 rounded-full bg-muted overflow-hidden">
                                    <span className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-white/40 to-transparent" />
                                </div>
                                <div className="relative h-3 w-2/3 rounded-full bg-muted overflow-hidden">
                                    <span className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-white/40 to-transparent" />
                                </div>
                            </div>
                            <div className="relative h-10 w-28 rounded-full bg-muted overflow-hidden">
                                <span className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-white/40 to-transparent" />
                            </div>
                        </div>
                    </PremiumCard>
                )}

                {foundHousehold && !isCheckingHousehold && (
                    <motion.div 
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-8"
                    >
                        <PremiumCard 
                            className="p-8 border-primary/50 bg-primary/5 cursor-pointer hover:border-primary transition-colors group"
                            onClick={handleEnterFoundHousehold}
                            glow
                        >
                            <div className="h-12 w-12 bg-primary/20 rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary/30 transition-colors">
                                <Home className="h-6 w-6 text-primary" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">{t('household.householdFound') || 'Household Found'}</h3>
                            <p className="text-muted-foreground mb-6">{t('household.alreadyMember') || 'You are already a member of'} <span className="font-medium text-foreground">{foundHousehold.name}</span></p>
                            <Button 
                                onClick={(e) => {
                                    e.preventDefault();
                                    handleEnterFoundHousehold();
                                }} 
                                className="w-full group-hover:bg-primary group-hover:text-primary-foreground" 
                                size="lg" 
                                disabled={isLoading}
                            >
                                {isLoading ? t('common.loading') || "Loading..." : t('household.enterDashboard') || "Enter Dashboard"} <ArrowUpRight className="ml-2 h-4 w-4" />
                            </Button>
                        </PremiumCard>
                    </motion.div>
                )}

                <div className="grid md:grid-cols-2 gap-6">
                    <PremiumCard 
                        className="p-8 cursor-pointer hover:border-primary transition-colors group"
                        onClick={() => setMode('create')}
                        glow
                    >
                        <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                            <Home className="h-6 w-6 text-primary" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">{t('household.createHousehold')}</h3>
                        <p className="text-muted-foreground mb-6">{t('household.createNew')}</p>
                        <Button 
                            variant="outline" 
                            className="w-full group-hover:bg-primary group-hover:text-primary-foreground"
                            onClick={(e) => {
                                e.preventDefault();
                                setMode('create');
                            }}
                        >
                            {t('household.createButton')}
                        </Button>
                    </PremiumCard>

                    <PremiumCard 
                        className="p-8 cursor-pointer hover:border-primary transition-colors group"
                        onClick={() => setMode('join')}
                        glass
                    >
                        <div className="h-12 w-12 bg-blue-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-blue-500/20 transition-colors">
                            <Users className="h-6 w-6 text-blue-500" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">{t('household.joinHousehold')}</h3>
                        <p className="text-muted-foreground mb-6">{t('household.joinExisting')}</p>
                        <Button 
                            variant="outline" 
                            className="w-full group-hover:bg-blue-500 group-hover:text-white"
                            onClick={(e) => {
                                e.preventDefault();
                                setMode('join');
                            }}
                        >
                            {t('household.joinButton')}
                        </Button>
                    </PremiumCard>
                </div>
            </motion.div>
        </div>
      );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background relative" style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <UserProfileHeader />
      <motion.div  
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="w-full max-w-md"
      >
        <Button variant="ghost" onClick={() => setMode('choose')} className="mb-4 pl-0 hover:pl-2 transition-all">
            ← {t('common.back')}
        </Button>
        
        <PremiumCard glow className="p-8 space-y-6">
            <div>
                <h2 className="text-2xl font-bold mb-2">
                    {mode === 'create' ? t('household.nameYourHousehold') || 'Name your household' : t('household.enterInviteCode') || 'Enter Invite Code'}
                </h2>
                <p className="text-muted-foreground">
                    {mode === 'create' ? t('household.giveSharedSpaceName') || 'Give your shared space a name.' : t('household.askPartnerForCode') || 'Ask your partner for their unique join code.'}
                </p>
            </div>

            {mode === 'create' ? (
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label>{t('household.householdName')}</Label>
                        <Input value={name} onChange={e => setName(e.target.value)} placeholder={t('household.householdNamePlaceholder')} />
                    </div>
                    <Button onClick={handleCreate} className="w-full" size="lg" disabled={isLoading}>
                        {isLoading ? t('common.loading') || "Creating..." : t('household.createAndContinue') || "Create & Continue"} <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label>{t('household.inviteCode') || 'Invite Code'}</Label>
                        <Input value={code} onChange={e => setCode(e.target.value)} placeholder={t('household.joinCodePlaceholder')} className="uppercase tracking-widest font-mono" />
                    </div>
                    <Button onClick={handleJoin} className="w-full" size="lg" disabled={isLoading}>
                        {isLoading ? t('common.loading') || "Joining..." : t('household.joinHouseholdButton') || "Join Household"} <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            )}
        </PremiumCard>
      </motion.div>
    </div>
  );
};