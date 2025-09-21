import { useEffect, useRef } from 'react';
import { useLibrary } from '../lib/context';

export function useAutoBackup() {
  const { state, addNotification } = useLibrary();
  const lastBackupRef = useRef<Date | null>(null);

  useEffect(() => {
    const now = new Date();
    const shouldBackup = !lastBackupRef.current || 
      (now.getTime() - lastBackupRef.current.getTime()) > 24 * 60 * 60 * 1000; // 24 ore

    if (shouldBackup && (state.books.length > 0 || state.users.length > 0 || state.loans.length > 0)) {
      // Simula backup automatico
      setTimeout(() => {
        lastBackupRef.current = now;
        addNotification({
          type: 'info',
          title: 'Backup Automatico',
          message: 'I dati sono stati salvati automaticamente'
        });
      }, 2000);
    }
  }, [state.books.length, state.users.length, state.loans.length, addNotification]);

  const triggerManualBackup = () => {
    lastBackupRef.current = new Date();
    addNotification({
      type: 'success',
      title: 'Backup Manuale',
      message: 'Backup eseguito con successo'
    });
  };

  return { triggerManualBackup };
}
