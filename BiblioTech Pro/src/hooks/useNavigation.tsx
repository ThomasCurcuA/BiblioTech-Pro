import { createContext, useContext } from 'react';

type ActiveSection = 'dashboard' | 'books' | 'users' | 'loans' | 'notifications' | 'settings';

interface NavigationContextType {
  activeSection: ActiveSection;
  setActiveSection: (section: ActiveSection) => void;
  navigateToSection: (section: ActiveSection) => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
}

export { NavigationContext };
export type { ActiveSection };
