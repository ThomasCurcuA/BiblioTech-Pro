import React, { useState } from 'react';
import { Users, Plus, Search, Edit, Trash2, Mail, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { useLibrary } from '../lib/context';
import { User as UserType } from '../lib/storage';
import { formatDate } from '../lib/storage';

const UsersManager: React.FC = () => {
  const { state, addUser, updateUser, deleteUser } = useLibrary();
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserType | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    email: '',
    cardNumber: ''
  });

  const filteredUsers = state.users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.surname.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.cardNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const generateCardNumber = () => {
    const existingNumbers = state.users.map(u => u.cardNumber);
    let cardNumber;
    do {
      const randomNum = Math.floor(Math.random() * 9999) + 1;
      cardNumber = `LIB${randomNum.toString().padStart(4, '0')}`;
    } while (existingNumbers.includes(cardNumber));
    return cardNumber;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const userData = {
      ...formData,
      cardNumber: formData.cardNumber || generateCardNumber()
    };
    
    if (editingUser) {
      updateUser({ ...editingUser, ...userData });
    } else {
      addUser(userData);
    }
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      surname: '',
      email: '',
      cardNumber: ''
    });
    setEditingUser(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (user: UserType) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      surname: user.surname,
      email: user.email,
      cardNumber: user.cardNumber
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (user: UserType) => {
    const userLoans = state.loans.filter(loan => loan.userId === user.id && loan.status === 'active');
    if (userLoans.length > 0) {
      alert(`Impossibile eliminare ${user.name} ${user.surname}. L'utente ha ${userLoans.length} prestito/i attivo/i.`);
      return;
    }
    
    if (window.confirm(`Sei sicuro di voler eliminare ${user.name} ${user.surname}?`)) {
      deleteUser(user.id);
    }
  };

  const getUserLoansCount = (userId: string) => {
    return state.loans.filter(loan => loan.userId === userId && loan.status === 'active').length;
  };

  // Calcola statistiche utenti
  const totalUsers = state.users.length;
  const activeUsers = state.users.filter(user => {
    // Un utente è attivo se ha almeno un prestito attivo
    return state.loans.some(loan => loan.userId === user.id && loan.status === 'active');
  }).length;
  const inactiveUsers = totalUsers - activeUsers;

  return (
    <div className="space-y-6">
      {/* Statistiche utenti */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-purple-900/50 to-purple-800/50 border-purple-700/50">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-400 mb-1">{totalUsers}</div>
            <div className="text-sm text-purple-300">Utenti Totali</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-900/50 to-green-800/50 border-green-700/50">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-400 mb-1">{activeUsers}</div>
            <div className="text-sm text-green-300">Utenti Attivi</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 border-gray-700/50">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-gray-400 mb-1">{inactiveUsers}</div>
            <div className="text-sm text-gray-300">Utenti Inattivi</div>
          </CardContent>
        </Card>
      </div>

      {/* Header con ricerca e aggiungi */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <Input
            placeholder="Cerca utenti per nome, cognome, email o tessera..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-slate-800/50 border-slate-700 text-slate-200 placeholder:text-slate-500"
          />
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-green-600 hover:bg-green-700">
              <Plus className="w-4 h-4 mr-2" />
              Aggiungi Utente
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-slate-800 border-slate-700 text-slate-200">
            <DialogHeader>
              <DialogTitle>
                {editingUser ? 'Modifica Utente' : 'Aggiungi Nuovo Utente'}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nome</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="bg-slate-700 border-slate-600"
                  />
                </div>
                <div>
                  <Label htmlFor="surname">Cognome</Label>
                  <Input
                    id="surname"
                    value={formData.surname}
                    onChange={(e) => setFormData({ ...formData, surname: e.target.value })}
                    required
                    className="bg-slate-700 border-slate-600"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="bg-slate-700 border-slate-600"
                />
              </div>
              
              <div>
                <Label htmlFor="cardNumber">Numero Tessera (opzionale)</Label>
                <Input
                  id="cardNumber"
                  value={formData.cardNumber}
                  onChange={(e) => setFormData({ ...formData, cardNumber: e.target.value })}
                  placeholder="Lascia vuoto per generazione automatica"
                  className="bg-slate-700 border-slate-600"
                />
                <p className="text-xs text-slate-400 mt-1">
                  Se non specificato, verrà generato automaticamente
                </p>
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={resetForm}>
                  Annulla
                </Button>
                <Button type="submit" className="bg-green-600 hover:bg-green-700">
                  {editingUser ? 'Aggiorna' : 'Aggiungi'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Lista utenti */}
      {filteredUsers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredUsers.map((user) => {
            const loansCount = getUserLoansCount(user.id);
            
            return (
              <Card key={user.id} className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm hover:bg-slate-800/70 transition-all duration-300">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg text-slate-200">
                        {user.name} {user.surname}
                      </CardTitle>
                      <div className="flex items-center space-x-2 mt-1">
                        <Mail className="w-3 h-3 text-slate-500" />
                        <p className="text-slate-400 text-sm">{user.email}</p>
                      </div>
                    </div>
                    <Badge variant={loansCount > 0 ? "destructive" : "default"} className="ml-2">
                      {loansCount} prestiti
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Tessera:</span>
                      <span className="text-slate-300 font-mono">{user.cardNumber}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Registrazione:</span>
                      <span className="text-slate-300">{formatDate(user.registrationDate)}</span>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(user)}
                      className="flex-1"
                    >
                      <Edit className="w-3 h-3 mr-1" />
                      Modifica
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(user)}
                      disabled={loansCount > 0}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                  
                  {loansCount > 0 && (
                    <p className="text-xs text-yellow-400 mt-2 flex items-center">
                      <Calendar className="w-3 h-3 mr-1" />
                      Prestiti attivi: impossibile eliminare
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
          <CardContent className="p-8 text-center">
            <Users className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-200 mb-2">
              {searchTerm ? 'Nessun utente trovato' : 'Nessun utente registrato'}
            </h3>
            <p className="text-slate-400 mb-4">
              {searchTerm 
                ? 'Prova a modificare i termini di ricerca'
                : 'Inizia registrando il primo utente'
              }
            </p>
            {!searchTerm && (
              <Button 
                onClick={() => setIsDialogOpen(true)}
                className="bg-green-600 hover:bg-green-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Registra Primo Utente
              </Button>
            )}
          </CardContent>
        </Card>
      )}

    </div>
  );
};

export default UsersManager;
