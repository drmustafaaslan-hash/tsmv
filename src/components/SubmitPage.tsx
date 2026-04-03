'use client';
import { useState } from 'react';
import { useStore } from '@/lib/store';
import { readFileAsBase64 } from '@/lib/utils';
import { Field, Input, Select, Textarea, FileDrop, Btn, Avatar } from './ui';

type Tab = 'profile' | 'donation';

export default function SubmitPage({ onToast }: { onToast: (m: string, t: 'success' | 'error') => void }) {
  const { members, profiles, donations, pendingProfiles, pendingDonations, submitProfileUpdate, submitDonation } = useStore();
  const [tab, setTab] = useState<Tab>('profile');

  // Profile form
  const [profileMemberNo, setProfileMemberNo] = useState<number | 0>(0);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [profilePhotoName, setProfilePhotoName] = useState<string | null>(null);
  const [profileBio, setProfileBio] = useState('');
  const [profileSocial, setProfileSocial] = useState('');

  // Donation form
  const [donMemberNo, setDonMemberNo] = useState<number | 0>(0);
  const [donAmount, setDonAmount] = useState('');
  const [donDate, setDonDate] = useState(new Date().toISOString().split('T')[0]);
  const [donNote, setDonNote] = useState('');
  const [donDekont, setDonDekont] = useState<string | null>(null);
  const [donDekontName, setDonDekontName] = useState<string | null>(null);
  const [donDekontType, setDonDekontType] = useState<string | null>(null);

  const onProfileMemberChange = (no: number) => {
    setProfileMemberNo(no);
    if (!no) return;
    const prof = profiles[no] || {};
    setProfileBio(prof.bio || '');
    setProfileSocial(prof.social || '');
    setProfilePhoto(prof.photo || null);
    setProfilePhotoName(prof.photo ? 'mevcut-foto.jpg' : null);
  };

  const hasPendingProfile = (no: number) => pendingProfiles.some((p) => p.memberNo === no && p.status === 'pending');
  const hasPendingDonation = (no: number) => pendingDonations.some((p) => p.memberNo === no && p.status === 'pending');

  const handleProfileSubmit = () => {
    if (!profileMemberNo) return onToast('Lütfen isim seçiniz.', 'error');
    if (!profileBio && !profilePhoto) return onToast('En az fotoğraf veya biyografi giriniz.', 'error');
    if (hasPendingProfile(profileMemberNo)) return onToast('Bu üye için zaten bekleyen profil güncellemesi var.', 'error');
    const m = members.find((x) => x.no === profileMemberNo)!;
    submitProfileUpdate({ memberNo: m.no, isim: m.isim, photo: profilePhoto, bio: profileBio, social: profileSocial });
    setProfileMemberNo(0); setProfileBio(''); setProfileSocial(''); setProfilePhoto(null); setProfilePhotoName(null);
    onToast('Profil bilgileriniz gönderildi. Admin onayından sonra yayınlanacak.', 'success');
  };

  const handleDonationSubmit = () => {
    if (!donMemberNo) return onToast('Lütfen isim seçiniz.', 'error');
    const amount = parseFloat(donAmount);
    if (!amount || amount <= 0) return onToast('Geçerli bir tutar giriniz.', 'error');
    if (!donDate) return onToast('Bağış tarihini seçiniz.', 'error');
    if (hasPendingDonation(donMemberNo)) return onToast('Bu üye için zaten bekleyen bildirim var.', 'error');
    const m = members.find((x) => x.no === donMemberNo)!;
    submitDonation({ memberNo: m.no, isim: m.isim, unvan: m.unvan, amount, date: donDate, note: donNote, dekontData: donDekont, dekontName: donDekontName, dekontType: donDekontType });
    setDonMemberNo(0); setDonAmount(''); setDonNote(''); setDonDekont(null); setDonDekontName(null);
    onToast('Bildiriminiz alındı. Admin onayından sonra tabloya yansıyacak.', 'success');
  };

  return (
    <div>
      <h1 className="font-serif text-[22px] font-semibold mb-1">Bilgi &amp; Bağış Güncelle</h1>
      <p className="text-[12px] text-muted mb-5">Fotoğraf, biyografi ve bağış bildiriminizi buradan yapabilirsiniz. Bilgiler admin onayından sonra yayınlanır.</p>

      {/* Tabs */}
      <div className="flex border-b border-[rgba(26,22,18,0.28)] mb-6">
        {([['profile', '👤 Profil Bilgilerim'], ['donation', '💳 Bağış Bildir']] as [Tab, string][]).map(([id, label]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`px-5 py-2.5 text-[13px] font-sans border-b-2 -mb-px transition-all ${tab === id ? 'border-gold text-ink font-medium' : 'border-transparent text-muted'}`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* PROFILE TAB */}
      {tab === 'profile' && (
        <div className="max-w-[560px]">
          <div className="bg-white border border-[rgba(26,22,18,0.12)] rounded-xl p-7 shadow-sm">
            <Field label="Kim olduğunuzu seçin" hint="Mevcut bilgileriniz varsa otomatik yüklenecektir.">
              <Select value={profileMemberNo} onChange={(e) => onProfileMemberChange(Number(e.target.value))}>
                <option value={0}>— Listeden seçiniz —</option>
                {members.map((m) => (
                  <option key={m.no} value={m.no}>{m.no}. {m.isim}</option>
                ))}
              </Select>
            </Field>

            {profileMemberNo > 0 && (
              <>
                {hasPendingProfile(profileMemberNo) && (
                  <div className="mb-4 px-3 py-2 text-[11px] rounded" style={{ background: '#FFF8E6', color: '#8B6400' }}>
                    ⏳ Bu üye için bekleyen profil güncellemesi var.
                  </div>
                )}

                <div className="flex gap-4 items-start mb-4">
                  <div className="flex-1">
                    <label className="block text-[11px] font-medium uppercase tracking-[0.07em] text-muted mb-1.5">Fotoğraf (JPG/PNG — Max 3 MB)</label>
                    <FileDrop
                      accept=".jpg,.jpeg,.png"
                      maxMB={3}
                      icon="📷"
                      label="Fotoğraf seç"
                      currentName={profilePhotoName}
                      onFile={async (file, data) => { setProfilePhoto(data); setProfilePhotoName(file.name); }}
                      onClear={() => { setProfilePhoto(null); setProfilePhotoName(null); }}
                    />
                  </div>
                  {profilePhoto && (
                    <div className="mt-6">
                      <Avatar photo={profilePhoto} name={members.find((m) => m.no === profileMemberNo)?.isim || ''} size="xl" />
                    </div>
                  )}
                </div>

                <Field label="Kısa Biyografi" hint={`${profileBio.length} / 600 karakter`}>
                  <Textarea
                    value={profileBio}
                    onChange={(e) => setProfileBio(e.target.value.slice(0, 600))}
                    placeholder="Kendiniz hakkında kısa bir tanıtım yazısı… Eğitim, kariyer, ilgi alanları vb."
                    style={{ minHeight: 120 }}
                  />
                </Field>

                <Field label="Web Sitesi / Sosyal Medya (isteğe bağlı)">
                  <Input type="url" value={profileSocial} onChange={(e) => setProfileSocial(e.target.value)} placeholder="https://..." />
                </Field>

                <Btn variant="primary" className="w-full justify-center mt-2" onClick={handleProfileSubmit}>
                  Profil Bilgilerimi Gönder
                </Btn>
              </>
            )}
          </div>
        </div>
      )}

      {/* DONATION TAB */}
      {tab === 'donation' && (
        <div className="max-w-[560px]">
          <div className="bg-white border border-[rgba(26,22,18,0.12)] rounded-xl p-7 shadow-sm">
            <Field label="İsim Seçin">
              <Select value={donMemberNo} onChange={(e) => setDonMemberNo(Number(e.target.value))}>
                <option value={0}>— Listeden seçiniz —</option>
                {members.map((m) => <option key={m.no} value={m.no}>{m.no}. {m.isim}</option>)}
              </Select>
            </Field>

            {donMemberNo > 0 && hasPendingDonation(donMemberNo) && (
              <div className="mb-4 px-3 py-2 text-[11px] rounded" style={{ background: '#FFF8E6', color: '#8B6400' }}>
                ⏳ Bu üye için zaten bekleyen bir bağış bildirimi var.
              </div>
            )}

            <Field label="Bağış Tutarı (₺)">
              <Input type="number" min="0" step="500" value={donAmount} onChange={(e) => setDonAmount(e.target.value)} placeholder="Örn: 10000" />
            </Field>
            <Field label="Bağış Tarihi">
              <Input type="date" value={donDate} onChange={(e) => setDonDate(e.target.value)} />
            </Field>
            <Field label="Dekont (JPG, PNG veya PDF — Max 5 MB)">
              <FileDrop
                accept=".jpg,.jpeg,.png,.pdf"
                maxMB={5}
                icon="📄"
                label="Dekont seç"
                currentName={donDekontName}
                onFile={async (file, data) => { setDonDekont(data); setDonDekontName(file.name); setDonDekontType(file.type); }}
                onClear={() => { setDonDekont(null); setDonDekontName(null); setDonDekontType(null); }}
              />
            </Field>
            <Field label="Not (isteğe bağlı)">
              <Textarea value={donNote} onChange={(e) => setDonNote(e.target.value)} placeholder="Eklemek istediğiniz not…" style={{ minHeight: 70 }} />
            </Field>
            <Btn variant="primary" className="w-full justify-center mt-2" onClick={handleDonationSubmit}>
              Bildirimi Gönder
            </Btn>
          </div>
        </div>
      )}
    </div>
  );
}
