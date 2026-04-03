'use client';
import { useStore } from '@/lib/store';
import { formatMoney } from '@/lib/utils';

export default function StatsRow({ isAdmin = false }: { isAdmin?: boolean }) {
  const { members, donations, profiles, getPendingCount } = useStore();
  const approvedCount = Object.keys(donations).filter((k) => donations[Number(k)]?.amount > 0).length;
  const total = Object.values(donations).reduce((s, d) => s + (d?.amount || 0), 0);
  const profileCount = Object.keys(profiles).length;
  const pendingCount = getPendingCount();

  const cards = [
    { label: 'Toplam Üye', value: members.length, cls: 'gold-top' },
    { label: 'Bağış Yapan', value: approvedCount, cls: 'green-top' },
    { label: 'Toplam Bağış', value: formatMoney(total), cls: 'gold-top', gold: true },
    isAdmin
      ? { label: 'Bekleyen İşlem', value: pendingCount, cls: 'red-top' }
      : { label: 'Profil Tamamlayan', value: profileCount, cls: 'gold-top' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 mb-6">
      {cards.map((c) => (
        <div key={c.label} className={`${c.cls} bg-white border border-[rgba(26,22,18,0.12)] rounded-md p-3.5 relative overflow-hidden`}>
          <div className="text-[10px] font-medium uppercase tracking-[0.08em] text-muted mb-1">{c.label}</div>
          <div className={`font-serif text-[24px] ${c.gold ? 'text-gold' : 'text-ink'}`}>{c.value}</div>
        </div>
      ))}
    </div>
  );
}
