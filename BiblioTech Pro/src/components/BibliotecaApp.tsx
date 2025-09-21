import React, { useState, createContext, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Users, FileText, Bell, Settings, 
  ArrowLeft, Menu, X, BarChart3, Download, Upload,
  Search, Filter, Zap, Star, TrendingUp } from 'lucide-react';
import EnhancedDashboard from './EnhancedDashboard';
import BooksManager from './BooksManager';
import UsersManager from './UsersManager';
import LoansManager from './LoansManager';
import NotificationSystem from './NotificationSystem';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { useLibrary } from '../lib/context';
import { NavigationContext } from '../hooks/useNavigation';

type ActiveSection = 'dashboard' | 'books' | 'users' | 'loans' | 'notifications' | 'settings';

const sidebarVariants = {
  open: {
    x: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15
    }
  },
  closed: {
    x: -300,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15
    }
  }
};

const contentVariants = {
  hidden: { opacity: 0, x: 20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15
    }
  },
  exit: {
    opacity: 0,
    x: -20,
    transition: {
      duration: 0.2
    }
  }
};

function BibliotecaAppContent() {
  const [activeSection, setActiveSection] = useState<ActiveSection>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { state } = useLibrary();

  const navigateToSection = (section: ActiveSection) => {
    setActiveSection(section);
  };

  const navigationContextValue = {
    activeSection,
    setActiveSection,
    navigateToSection
  };

  const menuItems = [
    {
      id: 'dashboard' as ActiveSection,
      label: 'Dashboard',
      icon: BarChart3,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/20',
      description: 'Panoramica generale'
    },
    {
      id: 'books' as ActiveSection,
      label: 'Gestione Libri',
      icon: BookOpen,
      color: 'text-green-400',
      bgColor: 'bg-green-500/20',
      description: 'Catalogo e inventario'
    },
    {
      id: 'users' as ActiveSection,
      label: 'Gestione Utenti',
      icon: Users,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/20',
      description: 'Membri biblioteca'
    },
    {
      id: 'loans' as ActiveSection,
      label: 'Gestione Prestiti',
      icon: FileText,
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/20',
      description: 'Prestiti e restituzioni'
    },
    {
      id: 'notifications' as ActiveSection,
      label: 'Notifiche',
      icon: Bell,
      color: 'text-red-400',
      bgColor: 'bg-red-500/20',
      description: 'Centro messaggi'
    },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <EnhancedDashboard />;
      case 'books':
        return <BooksManager />;
      case 'users':
        return <UsersManager />;
      case 'loans':
        return <LoansManager />;
      case 'notifications':
        return <NotificationSystem />;
      default:
        return <EnhancedDashboard />;
    }
  };

  const getCurrentSectionInfo = () => {
    return menuItems.find(item => item.id === activeSection) || menuItems[0];
  };

  const currentSection = getCurrentSectionInfo();

  return (
    <NavigationContext.Provider value={navigationContextValue}>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-green-500/5 rounded-full blur-3xl"></div>
      </div>

      {/* Sidebar */}
      <AnimatePresence>
        <motion.div
          variants={sidebarVariants}
          initial="open"
          animate={sidebarOpen ? "open" : "closed"}
          className="fixed left-0 top-0 h-full w-80 bg-gray-800/95 backdrop-blur-xl border-r border-gray-700/50 z-50 shadow-2xl"
        >
          <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    BiblioTech Pro
                  </h1>
                  <p className="text-xs text-gray-400">Sistema Avanzato</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(false)}
                className="text-gray-400 hover:text-white lg:hidden"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Navigation */}
            <nav className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeSection === item.id;
                
                return (
                  <motion.button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all duration-300 group ${
                      isActive
                        ? `${item.bgColor} ${item.color} shadow-lg`
                        : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className={`p-2 rounded-lg ${isActive ? 'bg-white/20' : 'bg-gray-700/50 group-hover:bg-gray-600/50'}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium">{item.label}</p>
                      <p className="text-xs opacity-70">{item.description}</p>
                    </div>
                    {isActive && (
                      <motion.div
                        layoutId="activeIndicator"
                        className="w-2 h-2 bg-current rounded-full ml-auto"
                      />
                    )}
                  </motion.button>
                );
              })}
            </nav>

            {/* Quick Actions */}
            <div className="mt-8 p-4 bg-gradient-to-r from-gray-700/50 to-gray-600/50 rounded-xl border border-gray-600/50">
              <h3 className="text-sm font-semibold text-gray-300 mb-3">Azioni Rapide</h3>
              <div className="space-y-2">
                <Button 
                  size="sm" 
                  className="w-full justify-start bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border-blue-500/30"
                  onClick={() => navigateToSection('dashboard')}
                >
                  <Zap className="h-4 w-4 mr-2" />
                  Dashboard
                </Button>
                <Button 
                  size="sm" 
                  className="w-full justify-start bg-green-600/20 hover:bg-green-600/30 text-green-300 border-green-500/30"
                  onClick={() => navigateToSection('notifications')}
                >
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Notifiche
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Main Content */}
      <div className={`transition-all duration-300 ${sidebarOpen ? 'ml-80' : 'ml-0'}`}>
        {/* Top Bar */}
        <div className="sticky top-0 z-40 bg-gray-800/95 backdrop-blur-xl border-b border-gray-700/50 shadow-lg">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-4">
              {!sidebarOpen && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSidebarOpen(true)}
                  className="text-gray-400 hover:text-white"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              )}
              
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${currentSection.bgColor}`}>
                  <currentSection.icon className={`h-5 w-5 ${currentSection.color}`} />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">{currentSection.label}</h2>
                  <p className="text-sm text-gray-400">{currentSection.description}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Badge variant="outline" className="text-green-400 border-green-500/50">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                Sistema Attivo
              </Badge>
              
              <div className="text-right">
                <p className="text-sm font-medium text-white">
                  {new Date().toLocaleDateString('it-IT', { 
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
                <p className="text-xs text-gray-400">
                  {new Date().toLocaleTimeString('it-IT')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              variants={contentVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
        />
      )}
      </div>
    </NavigationContext.Provider>
  );
}

export default function BibliotecaApp() {
  return <BibliotecaAppContent />;
}