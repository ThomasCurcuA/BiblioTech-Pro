export interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string;
  genre: string;
  year: number;
  available: boolean;
  createdAt: string;
  // Nuove funzionalità avanzate
  category: string; // Categoria principale (es. "Letteratura", "Scienze", "Storia")
  deweyCode?: string; // Codice classificazione Dewey
  publisher?: string; // Casa editrice
  language: string; // Lingua del libro
  pages?: number; // Numero di pagine
  price?: number; // Prezzo di acquisto
  value?: number; // Valore attuale stimato
  condition: 'new' | 'good' | 'fair' | 'damaged' | 'repair'; // Condizione del libro
  coverImage?: string; // URL o base64 dell'immagine copertina
  barcode?: string; // Codice a barre interno
  shelfLocation?: string; // Posizione scaffale (es. "A-15-3")
  description?: string; // Descrizione dettagliata
  tags: string[]; // Tag personalizzati
  rating: number; // Rating medio (0-5)
  totalRatings: number; // Numero totale di valutazioni
  lastMaintenance?: string; // Data ultima manutenzione
}

export interface User {
  id: string;
  name: string;
  surname: string;
  email: string;
  cardNumber: string;
  registrationDate: string;
}

export interface Loan {
  id: string;
  bookId: string;
  userId: string;
  loanDate: string;
  dueDate: string;
  returnDate?: string;
  status: 'active' | 'returned' | 'overdue';
}

export interface LibraryData {
  books: Book[];
  users: User[];
  loans: Loan[];
}

const STORAGE_KEY = 'biblioteca-data';

// Dati di esempio per inizializzare l'app
const initialData: LibraryData = {
  books: [
    {
      id: '1',
      title: 'Il Nome della Rosa',
      author: 'Umberto Eco',
      isbn: '978-88-452-3207-2',
      genre: 'Narrativa Storica',
      year: 1980,
      available: true,
      createdAt: '2024-01-15',
      category: 'Letteratura',
      deweyCode: '853.914',
      publisher: 'Bompiani',
      language: 'Italiano',
      pages: 672,
      price: 18.50,
      value: 15.00,
      condition: 'good',
      barcode: 'LIB001',
      shelfLocation: 'A-15-3',
      description: 'Un giallo storico ambientato in un monastero medievale. Un capolavoro della letteratura italiana.',
      tags: ['mistero', 'storico', 'medievale', 'filosofia'],
      rating: 4.5,
      totalRatings: 127
    },
    {
      id: '2',
      title: 'Clean Code',
      author: 'Robert C. Martin',
      isbn: '978-0-13-235088-4',
      genre: 'Programmazione',
      year: 2008,
      available: false,
      createdAt: '2024-01-16',
      category: 'Informatica',
      deweyCode: '005.1',
      publisher: 'Prentice Hall',
      language: 'Inglese',
      pages: 464,
      price: 45.00,
      value: 35.00,
      condition: 'new',
      barcode: 'LIB002',
      shelfLocation: 'C-5-2',
      description: 'Una guida completa per scrivere codice pulito e mantenibile.',
      tags: ['programmazione', 'best-practices', 'software-engineering'],
      rating: 4.7,
      totalRatings: 89
    },
    {
      id: '3',
      title: 'JavaScript: The Good Parts',
      author: 'Douglas Crockford',
      isbn: '978-0-596-51774-8',
      genre: 'Programmazione',
      year: 2008,
      available: true,
      createdAt: '2024-01-17',
      category: 'Informatica',
      deweyCode: '005.133',
      publisher: 'O\'Reilly',
      language: 'Inglese',
      pages: 176,
      price: 35.00,
      value: 28.00,
      condition: 'good',
      barcode: 'LIB003',
      shelfLocation: 'C-5-1',
      description: 'Un\'analisi delle parti migliori del linguaggio JavaScript.',
      tags: ['javascript', 'programmazione', 'web-development'],
      rating: 4.3,
      totalRatings: 156
    }
  ],
  users: [
    {
      id: '1',
      name: 'Mario',
      surname: 'Rossi',
      email: 'mario.rossi@email.com',
      cardNumber: 'LIB001',
      registrationDate: '2024-01-10'
    },
    {
      id: '2',
      name: 'Anna',
      surname: 'Verdi',
      email: 'anna.verdi@email.com',
      cardNumber: 'LIB002',
      registrationDate: '2024-01-12'
    }
  ],
  loans: [
    {
      id: '1',
      bookId: '2',
      userId: '1',
      loanDate: '2024-01-18',
      dueDate: '2024-02-01',
      status: 'active'
    }
  ]
};

export const loadData = (): LibraryData => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading data:', error);
  }
  
  // Se non ci sono dati salvati, usa i dati iniziali
  saveData(initialData);
  return initialData;
};

export const saveData = (data: LibraryData): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving data:', error);
  }
};

export const generateId = (): string => {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
};

export const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString('it-IT');
};

export const isOverdue = (dueDate: string): boolean => {
  return new Date(dueDate) < new Date();
};
