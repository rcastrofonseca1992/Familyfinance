
import React from 'react';
import { Home, PieChart, Calculator, Target, Settings, PlusCircle } from 'lucide-react';
import { cn } from '../ui/utils';

export type ViewType = 'dashboard' | 'feasibility' | 'accounts' | 'goals' | 'settings';

interface NavigationProps {
  currentView: ViewType;
  onChangeView: (view: ViewType) => void;
}

const NAV_ITEMS: { id: ViewType; label: string; icon: React.ElementType }[] = [
  { id: 'dashboard', label: 'Home', icon: Home },
  { id: 'feasibility', label: 'Buy Home', icon: Calculator },
  { id: 'accounts', label: 'Accounts', icon: PieChart },
  { id: 'goals', label: 'Goals', icon: Target },
  { id: 'settings', label: 'Settings', icon: Settings },
];


export const MobileTopBar: React.FC = () => {
  return (
    <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border h-14 px-4 flex items-center justify-between">
        <span className="font-bold text-lg tracking-tight">Figma Make</span>
        <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[10px] uppercase font-medium text-muted-foreground tracking-wider">Online</span>
        </div>
    </div>
  );
};

export const MobileBottomBar: React.FC<NavigationProps> = ({ currentView, onChangeView }) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-t border-border h-[88px] pb-6 px-4 flex justify-between items-center md:hidden transition-all duration-300">
      {NAV_ITEMS.map((item) => (
        <button
          key={item.id}
          onClick={() => onChangeView(item.id)}
          className={cn(
            "flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-300 active:scale-95",
            currentView === item.id 
              ? "text-primary" 
              : "text-muted-foreground hover:text-primary/80"
          )}
        >
          <item.icon 
            size={24} 
            strokeWidth={currentView === item.id ? 2.5 : 2} 
            className={cn(
              "transition-all duration-300",
              currentView === item.id && "drop-shadow-lg"
            )}
          />
          <span className="text-[10px] font-medium">{item.label}</span>
        </button>
      ))}
    </div>
  );
};

export const Sidebar: React.FC<NavigationProps> = ({ currentView, onChangeView }) => {
  return (
    <div className="hidden md:flex flex-col fixed top-0 left-0 h-full w-[260px] bg-background border-r border-border p-6 z-40">
      <div className="mb-10 px-2">
        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
          Figma Make
        </h1>
        <p className="text-xs text-muted-foreground tracking-widest uppercase mt-1">Finance OS</p>
      </div>
      
      <div className="flex flex-col gap-2 space-y-1">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => onChangeView(item.id)}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
              currentView === item.id 
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <item.icon 
              size={20} 
              strokeWidth={currentView === item.id ? 2.5 : 2}
              className="group-hover:scale-110 transition-transform" 
            />
            <span className="font-medium">{item.label}</span>
            {currentView === item.id && (
              <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-foreground/50" />
            )}
          </button>
        ))}
      </div>

      <div className="mt-auto">
        <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white relative overflow-hidden">
            <div className="relative z-10">
                <p className="text-xs font-medium text-white/60 mb-1">Total Net Worth</p>
                <p className="text-xl font-bold">€135,200</p>
            </div>
            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-primary/30 rounded-full blur-2xl" />
        </div>
      </div>
    </div>
  );
};
