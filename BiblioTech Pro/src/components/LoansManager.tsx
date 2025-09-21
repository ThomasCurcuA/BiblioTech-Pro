import React, { useState } from 'react';
import { Calendar, Plus, Search, BookOpen, User, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useLibrary } from '../lib/context';
import { Loan as LoanType } from '../lib/storage';
import { formatDate, isOverdue } from '../lib/storage';

const LoansManager: React.FC = () => {
  const { state, addLoan, updateLoan, updateBook } = useLibrary();
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    bookId: '',
    userId: '',
    loanDate: new Date().toISOString().split('T')[0],
    dueDate: ''
  });

  // Calcola la data di scadenza (30 giorni dalla data del prestito)
  const calculateDueDate = (loanDate: string) => {
    const date = new Date(loanDate);
    date.setDate(date.getDate() + 30);
    return date.toISOString().split('T')[0];
  };

  const filteredLoans = state.loans.filter(loan => {
    const book = state.books.find(b => b.id === loan.bookId);
    const user = state.users.find(u => u.id === loan.userId);
    const searchLower = searchTerm.toLowerCase();
    
    return (
      book?.title.toLowerCase().includes(searchLower) ||
      book?.author.toLowerCase().includes(searchLower) ||
      user?.name.toLowerCase().includes(searchLower) ||
      user?.surname.toLowerCase().includes(searchLower) ||
      user?.cardNumber.toLowerCase().includes(searchLower)
    );
  });

  const availableBooks = state.books.filter(book => book.available);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const dueDate = formData.dueDate || calculateDueDate(formData.loanDate);
    
    addLoan({
      bookId: formData.bookId,
      userId: formData.userId,
      loanDate: formData.loanDate,
      dueDate,
      status: 'active'
    });
    
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      bookId: '',
      userId: '',
      loanDate: new Date().toISOString().split('T')[0],
      dueDate: ''
    });
    setIsDialogOpen(false);
  };

  const handleReturn = (loan: LoanType) => {
    // Aggiorna il prestito come restituito
    updateLoan({
      ...loan,
      returnDate: new Date().toISOString().split('T')[0],
      status: 'returned'
    });
    
    // Rendi il libro disponibile
    const book = state.books.find(b => b.id === loan.bookId);
    if (book) {
      updateBook({ ...book, available: true });
    }
  };

  const getStatusBadge = (loan: LoanType) => {
    if (loan.status === 'returned') {
      return <Badge variant="default" className="bg-green-600">Restituito</Badge>;
    }
    if (isOverdue(loan.dueDate)) {
      return <Badge variant="destructive">Scaduto</Badge>;
    }
    return <Badge variant="secondary">Attivo</Badge>;
  };

  // Calcola statistiche prestiti
  const totalLoans = state.loans.length;
  const activeLoansCount = state.loans.filter(loan => loan.status === 'active').length;
  const overdueLoansCount = state.loans.filter(loan => loan.status === 'active' && isOverdue(loan.dueDate)).length;

  return (
    <div className="space-y-6">
      {/* Statistiche prestiti */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-orange-900/50 to-orange-800/50 border-orange-700/50">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-400 mb-1">{totalLoans}</div>
            <div className="text-sm text-orange-300">Prestiti Totali</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-900/50 to-blue-800/50 border-blue-700/50">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-400 mb-1">{activeLoansCount}</div>
            <div className="text-sm text-blue-300">Prestiti Attivi</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-red-900/50 to-red-800/50 border-red-700/50">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-400 mb-1">{overdueLoansCount}</div>
            <div className="text-sm text-red-300">Prestiti Scaduti</div>
          </CardContent>
        </Card>
      </div>

      {/* Header con ricerca e aggiungi */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <Input
            placeholder="Cerca prestiti per libro, autore o utente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-slate-800/50 border-slate-700 text-slate-200 placeholder:text-slate-500"
          />
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-purple-600 hover:bg-purple-700" disabled={availableBooks.length === 0 || state.users.length === 0}>
              <Plus className="w-4 h-4 mr-2" />
              Nuovo Prestito
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-slate-800 border-slate-700 text-slate-200">
            <DialogHeader>
              <DialogTitle>Crea Nuovo Prestito</DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="bookId">Libro</Label>
                <Select value={formData.bookId} onValueChange={(value) => setFormData({ ...formData, bookId: value })}>
                  <SelectTrigger className="bg-slate-700 border-slate-600">
                    <SelectValue placeholder="Seleziona un libro disponibile" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-700 border-slate-600">
                    {availableBooks.map(book => (
                      <SelectItem key={book.id} value={book.id}>
                        {book.title} - {book.author}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="userId">Utente</Label>
                <Select value={formData.userId} onValueChange={(value) => setFormData({ ...formData, userId: value })}>
                  <SelectTrigger className="bg-slate-700 border-slate-600">
                    <SelectValue placeholder="Seleziona un utente" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-700 border-slate-600">
                    {state.users.map(user => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name} {user.surname} ({user.cardNumber})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="loanDate">Data Prestito</Label>
                  <Input
                    id="loanDate"
                    type="date"
                    value={formData.loanDate}
                    onChange={(e) => {
                      const newLoanDate = e.target.value;
                      setFormData({ 
                        ...formData, 
                        loanDate: newLoanDate,
                        dueDate: calculateDueDate(newLoanDate)
                      });
                    }}
                    required
                    className="bg-slate-700 border-slate-600"
                  />
                </div>
                <div>
                  <Label htmlFor="dueDate">Data Scadenza</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={formData.dueDate || calculateDueDate(formData.loanDate)}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="bg-slate-700 border-slate-600"
                  />
                  <p className="text-xs text-slate-400 mt-1">
                    Default: 30 giorni dalla data del prestito
                  </p>
                </div>
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={resetForm}>
                  Annulla
                </Button>
                <Button type="submit" className="bg-purple-600 hover:bg-purple-700">
                  Crea Prestito
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Alert per prestiti scaduti */}
      {overdueLoansCount > 0 && (
        <Card className="bg-red-900/20 border-red-700/50 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0" />
              <div>
                <p className="font-medium text-red-200">
                  Attenzione: {overdueLoansCount} prestito{overdueLoansCount > 1 ? 'i' : ''} scadut{overdueLoansCount > 1 ? 'i' : 'o'}
                </p>
                <p className="text-sm text-red-300">
                  Alcuni libri sono in ritardo nella restituzione.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista prestiti */}
      {filteredLoans.length > 0 ? (
        <div className="space-y-4">
          {filteredLoans.map((loan) => {
            const book = state.books.find(b => b.id === loan.bookId);
            const user = state.users.find(u => u.id === loan.userId);
            const isLoanOverdue = loan.status === 'active' && isOverdue(loan.dueDate);
            
            return (
              <Card key={loan.id} className={`bg-slate-800/50 border-slate-700/50 backdrop-blur-sm hover:bg-slate-800/70 transition-all duration-300 ${
                isLoanOverdue ? 'border-red-500/30 bg-red-900/10' : ''
              }`}>
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                          <BookOpen className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-slate-200">
                            {book ? book.title : 'Libro non trovato'}
                          </h3>
                          <p className="text-slate-400">
                            {book ? book.author : 'Autore sconosciuto'}
                          </p>
                          <div className="flex items-center space-x-2 mt-1">
                            <User className="w-4 h-4 text-slate-500" />
                            <span className="text-slate-300">
                              {user ? `${user.name} ${user.surname} (${user.cardNumber})` : 'Utente non trovato'}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-blue-400" />
                          <div>
                            <span className="text-slate-500">Prestito:</span>
                            <span className="text-slate-300 ml-1">{formatDate(loan.loanDate)}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4 text-orange-400" />
                          <div>
                            <span className="text-slate-500">Scadenza:</span>
                            <span className={`ml-1 ${isLoanOverdue ? 'text-red-400 font-semibold' : 'text-slate-300'}`}>
                              {formatDate(loan.dueDate)}
                            </span>
                          </div>
                        </div>
                        {loan.returnDate && (
                          <div className="flex items-center space-x-2">
                            <CheckCircle className="w-4 h-4 text-green-400" />
                            <div>
                              <span className="text-slate-500">Restituzione:</span>
                              <span className="text-green-300 ml-1">{formatDate(loan.returnDate)}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end space-y-2">
                      {getStatusBadge(loan)}
                      {loan.status === 'active' && (
                        <Button
                          size="sm"
                          onClick={() => handleReturn(loan)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Restituisci
                        </Button>
                      )}
                      {isLoanOverdue && (
                        <div className="flex items-center space-x-1 text-red-400">
                          <AlertCircle className="w-4 h-4" />
                          <span className="text-xs font-medium">SCADUTO</span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
          <CardContent className="p-8 text-center">
            <Calendar className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-200 mb-2">
              {searchTerm ? 'Nessun prestito trovato' : 'Nessun prestito registrato'}
            </h3>
            <p className="text-slate-400 mb-4">
              {searchTerm 
                ? 'Prova a modificare i termini di ricerca'
                : 'Inizia creando il primo prestito'
              }
            </p>
            {!searchTerm && availableBooks.length > 0 && state.users.length > 0 && (
              <Button 
                onClick={() => setIsDialogOpen(true)}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Crea Primo Prestito
              </Button>
            )}
            {(availableBooks.length === 0 || state.users.length === 0) && (
              <div className="text-slate-500 text-sm">
                {availableBooks.length === 0 && <p>• Nessun libro disponibile per il prestito</p>}
                {state.users.length === 0 && <p>• Nessun utente registrato</p>}
              </div>
            )}
          </CardContent>
        </Card>
      )}

    </div>
  );
};

export default LoansManager;
