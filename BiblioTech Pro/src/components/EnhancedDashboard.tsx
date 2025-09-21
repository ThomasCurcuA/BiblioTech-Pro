import React from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area
} from 'recharts';
import { useLibrary } from '../lib/context';
import { useNavigation } from '../hooks/useNavigation';
import { useAutoBackup } from '../hooks/useAutoBackup';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { 
  BookOpen, Users, FileText, AlertTriangle, TrendingUp, Calendar,
  Download, Upload, Bell, Activity, Star, Clock, Target, Zap
} from 'lucide-react';
import { formatDate, isOverdue } from '../lib/storage';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100
    }
  }
};

export default function EnhancedDashboard() {
  const { state, exportData, addNotification } = useLibrary();
  const { books, users, loans } = state;
  const { navigateToSection } = useNavigation();
  const { triggerManualBackup } = useAutoBackup();

  // Funzioni per gestire le azioni
  const handleExportData = () => {
    exportData();
    addNotification({
      type: 'success',
      title: 'Esportazione Completata',
      message: 'I dati sono stati esportati con successo'
    });
  };

  const handleTestNotification = () => {
    addNotification({
      type: 'info',
      title: 'Test Notifica',
      message: 'Questa è una notifica di test per verificare il funzionamento del sistema'
    });
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'books':
        navigateToSection('books');
        addNotification({
          type: 'info',
          title: 'Navigazione',
          message: 'Sezione Gestione Libri aperta'
        });
        break;
      case 'users':
        navigateToSection('users');
        addNotification({
          type: 'info',
          title: 'Navigazione',
          message: 'Sezione Gestione Utenti aperta'
        });
        break;
      case 'loans':
        navigateToSection('loans');
        addNotification({
          type: 'info',
          title: 'Navigazione',
          message: 'Sezione Gestione Prestiti aperta'
        });
        break;
      case 'report':
        handleExportData();
        break;
    }
  };

  // Calculate statistics
  const totalBooks = books.length;
  const availableBooks = books.filter(book => book.available).length;
  const totalUsers = users.length;
  const activeLoans = loans.filter(loan => loan.status === 'active').length;
  const overdueLoans = loans.filter(loan => loan.status === 'active' && isOverdue(loan.dueDate)).length;

  // Calculate trends
  const thisMonth = new Date().getMonth();
  const thisYear = new Date().getFullYear();
  const monthlyLoans = loans.filter(loan => {
    const loanDate = new Date(loan.loanDate);
    return loanDate.getMonth() === thisMonth && loanDate.getFullYear() === thisYear;
  }).length;

  // Genre distribution
  const genreData = books.reduce((acc, book) => {
    acc[book.genre] = (acc[book.genre] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const pieData = Object.entries(genreData).map(([genre, count]) => ({
    name: genre,
    value: count
  }));

  // Funzione per generare statistiche avanzate
  const generateAdvancedStats = () => {
    const avgLoansPerUser = totalUsers > 0 ? (loans.length / totalUsers).toFixed(1) : '0';
    const mostPopularGenre = pieData.length > 0 ? pieData[0].name : 'N/A';
    const overdueRate = totalBooks > 0 ? ((overdueLoans / totalBooks) * 100).toFixed(1) : '0';
    
    return {
      avgLoansPerUser,
      mostPopularGenre,
      overdueRate
    };
  };

  const advancedStats = generateAdvancedStats();

  // Monthly loans trend (last 6 months)
  const monthlyTrend = [];
  for (let i = 5; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const monthLoans = loans.filter(loan => {
      const loanDate = new Date(loan.loanDate);
      return loanDate.getMonth() === date.getMonth() && loanDate.getFullYear() === date.getFullYear();
    }).length;
    
    monthlyTrend.push({
      month: date.toLocaleDateString('it-IT', { month: 'short' }),
      loans: monthLoans
    });
  }

  const stats = [
    {
      title: 'Libri Totali',
      value: totalBooks,
      description: `${availableBooks} disponibili`,
      icon: BookOpen,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      trend: '+12%',
      trendUp: true,
      onClick: () => navigateToSection('books')
    },
    {
      title: 'Utenti Attivi',
      value: totalUsers,
      description: 'Membri registrati',
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      trend: '+8%',
      trendUp: true,
      onClick: () => navigateToSection('users')
    },
    {
      title: 'Prestiti Attivi',
      value: activeLoans,
      description: 'In corso',
      icon: FileText,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      trend: '+15%',
      trendUp: true,
      onClick: () => navigateToSection('loans')
    },
    {
      title: 'Prestiti Scaduti',
      value: overdueLoans,
      description: 'Richiedono attenzione',
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      trend: '-5%',
      trendUp: false,
      onClick: () => navigateToSection('loans')
    },
    {
      title: 'Prestiti Mensili',
      value: monthlyLoans,
      description: 'Questo mese',
      icon: TrendingUp,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100',
      trend: '+22%',
      trendUp: true,
      onClick: () => navigateToSection('loans')
    },
    {
      title: 'Notifiche',
      value: state.notifications?.filter(n => !n.read).length || 0,
      description: 'Non lette',
      icon: Bell,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      trend: 'Nuove',
      trendUp: true,
      onClick: () => navigateToSection('notifications')
    }
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Dashboard Avanzata
          </h1>
          <p className="text-gray-400">Panoramica completa del sistema bibliotecario</p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={handleExportData}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
          >
            <Download className="h-4 w-4 mr-2" />
            Esporta Dati
          </Button>
          <Button
            onClick={handleTestNotification}
            variant="outline"
            className="border-gray-600 text-gray-300 hover:bg-gray-700"
          >
            <Bell className="h-4 w-4 mr-2" />
            Test Notifica
          </Button>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={index}
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
              className="relative overflow-hidden cursor-pointer"
              onClick={stat.onClick}
            >
              <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700 hover:border-gray-600 transition-all duration-300 hover:shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-xl ${stat.bgColor} bg-opacity-20`}>
                      <Icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                    <Badge 
                      variant={stat.trendUp ? "default" : "destructive"}
                      className="text-xs"
                    >
                      {stat.trend}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-400 mb-1">{stat.title}</p>
                    <p className="text-3xl font-bold text-white mb-1">{stat.value}</p>
                    <p className="text-xs text-gray-500">{stat.description}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Monthly Trends */}
        <motion.div variants={itemVariants}>
          <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-400" />
                Trend Prestiti Mensili
              </CardTitle>
              <CardDescription className="text-gray-400">
                Andamento degli ultimi 6 mesi
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={monthlyTrend}>
                  <defs>
                    <linearGradient id="colorLoans" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1F2937', 
                      border: '1px solid #374151',
                      borderRadius: '8px'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="loans" 
                    stroke="#3B82F6" 
                    fillOpacity={1} 
                    fill="url(#colorLoans)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Genre Distribution */}
        <motion.div variants={itemVariants}>
          <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Target className="h-5 w-5 text-green-400" />
                Distribuzione Generi
              </CardTitle>
              <CardDescription className="text-gray-400">
                Composizione della collezione
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1F2937', 
                      border: '1px solid #374151',
                      borderRadius: '8px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Activity */}
        <motion.div variants={itemVariants}>
          <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Activity className="h-5 w-5 text-purple-400" />
                Attività Recente
              </CardTitle>
              <CardDescription className="text-gray-400">
                Ultime operazioni del sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-80 overflow-y-auto">
                {loans.slice(0, 10).map((loan, index) => {
                  const book = books.find(b => b.id === loan.bookId);
                  const user = users.find(u => u.id === loan.userId);
                  
                  return (
                    <motion.div
                      key={loan.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center gap-3 p-3 bg-gray-700/50 rounded-lg"
                    >
                      <div className={`w-2 h-2 rounded-full ${
                        loan.status === 'active' ? 'bg-green-400' :
                        loan.status === 'returned' ? 'bg-blue-400' :
                        'bg-red-400'
                      }`} />
                      <div className="flex-1">
                        <p className="text-white text-sm font-medium">
                          {loan.status === 'active' ? 'Prestito attivo' : 
                           loan.status === 'returned' ? 'Libro restituito' : 'Prestito scaduto'}: {book?.title}
                        </p>
                        <p className="text-gray-400 text-xs">
                          {user?.name} {user?.surname} • {formatDate(loan.loanDate)}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {loan.status}
                      </Badge>
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Stats */}
        <motion.div variants={itemVariants}>
          <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-400" />
                Statistiche Rapide
              </CardTitle>
              <CardDescription className="text-gray-400">
                Dati chiave del sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-gray-700/50 rounded-lg">
                  <span className="text-gray-300">Libri disponibili</span>
                  <Badge variant="secondary" className="bg-green-600/20 text-green-400">
                    {availableBooks}
                  </Badge>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-700/50 rounded-lg">
                  <span className="text-gray-300">Prestiti attivi</span>
                  <Badge variant="secondary" className="bg-blue-600/20 text-blue-400">
                    {activeLoans}
                  </Badge>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-700/50 rounded-lg">
                  <span className="text-gray-300">Prestiti scaduti</span>
                  <Badge variant="secondary" className="bg-red-600/20 text-red-400">
                    {overdueLoans}
                  </Badge>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-700/50 rounded-lg">
                  <span className="text-gray-300">Tasso utilizzo</span>
                  <Badge variant="secondary" className="bg-purple-600/20 text-purple-400">
                    {totalBooks > 0 ? Math.round((activeLoans / totalBooks) * 100) : 0}%
                  </Badge>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-700/50 rounded-lg">
                  <span className="text-gray-300">Media prestiti/utente</span>
                  <Badge variant="secondary" className="bg-indigo-600/20 text-indigo-400">
                    {advancedStats.avgLoansPerUser}
                  </Badge>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-700/50 rounded-lg">
                  <span className="text-gray-300">Genere più popolare</span>
                  <Badge variant="secondary" className="bg-orange-600/20 text-orange-400">
                    {advancedStats.mostPopularGenre}
                  </Badge>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-700/50 rounded-lg">
                  <span className="text-gray-300">Tasso ritardi</span>
                  <Badge variant="secondary" className="bg-red-600/20 text-red-400">
                    {advancedStats.overdueRate}%
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div variants={itemVariants}>
        <Card className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 border-blue-700/50">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-400" />
              Azioni Rapide
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button 
                onClick={() => handleQuickAction('books')}
                className="bg-blue-600 hover:bg-blue-700 h-16 flex-col"
              >
                <BookOpen className="h-6 w-6 mb-1" />
                <span className="text-xs">Gestione Libri</span>
              </Button>
              <Button 
                onClick={() => handleQuickAction('users')}
                className="bg-green-600 hover:bg-green-700 h-16 flex-col"
              >
                <Users className="h-6 w-6 mb-1" />
                <span className="text-xs">Gestione Utenti</span>
              </Button>
              <Button 
                onClick={() => handleQuickAction('loans')}
                className="bg-purple-600 hover:bg-purple-700 h-16 flex-col"
              >
                <FileText className="h-6 w-6 mb-1" />
                <span className="text-xs">Gestione Prestiti</span>
              </Button>
              <Button 
                onClick={() => handleQuickAction('report')}
                className="bg-orange-600 hover:bg-orange-700 h-16 flex-col"
              >
                <Download className="h-6 w-6 mb-1" />
                <span className="text-xs">Esporta Dati</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
