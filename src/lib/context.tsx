import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { Book, User, Loan, LibraryData, loadData, saveData } from './storage';
import { toast } from 'sonner';

interface Notification {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

interface AuditLog {
  id: string;
  action: string;
  entityType: 'book' | 'user' | 'loan';
  entityId: string;
  details: string;
  timestamp: Date;
  userId?: string;
}

interface BookReview {
  id: string;
  bookId: string;
  userId: string;
  rating: number;
  review: string;
  timestamp: Date;
}

interface BookReservation {
  id: string;
  bookId: string;
  userId: string;
  timestamp: Date;
  status: 'pending' | 'fulfilled' | 'cancelled';
}

interface LibraryState extends LibraryData {
  notifications: Notification[];
  auditLogs: AuditLog[];
  bookReviews: BookReview[];
  bookReservations: BookReservation[];
  loading: boolean;
  error: string | null;
}

type LibraryAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_DATA'; payload: LibraryData }
  | { type: 'ADD_BOOK'; payload: Book }
  | { type: 'UPDATE_BOOK'; payload: Book }
  | { type: 'DELETE_BOOK'; payload: string }
  | { type: 'ADD_USER'; payload: User }
  | { type: 'UPDATE_USER'; payload: User }
  | { type: 'DELETE_USER'; payload: string }
  | { type: 'ADD_LOAN'; payload: Loan }
  | { type: 'UPDATE_LOAN'; payload: Loan }
  | { type: 'DELETE_LOAN'; payload: string }
  | { type: 'ADD_NOTIFICATION'; payload: Notification }
  | { type: 'MARK_NOTIFICATION_READ'; payload: string }
  | { type: 'DELETE_NOTIFICATION'; payload: string }
  | { type: 'ADD_AUDIT_LOG'; payload: AuditLog }
  | { type: 'ADD_BOOK_REVIEW'; payload: BookReview }
  | { type: 'ADD_BOOK_RESERVATION'; payload: BookReservation }
  | { type: 'UPDATE_BOOK_RESERVATION'; payload: BookReservation };

const initialState: LibraryState = {
  books: [],
  users: [],
  loans: [],
  notifications: [
    {
      id: 'welcome-1',
      type: 'info',
      title: 'Benvenuto nel Sistema',
      message: 'BiblioTech Pro è ora attivo e pronto per l\'uso',
      timestamp: new Date(),
      read: false
    }
  ],
  auditLogs: [],
  bookReviews: [],
  bookReservations: [],
  loading: false,
  error: null,
};

function libraryReducer(state: LibraryState, action: LibraryAction): LibraryState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_DATA':
      return { 
        ...state, 
        books: action.payload.books,
        users: action.payload.users,
        loans: action.payload.loans
      };
    case 'ADD_BOOK':
      return { ...state, books: [...state.books, action.payload] };
    case 'UPDATE_BOOK':
      return {
        ...state,
        books: state.books.map(book =>
          book.id === action.payload.id ? action.payload : book
        ),
      };
    case 'DELETE_BOOK':
      return {
        ...state,
        books: state.books.filter(book => book.id !== action.payload),
      };
    case 'ADD_USER':
      return { ...state, users: [...state.users, action.payload] };
    case 'UPDATE_USER':
      return {
        ...state,
        users: state.users.map(user =>
          user.id === action.payload.id ? action.payload : user
        ),
      };
    case 'DELETE_USER':
      return {
        ...state,
        users: state.users.filter(user => user.id !== action.payload),
      };
    case 'ADD_LOAN':
      return { ...state, loans: [...state.loans, action.payload] };
    case 'UPDATE_LOAN':
      return {
        ...state,
        loans: state.loans.map(loan =>
          loan.id === action.payload.id ? action.payload : loan
        ),
      };
    case 'DELETE_LOAN':
      return {
        ...state,
        loans: state.loans.filter(loan => loan.id !== action.payload),
      };
    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [action.payload, ...state.notifications],
      };
    case 'MARK_NOTIFICATION_READ':
      return {
        ...state,
        notifications: state.notifications.map(notification =>
          notification.id === action.payload
            ? { ...notification, read: true }
            : notification
        ),
      };
    case 'DELETE_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.filter(notification =>
          notification.id !== action.payload
        ),
      };
    case 'ADD_AUDIT_LOG':
      return {
        ...state,
        auditLogs: [action.payload, ...state.auditLogs],
      };
    case 'ADD_BOOK_REVIEW':
      return {
        ...state,
        bookReviews: [...state.bookReviews, action.payload],
      };
    case 'ADD_BOOK_RESERVATION':
      return {
        ...state,
        bookReservations: [...state.bookReservations, action.payload],
      };
    case 'UPDATE_BOOK_RESERVATION':
      return {
        ...state,
        bookReservations: state.bookReservations.map(reservation =>
          reservation.id === action.payload.id ? action.payload : reservation
        ),
      };
    default:
      return state;
  }
}

interface LibraryContextType {
  state: LibraryState;
  dispatch: React.Dispatch<LibraryAction>;
  addBook: (book: Omit<Book, 'id' | 'createdAt'>) => void;
  updateBook: (book: Book) => void;
  deleteBook: (id: string) => void;
  addUser: (user: Omit<User, 'id' | 'registrationDate'>) => void;
  updateUser: (user: User) => void;
  deleteUser: (id: string) => void;
  addLoan: (loan: Omit<Loan, 'id'>) => void;
  updateLoan: (loan: Loan) => void;
  deleteLoan: (id: string) => void;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  addAuditLog: (log: Omit<AuditLog, 'id' | 'timestamp'>) => void;
  addBookReview: (review: Omit<BookReview, 'id' | 'timestamp'>) => void;
  addBookReservation: (reservation: Omit<BookReservation, 'id' | 'timestamp' | 'status'>) => void;
  exportData: () => void;
  importData: (data: LibraryData) => void;
}

const LibraryContext = createContext<LibraryContextType | undefined>(undefined);

export function LibraryProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(libraryReducer, initialState);

  useEffect(() => {
    const data = loadData();
    dispatch({ type: 'SET_DATA', payload: data });
  }, []);

  useEffect(() => {
    if (state.books.length > 0 || state.users.length > 0 || state.loans.length > 0) {
      saveData({
        books: state.books,
        users: state.users,
        loans: state.loans,
      });
    }
  }, [state.books, state.users, state.loans]);

  const generateId = () => Date.now().toString() + Math.random().toString(36).substr(2, 9);

  const addBook = (bookData: Omit<Book, 'id' | 'createdAt'>) => {
    const book: Book = {
      ...bookData,
      id: generateId(),
      createdAt: new Date().toISOString().split('T')[0],
    };
    dispatch({ type: 'ADD_BOOK', payload: book });
    addAuditLog({
      action: 'CREATE',
      entityType: 'book',
      entityId: book.id,
      details: `Added book: ${book.title}`,
    });
    toast.success(`Book "${book.title}" added successfully!`);
  };

  const updateBook = (book: Book) => {
    dispatch({ type: 'UPDATE_BOOK', payload: book });
    addAuditLog({
      action: 'UPDATE',
      entityType: 'book',
      entityId: book.id,
      details: `Updated book: ${book.title}`,
    });
    toast.success(`Book "${book.title}" updated successfully!`);
  };

  const deleteBook = (id: string) => {
    const book = state.books.find(b => b.id === id);
    dispatch({ type: 'DELETE_BOOK', payload: id });
    if (book) {
      addAuditLog({
        action: 'DELETE',
        entityType: 'book',
        entityId: id,
        details: `Deleted book: ${book.title}`,
      });
      toast.success(`Book "${book.title}" deleted successfully!`);
    }
  };

  const addUser = (userData: Omit<User, 'id' | 'registrationDate'>) => {
    const user: User = {
      ...userData,
      id: generateId(),
      registrationDate: new Date().toISOString().split('T')[0],
    };
    dispatch({ type: 'ADD_USER', payload: user });
    addAuditLog({
      action: 'CREATE',
      entityType: 'user',
      entityId: user.id,
      details: `Added user: ${user.name} ${user.surname}`,
    });
    toast.success(`User "${user.name} ${user.surname}" added successfully!`);
  };

  const updateUser = (user: User) => {
    dispatch({ type: 'UPDATE_USER', payload: user });
    addAuditLog({
      action: 'UPDATE',
      entityType: 'user',
      entityId: user.id,
      details: `Updated user: ${user.name} ${user.surname}`,
    });
    toast.success(`User "${user.name} ${user.surname}" updated successfully!`);
  };

  const deleteUser = (id: string) => {
    const user = state.users.find(u => u.id === id);
    dispatch({ type: 'DELETE_USER', payload: id });
    if (user) {
      addAuditLog({
        action: 'DELETE',
        entityType: 'user',
        entityId: id,
        details: `Deleted user: ${user.name} ${user.surname}`,
      });
      toast.success(`User "${user.name} ${user.surname}" deleted successfully!`);
    }
  };

  const addLoan = (loanData: Omit<Loan, 'id'>) => {
    const loan: Loan = {
      ...loanData,
      id: generateId(),
    };
    dispatch({ type: 'ADD_LOAN', payload: loan });
    
    // Update book availability
    const book = state.books.find(b => b.id === loan.bookId);
    if (book) {
      updateBook({ ...book, available: false });
    }
    
    addAuditLog({
      action: 'CREATE',
      entityType: 'loan',
      entityId: loan.id,
      details: `Created loan for book ID: ${loan.bookId}`,
    });
    toast.success('Loan created successfully!');
  };

  const updateLoan = (loan: Loan) => {
    dispatch({ type: 'UPDATE_LOAN', payload: loan });
    addAuditLog({
      action: 'UPDATE',
      entityType: 'loan',
      entityId: loan.id,
      details: `Updated loan status: ${loan.status}`,
    });
    toast.success('Loan updated successfully!');
  };

  const deleteLoan = (id: string) => {
    const loan = state.loans.find(l => l.id === id);
    dispatch({ type: 'DELETE_LOAN', payload: id });
    
    // Update book availability
    if (loan) {
      const book = state.books.find(b => b.id === loan.bookId);
      if (book) {
        updateBook({ ...book, available: true });
      }
      addAuditLog({
        action: 'DELETE',
        entityType: 'loan',
        entityId: id,
        details: `Deleted loan for book ID: ${loan.bookId}`,
      });
      toast.success('Loan deleted successfully!');
    }
  };

  const addNotification = (notificationData: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const notification: Notification = {
      ...notificationData,
      id: generateId(),
      timestamp: new Date(),
      read: false,
    };
    dispatch({ type: 'ADD_NOTIFICATION', payload: notification });
  };

  const addAuditLog = (logData: Omit<AuditLog, 'id' | 'timestamp'>) => {
    const log: AuditLog = {
      ...logData,
      id: generateId(),
      timestamp: new Date(),
    };
    dispatch({ type: 'ADD_AUDIT_LOG', payload: log });
  };

  const addBookReview = (reviewData: Omit<BookReview, 'id' | 'timestamp'>) => {
    const review: BookReview = {
      ...reviewData,
      id: generateId(),
      timestamp: new Date(),
    };
    dispatch({ type: 'ADD_BOOK_REVIEW', payload: review });
    toast.success('Review added successfully!');
  };

  const addBookReservation = (reservationData: Omit<BookReservation, 'id' | 'timestamp' | 'status'>) => {
    const reservation: BookReservation = {
      ...reservationData,
      id: generateId(),
      timestamp: new Date(),
      status: 'pending',
    };
    dispatch({ type: 'ADD_BOOK_RESERVATION', payload: reservation });
    toast.success('Book reservation created successfully!');
  };

  const exportData = () => {
    const data = {
      books: state.books,
      users: state.users,
      loans: state.loans,
      bookReviews: state.bookReviews,
      bookReservations: state.bookReservations,
      auditLogs: state.auditLogs,
    };
    const dataStr = JSON.stringify(data, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `biblioteca-backup-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    toast.success('Data exported successfully!');
  };

  const importData = (data: LibraryData) => {
    dispatch({ type: 'SET_DATA', payload: data });
    toast.success('Data imported successfully!');
  };

  const contextValue: LibraryContextType = {
    state,
    dispatch,
    addBook,
    updateBook,
    deleteBook,
    addUser,
    updateUser,
    deleteUser,
    addLoan,
    updateLoan,
    deleteLoan,
    addNotification,
    addAuditLog,
    addBookReview,
    addBookReservation,
    exportData,
    importData,
  };

  return (
    <LibraryContext.Provider value={contextValue}>
      {children}
    </LibraryContext.Provider>
  );
}

export function useLibrary() {
  const context = useContext(LibraryContext);
  if (context === undefined) {
    throw new Error('useLibrary must be used within a LibraryProvider');
  }
  return context;
}
