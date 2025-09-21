import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Book, Plus, Search, Edit, Trash2, Star, MapPin, Barcode, DollarSign, Tag, Loader2, AlertCircle, Calendar, X } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { useLibrary } from '../lib/context';
import { Book as BookType } from '../lib/storage';
import {
  BOOK_CONDITIONS,
  LANGUAGES,
  GENRES,
  generateBarcode,
  getConditionColor,
  getConditionLabel
} from '../lib/bookConstants';

const BooksManager: React.FC = () => {
  const { state, addBook, updateBook, deleteBook } = useLibrary();
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<BookType | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bookToDelete, setBookToDelete] = useState<BookType | null>(null);
  
  // Stati per la ricerca API
  const [apiSearchTerm, setApiSearchTerm] = useState('');
  const [apiResults, setApiResults] = useState<any[]>([]);
  const [isLoadingApi, setIsLoadingApi] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [showApiResults, setShowApiResults] = useState(false);
  
  // Stati per la classificazione AI
  const [isClassifying, setIsClassifying] = useState(false);
  const [classificationStatus, setClassificationStatus] = useState<string>('');
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    isbn: '',
    genre: '',
    year: new Date().getFullYear(),
    available: true,
    category: '',
    deweyCode: '',
    publisher: '',
    language: 'Italiano',
    pages: '',
    price: '',
    value: '',
    condition: 'good' as 'new' | 'good' | 'fair' | 'damaged' | 'repair',
    barcode: '',
    shelfLocation: '',
    description: '',
    tags: [] as string[],
    rating: 0,
    totalRatings: 0,
    coverImage: ''
  });

  // Funzione per cercare libri tramite API Google Books
  const searchBooksAPI = async (query: string) => {
    if (!query.trim()) {
      setApiResults([]);
      setShowApiResults(false);
      return;
    }

    setIsLoadingApi(true);
    setApiError(null);

    try {
      const response = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=5&langRestrict=it`
      );
      
      if (!response.ok) {
        throw new Error('Errore nella ricerca API');
      }

      const data = await response.json();
      setApiResults(data.items || []);
      setShowApiResults(true);
    } catch (error) {
      setApiError('Errore nella ricerca. Riprova più tardi.');
      setApiResults([]);
    } finally {
      setIsLoadingApi(false);
    }
  };

  // Funzione per classificare il libro tramite AI (usando un approccio più semplice)
  const classifyBookWithAI = async (title: string, description: string, authors: string[]) => {
    try {
      // Usa l'API gratuita di Cohere per classificazione del testo
      const textToClassify = `${title} - ${authors.join(', ')} - ${description.substring(0, 300)}`;
      
      const response = await fetch('https://api.cohere.ai/v1/classify', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer YOUR_COHERE_API_KEY', // Sostituire con API key reale
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: [textToClassify],
          examples: [
            { text: "Il Signore degli Anelli", label: "Narrativa" },
            { text: "Storia d'Italia", label: "Storia" },
            { text: "Fisica quantistica", label: "Scienze" },
            { text: "Ricette di cucina", label: "Cucina" },
            { text: "Biografia di Einstein", label: "Biografia" },
            { text: "Manuale di programmazione", label: "Manuali" },
            { text: "Poesie di Leopardi", label: "Poesia" },
            { text: "Enciclopedia Britannica", label: "Enciclopedie" },
            { text: "Dizionario italiano", label: "Dizionari" },
            { text: "Storia dell'arte", label: "Arte" }
          ],
          model: 'large'
        }),
      });

      if (!response.ok) {
        throw new Error('Errore nella classificazione AI');
      }

      const result = await response.json();
      return result.classifications?.[0]?.prediction || 'Altre';
    } catch (error) {
      console.warn('Errore classificazione AI:', error);
      // Fallback: usa una classificazione basata su parole chiave
      const fallbackCategory = classifyBookByKeywords(title, description);
      return mapAICategoryToGenre(fallbackCategory); // Ritorna solo il genere
    }
  };

  // Funzione di mappatura per convertire categorie AI in generi del form
  const mapAICategoryToGenre = (aiCategory: string) => {
    const mapping: Record<string, string> = {
      'Narrativa': 'Narrativa',
      'Saggistica': 'Saggistica',
      'Poesia': 'Poesia',
      'Teatro': 'Teatro',
      'Filosofia': 'Saggistica',
      'Storia': 'Saggistica',
      'Scienze': 'Scienze',
      'Medicina': 'Scienze',
      'Ingegneria': 'Tecnologia',
      'Arte': 'Arte',
      'Musica': 'Musica',
      'Sport': 'Sport',
      'Cucina': 'Cucina',
      'Viaggi': 'Viaggi',
      'Biografia': 'Biografia',
      'Autobiografia': 'Autobiografia',
      'Religione': 'Saggistica',
      'Psicologia': 'Scienze',
      'Economia': 'Saggistica',
      'Diritto': 'Saggistica',
      'Politica': 'Saggistica',
      'Sociologia': 'Saggistica',
      'Geografia': 'Saggistica',
      'Matematica': 'Scienze',
      'Fisica': 'Scienze',
      'Chimica': 'Scienze',
      'Biologia': 'Scienze',
      'Astronomia': 'Scienze',
      'Informatica': 'Tecnologia',
      'Lingue': 'Altro',
      'Manuali': 'Altro',
      'Enciclopedie': 'Altro',
      'Dizionari': 'Altro',
      'Letteratura per bambini': 'Bambini',
      'Fumetti': 'Altro',
      'Altre': 'Altro',
      // Categorie aggiuntive che potrebbero essere restituite dall'API
      'Fiction': 'Narrativa',
      'Non-fiction': 'Saggistica',
      'Literature': 'Saggistica',
      'Art': 'Arte',
      'Music': 'Musica',
      'History': 'Saggistica',
      'Science': 'Scienze',
      'Technology': 'Tecnologia',
      'Philosophy': 'Saggistica',
      'Religion': 'Saggistica',
      'Psychology': 'Scienze',
      'Economics': 'Saggistica',
      'Law': 'Saggistica',
      'Politics': 'Saggistica',
      'Computer Science': 'Tecnologia',
      'Mathematics': 'Scienze',
      'Physics': 'Scienze',
      'Chemistry': 'Scienze',
      'Biology': 'Scienze',
      'Medicine': 'Scienze',
      'Engineering': 'Tecnologia',
      'Geography': 'Saggistica',
      'Sociology': 'Saggistica',
      'Biography': 'Biografia',
      'Autobiography': 'Autobiografia',
      'Memoir': 'Autobiografia',
      'Cookbook': 'Cucina',
      'Travel': 'Viaggi',
      'Sports': 'Sport',
      'Children': 'Bambini',
      'Young Adult': 'Ragazzi',
      'Reference': 'Altro',
      'Textbook': 'Altro',
      'Manual': 'Altro',
      'Guide': 'Altro',
      'Dictionary': 'Altro',
      'Encyclopedia': 'Altro',
      // Categorie specifiche di Google Books
      'Fiction & Literature': 'Narrativa',
      'Nonfiction': 'Saggistica',
      'Literary Fiction': 'Narrativa',
      'Mystery & Thriller': 'Narrativa',
      'Romance': 'Narrativa',
      'Science Fiction': 'Narrativa',
      'Fantasy': 'Narrativa',
      'Horror': 'Narrativa',
      'Adventure': 'Narrativa',
      'Comedy': 'Narrativa',
      'Drama': 'Teatro',
      'Poetry': 'Poesia',
      'Essays': 'Saggistica',
      'Biography & Autobiography': 'Biografia',
      'Self-Help': 'Saggistica',
      'Health & Fitness': 'Scienze',
      'Cooking': 'Cucina',
      'Photography': 'Arte',
      'Architecture': 'Arte',
      'Design': 'Arte',
      'Fashion': 'Arte',
      'Gardening': 'Altro',
      'Pets': 'Altro',
      'Parenting': 'Altro',
      'Education': 'Altro',
      'Textbooks': 'Altro',
      'Study Guides': 'Altro',
      'Language Learning': 'Altro',
      'Business & Money': 'Economia',
      'Careers': 'Saggistica',
      'Investing': 'Economia',
      'Real Estate': 'Economia',
      'Marketing': 'Economia',
      'Management': 'Economia',
      'Entrepreneurship': 'Economia',
      'Computers & Technology': 'Tecnologia',
      'Programming': 'Tecnologia',
      'Web Development': 'Tecnologia',
      'Mobile Apps': 'Tecnologia',
      'Gaming': 'Tecnologia',
      'Databases': 'Tecnologia',
      'Networking': 'Tecnologia',
      'Cybersecurity': 'Tecnologia',
      'Artificial Intelligence': 'Tecnologia',
      'Data Science': 'Tecnologia',
      'Cloud Computing': 'Tecnologia',
      'DevOps': 'Tecnologia',
      'Blockchain': 'Tecnologia'
    };

    return mapping[aiCategory] || '';
  };

  // Funzione di fallback per classificazione basata su parole chiave
  const classifyBookByKeywords = (title: string, description: string) => {
    const text = (title + ' ' + description).toLowerCase();
    
    const categories = {
      'Narrativa': [
        'romanzo', 'romanzi', 'racconto', 'racconti', 'storia', 'avventura', 'mistero', 'thriller', 
        'fantasy', 'sci-fi', 'fantascienza', 'horror', 'giallo', 'fiction', 'narrativa', 'libro',
        'saga', 'trilogia', 'serie', 'epopea', 'fiaba', 'favola', 'leggenda', 'mito', 'fiabesco'
      ],
      'Storia': [
        'storia', 'storico', 'storica', 'antico', 'medievale', 'rinascimento', 'guerra', 'rivoluzione', 
        'epoca', 'periodo', 'secolo', 'impero', 'regno', 'dinastia', 'battaglia', 'cronaca', 'annali'
      ],
      'Scienze': [
        'scienza', 'scientifico', 'fisica', 'chimica', 'biologia', 'matematica', 'astronomia', 
        'geologia', 'ricerca', 'sperimentale', 'teoria', 'formula', 'equazione', 'calcolo'
      ],
      'Medicina': [
        'medicina', 'sanitario', 'salute', 'anatomia', 'fisiologia', 'patologia', 'terapia', 
        'diagnosi', 'cura', 'malattia', 'sintomo', 'farmaco', 'chirurgia', 'ospedale'
      ],
      'Arte': [
        'arte', 'artistico', 'pittura', 'scultura', 'architettura', 'design', 'fotografia', 
        'galleria', 'museo', 'collezione', 'artista', 'pittore', 'scultore', 'creatività'
      ],
      'Musica': [
        'musica', 'musicale', 'compositore', 'sinfonia', 'opera', 'jazz', 'classica', 'concerto', 
        'orchestra', 'strumento', 'canto', 'melodia', 'armonia', 'ritmo', 'note'
      ],
      'Sport': [
        'sport', 'sportivo', 'calcio', 'basket', 'tennis', 'atletica', 'ginnastica', 'nuoto', 
        'ciclismo', 'maratona', 'campionato', 'allenamento', 'squadra', 'giocatore'
      ],
      'Cucina': [
        'cucina', 'ricette', 'gastronomia', 'alimentare', 'cibo', 'ristorante', 'chef', 'menu', 
        'ingredienti', 'preparazione', 'cottura', 'sapore', 'gusto', 'alimentazione'
      ],
      'Viaggi': [
        'viaggi', 'turismo', 'geografia', 'paesi', 'città', 'vacanze', 'mondo', 'destinazione', 
        'itinerario', 'guida turistica', 'cultura', 'tradizione', 'popolo', 'nazione'
      ],
      'Biografia': [
        'biografia', 'autobiografia', 'vita di', 'storia di', 'memorie', 'biografico', 'personaggio', 
        'celebre', 'famoso', 'importante', 'ricordo', 'esperienza', 'testimonianza'
      ],
      'Filosofia': [
        'filosofia', 'filosofico', 'etica', 'morale', 'pensiero', 'logica', 'ragione', 'verità', 
        'conoscenza', 'saggezza', 'riflessione', 'meditazione', 'principio', 'valore'
      ],
      'Religione': [
        'religione', 'religioso', 'cristiano', 'buddista', 'islamico', 'spirituale', 'fede', 'dio', 
        'preghiera', 'sacro', 'divino', 'santità', 'culto', 'rituale'
      ],
      'Psicologia': [
        'psicologia', 'psicologico', 'mente', 'comportamento', 'emozioni', 'psiche', 'cognitivo', 
        'terapia', 'analisi', 'inconscio', 'personalità', 'carattere', 'sentimenti'
      ],
      'Economia': [
        'economia', 'economico', 'finanza', 'business', 'mercato', 'commerciale', 'azienda', 
        'investimento', 'denaro', 'profitto', 'crisi', 'sviluppo', 'crescita'
      ],
      'Diritto': [
        'diritto', 'legale', 'giuridico', 'legge', 'tribunale', 'avvocato', 'giudice', 'processo', 
        'codice', 'norma', 'regolamento', 'statuto', 'costituzione'
      ],
      'Politica': [
        'politica', 'politico', 'governo', 'parlamento', 'elezioni', 'democrazia', 'partito', 
        'candidato', 'elettorale', 'amministrazione', 'stato', 'nazione', 'società'
      ],
      'Informatica': [
        'informatica', 'computer', 'programmazione', 'software', 'tecnologia', 'digitale', 'codice', 
        'algoritmo', 'database', 'sistema', 'rete', 'internet', 'web', 'app'
      ],
      'Lingue': [
        'lingua', 'linguistica', 'grammatica', 'vocabolario', 'traduzione', 'idioma', 'parola', 
        'sintassi', 'morfologia', 'fonetica', 'semantica', 'comunicazione'
      ],
      'Poesia': [
        'poesia', 'poetico', 'versi', 'lirica', 'poeta', 'sonetto', 'rima', 'metro', 'strofa', 
        'poema', 'cantico', 'ode', 'elegia', 'ballata'
      ],
      'Teatro': [
        'teatro', 'drammatico', 'commedia', 'tragedia', 'recitazione', 'scena', 'attore', 'dramma', 
        'spettacolo', 'rappresentazione', 'palcoscenico', 'copione', 'regia'
      ],
      'Manuali': [
        'manuale', 'guida', 'istruzioni', 'come fare', 'tutorial', 'procedura', 'metodo', 'tecnica', 
        'pratico', 'applicazione', 'utilizzo', 'gestione', 'amministrazione'
      ],
      'Enciclopedie': [
        'enciclopedia', 'enciclopedico', 'dizionario enciclopedico', 'sapere universale', 'conoscenza', 
        'informazione', 'dati', 'ricerca', 'studio', 'analisi', 'compendio'
      ],
      'Dizionari': [
        'dizionario', 'vocabolario', 'glossario', 'terminologia', 'definizione', 'significato', 
        'parole', 'linguaggio', 'lessico', 'etimologia', 'sinonimi'
      ],
      'Letteratura per bambini': [
        'bambini', 'infantile', 'ragazzi', 'giovani', 'fiaba', 'favola', 'educativo', 'scuola', 
        'apprendimento', 'gioco', 'fantasia', 'avventura', 'magia'
      ]
    };

    // Conta le corrispondenze per ogni categoria
    let bestMatch = '';
    let maxMatches = 0;

    for (const [category, keywords] of Object.entries(categories)) {
      const matches = keywords.filter(keyword => text.includes(keyword)).length;
      if (matches > maxMatches) {
        maxMatches = matches;
        bestMatch = category;
      }
    }

    // Se non ci sono corrispondenze, prova a classificare in base al titolo
    if (maxMatches === 0) {
      if (title.toLowerCase().includes('storia') || title.toLowerCase().includes('guerra')) {
        return 'Storia';
      }
      if (title.toLowerCase().includes('poesia') || title.toLowerCase().includes('versi')) {
        return 'Poesia';
      }
      if (title.toLowerCase().includes('arte') || title.toLowerCase().includes('pittura')) {
        return 'Arte';
      }
      if (title.toLowerCase().includes('musica') || title.toLowerCase().includes('opera')) {
        return 'Musica';
      }
      if (title.toLowerCase().includes('cucina') || title.toLowerCase().includes('ricette')) {
        return 'Cucina';
      }
      if (title.toLowerCase().includes('viaggi') || title.toLowerCase().includes('turismo')) {
        return 'Viaggi';
      }
      if (title.toLowerCase().includes('scienza') || title.toLowerCase().includes('ricerca')) {
        return 'Scienze';
      }
      if (title.toLowerCase().includes('informatica') || title.toLowerCase().includes('computer')) {
        return 'Informatica';
      }
      if (title.toLowerCase().includes('economia') || title.toLowerCase().includes('finanza')) {
        return 'Economia';
      }
      if (title.toLowerCase().includes('filosofia') || title.toLowerCase().includes('pensiero')) {
        return 'Filosofia';
      }
      // Default per libri di narrativa
      return 'Narrativa';
    }

    return bestMatch;
  };

  // Funzione per popolare il form con i dati dell'API
  const fillFormWithApiData = async (bookData: any) => {
    const volumeInfo = bookData.volumeInfo;
    const industryIdentifiers = volumeInfo.industryIdentifiers || [];
    
    // Trova ISBN-13 o ISBN-10
    const isbn13 = industryIdentifiers.find((id: any) => id.type === 'ISBN_13')?.identifier;
    const isbn10 = industryIdentifiers.find((id: any) => id.type === 'ISBN_10')?.identifier;
    const isbn = isbn13 || isbn10 || '';

    // Mappa il genere iniziale di Google Books
    const initialCategory = volumeInfo.categories?.[0] || '';
    const mappedInitialGenre = initialCategory ? mapAICategoryToGenre(initialCategory) : '';
    
    // Se non abbiamo un genere mappato, prova a classificare subito con le parole chiave
    let finalGenre = mappedInitialGenre;
    if (!finalGenre && volumeInfo.title) {
      const fallbackCategory = classifyBookByKeywords(volumeInfo.title, volumeInfo.description || '');
      finalGenre = mapAICategoryToGenre(fallbackCategory);
    }
    
    // Se ancora non abbiamo un genere, usa un default
    if (!finalGenre) {
      finalGenre = 'Altro';
    }

    console.log('Genere iniziale mappato:', { initialCategory, mappedInitialGenre, finalGenre }); // Debug

    // Prima popola i dati base
    setFormData({
      ...formData,
      title: volumeInfo.title || '',
      author: volumeInfo.authors?.join(', ') || '',
      isbn: isbn,
      year: volumeInfo.publishedDate ? parseInt(volumeInfo.publishedDate.split('-')[0]) : new Date().getFullYear(),
      publisher: volumeInfo.publisher || '',
      language: volumeInfo.language === 'en' ? 'Inglese' : 
                volumeInfo.language === 'es' ? 'Spagnolo' : 
                volumeInfo.language === 'fr' ? 'Francese' : 
                volumeInfo.language === 'de' ? 'Tedesco' : 'Italiano',
      pages: volumeInfo.pageCount?.toString() || '',
      description: volumeInfo.description || '',
      coverImage: volumeInfo.imageLinks?.thumbnail?.replace('http:', 'https:') || '',
      category: '', // Rimuoviamo la categoria
      genre: finalGenre
    });

    setShowApiResults(false);
    setApiSearchTerm('');

    // Poi classifica con AI se disponibile
    if (volumeInfo.title && volumeInfo.description) {
      setIsClassifying(true);
      setClassificationStatus('Classificazione in corso...');
      
      try {
        const classifiedCategory = await classifyBookWithAI(
          volumeInfo.title,
          volumeInfo.description,
          volumeInfo.authors || []
        );
        
        console.log('Categoria classificata dall\'AI:', classifiedCategory); // Debug
        
        if (classifiedCategory && classifiedCategory !== 'Altre' && classifiedCategory !== 'Altro') {
          const mappedGenre = mapAICategoryToGenre(classifiedCategory);
          if (mappedGenre) {
            setFormData(prev => ({
              ...prev,
              genre: mappedGenre
            }));
            setClassificationStatus(`✅ Classificato come: ${classifiedCategory} → ${mappedGenre}`);
          } else {
            // Se la categoria AI non è mappata, usa il fallback per parole chiave
            const fallbackCategory = classifyBookByKeywords(volumeInfo.title, volumeInfo.description || '');
            const fallbackGenre = mapAICategoryToGenre(fallbackCategory);
            if (fallbackGenre) {
              setFormData(prev => ({
                ...prev,
                genre: fallbackGenre
              }));
              setClassificationStatus(`⚠️ Categoria AI non mappata (${classifiedCategory}), usato fallback: ${fallbackCategory} → ${fallbackGenre}`);
            } else {
              setClassificationStatus(`⚠️ Categoria AI non mappata: "${classifiedCategory}"`);
            }
          }
        } else {
          setClassificationStatus('⚠️ Classificazione automatica non disponibile');
        }
      } catch (error) {
        console.warn('Errore nella classificazione AI:', error);
        setClassificationStatus('❌ Errore nella classificazione AI');
      } finally {
        setIsClassifying(false);
        
        // Rimuovi il messaggio dopo 3 secondi
        setTimeout(() => {
          setClassificationStatus('');
        }, 3000);
      }
    }
  };

  // Debounce per la ricerca API
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (apiSearchTerm) {
        searchBooksAPI(apiSearchTerm);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [apiSearchTerm]);

  // Chiudi risultati API quando si clicca fuori
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showApiResults && !(event.target as Element).closest('.api-search-container')) {
        setShowApiResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showApiResults]);

  const filteredBooks = state.books.filter(book =>
    book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.genre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.isbn.includes(searchTerm) ||
    book.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.publisher?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.barcode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.shelfLocation?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Converti i valori string in numeri dove necessario
    const bookData = {
      ...formData,
      pages: formData.pages ? parseInt(formData.pages) : undefined,
      price: formData.price ? parseFloat(formData.price) : undefined,
      value: formData.value ? parseFloat(formData.value) : undefined,
    };
    
    if (editingBook) {
      updateBook({ ...editingBook, ...bookData });
    } else {
      addBook(bookData);
    }
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      title: '',
      author: '',
      isbn: '',
      genre: '',
      year: new Date().getFullYear(),
      available: true,
      category: '',
      deweyCode: '',
      publisher: '',
      language: 'Italiano',
      pages: '',
      price: '',
      value: '',
      condition: 'good',
      barcode: generateBarcode(),
      shelfLocation: '',
      description: '',
      tags: [],
      rating: 0,
      totalRatings: 0,
      coverImage: ''
    });
    setEditingBook(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (book: BookType) => {
    setEditingBook(book);
    setFormData({
      title: book.title,
      author: book.author,
      isbn: book.isbn,
      genre: book.genre,
      year: book.year,
      available: book.available,
      category: book.category || '',
      deweyCode: book.deweyCode || '',
      publisher: book.publisher || '',
      language: book.language || 'Italiano',
      pages: book.pages?.toString() || '',
      price: book.price?.toString() || '',
      value: book.value?.toString() || '',
      condition: book.condition || 'good',
      barcode: book.barcode || '',
      shelfLocation: book.shelfLocation || '',
      description: book.description || '',
      tags: book.tags || [],
      rating: book.rating || 0,
      totalRatings: book.totalRatings || 0,
      coverImage: book.coverImage || ''
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (book: BookType) => {
    setBookToDelete(book);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (bookToDelete) {
      deleteBook(bookToDelete.id);
      setDeleteDialogOpen(false);
      setBookToDelete(null);
    }
  };

  const cancelDelete = () => {
    setDeleteDialogOpen(false);
    setBookToDelete(null);
  };

  // Calcola statistiche libri
  const totalBooks = state.books.length;
  const availableBooks = state.books.filter(book => book.available).length;
  const loanedBooks = totalBooks - availableBooks;

  return (
    <div className="space-y-6">
      {/* Statistiche libri */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-blue-900/50 to-blue-800/50 border-blue-700/50">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-400 mb-1">{totalBooks}</div>
            <div className="text-sm text-blue-300">Libri Totali</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-900/50 to-green-800/50 border-green-700/50">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-400 mb-1">{availableBooks}</div>
            <div className="text-sm text-green-300">Disponibili</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-red-900/50 to-red-800/50 border-red-700/50">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-400 mb-1">{loanedBooks}</div>
            <div className="text-sm text-red-300">In Prestito</div>
          </CardContent>
        </Card>
      </div>


          {/* Header con ricerca locale e aggiungi */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                placeholder="Cerca libri esistenti per titolo, autore, categoria..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-slate-800/50 border-slate-700 text-slate-200 placeholder:text-slate-500"
              />
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Aggiungi Libro
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-slate-800 border-slate-700 text-slate-200 max-w-6xl w-[95vw] h-[90vh] p-0">
            <DialogHeader className="p-6 pb-4 border-b border-slate-600">
              <DialogTitle className="text-xl font-bold text-white">
                {editingBook ? 'Modifica Libro' : 'Aggiungi Nuovo Libro'}
              </DialogTitle>
            </DialogHeader>

            {/* Barra di ricerca API all'interno del form */}
            <div className="px-6 py-4 bg-gradient-to-r from-blue-900/20 to-purple-900/20 border-b border-slate-600">
              <div className="relative api-search-container">
                <div className="flex items-center gap-2 mb-2">
                  <Search className="w-4 h-4 text-blue-400" />
                  <Label className="text-sm font-medium text-blue-400">
                    Ricerca Automatica (opzionale)
                  </Label>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <Input
                    placeholder="Cerca libro per titolo o autore (es: 'Il Signore degli Anelli')..."
                    value={apiSearchTerm}
                    onChange={(e) => setApiSearchTerm(e.target.value)}
                    className="pl-10 bg-slate-700/50 border-slate-600 text-slate-200 placeholder:text-slate-500"
                  />
                  {isLoadingApi && (
                    <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-blue-400 animate-spin" />
                  )}
                  
                  {/* Risultati API */}
                  {showApiResults && apiResults.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-slate-800 border border-slate-600 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
                      {apiResults.map((book, index) => (
                        <div
                          key={index}
                          onClick={() => fillFormWithApiData(book)}
                          className="flex items-center gap-3 p-3 hover:bg-slate-700 cursor-pointer border-b border-slate-700 last:border-b-0"
                        >
                          <img
                            src={book.volumeInfo.imageLinks?.thumbnail?.replace('http:', 'https:') || '/placeholder-book.png'}
                            alt="Copertina"
                            className="w-12 h-16 object-cover rounded border border-slate-600"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium text-white truncate">
                              {book.volumeInfo.title}
                            </h4>
                            <p className="text-xs text-slate-400 truncate">
                              {book.volumeInfo.authors?.join(', ') || 'Autore sconosciuto'}
                            </p>
                            <p className="text-xs text-slate-500 truncate">
                              {book.volumeInfo.publisher} • {book.volumeInfo.publishedDate}
                            </p>
                          </div>
                          <Button
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700 text-xs"
                          >
                            Usa
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Errore API */}
                  {apiError && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-red-900/50 border border-red-700 rounded-lg p-3 z-50">
                      <div className="flex items-center gap-2 text-red-300">
                        <AlertCircle className="w-4 h-4" />
                        <span className="text-sm">{apiError}</span>
                      </div>
                    </div>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Trova un libro per auto-riempire i campi del form
                </p>
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4 h-full overflow-y-auto">
              {/* Prima riga: Informazioni Base + Copertina */}
              <div className="grid grid-cols-4 gap-4">
                {/* Informazioni Base - 3 colonne */}
                <div className="col-span-3 bg-slate-700/30 rounded-lg p-3 border border-slate-600/50">
                  <h3 className="text-base font-semibold text-blue-400 flex items-center gap-2 mb-3">
                    <Book className="w-4 h-4" />
                    Informazioni Base
                  </h3>
                  
                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-2">
                      <Label htmlFor="title" className="text-slate-300 text-sm">Titolo *</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        required
                        className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 h-9"
                        placeholder="Titolo del libro"
                      />
                    </div>
                    <div>
                      <Label htmlFor="author" className="text-slate-300 text-sm">Autore *</Label>
                      <Input
                        id="author"
                        value={formData.author}
                        onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                        required
                        className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 h-9"
                        placeholder="Nome autore"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-3 mt-3">
                    <div>
                      <Label htmlFor="isbn" className="text-slate-300 text-sm">ISBN *</Label>
                      <Input
                        id="isbn"
                        value={formData.isbn}
                        onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                        required
                        className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 h-9"
                        placeholder="978-88-452-3207-2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="year" className="text-slate-300 text-sm">Anno *</Label>
                      <Input
                        id="year"
                        type="number"
                        min="1000"
                        max={new Date().getFullYear() + 1}
                        value={formData.year}
                        onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                        required
                        className="bg-slate-700 border-slate-600 text-white h-9"
                      />
                    </div>
                  </div>
                </div>

                {/* Copertina - 1 colonna */}
                <div className="bg-slate-700/30 rounded-lg p-3 border border-slate-600/50">
                  <h3 className="text-base font-semibold text-purple-400 flex items-center gap-2 mb-3">
                    <Book className="w-4 h-4" />
                    Copertina
                  </h3>
                  
                  <div className="relative">
                    {formData.coverImage ? (
                      <div className="relative group">
                        <img
                          src={formData.coverImage}
                          alt="Copertina libro"
                          className="w-full h-32 object-cover rounded-lg border border-slate-600"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const input = document.createElement('input');
                              input.type = 'file';
                              input.accept = 'image/*';
                              input.onchange = (e) => {
                                const file = (e.target as HTMLInputElement).files?.[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onload = (e) => {
                                    setFormData({ ...formData, coverImage: e.target?.result as string });
                                  };
                                  reader.readAsDataURL(file);
                                }
                              };
                              input.click();
                            }}
                            className="border-slate-600 text-slate-300 hover:bg-slate-600"
                          >
                            <Edit className="w-3 h-3 mr-1" />
                            Cambia
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setFormData({ ...formData, coverImage: '' })}
                            className="border-red-600 text-red-300 hover:bg-red-600"
                          >
                            <Trash2 className="w-3 h-3 mr-1" />
                            Rimuovi
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div
                        onClick={() => {
                          const input = document.createElement('input');
                          input.type = 'file';
                          input.accept = 'image/*';
                          input.onchange = (e) => {
                            const file = (e.target as HTMLInputElement).files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = (e) => {
                                setFormData({ ...formData, coverImage: e.target?.result as string });
                              };
                              reader.readAsDataURL(file);
                            }
                          };
                          input.click();
                        }}
                        className="w-full h-32 border-2 border-dashed border-slate-600 rounded-lg flex items-center justify-center cursor-pointer hover:border-slate-500 transition-colors bg-slate-700/20"
                      >
                        <div className="text-center">
                          <Plus className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                          <p className="text-slate-400 text-sm">Aggiungi copertina</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Seconda riga: Dettagli Avanzati */}
              <div className="bg-slate-700/30 rounded-lg p-3 border border-slate-600/50">
                <h3 className="text-base font-semibold text-green-400 flex items-center gap-2 mb-3">
                  <Tag className="w-4 h-4" />
                  Dettagli Avanzati
                </h3>
                
                <div className="grid grid-cols-6 gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Label htmlFor="genre" className="text-slate-300 text-sm">Genere</Label>
                      {isClassifying && (
                        <div className="flex items-center gap-1">
                          <Loader2 className="w-3 h-3 text-blue-400 animate-spin" />
                          <span className="text-xs text-blue-400">AI</span>
                        </div>
                      )}
                    </div>
                    <Select value={formData.genre} onValueChange={(value) => setFormData({ ...formData, genre: value })}>
                      <SelectTrigger className="bg-slate-700 border-slate-600 text-white h-9">
                        <SelectValue placeholder="Seleziona" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-700 border-slate-600">
                        {GENRES.map(genre => (
                          <SelectItem key={genre} value={genre} className="text-white hover:bg-slate-600">{genre}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {classificationStatus && (
                      <p className="text-xs mt-1 text-slate-400">{classificationStatus}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="deweyCode" className="text-slate-300 text-sm">Codice Dewey</Label>
                    <Input
                      id="deweyCode"
                      value={formData.deweyCode}
                      onChange={(e) => setFormData({ ...formData, deweyCode: e.target.value })}
                      placeholder="853.914"
                      className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 h-9"
                    />
                  </div>
                  <div>
                    <Label htmlFor="language" className="text-slate-300 text-sm">Lingua</Label>
                    <Select value={formData.language} onValueChange={(value) => setFormData({ ...formData, language: value })}>
                      <SelectTrigger className="bg-slate-700 border-slate-600 text-white h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-700 border-slate-600">
                        {LANGUAGES.map(language => (
                          <SelectItem key={language} value={language} className="text-white hover:bg-slate-600">{language}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="pages" className="text-slate-300 text-sm">Pagine</Label>
                    <Input
                      id="pages"
                      type="number"
                      min="1"
                      value={formData.pages}
                      onChange={(e) => setFormData({ ...formData, pages: e.target.value })}
                      className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 h-9"
                      placeholder="350"
                    />
                  </div>
                  <div>
                    <Label htmlFor="publisher" className="text-slate-300 text-sm">Editore</Label>
                    <Input
                      id="publisher"
                      value={formData.publisher}
                      onChange={(e) => setFormData({ ...formData, publisher: e.target.value })}
                      className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 h-9"
                      placeholder="Mondadori"
                    />
                  </div>
                  <div>
                    <Label htmlFor="condition" className="text-slate-300 text-sm">Condizione</Label>
                    <Select value={formData.condition} onValueChange={(value: any) => setFormData({ ...formData, condition: value })}>
                      <SelectTrigger className="bg-slate-700 border-slate-600 text-white h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-700 border-slate-600">
                        {BOOK_CONDITIONS.map(condition => (
                          <SelectItem key={condition.value} value={condition.value} className="text-white hover:bg-slate-600">{condition.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>


              {/* Valore e Posizione */}
              <div className="bg-slate-700/30 rounded-lg p-3 border border-slate-600/50">
                <h3 className="text-base font-semibold text-yellow-400 flex items-center gap-2 mb-3">
                  <DollarSign className="w-4 h-4" />
                  Valore e Posizione
                </h3>
                
                <div className="grid grid-cols-4 gap-3">
                  <div>
                    <Label htmlFor="price" className="text-slate-300 text-sm">Prezzo Acquisto (€)</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 h-9"
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <Label htmlFor="value" className="text-slate-300 text-sm">Valore Attuale (€)</Label>
                    <Input
                      id="value"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.value}
                      onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                      className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 h-9"
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <Label htmlFor="shelfLocation" className="text-slate-300 text-sm">Posizione Scaffale</Label>
                    <Input
                      id="shelfLocation"
                      value={formData.shelfLocation}
                      onChange={(e) => setFormData({ ...formData, shelfLocation: e.target.value })}
                      placeholder="A-15-3"
                      className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 h-9"
                    />
                  </div>
                  <div>
                    <Label htmlFor="barcode" className="text-slate-300 text-sm">Codice a Barre</Label>
                    <div className="flex gap-2">
                      <Input
                        id="barcode"
                        value={formData.barcode}
                        onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                        className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 h-9 flex-1"
                        placeholder="Auto-generato"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setFormData({ ...formData, barcode: generateBarcode() })}
                        className="border-slate-600 text-slate-300 hover:bg-slate-600 h-9 px-2"
                        title="Genera nuovo codice"
                      >
                        <Barcode className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Descrizione */}
              <div className="bg-slate-700/30 rounded-lg p-3 border border-slate-600/50">
                <h3 className="text-base font-semibold text-indigo-400 flex items-center gap-2 mb-3">
                  <Book className="w-4 h-4" />
                  Descrizione e Note
                </h3>
                
                <div>
                  <Label htmlFor="description" className="text-slate-300 text-sm">Descrizione Dettagliata</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Descrizione del libro, riassunto, note particolari..."
                    className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 h-20 resize-none"
                    rows={3}
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-600">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={resetForm}
                  className="border-slate-600 text-slate-300 hover:bg-slate-700 px-4 h-9"
                >
                  Annulla
                </Button>
                <Button 
                  type="submit" 
                  className="bg-blue-600 hover:bg-blue-700 px-6 h-9 font-medium"
                >
                  {editingBook ? 'Aggiorna' : 'Aggiungi'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Lista libri con design moderno */}
      {filteredBooks.length > 0 ? (
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <AnimatePresence>
            {filteredBooks.map((book, index) => (
              <motion.div
                key={book.id}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                transition={{ 
                  duration: 0.3, 
                  delay: index * 0.05,
                  type: "spring",
                  stiffness: 100
                }}
                whileHover={{ 
                  y: -8, 
                  scale: 1.02,
                  transition: { duration: 0.2 }
                }}
                whileTap={{ scale: 0.98 }}
                className="group"
              >
                <Card className="relative overflow-hidden bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-slate-700/50 backdrop-blur-xl hover:border-slate-600/70 transition-all duration-300 shadow-lg hover:shadow-2xl">
                  {/* Gradiente di sfondo animato */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  {/* Copertina del libro */}
                  <div className="relative h-48 overflow-hidden">
                    {book.coverImage ? (
                      <motion.img
                        src={book.coverImage}
                        alt={book.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        whileHover={{ scale: 1.1 }}
                        transition={{ duration: 0.3 }}
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center">
                        <Book className="w-16 h-16 text-slate-500 group-hover:text-slate-400 transition-colors duration-300" />
                      </div>
                    )}
                    
                    {/* Overlay con badge di stato */}
                    <div className="absolute top-3 right-3 flex flex-col gap-2">
                      <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ delay: index * 0.05 + 0.2, type: "spring" }}
                      >
                        <Badge 
                          variant={book.available ? "default" : "destructive"} 
                          className={`text-xs font-medium shadow-lg ${
                            book.available 
                              ? "bg-green-500/90 text-white border-green-400/50" 
                              : "bg-red-500/90 text-white border-red-400/50"
                          }`}
                        >
                          {book.available ? "Disponibile" : "In prestito"}
                        </Badge>
                      </motion.div>
                      
                      <motion.div
                        initial={{ scale: 0, rotate: 180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ delay: index * 0.05 + 0.3, type: "spring" }}
                      >
                        <Badge 
                          variant="outline" 
                          className={`text-xs font-medium shadow-lg backdrop-blur-sm ${getConditionColor(book.condition)} border-current`}
                        >
                          {getConditionLabel(book.condition)}
                        </Badge>
                      </motion.div>
                    </div>

                    {/* Gradiente di overlay per il testo */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>

                  <CardContent className="p-4 space-y-4 relative">
                    {/* Titolo e autore */}
                    <div className="space-y-2">
                      <motion.h3 
                        className="text-lg font-bold text-white line-clamp-2 group-hover:text-blue-300 transition-colors duration-300"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.05 + 0.1 }}
                      >
                        {book.title}
                      </motion.h3>
                      <motion.p 
                        className="text-slate-400 text-sm font-medium"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.05 + 0.15 }}
                      >
                        {book.author}
                      </motion.p>
                      {book.publisher && (
                        <motion.p 
                          className="text-slate-500 text-xs flex items-center gap-1"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: index * 0.05 + 0.2 }}
                        >
                          <Calendar className="w-3 h-3" />
                          {book.publisher} ({book.year})
                        </motion.p>
                      )}
                    </div>

                    {/* Informazioni principali */}
                    <motion.div 
                      className="grid grid-cols-2 gap-3 text-sm"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 + 0.25 }}
                    >
                      <div className="flex items-center gap-2 bg-slate-700/50 rounded-lg p-2">
                        <Tag className="w-4 h-4 text-blue-400 flex-shrink-0" />
                        <span className="text-slate-300 text-xs truncate">{book.genre}</span>
                      </div>
                      <div className="flex items-center gap-2 bg-slate-700/50 rounded-lg p-2">
                        <Book className="w-4 h-4 text-green-400 flex-shrink-0" />
                        <span className="text-slate-300 text-xs truncate">{book.isbn}</span>
                      </div>
                    </motion.div>

                    {/* Posizione e valore */}
                    {(book.shelfLocation || book.value || book.price) && (
                      <motion.div 
                        className="grid grid-cols-2 gap-3 text-sm"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 + 0.3 }}
                      >
                        {book.shelfLocation && (
                          <div className="flex items-center gap-2 bg-slate-700/50 rounded-lg p-2">
                            <MapPin className="w-4 h-4 text-purple-400 flex-shrink-0" />
                            <span className="text-slate-300 text-xs truncate">{book.shelfLocation}</span>
                          </div>
                        )}
                        {(book.value || book.price) && (
                          <div className="flex items-center gap-2 bg-slate-700/50 rounded-lg p-2">
                            <DollarSign className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                            <span className="text-slate-300 text-xs">€{book.value || book.price}</span>
                          </div>
                        )}
                      </motion.div>
                    )}

                    {/* Rating */}
                    {book.rating > 0 && (
                      <motion.div 
                        className="flex items-center gap-2 bg-slate-700/50 rounded-lg p-2"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 + 0.35 }}
                      >
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-yellow-400 text-sm font-medium">
                          {book.rating.toFixed(1)}
                        </span>
                        <span className="text-slate-400 text-xs">({book.totalRatings} voti)</span>
                      </motion.div>
                    )}

                    {/* Tag */}
                    {book.tags && book.tags.length > 0 && (
                      <motion.div 
                        className="flex flex-wrap gap-1"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.05 + 0.4 }}
                      >
                        {book.tags.slice(0, 3).map((tag, tagIndex) => (
                          <Badge 
                            key={tagIndex} 
                            variant="outline" 
                            className="text-xs bg-blue-500/20 border-blue-400/50 text-blue-300 hover:bg-blue-500/30 transition-colors duration-200"
                          >
                            {tag}
                          </Badge>
                        ))}
                        {book.tags.length > 3 && (
                          <Badge variant="outline" className="text-xs bg-slate-600/50 border-slate-500/50 text-slate-300">
                            +{book.tags.length - 3}
                          </Badge>
                        )}
                      </motion.div>
                    )}

                    {/* Azioni */}
                    <motion.div 
                      className="flex gap-2 pt-2"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 + 0.45 }}
                    >
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(book)}
                        className="flex-1 border-blue-500/50 text-blue-300 hover:bg-blue-500/20 hover:border-blue-400/70 transition-all duration-200 group/btn"
                      >
                        <Edit className="w-4 h-4 mr-2 group-hover/btn:rotate-12 transition-transform duration-200" />
                        Modifica
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(book)}
                        className="border-red-500/50 text-red-300 hover:bg-red-500/20 hover:border-red-400/70 transition-all duration-200 group/btn"
                      >
                        <Trash2 className="w-4 h-4 group-hover/btn:rotate-12 transition-transform duration-200" />
                      </Button>
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      ) : (
        <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
          <CardContent className="p-8 text-center">
            <Book className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-200 mb-2">
              {searchTerm ? 'Nessun libro trovato' : 'Nessun libro nel catalogo'}
            </h3>
            <p className="text-slate-400 mb-4">
              {searchTerm 
                ? 'Prova a modificare i termini di ricerca'
                : 'Inizia aggiungendo il primo libro al catalogo'
              }
            </p>
            {!searchTerm && (
              <Button 
                onClick={() => setIsDialogOpen(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Aggiungi Primo Libro
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Dialog di conferma eliminazione */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="bg-slate-800 border-slate-700 text-slate-200 max-w-md overflow-hidden">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.2, type: "spring", stiffness: 300 }}
          >
            <DialogHeader className="text-center">
              <motion.div 
                className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/20"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
              >
                <Trash2 className="h-8 w-8 text-red-400" />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <DialogTitle className="text-xl font-bold text-white">
                  Conferma Eliminazione
                </DialogTitle>
              </motion.div>
            </DialogHeader>
          
            <motion.div 
              className="py-4 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <motion.div 
                className="mb-4"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
              >
                {bookToDelete?.coverImage ? (
                  <img
                    src={bookToDelete.coverImage}
                    alt={bookToDelete.title}
                    className="mx-auto h-24 w-16 object-cover rounded-lg border border-slate-600 shadow-lg"
                  />
                ) : (
                  <div className="mx-auto h-24 w-16 bg-gradient-to-br from-slate-700 to-slate-800 rounded-lg border border-slate-600 flex items-center justify-center shadow-lg">
                    <Book className="w-8 h-8 text-slate-500" />
                  </div>
                )}
              </motion.div>
              
              <motion.p 
                className="text-slate-300 mb-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                Sei sicuro di voler eliminare questo libro?
              </motion.p>
              
              <motion.div 
                className="bg-slate-700/50 rounded-lg p-3 mb-4 border border-slate-600/50"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <h4 className="font-semibold text-white text-lg mb-1">
                  {bookToDelete?.title}
                </h4>
                <p className="text-slate-400 text-sm">
                  di {bookToDelete?.author}
                </p>
                {bookToDelete?.publisher && (
                  <p className="text-slate-500 text-xs mt-1">
                    {bookToDelete.publisher} ({bookToDelete.year})
                  </p>
                )}
              </motion.div>
              
              <motion.div 
                className="bg-red-900/20 border border-red-700/50 rounded-lg p-3"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                <div className="flex items-center gap-2 text-red-300">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.8, type: "spring", stiffness: 200 }}
                  >
                    <AlertCircle className="w-4 h-4" />
                  </motion.div>
                  <span className="text-sm font-medium">
                    Questa azione non può essere annullata
                  </span>
                </div>
              </motion.div>
            </motion.div>
          
            <motion.div 
              className="flex gap-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
            >
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1"
              >
                <Button
                  variant="outline"
                  onClick={cancelDelete}
                  className="w-full border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white transition-all duration-200 group"
                >
                  <X className="w-4 h-4 mr-2 group-hover:rotate-90 transition-transform duration-200" />
                  Annulla
                </Button>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1"
              >
                <Button
                  variant="destructive"
                  onClick={confirmDelete}
                  className="w-full bg-red-600 hover:bg-red-700 transition-all duration-200 group"
                >
                  <Trash2 className="w-4 h-4 mr-2 group-hover:rotate-12 transition-transform duration-200" />
                  Elimina
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>
        </DialogContent>
      </Dialog>

    </div>
  );
};

export default BooksManager;
