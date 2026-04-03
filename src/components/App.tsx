'use client';
import { useState, useCallback, useEffect } from 'react';
import { useStore } from '@/lib/store';
import Header from './Header';
import PublicPage from './PublicPage';
import SubmitPage from './SubmitPage';
import AdminPage from './AdminPage';
import LoginPage from './LoginPage';
import { Toast } from './ui';

type Page = 'public' | 'submit' | 'admin' | 'login';

interface ToastState {
  message: string;
  type: 'success' | 'error' | 'info';
  id: number;
}

export default function App() {
  const { adminLoggedIn, fetchAll, loading } = useStore();
  const [page, setPage] = useState<Page>('public');
  const [toast, setToast] = useState<ToastState | null>(null);

  useEffect(() => {
    fetchAll();
  }, []);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type, id: Date.now() });
  }, []);

  const navigate = (target: string) => {
    if (target === 'admin' && !adminLoggedIn) {
      setPage('login');
    } else {
      setPage(target as Page);
    }
  };

  const activePage = page === 'login' ? 'admin' : page;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#F5F0E8' }}>
        <div className="text-center">
          <div className="font-serif text-[22px] text-gold mb-2">TÜRKİYE SİNEMA VE MEDYA VAKFI</div>
          <div className="text-[13px] text-muted">Yükleniyor…</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: '#F5F0E8' }}>
      <Header activePage={activePage} onNav={navigate} />
      <main className="max-w-[1160px] mx-auto px-6 py-7">
        {page === 'public' && <PublicPage />}
        {page === 'submit' && <SubmitPage onToast={showToast} />}
        {page === 'login' && <LoginPage onSuccess={() => setPage('admin')} onToast={showToast} />}
        {page === 'admin' && adminLoggedIn && <AdminPage onToast={showToast} />}
        {page === 'admin' && !adminLoggedIn && <LoginPage onSuccess={() => setPage('admin')} onToast={showToast} />}
      </main>
      {toast && <Toast key={toast.id} message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
