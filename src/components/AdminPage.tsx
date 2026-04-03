'use client';
import { useState } from 'react';
import { useStore } from '@/lib/store';
import { formatMoney, formatDate, openBase64PDF, exportMembersCSV } from '@/lib/utils';
import { Badge, Avatar, Btn, Modal, Field, Input, Select, Textarea, FileDrop, ConfirmDialog } from './ui';
import StatsRow from './StatsRow';
import type { Member, ApprovedDonation } from '@/types';

type AdminTab = 'pending' | 'members' | 'settings';

export default function AdminPage({ onToast }: { onToast: (m: string, t: 'success' | 'error') => void }) {
  const {
    members, profiles, donations, pendingProfiles, pendingDonations, settings,
    approveProfile, rejectProfile, approveDonation, rejectDonation,
    addMember, updateMember, deleteMember,
    adminSetDonation, adminDeleteDonation,
    updateSettings, logout,
  } = useStore();

  const [tab, setTab] = useState<AdminTab>('pending');
  const [adminSearch, setAdminSearch] = useState('');
  const [adminFilter, setAdminFilter] = useState('all');

  const [memberModal, setMemberModal] = useState<'add' | 'edit' | null>(null);
  const [editMember, setEditMember] = useState<Member | null>(null);
  const [mForm, setMForm] = useState({ isim: '', unvan: '', tel: '' });

  const [donEditNo, setDonEditNo] = useState<number | null>(null);
  const [donForm, setDonForm] = useState<ApprovedDonation>({ amount: 0, date: '', note: '', dekontData: null, dekontName: null, dekontType: null });

  const [profViewNo, setProfViewNo] = useState<number | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ type: 'member' | 'donation'; no: number } | null>(null);
  const [sForm, setSForm] = useState(settings);
  const [imgPreview, setImgPreview] = useState<string | null>(null);

  const pendingProfs = pendingProfiles.filter((p) => p.status === 'pending');
  const pendingDons = pendingDonations.filter((p) => p.status === 'pending');

  const filteredMembers = members.filter((m) => {
    const q = adminSearch.toLowerCase();
    const match = m.isim.toLowerCase().includes(q) || m.unvan.toLowerCase().includes(q);
    const has = donations[m.no]?.amount > 0;
    const hasPend = pendingDonations.some((p) => p.memberNo === m.no && p.status === 'pending');
    const hasProf = profiles[m.no]?.bio || profiles[m.no]?.photo;
    const hasPendProf = pendingProfiles.some((p) => p.memberNo === m.no && p.status === 'pending');
    if (adminFilter === 'approved') return match && has;
    if (adminFilter === 'pending') return match && (hasPend || hasPendProf);
    if (adminFilter === 'none') return match && !has;
    if (adminFilter === 'profile') return match && hasProf;
    return match;
  });

  const openAddMember = () => { setMForm({ isim: '', unvan: '', tel: '' }); setEditMember(null); setMemberModal('add'); };
  const openEditMember = (m: Member) => { setMForm({ isim: m.isim, unvan: m.unvan, tel: m.tel }); setEditMember(m); setMemberModal('edit'); };

  const saveMember = () => {
    if (!mForm.isim.trim()) return onToast('İsim zorunludur.', 'error');
    if (memberModal === 'add') { addMember(mForm); onToast('Üye eklendi.', 'success'); }
    else if (editMember) { updateMember(editMember.no, mForm); onToast('Üye güncellendi.', 'success'); }
    setMemberModal(null);
  };

  const openDonEdit = (no: number) => {
    const d = donations[no] || { amount: 0, date: '', note: '', dekontData: null, dekontName: null, dekontType: null };
    setDonForm({ ...d });
    setDonEditNo(no);
  };

  const saveDonation = () => {
    if (!donEditNo) return;
    adminSetDonation(donEditNo, donForm);
    onToast('Bağış kaydedildi.', 'success');
    setDonEditNo(null);
  };

  const handleConfirmDelete = () => {
    if (!confirmDelete) return;
    if (confirmDelete.type === 'member') { deleteMember(confirmDelete.no); onToast('Üye silindi.', 'success'); }
    else { adminDeleteDonation(confirmDelete.no); onToast('Bağış silindi.', 'success'); }
    setConfirmDelete(null);
  };

  const saveSettings = () => { updateSettings(sForm); onToast('Ayarlar kaydedildi.', 'success'); };

  const tabs: [AdminTab, string][] = [
    ['pending', `Bekleyenler${pendingProfs.length + pendingDons.length > 0 ? ` (${pendingProfs.length + pendingDons.length})` : ''}`],
    ['members', 'Üye Yönetimi'],
    ['settings', 'Site Ayarları'],
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div>
          <h1 className="font-serif text-[22px] font-semibold">Yönetim Paneli</h1>
          <p className="text-[12px] text-muted">Bekleyen işlemler, üye yönetimi ve site ayarları</p>
        </div>
        <div className="flex gap-2">
          <Btn size="sm" onClick={() => exportMembersCSV(members, donations, profiles)}>📊 CSV İndir</Btn>
          <Btn variant="danger" size="sm" onClick={logout}>Çıkış Yap</Btn>
        </div>
      </div>

      <StatsRow isAdmin />

      <div className="flex border-b border-[rgba(26,22,18,0.28)] mb-6">
        {tabs.map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)}
            className={`px-5 py-2.5 text-[13px] font-sans border-b-2 -mb-px transition-all ${tab === id ? 'border-gold text-ink font-medium' : 'border-transparent text-muted'}`}>
            {label}
          </button>
        ))}
      </div>

      {/* PENDING TAB */}
      {tab === 'pending' && (
        <div className="space-y-6">
          <section>
            <h2 className="font-serif text-[16px] mb-3">Bekleyen Profil Güncellemeleri</h2>
            <div className="bg-white border border-[rgba(26,22,18,0.12)] rounded-xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-[13px]">
                  <thead>
                    <tr className="border-b border-[rgba(26,22,18,0.28)]" style={{ background: '#F5F0E8' }}>
                      {['Fotoğraf', 'İsim', 'Biyografi (önizleme)', 'Sosyal', 'Gönderim Zamanı', 'İşlem'].map((h, i) => (
                        <th key={i} className={`px-3 py-2.5 text-[10px] font-medium uppercase tracking-[0.1em] text-muted text-left whitespace-nowrap ${i === 5 ? 'text-right' : ''}`}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {pendingProfs.length === 0 && <tr><td colSpan={6} className="text-center py-8 text-muted">✓ Bekleyen profil güncellemesi yok</td></tr>}
                    {pendingProfs.map((p) => (
                      <tr key={p.id} className="tbl-row border-b border-[rgba(26,22,18,0.08)]">
                        <td className="px-3 py-2.5">
                          {p.photo
                            ? <img src={p.photo} alt="" className="w-11 h-11 rounded-full object-cover border border-[rgba(26,22,18,0.12)] cursor-pointer" onClick={() => setImgPreview(p.photo)} />
                            : <div className="w-11 h-11 rounded-full bg-cream border border-dashed border-[rgba(26,22,18,0.28)] flex items-center justify-center text-muted text-[11px]">—</div>
                          }
                        </td>
                        <td className="px-3 py-2.5 font-medium">{p.isim}</td>
                        <td className="px-3 py-2.5 text-[12px] text-muted max-w-[200px]">{p.bio ? p.bio.slice(0, 80) + (p.bio.length > 80 ? '…' : '') : '—'}</td>
                        <td className="px-3 py-2.5 text-[12px]">
                          {p.social ? <a href={p.social} target="_blank" rel="noreferrer" className="text-gold hover:underline">{p.social.slice(0, 28)}{p.social.length > 28 ? '…' : ''}</a> : '—'}
                        </td>
                        <td className="px-3 py-2.5 text-[11px] text-muted whitespace-nowrap">{new Date(p.submittedAt).toLocaleString('tr-TR')}</td>
                        <td className="px-3 py-2.5">
                          <div className="flex gap-1.5 justify-end">
                            <Btn variant="success" size="sm" onClick={() => { approveProfile(p.id); onToast(`${p.isim} profili onaylandı.`, 'success'); }}>✓ Onayla</Btn>
                            <Btn variant="danger" size="sm" onClick={() => { rejectProfile(p.id); onToast(`${p.isim} profili reddedildi.`, 'error'); }}>✗ Reddet</Btn>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          <section>
            <h2 className="font-serif text-[16px] mb-3">Bekleyen Bağış Bildirimleri</h2>
            <div className="bg-white border border-[rgba(26,22,18,0.12)] rounded-xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-[13px]">
                  <thead>
                    <tr className="border-b border-[rgba(26,22,18,0.28)]" style={{ background: '#F5F0E8' }}>
                      {['İsim', 'Tutar', 'Tarih', 'Not', 'Dekont', 'Gönderim Zamanı', 'İşlem'].map((h, i) => (
                        <th key={i} className={`px-3 py-2.5 text-[10px] font-medium uppercase tracking-[0.1em] text-muted text-left whitespace-nowrap ${i === 6 ? 'text-right' : ''}`}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {pendingDons.length === 0 && <tr><td colSpan={7} className="text-center py-8 text-muted">✓ Bekleyen bağış bildirimi yok</td></tr>}
                    {pendingDons.map((p) => (
                      <tr key={p.id} className="tbl-row border-b border-[rgba(26,22,18,0.08)]">
                        <td className="px-3 py-2.5 font-medium">{p.isim}</td>
                        <td className="px-3 py-2.5 font-mono font-medium text-[#1A5C3A]">{formatMoney(p.amount)}</td>
                        <td className="px-3 py-2.5 text-[12px] whitespace-nowrap">{formatDate(p.date)}</td>
                        <td className="px-3 py-2.5 text-[12px] text-muted max-w-[130px]">{p.note || '—'}</td>
                        <td className="px-3 py-2.5">
                          {p.dekontData
                            ? p.dekontType === 'application/pdf'
                              ? <button className="text-[11px] text-gold font-medium hover:underline" onClick={() => openBase64PDF(p.dekontData!)}>📄 PDF</button>
                              : <img src={p.dekontData} alt="dekont" className="w-11 h-8 object-cover rounded border border-[rgba(26,22,18,0.12)] cursor-pointer" onClick={() => setImgPreview(p.dekontData)} />
                            : <span className="text-muted text-[11px]">—</span>
                          }
                        </td>
                        <td className="px-3 py-2.5 text-[11px] text-muted whitespace-nowrap">{new Date(p.submittedAt).toLocaleString('tr-TR')}</td>
                        <td className="px-3 py-2.5">
                          <div className="flex gap-1.5 justify-end">
                            <Btn variant="success" size="sm" onClick={() => { approveDonation(p.id); onToast(`${p.isim} bağışı onaylandı.`, 'success'); }}>✓ Onayla</Btn>
                            <Btn variant="danger" size="sm" onClick={() => { rejectDonation(p.id); onToast(`${p.isim} bağışı reddedildi.`, 'error'); }}>✗ Reddet</Btn>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* MEMBERS TAB */}
      {tab === 'members' && (
        <div>
          <div className="flex gap-2 mb-4 flex-wrap items-center">
            <input
              className="flex-1 min-w-[180px] px-3 py-2 border border-[rgba(26,22,18,0.28)] rounded text-[13px] bg-cream text-ink outline-none focus:border-gold"
              placeholder="İsim veya kurum ara…"
              value={adminSearch}
              onChange={(e) => setAdminSearch(e.target.value)}
            />
            <select
              className="px-3 py-2 border border-[rgba(26,22,18,0.28)] rounded text-[13px] bg-cream text-ink outline-none"
              value={adminFilter}
              onChange={(e) => setAdminFilter(e.target.value)}
            >
              <option value="all">Tümü ({members.length})</option>
              <option value="approved">Onaylı Bağış</option>
              <option value="pending">Bekleyen</option>
              <option value="none">Bağış Yok</option>
              <option value="profile">Profili Olanlar</option>
            </select>
            <Btn variant="primary" onClick={openAddMember}>+ Üye Ekle</Btn>
          </div>

          <div className="bg-white border border-[rgba(26,22,18,0.12)] rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-[13px]">
                <thead>
                  <tr className="border-b border-[rgba(26,22,18,0.28)]" style={{ background: '#F5F0E8' }}>
                    {['', 'No', 'İsim', 'Unvan / Kurum', 'Telefon', 'Bağış', 'Profil', 'Dekont', 'İşlemler'].map((h, i) => (
                      <th key={i} className={`px-2.5 py-2.5 text-[10px] font-medium uppercase tracking-[0.1em] text-muted text-left whitespace-nowrap ${i >= 7 ? 'text-right' : ''}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredMembers.length === 0 && <tr><td colSpan={9} className="text-center py-8 text-muted">Sonuç bulunamadı</td></tr>}
                  {filteredMembers.map((m) => {
                    const d = donations[m.no];
                    const has = d?.amount > 0;
                    const prof = profiles[m.no];
                    const hasProf = prof?.bio || prof?.photo;
                    const hasPendDon = pendingDonations.some((p) => p.memberNo === m.no && p.status === 'pending');
                    const hasPendProf = pendingProfiles.some((p) => p.memberNo === m.no && p.status === 'pending');
                    let donBadge = <Badge variant="waiting">—</Badge>;
                    if (has) donBadge = <Badge variant="paid">✓ Onaylı</Badge>;
                    else if (hasPendDon) donBadge = <Badge variant="pending">⏳</Badge>;
                    return (
                      <tr key={m.no} className="tbl-row border-b border-[rgba(26,22,18,0.08)]">
                        <td className="px-2.5 py-2"><Avatar photo={prof?.photo} name={m.isim} size="sm" /></td>
                        <td className="px-2.5 py-2 font-mono text-[11px] text-muted">{m.no}</td>
                        <td className="px-2.5 py-2 font-medium">{m.isim}</td>
                        <td className="px-2.5 py-2 text-muted text-[12px] max-w-[200px]">{m.unvan}</td>
                        <td className="px-2.5 py-2 font-mono text-[11px] text-muted whitespace-nowrap">{m.tel}</td>
                        <td className="px-2.5 py-2">
                          <div className="flex items-center gap-1">
                            {donBadge}
                            {has && <span className="font-mono text-[11px] text-[#1A5C3A]">{formatMoney(d.amount)}</span>}
                          </div>
                        </td>
                        <td className="px-2.5 py-2">
                          <Badge variant={hasProf ? 'profile' : 'waiting'}>{hasProf ? '✓ Var' : 'Yok'}</Badge>
                          {hasPendProf && <Badge variant="pending">⏳</Badge>}
                        </td>
                        <td className="px-2.5 py-2">
                          {has && d.dekontData
                            ? d.dekontType === 'application/pdf'
                              ? <button className="text-[11px] text-gold font-medium hover:underline" onClick={() => openBase64PDF(d.dekontData!)}>📄</button>
                              : <img src={d.dekontData} alt="dekont" className="w-9 h-7 object-cover rounded border cursor-pointer" onClick={() => setImgPreview(d.dekontData)} />
                            : <span className="text-muted text-[11px]">—</span>
                          }
                        </td>
                        <td className="px-2.5 py-2">
                          <div className="flex gap-1 justify-end flex-wrap">
                            <Btn size="sm" onClick={() => openEditMember(m)}>✏️ Düzenle</Btn>
                            <Btn size="sm" onClick={() => openDonEdit(m.no)}>💳 Bağış</Btn>
                            <Btn size="sm" onClick={() => setProfViewNo(m.no)}>👤 Profil</Btn>
                            <Btn variant="danger" size="sm" onClick={() => setConfirmDelete({ type: 'member', no: m.no })}>🗑</Btn>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
          <p className="text-[11px] text-muted mt-2">{filteredMembers.length} üye gösteriliyor</p>
        </div>
      )}

      {/* SETTINGS TAB */}
      {tab === 'settings' && (
        <div className="max-w-[600px] space-y-4">
          <div className="bg-white border border-[rgba(26,22,18,0.12)] rounded-xl p-7 shadow-sm">
            <h2 className="font-serif text-[18px] mb-5">Site Başlık ve Metinleri</h2>
            <Field label="Büyük Başlık (Header'da üst satır)">
              <Input value={sForm.headerTitle} onChange={(e) => setSForm({ ...sForm, headerTitle: e.target.value })} />
            </Field>
            <Field label="Alt Başlık (Header'da alt satır)">
              <Input value={sForm.subtitle} onChange={(e) => setSForm({ ...sForm, subtitle: e.target.value })} />
            </Field>
            <Field label="Sayfa Başlığı (Tarayıcı sekmesi)">
              <Input value={sForm.title} onChange={(e) => setSForm({ ...sForm, title: e.target.value })} />
            </Field>
            <Field label="Site Açıklaması">
              <Textarea value={sForm.description} onChange={(e) => setSForm({ ...sForm, description: e.target.value })} style={{ minHeight: 80 }} />
            </Field>
            <div className="mt-2 pt-4 border-t border-[rgba(26,22,18,0.1)]">
              <Btn variant="primary" onClick={saveSettings}>✓ Ayarları Kaydet</Btn>
            </div>
          </div>
          <div className="bg-white border border-[#FEE8E8] rounded-xl p-6 shadow-sm">
            <h2 className="font-serif text-[16px] mb-1 text-[#8B2020]">Oturum</h2>
            <p className="text-[12px] text-muted mb-4">Admin oturumunu kapatmak için aşağıdaki butona tıklayın.</p>
            <Btn variant="danger" onClick={logout}>Oturumu Kapat</Btn>
          </div>
        </div>
      )}

      {/* MODALS */}
      <Modal open={memberModal !== null} onClose={() => setMemberModal(null)}
        title={memberModal === 'add' ? 'Yeni Üye Ekle' : 'Üyeyi Düzenle'}
        subtitle={memberModal === 'edit' ? `#${editMember?.no} — ${editMember?.isim}` : undefined}>
        <Field label="İsim Soyisim">
          <Input value={mForm.isim} onChange={(e) => setMForm({ ...mForm, isim: e.target.value })} placeholder="Ad Soyad" />
        </Field>
        <Field label="Unvan / Kurum">
          <Textarea value={mForm.unvan} onChange={(e) => setMForm({ ...mForm, unvan: e.target.value })} placeholder="Unvan ve/veya kurum bilgisi" style={{ minHeight: 80 }} />
        </Field>
        <Field label="Telefon">
          <Input value={mForm.tel} onChange={(e) => setMForm({ ...mForm, tel: e.target.value })} placeholder="0 5xx xxx xx xx" />
        </Field>
        <div className="flex gap-2 pt-2">
          <Btn variant="primary" onClick={saveMember}>{memberModal === 'add' ? '+ Ekle' : '✓ Kaydet'}</Btn>
          <Btn variant="ghost" onClick={() => setMemberModal(null)}>İptal</Btn>
        </div>
      </Modal>

      <Modal open={donEditNo !== null} onClose={() => setDonEditNo(null)}
        title="Bağış Bilgisini Düzenle"
        subtitle={donEditNo ? members.find((m) => m.no === donEditNo)?.isim : undefined}>
        <Field label="Bağış Tutarı (₺)">
          <Input type="number" min="0" step="500" value={donForm.amount || ''} onChange={(e) => setDonForm({ ...donForm, amount: Number(e.target.value) })} />
        </Field>
        <Field label="Bağış Tarihi">
          <Input type="date" value={donForm.date} onChange={(e) => setDonForm({ ...donForm, date: e.target.value })} />
        </Field>
        <Field label="Not">
          <Textarea value={donForm.note} onChange={(e) => setDonForm({ ...donForm, note: e.target.value })} style={{ minHeight: 70 }} />
        </Field>
        <Field label="Dekont (JPG, PNG veya PDF — Max 5 MB)">
          <FileDrop accept=".jpg,.jpeg,.png,.pdf" maxMB={5} icon="📄" label="Dekont seç"
            currentName={donForm.dekontName}
            onFile={(file, data) => setDonForm({ ...donForm, dekontData: data, dekontName: file.name, dekontType: file.type })}
            onClear={() => setDonForm({ ...donForm, dekontData: null, dekontName: null, dekontType: null })}
          />
          {donForm.dekontData && donForm.dekontType !== 'application/pdf' && (
            <img src={donForm.dekontData} alt="dekont" className="mt-2 max-h-32 rounded border" />
          )}
        </Field>
        <div className="flex gap-2 pt-2 flex-wrap">
          <Btn variant="primary" onClick={saveDonation}>✓ Kaydet</Btn>
          {donations[donEditNo!]?.amount > 0 && (
            <Btn variant="danger" onClick={() => { setConfirmDelete({ type: 'donation', no: donEditNo! }); setDonEditNo(null); }}>Bağışı Sil</Btn>
          )}
          <Btn variant="ghost" onClick={() => setDonEditNo(null)}>İptal</Btn>
        </div>
      </Modal>

      <Modal open={profViewNo !== null} onClose={() => setProfViewNo(null)}
        title="Profil Düzenle"
        subtitle={profViewNo ? members.find((m) => m.no === profViewNo)?.isim : undefined}
        maxWidth="max-w-xl">
        {profViewNo && (() => {
          const prof = profiles[profViewNo] || {};
          const m = members.find((x) => x.no === profViewNo)!;
          return (
            <AdminProfileEditor
              memberNo={profViewNo}
              member={m}
              profile={prof as { photo?: string | null; bio?: string; social?: string }}
              onSave={async (data) => {
                await useStore.getState().adminSetProfile(profViewNo, data);
                onToast('Profil güncellendi ve anında yayına alındı.', 'success');
                setProfViewNo(null);
              }}
              onClose={() => setProfViewNo(null)}
              onDelete={async () => {
                await useStore.getState().adminDeleteProfile(profViewNo);
                onToast('Profil silindi.', 'success');
                setProfViewNo(null);
              }}
            />
          );
        })()}
      </Modal>

      {imgPreview && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center cursor-zoom-out" style={{ background: 'rgba(0,0,0,0.88)' }} onClick={() => setImgPreview(null)}>
          <img src={imgPreview} alt="Önizleme" className="max-w-[90vw] max-h-[90vh] rounded" />
          <div className="absolute top-4 right-5 text-white text-[12px] opacity-60">Kapatmak için tıklayın</div>
        </div>
      )}

      <ConfirmDialog
        open={!!confirmDelete}
        title={confirmDelete?.type === 'member' ? 'Üyeyi Sil' : 'Bağışı Sil'}
        message={confirmDelete?.type === 'member'
          ? `"${members.find((m) => m.no === confirmDelete?.no)?.isim}" adlı üyeyi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`
          : 'Bu bağış kaydını silmek istediğinizden emin misiniz?'
        }
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
}

function AdminProfileEditor({
  memberNo, member, profile, onSave, onClose, onDelete,
}: {
  memberNo: number;
  member: Member;
  profile: { photo?: string | null; bio?: string; social?: string };
  onSave: (data: { photo: string | null; bio: string; social: string }) => void;
  onClose: () => void;
  onDelete: () => void;
}) {
  const [photo, setPhoto] = useState<string | null>(profile.photo || null);
  const [photoName, setPhotoName] = useState<string | null>(profile.photo ? 'mevcut-foto.jpg' : null);
  const [bio, setBio] = useState(profile.bio || '');
  const [social, setSocial] = useState(profile.social || '');
  const [confirmDel, setConfirmDel] = useState(false);

  return (
    <div>
      <div className="flex gap-3 items-start mb-5 p-4 rounded-lg" style={{ background: '#F5F0E8' }}>
        <Avatar photo={photo} name={member.isim} size="xl" />
        <div>
          <div className="font-medium text-[15px]">{member.isim}</div>
          <div className="text-[12px] text-muted leading-snug mt-0.5">{member.unvan}</div>
          <div className="text-[11px] text-muted font-mono mt-1">{member.tel}</div>
          <div className="text-[10px] text-muted mt-0.5">Üye No: #{member.no}</div>
        </div>
      </div>

      <Field label="Fotoğraf (JPG/PNG — Max 3 MB)">
        <FileDrop
          accept=".jpg,.jpeg,.png"
          maxMB={3}
          icon="📷"
          label="Fotoğraf seç veya sürükle"
          currentName={photoName}
          onFile={(file, data) => { setPhoto(data); setPhotoName(file.name); }}
          onClear={() => { setPhoto(null); setPhotoName(null); }}
        />
        {photo && (
          <div className="mt-3 flex items-center gap-3">
            <img src={photo} alt="önizleme" className="w-20 h-20 rounded-full object-cover border-2 border-gold" />
            <span className="text-[11px] text-muted">Yeni fotoğraf önizlemesi</span>
          </div>
        )}
      </Field>

      <Field label="Kısa Biyografi" hint={`${bio.length} / 600 karakter`}>
        <Textarea
          value={bio}
          onChange={(e) => setBio(e.target.value.slice(0, 600))}
          style={{ minHeight: 120 }}
          placeholder="Biyografi metni… Eğitim, kariyer, ilgi alanları vb."
        />
      </Field>

      <Field label="Web Sitesi / Sosyal Medya (isteğe bağlı)">
        <Input type="url" value={social} onChange={(e) => setSocial(e.target.value)} placeholder="https://..." />
      </Field>

      <div className="flex gap-2 pt-2 flex-wrap">
        <Btn variant="primary" onClick={() => onSave({ photo, bio, social })}>✓ Kaydet ve Yayınla</Btn>
        {(profile.photo || profile.bio) && (
          <Btn variant="danger" onClick={() => setConfirmDel(true)}>Profili Sil</Btn>
        )}
        <Btn variant="ghost" onClick={onClose}>İptal</Btn>
      </div>

      <p className="text-[11px] text-muted mt-3">
        💡 Admin tarafından yapılan değişiklikler onay beklemeden <strong>anında yayına</strong> girer.
      </p>

      <ConfirmDialog
        open={confirmDel}
        title="Profili Sil"
        message={`"${member.isim}" profilini silmek istediğinizden emin misiniz? Fotoğraf ve biyografi kalıcı olarak silinir.`}
        onConfirm={() => { setConfirmDel(false); onDelete(); }}
        onCancel={() => setConfirmDel(false)}
      />
    </div>
  );
}
