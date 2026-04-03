'use client';
import { useStore } from '@/lib/store';

interface HeaderProps {
  activePage: string;
  onNav: (page: string) => void;
}

export default function Header({ activePage, onNav }: HeaderProps) {
  const { settings, adminLoggedIn, getPendingCount } = useStore();
  const pendingCount = getPendingCount();

  const navItems = [
    { id: 'public', label: 'Genel Tablo' },
    { id: 'submit', label: 'Bilgi & Bağış Güncelle' },
    { id: adminLoggedIn ? 'admin' : 'login', label: adminLoggedIn ? `Yönetim${pendingCount > 0 ? ` (${pendingCount})` : ''}` : 'Yönetim Paneli' },
  ];

  return (
    <header className="sticky top-0 z-40" style={{ background: '#1A1612', borderBottom: '2px solid #B8860B' }}>
      <div className="max-w-[1160px] mx-auto flex items-center justify-between gap-3 px-6 py-3 flex-wrap">
        <div className="font-serif text-[13px] leading-tight" style={{ color: '#F5F0E8' }}>
          <span style={{ color: '#D4A520' }}>{settings.headerTitle}</span>
          <br />
          <span className="text-[11px] opacity-70">{settings.subtitle}</span>
        </div>
        <nav className="flex gap-1.5 flex-wrap">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onNav(item.id)}
              className={`px-3.5 py-1.5 rounded text-[12px] border transition-all duration-150 font-sans ${
                activePage === item.id
                  ? 'bg-gold border-gold text-ink font-medium'
                  : 'bg-transparent text-cream border-[rgba(245,240,232,0.22)] hover:border-gold hover:text-gold-light'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
}
