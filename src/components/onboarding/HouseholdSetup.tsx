
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

export const HouseholdSetup: React.FC = () => {
  const { createHousehold, joinHousehold, logout, data, checkServerHousehold, updateData } = useFinance();
  const [mode, setMode] = useState<'choose' | 'create' | 'join'>('choose');
  const [name, setName] = useState('My Family');
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [foundHousehold, setFoundHousehold] = useState<Household | null>(null);

  React.useEffect(() => {
      const checkForHousehold = async () => {
          if (data.user) {
              const result = await checkServerHousehold();
              if (result.found && result.household) {
                  setFoundHousehold(result.household);
              }
          }
      };
      checkForHousehold();
  }, [data.user]);

  const handleEnterFoundHousehold = () => {
      if (foundHousehold) {
          updateData({ household: foundHousehold });
          toast.success(`Welcome back to ${foundHousehold.name}!`);
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
        <div className="min-h-screen flex items-center justify-center p-4 bg-background relative">
            <UserProfileHeader />
            <motion.div  
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-2xl"
            >
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold tracking-tight mb-4">Welcome to Family Finance</h1>
                    <p className="text-xl text-muted-foreground">Are you setting up a new household or joining an existing one?</p>
                </div>

                {foundHousehold && (
                    <motion.div 
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-8"
                    >
                        <PremiumCard 
                            className="p-6 border-primary/50 bg-primary/5"
                            glow
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 bg-primary/20 rounded-xl flex items-center justify-center">
                                        <Home className="h-6 w-6 text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold">Household Found</h3>
                                        <p className="text-muted-foreground">You are already a member of <span className="font-medium text-foreground">{foundHousehold.name}</span></p>
                                    </div>
                                </div>
                                <Button onClick={handleEnterFoundHousehold} size="lg">
                                    Enter Dashboard <ArrowUpRight className="ml-2 h-4 w-4" />
                                </Button>
                            </div>
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
                        <h3 className="text-xl font-bold mb-2">Create Household</h3>
                        <p className="text-muted-foreground mb-6">Start fresh. Invite your partner later with a unique code.</p>
                        <Button variant="outline" className="w-full group-hover:bg-primary group-hover:text-primary-foreground">
                            Get Started
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
                        <h3 className="text-xl font-bold mb-2">Join Household</h3>
                        <p className="text-muted-foreground mb-6">Enter the invite code shared by your partner to sync up.</p>
                        <Button variant="outline" className="w-full group-hover:bg-blue-500 group-hover:text-white">
                            Enter Code
                        </Button>
                    </PremiumCard>
                </div>
            </motion.div>
        </div>
      );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background relative">
      <UserProfileHeader />
      <motion.div  
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="w-full max-w-md"
      >
        <Button variant="ghost" onClick={() => setMode('choose')} className="mb-4 pl-0 hover:pl-2 transition-all">
            ← Back
        </Button>
        
        <PremiumCard glow className="p-8 space-y-6">
            <div>
                <h2 className="text-2xl font-bold mb-2">
                    {mode === 'create' ? 'Name your household' : 'Enter Invite Code'}
                </h2>
                <p className="text-muted-foreground">
                    {mode === 'create' ? 'Give your shared space a name.' : 'Ask your partner for their unique join code.'}
                </p>
            </div>

            {mode === 'create' ? (
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label>Household Name</Label>
                        <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. The Smiths" />
                    </div>
                    <Button onClick={handleCreate} className="w-full" size="lg" disabled={isLoading}>
                        {isLoading ? "Creating..." : "Create & Continue"} <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label>Invite Code</Label>
                        <Input value={code} onChange={e => setCode(e.target.value)} placeholder="e.g. RM2025" className="uppercase tracking-widest font-mono" />
                    </div>
                    <Button onClick={handleJoin} className="w-full" size="lg" disabled={isLoading}>
                        {isLoading ? "Joining..." : "Join Household"} <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            )}
        </PremiumCard>
      </motion.div>
    </div>
  );
};
