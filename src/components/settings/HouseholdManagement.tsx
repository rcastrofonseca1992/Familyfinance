import React, { useState } from 'react';
import { useFinance } from '../store/FinanceContext';
import { PremiumCard } from '../ui/PremiumCard';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { MoreHorizontal, UserMinus, Shield, ShieldAlert, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import { useLanguage } from '../../src/contexts/LanguageContext';

interface HouseholdManagementProps {
  onBack: () => void;
}

export const HouseholdManagement: React.FC<HouseholdManagementProps> = ({ onBack }) => {
  const { data, updateHouseholdMember, checkServerHousehold } = useFinance();
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<string | null>(null);

  const currentUser = data.user;
  const isOwner = currentUser?.role === 'owner';
  const members = data.household?.members || [];

  const handleRemoveMember = async () => {
    if (!memberToRemove) return;
    
    setIsLoading(true);
    try {
        await updateHouseholdMember(memberToRemove, { action: 'remove' });
        // Refresh data
        await checkServerHousehold();
    } catch (e) {
        // toast handled in context
    } finally {
        setIsLoading(false);
        setMemberToRemove(null);
    }
  };

  const handleChangeRole = async (memberId: string, newRole: 'owner' | 'partner') => {
    setIsLoading(true);
    try {
        await updateHouseholdMember(memberId, { role: newRole });
        await checkServerHousehold();
    } catch (e) {
        // toast handled
    } finally {
        setIsLoading(false);
    }
  };

  const getInitials = (name: string) => {
      return name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
  };

  return (
    <div className="w-full space-y-6 pb-24">
      <div className="flex items-center gap-2 mb-6">
        <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">Manage Household</h1>
      </div>

      <PremiumCard className="space-y-6 p-0 border-none shadow-none !border-0">
        <div>
            <h3 className="font-semibold text-lg mb-1">{data.household?.name || 'Household'}</h3>
            <p className="text-sm text-muted-foreground">
                Manage members and permissions.
                {isOwner ? " You have full control." : " You are a member."}
            </p>
        </div>

        <div className="rounded-md border-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((member) => (
                <TableRow key={member.id}>
                  <TableCell className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src="" />
                      <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <div className="font-medium">{member.name}</div>
                        <div className="text-xs text-muted-foreground">{member.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={member.role === 'owner' ? 'default' : 'secondary'}>
                        {member.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {(isOwner || member.id === currentUser?.id) && (
                        <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            
                            {isOwner && member.id !== currentUser?.id && (
                                <>
                                    <DropdownMenuItem onClick={() => handleChangeRole(member.id, member.role === 'owner' ? 'partner' : 'owner')}>
                                        {member.role === 'owner' ? <ShieldAlert className="mr-2 h-4 w-4" /> : <Shield className="mr-2 h-4 w-4" />}
                                        {member.role === 'owner' ? 'Demote to Partner' : 'Promote to Owner'}
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                </>
                            )}
                            
                            <DropdownMenuItem 
                                className="text-red-600"
                                onClick={() => setMemberToRemove(member.id)}
                            >
                                <UserMinus className="mr-2 h-4 w-4" />
                                {member.id === currentUser?.id ? 'Leave Household' : 'Remove Member'}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </PremiumCard>

      <AlertDialog open={!!memberToRemove} onOpenChange={(open) => !open && setMemberToRemove(null)}>
        <AlertDialogContent>
            <AlertDialogHeader>
            <AlertDialogTitle>{t('delete.title')}</AlertDialogTitle>
            <AlertDialogDescription>
                {memberToRemove === currentUser?.id 
                    ? "You are about to leave this household. You will lose access to shared data."
                    : "This will remove the user from the household. They will lose access to shared data."
                }
            </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction 
                onClick={handleRemoveMember} 
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                disabled={isLoading}
            >
                {isLoading ? "Processing..." : t('common.confirm')}
            </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
        </AlertDialog>
    </div>
  );
};