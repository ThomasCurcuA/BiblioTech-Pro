import React from 'react';
import { Book, Users, Calendar, AlertCircle, TrendingUp, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { useLibrary } from '../lib/context';
import { formatDate, isOverdue } from '../lib/storage';

const Dashboard: React.FC = () => {
  const { state } = useLibrary();

  // Calcoli statistiche
  const totalBooks = state.books.length;
  const availableBooks = state.books.filter(book => book.available).length;
  const totalUsers = state.users.length;
  const activeLoans = state.loans.filter(loan => loan.status === 'active').length;
  const overdueLoans = state.loans.filter(loan => 
    loan.status === 'active' && isOverdue(loan.dueDate)
  ).length;

  // Libri più richiesti (simulazione basata sui prestiti)
  const bookLoanCounts = state.loans.reduce((acc, loan) => {
    acc[loan.bookId] = (acc[loan.bookId] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const popularBooks = state.books
    .map(book => ({
      ...book,
      loanCount: bookLoanCounts[book.id] || 0
    }))
    .sort((a, b) => b.loanCount - a.loanCount)
    .slice(0, 5);

  // Prestiti recenti
  const recentLoans = state.loans
    .sort((a, b) => new Date(b.loanDate).getTime() - new Date(a.loanDate).getTime())
    .slice(0, 5);

  const statCards = [
    {
      title: 'Libri Totali',
      value: totalBooks,
      icon: Book,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      description: `${availableBooks} disponibili`
    },
    {
      title: 'Utenti Registrati',
      value: totalUsers,
      icon: Users,
      color: 'text-green-400',
      bgColor: 'bg-green-500/10',
      description: 'Membri attivi'
    },
    {
      title: 'Prestiti Attivi',
      value: activeLoans,
      icon: Calendar,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
      description: 'In corso'
    },
    {
      title: 'Prestiti Scaduti',
      value: overdueLoans,
      icon: AlertCircle,
      color: 'text-red-400',
      bgColor: 'bg-red-500/10',
      description: 'Richiedono attenzione'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Cards Statistiche */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm hover:bg-slate-800/70 transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm font-medium">{stat.title}</p>
                    <p className="text-2xl font-bold text-slate-200 mt-1">{stat.value}</p>
                    <p className="text-slate-500 text-xs mt-1">{stat.description}</p>
                  </div>
                  <div className={`w-12 h-12 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Libri Popolari */}
        <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-slate-200 flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-green-400" />
              <span>Libri Più Richiesti</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {popularBooks.length > 0 ? (
                popularBooks.map((book, index) => (
                  <div key={book.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-700/30 hover:bg-slate-700/50 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-slate-200">{book.title}</p>
                        <p className="text-sm text-slate-400">{book.author}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary" className="bg-slate-600 text-slate-200">
                        {book.loanCount} prestiti
                      </Badge>
                      <Badge variant={book.available ? "default" : "destructive"}>
                        {book.available ? "Disponibile" : "In prestito"}
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Book className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-400">Nessun dato sui prestiti</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Prestiti Recenti */}
        <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-slate-200 flex items-center space-x-2">
              <Clock className="w-5 h-5 text-orange-400" />
              <span>Prestiti Recenti</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentLoans.length > 0 ? (
                recentLoans.map((loan) => {
                  const book = state.books.find(b => b.id === loan.bookId);
                  const user = state.users.find(u => u.id === loan.userId);
                  const isLoanOverdue = loan.status === 'active' && isOverdue(loan.dueDate);
                  
                  return (
                    <div key={loan.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-700/30 hover:bg-slate-700/50 transition-colors">
                      <div>
                        <p className="font-medium text-slate-200">
                          {book ? book.title : 'Libro non trovato'}
                        </p>
                        <p className="text-sm text-slate-400">
                          {user ? `${user.name} ${user.surname}` : 'Utente non trovato'}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          Prestito: {formatDate(loan.loanDate)} • Scadenza: {formatDate(loan.dueDate)}
                        </p>
                      </div>
                      <div className="flex flex-col items-end space-y-1">
                        <Badge variant={
                          loan.status === 'returned' ? "default" : 
                          isLoanOverdue ? "destructive" : "secondary"
                        }>
                          {loan.status === 'returned' ? 'Restituito' : 
                           isLoanOverdue ? 'Scaduto' : 'Attivo'}
                        </Badge>
                        {isLoanOverdue && (
                          <div className="flex items-center space-x-1 text-red-400">
                            <AlertCircle className="w-3 h-3" />
                            <span className="text-xs">Attenzione</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-400">Nessun prestito registrato</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alert per prestiti scaduti */}
      {overdueLoans > 0 && (
        <Card className="bg-red-900/20 border-red-700/50 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0" />
              <div>
                <p className="font-medium text-red-200">
                  Attenzione: {overdueLoans} prestito{overdueLoans > 1 ? 'i' : ''} scadut{overdueLoans > 1 ? 'i' : 'o'}
                </p>
                <p className="text-sm text-red-300">
                  Alcuni libri sono in ritardo nella restituzione. Controlla la sezione prestiti per maggiori dettagli.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Messaggio di benvenuto se non ci sono dati */}
      {totalBooks === 0 && totalUsers === 0 && (
        <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Book className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-slate-200 mb-2">
              Benvenuto nel Sistema Biblioteca!
            </h3>
            <p className="text-slate-400 mb-6">
              Inizia aggiungendo libri e registrando utenti per gestire la tua biblioteca.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Badge variant="outline" className="border-blue-400 text-blue-400">
                📚 Aggiungi Libri
              </Badge>
              <Badge variant="outline" className="border-green-400 text-green-400">
                👥 Registra Utenti
              </Badge>
              <Badge variant="outline" className="border-purple-400 text-purple-400">
                📅 Gestisci Prestiti
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Dashboard;
