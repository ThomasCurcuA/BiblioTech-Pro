// Costanti per la gestione avanzata dei libri

export const BOOK_CATEGORIES = [
  'Letteratura',
  'Informatica',
  'Scienze',
  'Storia',
  'Filosofia',
  'Arte',
  'Musica',
  'Medicina',
  'Economia',
  'Diritto',
  'Ingegneria',
  'Matematica',
  'Fisica',
  'Chimica',
  'Biologia',
  'Geografia',
  'Religione',
  'Psicologia',
  'Sociologia',
  'Altro'
] as const;

export const BOOK_CONDITIONS = [
  { value: 'new', label: 'Nuovo', color: 'bg-green-500' },
  { value: 'good', label: 'Buono', color: 'bg-blue-500' },
  { value: 'fair', label: 'Discreto', color: 'bg-yellow-500' },
  { value: 'damaged', label: 'Danneggiato', color: 'bg-red-500' },
  { value: 'repair', label: 'In Riparazione', color: 'bg-orange-500' }
] as const;

export const LANGUAGES = [
  'Italiano',
  'Inglese',
  'Francese',
  'Tedesco',
  'Spagnolo',
  'Portoghese',
  'Russo',
  'Cinese',
  'Giapponese',
  'Arabo',
  'Altro'
] as const;

export const GENRES = [
  'Narrativa',
  'Saggistica',
  'Poesia',
  'Teatro',
  'Biografia',
  'Autobiografia',
  'Storia',
  'Filosofia',
  'Scienze',
  'Tecnologia',
  'Arte',
  'Musica',
  'Cucina',
  'Viaggi',
  'Sport',
  'Hobby',
  'Bambini',
  'Ragazzi',
  'Altro'
] as const;

// Codici Dewey Decimali comuni
export const DEWEY_CODES = [
  '000 - Informatica, Informazione, Opere generali',
  '100 - Filosofia e psicologia',
  '200 - Religione',
  '300 - Scienze sociali',
  '400 - Linguaggio',
  '500 - Scienze naturali e matematica',
  '600 - Tecnologia e scienze applicate',
  '700 - Arti e ricreazione',
  '800 - Letteratura',
  '900 - Storia e geografia'
] as const;

// Funzione per generare codice a barre
export const generateBarcode = (): string => {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `LIB${timestamp}${random}`;
};

// Funzione per validare ISBN
export const validateISBN = (isbn: string): boolean => {
  // Rimuove trattini e spazi
  const cleanISBN = isbn.replace(/[-\s]/g, '');
  
  // ISBN-10 o ISBN-13
  if (cleanISBN.length === 10) {
    return validateISBN10(cleanISBN);
  } else if (cleanISBN.length === 13) {
    return validateISBN13(cleanISBN);
  }
  
  return false;
};

const validateISBN10 = (isbn: string): boolean => {
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(isbn[i]) * (10 - i);
  }
  
  const checkDigit = isbn[9] === 'X' ? 10 : parseInt(isbn[9]);
  return (sum + checkDigit) % 11 === 0;
};

const validateISBN13 = (isbn: string): boolean => {
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(isbn[i]) * (i % 2 === 0 ? 1 : 3);
  }
  
  const checkDigit = (10 - (sum % 10)) % 10;
  return checkDigit === parseInt(isbn[12]);
};

// Funzione per ottenere il colore della condizione
export const getConditionColor = (condition: string): string => {
  const cond = BOOK_CONDITIONS.find(c => c.value === condition);
  return cond ? cond.color : 'bg-gray-500';
};

// Funzione per ottenere la label della condizione
export const getConditionLabel = (condition: string): string => {
  const cond = BOOK_CONDITIONS.find(c => c.value === condition);
  return cond ? cond.label : 'Sconosciuto';
};
