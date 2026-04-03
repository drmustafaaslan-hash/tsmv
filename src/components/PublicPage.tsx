'use client';
import { useState } from 'react';
import { useStore } from '@/lib/store';
import { formatMoney, formatDate, openBase64PDF, initials } from '@/lib/utils';
import { Badge, Avatar, Modal, Btn } from './ui';
import StatsRow from './StatsRow';

export default function PublicPage() {
  const { members, profiles, donations } = useStore();
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [selectedMemberNo, setSelectedMemberNo] = useState<number | null>(null);

  const filtered = members.filter((m) => {
    const q = search.toLowerCase();
    const match = m.isim.toLowerCase().includes(q) || m.unvan.toLowerCase().includes(q);
    const has = donations[m.no]?.amount > 0;
    const hasProf = profiles[m.no]?.bio || profiles[m.no]?.photo;
    if (filter === 'paid') return match && has;
    if (filter === 'waiting') return match && !has;
    if (filter === 'bio') return match && hasProf;
    return match;
  });

  const selectedMember = selectedMemberNo ? members.find((m) => m.no === selectedMemberNo) : null;
  const selectedProfile = selectedMemberNo ? profiles[selectedMemberNo] : null;
  const selectedDonation = selectedMemberNo ? donations[selectedMemberNo] : null;

  return (
    <div>
      <StatsRow />

      {/* Ornament */}
      <div className="flex items-center gap-2.5 mb-5">
        <div className="flex-1 h-px bg-[rgba(26,22,18,0.28)]" />
        <div className="w-2 h-2 rotate-45 flex-shrink-0" style={{ background: '#B8860B' }} />
        <div className="flex-1 h-px bg-[rgba(26,22,18,0.28)]" />
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
        <div>
          <h1 className="font-serif text-[22px] font-semibold text-ink">Kurucu Mütevelli Üyeleri</h1>
          <p className="text-[12px] text-muted">Onaylanan bağışlar ve profiller gösterilmektedir.</p>
        </div>
        <div className="flex gap-1 border border-[rgba(26,22,18,0.28)] rounded overflow-hidden">
          {(['grid', 'list'] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-3 py-1.5 text-[15px] transition-colors ${view === v ? 'bg-ink text-cream' : 'bg-cream text-muted hover:bg-gold-pale'}`}
            >
              {v === 'grid' ? '⊞' : '☰'}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-2 mb-4 flex-wrap">
        <input
          className="flex-1 min-w-[180px] px-3 py-2 border border-[rgba(26,22,18,0.28)] rounded text-[13px] bg-cream text-ink outline-none focus:border-gold"
          placeholder="İsim veya kurum ara…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="px-3 py-2 border border-[rgba(26,22,18,0.28)] rounded text-[13px] bg-cream text-ink outline-none"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="all">Tümü</option>
          <option value="paid">Bağış yapanlar</option>
          <option value="waiting">Henüz bildirilmemiş</option>
          <option value="bio">Profili olanlar</option>
        </select>
      </div>

      {/* GRID VIEW */}
      {view === 'grid' && (
        <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))' }}>
          {filtered.length === 0 && (
            <div className="col-span-full text-center py-10 text-muted">
              <div className="text-3xl mb-2">🔍</div>Sonuç bulunamadı
            </div>
          )}
          {filtered.map((m) => {
            const d = donations[m.no];
            const has = d?.amount > 0;
            const prof = profiles[m.no];
            return (
              <div key={m.no} className="member-card bg-white border border-[rgba(26,22,18,0.12)] rounded-xl overflow-hidden shadow-sm cursor-pointer" onClick={() => setSelectedMemberNo(m.no)}>
                {/* Photo area */}
                <div className="w-full h-[155px] bg-cream relative flex items-center justify-center overflow-hidden">
                  {prof?.photo
                    ? <img src={prof.photo} alt={m.isim} className="w-full h-full object-cover" />
                    : <div className="flex flex-col items-center gap-1 text-muted">
                        <span className="font-serif text-[38px] font-semibold text-gold">{initials(m.isim)}</span>
                        <small className="text-[9px] uppercase tracking-wider">Fotoğraf yok</small>
                      </div>
                  }
                  <div className="absolute top-2 right-2">
                    <Badge variant={has ? 'paid' : 'waiting'}>{has ? '✓ Bağış' : 'Bekliyor'}</Badge>
                  </div>
                </div>
                {/* Body */}
                <div className="p-3.5">
                  <div className="font-medium text-[13px] text-ink leading-tight mb-0.5">{m.isim}</div>
                  <div className="text-[11px] text-muted mb-2 leading-snug line-clamp-2">{m.unvan}</div>
                  {prof?.bio
                    ? <div className="text-[12px] text-muted leading-relaxed line-clamp-3">{prof.bio}</div>
                    : <div className="text-[12px] text-[rgba(26,22,18,0.25)] italic">Henüz biyografi eklenmemiş</div>
                  }
                </div>
                <div className="px-3.5 py-2.5 border-t border-[rgba(26,22,18,0.1)] flex items-center justify-between">
                  <span className={`font-mono text-[13px] font-medium ${has ? 'text-[#1A5C3A]' : 'text-muted'}`}>
                    {has ? formatMoney(d.amount) : '—'}
                  </span>
                  <span className="text-[11px] text-muted">Detay →</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* LIST VIEW */}
      {view === 'list' && (
        <div className="bg-white border border-[rgba(26,22,18,0.12)] rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-[13px]">
              <thead>
                <tr className="border-b border-[rgba(26,22,18,0.28)]" style={{ background: '#F5F0E8' }}>
                  {['', 'No', 'İsim', 'Unvan / Kurum', 'Telefon', 'Bağış (₺)', 'Durum'].map((h, i) => (
                    <th key={i} className={`px-3 py-2.5 text-left text-[10px] font-medium uppercase tracking-[0.1em] text-muted whitespace-nowrap ${i >= 5 ? 'text-right' : ''}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr><td colSpan={7} className="text-center py-10 text-muted">Sonuç bulunamadı</td></tr>
                )}
                {filtered.map((m) => {
                  const d = donations[m.no];
                  const has = d?.amount > 0;
                  const prof = profiles[m.no];
                  return (
                    <tr key={m.no} className="tbl-row border-b border-[rgba(26,22,18,0.08)] cursor-pointer" onClick={() => setSelectedMemberNo(m.no)}>
                      <td className="px-3 py-2.5 w-10"><Avatar photo={prof?.photo} name={m.isim} size="md" /></td>
                      <td className="px-3 py-2.5 text-muted font-mono text-[11px]">{m.no}</td>
                      <td className="px-3 py-2.5 font-medium">{m.isim}</td>
                      <td className="px-3 py-2.5 text-muted text-[12px] max-w-[200px]">{m.unvan}</td>
                      <td className="px-3 py-2.5 font-mono text-[11px] text-muted whitespace-nowrap">{m.tel}</td>
                      <td className={`px-3 py-2.5 font-mono font-medium text-right ${has ? 'text-[#1A5C3A]' : 'text-muted'}`}>{has ? formatMoney(d.amount) : '—'}</td>
                      <td className="px-3 py-2.5 text-right"><Badge variant={has ? 'paid' : 'waiting'}>{has ? '✓ Onaylı' : 'Bekliyor'}</Badge></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* PROFILE MODAL */}
      <Modal open={!!selectedMember} onClose={() => setSelectedMemberNo(null)} title="" maxWidth="max-w-[500px]">
        {selectedMember && (
          <>
            <div className="flex gap-4 mb-5 items-start">
              <Avatar photo={selectedProfile?.photo} name={selectedMember.isim} size="xl" />
              <div>
                <h2 className="font-serif text-[20px] mb-1">{selectedMember.isim}</h2>
                <p className="text-[12px] text-muted leading-snug">{selectedMember.unvan}</p>
                <p className="text-[12px] text-muted mt-1 font-mono">{selectedMember.tel}</p>
              </div>
            </div>

            {selectedProfile?.bio
              ? <div className="text-[13px] text-ink leading-relaxed bg-cream rounded-lg p-3.5">{selectedProfile.bio}</div>
              : <div className="text-[12px] text-muted italic py-2">Biyografi henüz eklenmemiş.</div>
            }

            {selectedProfile?.social && (
              <div className="mt-2.5">
                <a href={selectedProfile.social} target="_blank" rel="noreferrer" className="text-[12px] text-gold hover:underline">
                  🔗 {selectedProfile.social}
                </a>
              </div>
            )}

            <div className="h-px bg-[rgba(26,22,18,0.1)] my-4" />

            <div className="flex items-center justify-between">
              <span className="text-[12px] text-muted">Bağış durumu</span>
              <div className="flex items-center gap-2">
                <Badge variant={(selectedDonation?.amount ?? 0) > 0 ? 'paid' : 'waiting'}>
                  {(selectedDonation?.amount ?? 0) > 0 ? '✓ Onaylı' : 'Bekliyor'}
                </Badge>
                {(selectedDonation?.amount ?? 0) > 0 && (
                  <span className="font-mono font-medium text-[#1A5C3A] text-[14px]">{formatMoney(selectedDonation!.amount)}</span>
                )}
              </div>
            </div>

            {selectedDonation?.date && (
              <div className="mt-2 text-[12px] text-muted">Tarih: {formatDate(selectedDonation.date)}</div>
            )}

            {selectedDonation?.dekontData && (
              <div className="mt-3">
                {selectedDonation.dekontType === 'application/pdf'
                  ? <Btn size="sm" onClick={() => openBase64PDF(selectedDonation.dekontData!)}>📄 Dekontu Görüntüle</Btn>
                  : <img src={selectedDonation.dekontData} alt="Dekont" className="max-h-40 rounded border border-[rgba(26,22,18,0.12)] cursor-pointer" onClick={() => window.open(selectedDonation.dekontData!)} />
                }
              </div>
            )}
          </>
        )}
      </Modal>
    </div>
  );
}
