import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LibraryProvider } from './lib/context';
import { Toaster } from 'sonner';
import BibliotecaApp from './components/BibliotecaApp';
import './index.css';

function App() {
  return (
    <LibraryProvider>
      <Router>
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
          <Routes>
            <Route path="/" element={<BibliotecaApp />} />
            <Route path="/biblioteca" element={<BibliotecaApp />} />
          </Routes>
          <Toaster position="top-right" richColors />
        </div>
      </Router>
    </LibraryProvider>
  );
}

export default App;
