# 📚 Sistema di Gestione Biblioteca

[![React](https://img.shields.io/badge/React-18-blue?style=for-the-badge&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=for-the-badge&logo=vite)](https://vitejs.dev/)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

Un sistema completo e moderno per la gestione di una biblioteca sviluppato con React, TypeScript e Tailwind CSS. Include funzionalità avanzate come ricerca automatica tramite API, classificazione AI, dashboard interattive e design responsive.

## ✨ Caratteristiche

- **📚 Gestione Libri Avanzata**: Aggiungi, modifica ed elimina libri con informazioni complete (ISBN, genere, editore, condizione, copertina)
- **🔍 Ricerca Automatica API**: Integrazione con Google Books API per auto-riempire i dati dei libri
- **🤖 Classificazione AI**: Classificazione automatica del genere tramite AI (Cohere API)
- **👥 Gestione Utenti**: Registra e gestisci gli utenti della biblioteca con tessera
- **📋 Sistema Prestiti**: Gestisci prestiti e restituzioni con controlli automatici e scadenze
- **📊 Dashboard Interattiva**: Visualizza statistiche avanzate con grafici e trend
- **🔔 Centro Notifiche**: Sistema di notifiche completo con filtri e gestione
- **🎨 Design Moderno**: Interfaccia responsive con animazioni fluide (Framer Motion)
- **💾 Persistenza Dati**: Salvataggio automatico nel localStorage con backup
- **📱 Responsive Design**: Perfettamente funzionante su desktop, tablet e mobile

## 🎬 Demo Live

🚀 **Prova il sistema online**: [Demo Live](https://biblioteca-management-demo.vercel.app) | 📚 **Repository GitHub**: [biblioteca-management](https://github.com/TUO-USERNAME/biblioteca-management)

### 🖼️ Screenshots

<table>
  <tr>
    <td width="33%">
      <img src="docs/dashboard-main.png" alt="Dashboard" width="100%">
      <p align="center"><b>Dashboard Principale</b></p>
    </td>
    <td width="33%">
      <img src="docs/books-list.png" alt="Gestione Libri" width="100%">
      <p align="center"><b>Gestione Libri</b></p>
    </td>
    <td width="33%">
      <img src="docs/loans-list.png" alt="Gestione Prestiti" width="100%">
      <p align="center"><b>Gestione Prestiti</b></p>
    </td>
  </tr>
</table>

## 🚀 Tecnologie Utilizzate

### **Frontend Core**
- **React 18** - Framework frontend con hooks moderni
- **TypeScript** - Tipizzazione statica per codice robusto
- **Vite** - Build tool veloce e moderno

### **Styling & UI**
- **Tailwind CSS** - Framework CSS utility-first
- **Framer Motion** - Animazioni fluide e moderne
- **Radix UI** - Componenti UI accessibili e headless
- **Lucide React** - Icone moderne e coerenti

### **State Management & Data**
- **React Context API** - Gestione stato globale
- **LocalStorage** - Persistenza dati lato client
- **Google Books API** - Integrazione per ricerca automatica libri
- **Cohere AI API** - Classificazione automatica generi

### **Charts & Visualizations**
- **Recharts** - Grafici interattivi per dashboard
- **Sonner** - Sistema notifiche toast moderne

## 🚀 Getting Started

### Prerequisiti
- **Node.js** (versione 16 o superiore)
- **npm** o **yarn** come package manager

### 📦 Installazione Rapida

1. **Clona il repository**
   ```bash
   git clone https://github.com/ThomasCurcuA/biblioteca-management.git
   cd biblioteca-management
   ```

2. **Installa le dipendenze**
   ```bash
   npm install
   # oppure
   yarn install
   ```

3. **Avvia il server di sviluppo**
   ```bash
   npm run dev
   # oppure
   yarn dev
   ```

4. **Apri il browser**
   ```
   http://localhost:3000
   ```

### 🎯 Prima Configurazione

Il sistema viene inizializzato automaticamente con dati di esempio:
- **3 libri** di esempio con informazioni complete
- **2 utenti** registrati
- **1 prestito** attivo
- **Notifica di benvenuto**

### 🔧 Configurazione API (Opzionale)

Per utilizzare la ricerca automatica libri e classificazione AI:

1. **Google Books API** (gratuita):
   - Non richiede API key per uso base
   - Funziona immediatamente

2. **Cohere AI API** (per classificazione generi):
   - Registrati su [Cohere](https://cohere.ai/)
   - Aggiungi la tua API key nel codice (opzionale)
   - Funziona anche senza API key (usa fallback)

### 🎨 Personalizzazione

- **Tema**: Modifica i colori in `src/index.css`
- **Componenti UI**: Personalizza i componenti in `src/components/ui/`
- **Dati**: Modifica i dati di esempio in `src/lib/storage.ts`

## 🏗️ Script Disponibili

- `npm run dev` - Avvia il server di sviluppo
- `npm run build` - Crea la build di produzione
- `npm run preview` - Anteprima della build di produzione
- `npm run lint` - Esegue il linting del codice
- `npm run type-check` - Controlla i tipi TypeScript

## 📁 Struttura del Progetto

```
biblioteca-management/
├── src/
│   ├── components/          # Componenti React
│   │   ├── ui/             # Componenti UI riutilizzabili
│   │   ├── Dashboard.tsx   # Dashboard principale
│   │   ├── BooksManager.tsx # Gestione libri
│   │   ├── UsersManager.tsx # Gestione utenti
│   │   └── LoansManager.tsx # Gestione prestiti
│   ├── lib/                # Logica e utilità
│   │   ├── storage.ts      # Gestione dati e localStorage
│   │   ├── context.tsx     # Context API per stato globale
│   │   └── utils.ts        # Funzioni di utilità
│   ├── App.tsx             # Componente principale
│   └── main.tsx            # Entry point
├── public/                 # File statici
├── package.json            # Dipendenze e script
└── README.md              # Documentazione
```

## 🎯 Funzionalità Principali

### 📖 Gestione Libri Avanzata
- ✅ **Ricerca Automatica**: Integrazione con Google Books API per auto-riempire i dati
- ✅ **Classificazione AI**: Classificazione automatica del genere tramite AI
- ✅ **Informazioni Complete**: ISBN, editore, condizione, copertina, posizione scaffale
- ✅ **Upload Copertine**: Caricamento e anteprima immagini copertina
- ✅ **Gestione Tag**: Sistema di tag personalizzati per categorizzazione
- ✅ **Valutazioni**: Sistema di rating e recensioni
- ✅ **Ricerca Avanzata**: Filtri multipli per titolo, autore, genere, editore

### 👥 Gestione Utenti
- ✅ **Registrazione Completa**: Dati anagrafici, email, tessera bibliotecaria
- ✅ **Ricerca Utenti**: Filtri per nome, cognome, email, tessera
- ✅ **Storico Prestiti**: Visualizzazione completa dei prestiti per utente
- ✅ **Gestione Profili**: Modifica e aggiornamento dati utenti

### 📋 Sistema Prestiti Intelligente
- ✅ **Controlli Automatici**: Validazione disponibilità libri
- ✅ **Gestione Scadenze**: Calcolo automatico date scadenza
- ✅ **Notifiche Scadenza**: Alert per prestiti in scadenza
- ✅ **Stato Prestiti**: Tracking completo (attivo, restituito, scaduto)
- ✅ **Storico Completo**: Cronologia completa prestiti

### 📊 Dashboard Interattiva
- ✅ **Statistiche Real-time**: Contatori aggiornati in tempo reale
- ✅ **Grafici Dinamici**: Charts interattivi con Recharts
- ✅ **Trend Analysis**: Analisi trend prestiti mensili
- ✅ **Distribuzione Generi**: Visualizzazione composizione collezione
- ✅ **Libri Popolari**: Ranking libri più votati
- ✅ **Attività Recente**: Log delle ultime operazioni

### 🔔 Sistema Notifiche
- ✅ **Centro Notifiche**: Gestione centralizzata messaggi
- ✅ **Filtri Avanzati**: Visualizzazione per tipo e stato
- ✅ **Notifiche Sistema**: Alert automatici per operazioni
- ✅ **Gestione Lettura**: Marcatura come letto/non letto

## 🔧 Configurazione

Il sistema utilizza il localStorage per la persistenza dei dati. I dati vengono salvati automaticamente ad ogni modifica.

### Dati di Esempio
Il sistema include dati di esempio per testare le funzionalità:
- 3 libri di esempio
- 2 utenti di esempio  
- 1 prestito di esempio

## 🎨 Personalizzazione

### Temi e Stili
Il sistema utilizza Tailwind CSS con un tema scuro predefinito. Puoi personalizzare i colori modificando le variabili CSS in `src/index.css`.

### Componenti UI
I componenti UI sono basati su Radix UI e possono essere facilmente personalizzati modificando i file in `src/components/ui/`.

## 📱 Responsive Design

Il sistema è completamente responsive e funziona su:
- Desktop (1024px+)
- Tablet (768px - 1023px)
- Mobile (320px - 767px)

## 🚀 Deploy

### Build di Produzione
```bash
npm run build
```

I file di build saranno generati nella cartella `dist/`.

### Deploy su Vercel
1. Collega il repository a Vercel
2. Configura il build command: `npm run build`
3. Configura l'output directory: `dist`
4. Deploy automatico ad ogni push

### Deploy su Netlify
1. Collega il repository a Netlify
2. Configura il build command: `npm run build`
3. Configura la publish directory: `dist`
4. Deploy automatico ad ogni push

## 🤝 Contribuire

1. Fork del repository
2. Crea un branch per la feature (`git checkout -b feature/AmazingFeature`)
3. Commit delle modifiche (`git commit -m 'Add some AmazingFeature'`)
4. Push al branch (`git push origin feature/AmazingFeature`)
5. Apri una Pull Request

## 📄 Licenza

Questo progetto è distribuito sotto la licenza MIT. Vedi il file `LICENSE` per maggiori informazioni.

## 🎯 Roadmap Futura

### 🚀 Features Pianificate
- [ ] **Sistema di Backup**: Backup automatico su cloud
- [ ] **Multi-lingua**: Supporto per più lingue (EN, FR, DE)
- [ ] **Sistema di Permessi**: Ruoli utente (Admin, Bibliotecario, Utente)
- [ ] **API REST**: Backend API per integrazioni esterne
- [ ] **Mobile App**: App mobile React Native
- [ ] **Sistema di Prenotazioni**: Prenotazione libri in prestito
- [ ] **Integrazione QR**: Codici QR per libri e utenti
- [ ] **Report Avanzati**: Generazione report PDF/Excel

### 🔧 Miglioramenti Tecnici
- [ ] **Database**: Migrazione da localStorage a database
- [ ] **Testing**: Suite di test completa (Jest, React Testing Library)
- [ ] **PWA**: Progressive Web App con offline support
- [ ] **Performance**: Ottimizzazioni rendering e bundle size
- [ ] **Accessibility**: Miglioramenti accessibilità WCAG

## 🤝 Contribuire

Contributi, bug report e feature requests sono benvenuti! Leggi il [CONTRIBUTING.md](CONTRIBUTING.md) per iniziare.

## 📊 Statistiche Progetto

![GitHub stars](https://img.shields.io/github/stars/ThomasCurcuA/biblioteca-management?style=social)
![GitHub forks](https://img.shields.io/github/forks/ThomasCurcuA/biblioteca-management?style=social)
![GitHub issues](https://img.shields.io/github/issues/ThomasCurcuA/biblioteca-management)
![GitHub pull requests](https://img.shields.io/github/issues-pr/ThomasCurcuA/biblioteca-management)

## 👨‍💻 Autore

**Thomas Curcu**
- 🐙 GitHub: [@ThomasCurcuA](https://github.com/ThomasCurcuA)
- 🌐 Portfolio: [thomascurcu.dev](https://thomascurcu.dev)
- 💼 LinkedIn: [Thomas Curcu](https://linkedin.com/in/thomas-curcu)
- 📧 Email: [thomas.curcu@email.com](mailto:thomas.curcu@email.com)

## 🙏 Ringraziamenti

- [React](https://reactjs.org/) - Framework JavaScript per UI moderne
- [TypeScript](https://www.typescriptlang.org/) - Superset di JavaScript con tipizzazione
- [Tailwind CSS](https://tailwindcss.com/) - Framework CSS utility-first
- [Vite](https://vitejs.dev/) - Build tool veloce e moderno
- [Framer Motion](https://www.framer.com/motion/) - Libreria animazioni React
- [Radix UI](https://www.radix-ui.com/) - Componenti UI accessibili e headless
- [Lucide](https://lucide.dev/) - Icone moderne e coerenti
- [Recharts](https://recharts.org/) - Libreria grafici per React
- [Sonner](https://sonner.emilkowal.ski/) - Sistema notifiche toast elegante

## 📄 Licenza

Questo progetto è distribuito sotto la licenza MIT. Vedi il file [LICENSE](LICENSE) per maggiori informazioni.

---

<div align="center">
  <p>⭐ <strong>Se ti piace questo progetto, lascia una stella!</strong> ⭐</p>
  <p>Fatto con ❤️ da <a href="https://github.com/ThomasCurcuA">Thomas Curcu</a></p>
</div>
