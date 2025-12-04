import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './dialog';
import { Button } from './button';
import { AlertTriangle, Save, Trash2, X } from 'lucide-react';

export interface ConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'default' | 'destructive' | 'warning';
  onConfirm: () => void;
  onCancel?: () => void;
}

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'default',
  onConfirm,
  onCancel,
}) => {
  const handleCancel = () => {
    if (onCancel) onCancel();
    onOpenChange(false);
  };

  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };

  const getIcon = () => {
    switch (variant) {
      case 'destructive':
        return <Trash2 className="h-5 w-5 text-rose-600" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-amber-600" />;
      default:
        return <Save className="h-5 w-5 text-blue-600" />;
    }
  };

  const getButtonVariant = () => {
    switch (variant) {
      case 'destructive':
        return 'destructive' as const;
      case 'warning':
        return 'default' as const;
      default:
        return 'default' as const;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className={`p-2 rounded-xl ${
              variant === 'destructive' 
                ? 'bg-rose-100 dark:bg-rose-900/30'
                : variant === 'warning'
                ? 'bg-amber-100 dark:bg-amber-900/30'
                : 'bg-blue-100 dark:bg-blue-900/30'
            }`}>
              {getIcon()}
            </div>
            <DialogTitle className="text-xl">{title}</DialogTitle>
          </div>
          <DialogDescription className="text-base pt-2">
            {description}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button 
            variant="outline" 
            onClick={handleCancel}
            className="gap-2"
          >
            <X size={16} />
            {cancelLabel}
          </Button>
          <Button 
            variant={getButtonVariant()}
            onClick={handleConfirm}
            className="gap-2"
          >
            {variant === 'destructive' ? <Trash2 size={16} /> : <Save size={16} />}
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
