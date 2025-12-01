
import React from 'react';
import { useFinance } from '../store/FinanceContext';
import { LayoutDashboard, User, Target, Settings, LogOut } from 'lucide-react';
import { Button } from '../ui/button';
import { cn } from '../ui/utils';

interface AppShellProps {
  children: React.ReactNode;
  currentTab: string;
  onTabChange: (tab: string) => void;
  title?: string;
  subtitle?: React.ReactNode;
  headerAction?: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children, currentTab, onTabChange, title, subtitle, headerAction }) => {
  const { data, logout } = useFinance();
  
  const navItems = [
    { id: 'dashboard', label: 'Household', icon: LayoutDashboard },
    { id: 'personal', label: 'Personal', icon: User },
    { id: 'goals', label: 'Goals', icon: Target },
  ];

  const getPageTitle = () => {
    const item = navItems.find(i => i.id === currentTab);
    if (item) return item.label;
    if (currentTab === 'settings') return 'Settings';
    return 'Family Finance';
  };

  const mobileNavItems = [
    ...navItems,
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <div className="h-[100dvh] bg-background flex flex-col md:flex-row overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r border-border h-full bg-card">
        <div className="p-6 border-b border-border/50">
            <h1 className="font-bold text-xl tracking-tight text-primary">Family Finance</h1>
            <p className="text-xs text-muted-foreground mt-1">{data.household?.name}</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
            {navItems.map(item => (
                <Button
                    key={item.id}
                    variant={currentTab === item.id ? 'secondary' : 'ghost'}
                    className={cn("w-full justify-start gap-3", currentTab === item.id && "bg-primary/10 text-primary hover:bg-primary/20")}
                    onClick={() => onTabChange(item.id)}
                >
                    <item.icon size={20} />
                    {item.label}
                </Button>
            ))}
        </nav>
        
        <div className="p-4 border-t border-border/50 space-y-2">
            <Button 
                variant={currentTab === 'settings' ? 'secondary' : 'ghost'}
                className={cn("w-full justify-start gap-3 text-muted-foreground hover:text-foreground", currentTab === 'settings' && "bg-primary/10 text-primary")}
                onClick={() => onTabChange('settings')}
            >
                <Settings size={20} />
                Settings
            </Button>
            <Button variant="ghost" onClick={logout} className="w-full justify-start gap-3 text-red-500 hover:text-red-600 hover:bg-red-500/10">
                <LogOut size={20} />
                Log Out
            </Button>
        </div>
      </aside>

      {/* Content Area */}
      <main className="flex-1 relative flex flex-col h-full overflow-y-auto overflow-x-hidden overscroll-y-contain">
          {/* Universal Header */}
          {(title || subtitle || headerAction) && (
              <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b p-4 md:p-6 flex flex-row justify-between items-center gap-2 shrink-0">
                  <div className="flex-1 min-w-0">
                      {title && <h1 className="text-xl md:text-2xl font-bold tracking-tight truncate">{title}</h1>}
                      {subtitle && <div className="text-xs md:text-sm text-muted-foreground truncate">{subtitle}</div>}
                  </div>
                  {headerAction && (
                      <div className="shrink-0">
                          {headerAction}
                      </div>
                  )}
              </div>
          )}

          <div className="p-4 md:p-8 max-w-5xl mx-auto pb-24 md:pb-8 w-full flex-1">
              {children}
          </div>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-background/90 backdrop-blur-lg border-t border-border pb-[env(safe-area-inset-bottom)] z-50">
          <div className="flex justify-around p-2">
              {mobileNavItems.map(item => (
                  <button
                      key={item.id}
                      onClick={() => onTabChange(item.id)}
                      className={cn(
                          "flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-200 w-full",
                          currentTab === item.id ? "text-primary" : "text-muted-foreground hover:bg-muted/50"
                      )}
                  >
                      <div className={cn(
                          "p-1 rounded-lg mb-1 transition-all",
                          currentTab === item.id ? "bg-primary/10" : "bg-transparent"
                      )}>
                          <item.icon size={22} strokeWidth={currentTab === item.id ? 2.5 : 2} />
                      </div>
                      <span className="text-[10px] font-medium">{item.label}</span>
                  </button>
              ))}
          </div>
      </nav>
    </div>
  );
};
