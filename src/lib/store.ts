'use client';
import { create } from 'zustand';
import { supabase } from './supabase';
import type {
  Member, MemberProfile, ApprovedDonation,
  PendingDonation, PendingProfileUpdate, SiteSettings
} from '@/types';

const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'vakif2024';

const DEFAULT_SETTINGS: SiteSettings = {
  title: "Türkiye Sinema ve Medya Vakfı\nKurucu Mütevelli Heyeti\nBilgi Formu",
  subtitle: "Kurucu Mütevelli Heyeti — Bilgi Formu",
  headerTitle: "TÜRKİYE SİNEMA VE MEDYA VAKFI",
  description: "Kurucu mütevelli heyeti üyelerinin bilgi ve bağış takip sistemi.",
};

const INITIAL_MEMBERS: Member[] = [
  {no:1,isim:"Abdülkadir Taşkın",unvan:"TRT İnsan Kaynakları Birimi",tel:"0 538 349 20 49"},
  {no:2,isim:"Adem Şimşek",unvan:"Dr. / Mühendis / Siber Güvenlik ve İletişim Teknolojileri Uzmanı",tel:"0 532 604 90 56"},
  {no:3,isim:"Ahmet Yenilmez",unvan:"Oyuncu",tel:"0 532 326 03 95"},
  {no:4,isim:"Ali Çiydem",unvan:"Yetim Vakfı / Kültürel Çalışmalar Araştırmacısı",tel:"0 532 676 20 63"},
  {no:5,isim:"Ali Nuri Türkoğlu",unvan:"Oyuncu, Yapımcı, Yönetmen",tel:"0 532 361 36 01"},
  {no:6,isim:"Bünyamin Yılmaz",unvan:"Anadolu Ajansı Kültür Sanat Editörü",tel:"0 530 069 72 59"},
  {no:7,isim:"Çiğdem Çan Aslan",unvan:"Uzman Klinik Psikolog",tel:"0 507 464 76 99"},
  {no:8,isim:"Erol Erdoğan",unvan:"Yazar / Sosyolog",tel:"0 532 508 10 39"},
  {no:9,isim:"Ersin Çelik",unvan:"Yeni Şafak Dijital Yayın Yönetmeni",tel:"0 532 302 91 71"},
  {no:10,isim:"Haluk Huyut",unvan:"Sunucu",tel:"0 534 676 00 66"},
  {no:11,isim:"Halis Cahit Kurutlu",unvan:"Yapımcı",tel:"0 505 584 51 36"},
  {no:12,isim:"Harun Emre Karadağ",unvan:"Marka Konseyi Genel Sekreteri / Marka Danışmanı",tel:"0 555 565 79 19"},
  {no:13,isim:"Harun Korkmaz",unvan:"Yönetmen",tel:"0 534 676 00 66"},
  {no:14,isim:"Hasan Sarı",unvan:"Dr. / Gençlik ve Spor Bakanlığı / Denizli Gençlik Hizmetleri Müdürü",tel:"0 555 888 53 20"},
  {no:15,isim:"İbrahim Altay",unvan:"Daily Sabah Genel Yayın Yönetmeni / Medya Derneği Genel Sekreteri",tel:"0 507 764 19 00"},
  {no:16,isim:"İhsan Aktaş",unvan:"Yazar / Kamuoyu Araştırma Şirketi (GENAR) Sahibi",tel:"0 532 353 89 56"},
  {no:17,isim:"İhsan Kabil",unvan:"Film Eleştirmeni",tel:"0 533 443 41 64"},
  {no:18,isim:"İsrafil Kuralay",unvan:"Dr. / İstanbul Ticaret Üniversitesi Müteevelli Heyet Başkanı",tel:"0 532 287 29 16"},
  {no:19,isim:"İsmail Çağlar",unvan:"Prof Dr. / İstanbul Üniversitesi İletişim Koordinatörü / AA Yönetim Kurul Üyesi",tel:"0 533 640 30 39"},
  {no:20,isim:"İsmail Halis",unvan:"Gazeteci, 10'lar Medya Yayın Yönetmeni",tel:"0 537 839 29 44"},
  {no:21,isim:"Kenan Alpay",unvan:"Yazar / Yeni Akit Gazetesi",tel:"0 533 615 22 95"},
  {no:22,isim:"Kemal Tekden",unvan:"TÜZDEV Vakfı Başkanı / Eski Milletvekili",tel:"0 532 275 30 20"},
  {no:23,isim:"Mahmut Aslan",unvan:"Aile ve Sosyal Hizmetler Bakanlığı Strateji ve Geliştirme Başkanı",tel:"0 533 027 91 91"},
  {no:24,isim:"Mehmet Emin Babacan",unvan:"Prof. Dr. / Marmara Üniversitesi İletişim Fakültesi Dekanı",tel:"0 532 646 27 33"},
  {no:25,isim:"Mesut Uçakan",unvan:"Yönetmen",tel:"0 532 614 39 64"},
  {no:26,isim:"Murat Kazancı",unvan:"YTB Başkan Yardımcısı",tel:"0 532 393 79 67"},
  {no:27,isim:"Mustafa Aslan",unvan:"Doç. Dr. / Film Araştırmaları Derneği Başkanı / Sakarya Üniversitesi RTVS",tel:"0 539 331 39 94"},
  {no:28,isim:"Muzaffer Musab Yılmaz",unvan:"Dr. / Kırşehir Ahi Evran Üniversitesi Öğretim Üyesi",tel:"0 507 174 52 45"},
  {no:29,isim:"Nazif Tunç",unvan:"Yapımcı / Yönetmen / Uluslararası Sinema Derneği Başkanı",tel:"0 532 516 41 58"},
  {no:30,isim:"Ozan Bodur",unvan:"Senarist",tel:"0 546 450 22 94"},
  {no:31,isim:"Rafet Gayretli",unvan:"Edebiyatçı",tel:"0 535 939 03 19"},
  {no:32,isim:"Recep Kemal Akyürek",unvan:"Aile ve Sosyal Hizmetler Bakanlığı Destek Hizmetleri Dairesi Başkanı",tel:"0 532 512 59 37"},
  {no:33,isim:"Samet Doğan",unvan:"Yönetmen",tel:"0 530 040 96 83"},
  {no:34,isim:"Selim Cerrah",unvan:"Maarif Vakfı Yönetim Kurulu Üyesi / Cihannüma Derneği Genel Başkanı",tel:"0 505 654 54 30"},
  {no:35,isim:"Serhat Yetimova",unvan:"Doç. Dr. / Sakarya Üniversitesi İletişim Fakültesi RTVS Öğretim Üyesi",tel:"0 538 614 85 32"},
  {no:36,isim:"Sibel Eraslan",unvan:"Yazar",tel:"0 505 654 54 30"},
  {no:37,isim:"Şevki Es",unvan:"Yönetmen",tel:"0 535 257 64 21"},
  {no:38,isim:"Şükrü Sim",unvan:"Prof. Dr. / İstanbul Üniversitesi İletişim Fakültesi RTVS Bölüm Başkanı",tel:"0 532 352 38 60"},
  {no:39,isim:"Turan Kışlakçı",unvan:"Gazeteci / Yazar",tel:"0 530 935 80 80"},
  {no:40,isim:"Ümit Sönmez",unvan:"Yapımcı / Yönetmen",tel:"0 532 211 43 04"},
  {no:41,isim:"Yahya Coşkun",unvan:"Dr. / TİKA Başkan Yardımcısı",tel:"0 532 615 85 79"},
  {no:42,isim:"Yaşar Kahraman",unvan:"Doç. Dr. / Sakarya Üniversitesi Mühendislik Fakültesi / İHH Genel Merkez",tel:"0 533 618 88 78"},
  {no:43,isim:"Yeşim Tombaz",unvan:"Senarist / Yönetmen",tel:"0 532 613 32 84"},
  {no:44,isim:"Yücel Hüdaverdi",unvan:"Yönetmen",tel:"0 554 328 61 01"},
  {no:45,isim:"Yusuf Adıgüzel",unvan:"Prof. Dr. / Sosyolog / Anadolu Üniversitesi Rektörü",tel:"0 539 331 39 94"},
  {no:46,isim:"Yusuf Kaplan",unvan:"Yeni Şafak Gazetesi Yazarı / MTO",tel:"0 530 931 85 96"},
  {no:47,isim:"Yusuf Ziya Gökçek",unvan:"Doç. Dr. / Marmara Üniversitesi İletişim Fakültesi RTVS Öğretim Üyesi",tel:"0 542 399 95 41"},
];

interface StoreState {
  members: Member[];
  profiles: Record<number, MemberProfile>;
  donations: Record<number, ApprovedDonation>;
  pendingDonations: PendingDonation[];
  pendingProfiles: PendingProfileUpdate[];
  settings: SiteSettings;
  adminLoggedIn: boolean;
  loading: boolean;

  fetchAll: () => Promise<void>;
  login: (password: string) => boolean;
  logout: () => void;
  updateSettings: (s: Partial<SiteSettings>) => Promise<void>;
  addMember: (m: Omit<Member, 'no'>) => Promise<void>;
  updateMember: (no: number, m: Partial<Member>) => Promise<void>;
  deleteMember: (no: number) => Promise<void>;
  submitProfileUpdate: (p: Omit<PendingProfileUpdate, 'id' | 'status' | 'submittedAt' | 'type'>) => Promise<void>;
  approveProfile: (id: number) => Promise<void>;
  rejectProfile: (id: number) => Promise<void>;
  submitDonation: (d: Omit<PendingDonation, 'id' | 'status' | 'submittedAt' | 'type'>) => Promise<void>;
  approveDonation: (id: number) => Promise<void>;
  rejectDonation: (id: number) => Promise<void>;
  adminSetDonation: (memberNo: number, data: ApprovedDonation) => Promise<void>;
  adminDeleteDonation: (memberNo: number) => Promise<void>;
  adminSetProfile: (memberNo: number, data: { photo: string | null; bio: string; social: string }) => Promise<void>;
  adminDeleteProfile: (memberNo: number) => Promise<void>;
  getPendingCount: () => number;
}

export const useStore = create<StoreState>()((set, get) => ({
  members: [],
  profiles: {},
  donations: {},
  pendingDonations: [],
  pendingProfiles: [],
  settings: DEFAULT_SETTINGS,
  adminLoggedIn: false,
  loading: true,

  fetchAll: async () => {
    // Önce başlangıç verilerini hemen göster — site anında açılsın
    set({ members: INITIAL_MEMBERS, loading: false });
    try {
      // Arka planda Supabase'den güncel veriyi çek
      const { data: membersData } = await supabase.from('members').select('*').order('no');
      let members = membersData && membersData.length > 0
        ? membersData.map((m: any) => ({ no: m.no, isim: m.isim, unvan: m.unvan, tel: m.tel }))
        : INITIAL_MEMBERS;

      // Eğer veritabanı boşsa başlangıç verilerini yükle
      if (!membersData || membersData.length === 0) {
        await supabase.from('members').insert(INITIAL_MEMBERS.map(m => ({ no: m.no, isim: m.isim, unvan: m.unvan, tel: m.tel })));
      }

      // Profiles
      const { data: profilesData } = await supabase.from('profiles').select('*');
      const profiles: Record<number, MemberProfile> = {};
      (profilesData || []).forEach((p: any) => {
        profiles[p.member_no] = { memberNo: p.member_no, photo: p.photo, bio: p.bio, social: p.social };
      });

      // Donations
      const { data: donationsData } = await supabase.from('donations').select('*');
      const donations: Record<number, ApprovedDonation> = {};
      (donationsData || []).forEach((d: any) => {
        donations[d.member_no] = { amount: d.amount, date: d.date, note: d.note, dekontData: d.dekont_data, dekontName: d.dekont_name, dekontType: d.dekont_type };
      });

      // Pending profiles
      const { data: pendingProfilesData } = await supabase.from('pending_profiles').select('*').eq('status', 'pending');
      const pendingProfiles: PendingProfileUpdate[] = (pendingProfilesData || []).map((p: any) => ({
        id: p.id, type: 'profile' as const, memberNo: p.member_no, isim: p.isim,
        photo: p.photo, bio: p.bio, social: p.social, status: p.status, submittedAt: p.submitted_at,
      }));

      // Pending donations
      const { data: pendingDonationsData } = await supabase.from('pending_donations').select('*').eq('status', 'pending');
      const pendingDonations: PendingDonation[] = (pendingDonationsData || []).map((d: any) => ({
        id: d.id, type: 'donation' as const, memberNo: d.member_no, isim: d.isim, unvan: d.unvan,
        amount: d.amount, date: d.date, note: d.note,
        dekontData: d.dekont_data, dekontName: d.dekont_name, dekontType: d.dekont_type,
        status: d.status, submittedAt: d.submitted_at,
      }));

      // Settings
      const { data: settingsData } = await supabase.from('settings').select('*').eq('id', 1).single();
      const settings = settingsData ? {
        title: settingsData.title,
        subtitle: settingsData.subtitle,
        headerTitle: settingsData.header_title,
        description: settingsData.description,
      } : DEFAULT_SETTINGS;

      set({ members, profiles, donations, pendingProfiles, pendingDonations, settings, loading: false });
    } catch (e) {
      console.error(e);
      set({ members: INITIAL_MEMBERS, loading: false });
    }
  },

  login: (password) => {
    if (password === ADMIN_PASSWORD) { set({ adminLoggedIn: true }); return true; }
    return false;
  },
  logout: () => set({ adminLoggedIn: false }),

  updateSettings: async (s) => {
    const newSettings = { ...get().settings, ...s };
    await supabase.from('settings').upsert({ id: 1, title: newSettings.title, subtitle: newSettings.subtitle, header_title: newSettings.headerTitle, description: newSettings.description });
    set({ settings: newSettings });
  },

  addMember: async (m) => {
    const maxNo = Math.max(...get().members.map(x => x.no), 0);
    const newMember = { ...m, no: maxNo + 1 };
    await supabase.from('members').insert({ no: newMember.no, isim: newMember.isim, unvan: newMember.unvan, tel: newMember.tel });
    set((state) => ({ members: [...state.members, newMember] }));
  },

  updateMember: async (no, m) => {
    await supabase.from('members').update({ isim: m.isim, unvan: m.unvan, tel: m.tel }).eq('no', no);
    set((state) => ({ members: state.members.map(x => x.no === no ? { ...x, ...m } : x) }));
  },

  deleteMember: async (no) => {
    await supabase.from('members').delete().eq('no', no);
    set((state) => ({ members: state.members.filter(x => x.no !== no) }));
  },

  submitProfileUpdate: async (p) => {
    const entry: PendingProfileUpdate = {
      ...p, type: 'profile', id: Date.now(), status: 'pending', submittedAt: new Date().toISOString(),
    };
    await supabase.from('pending_profiles').insert({
      id: entry.id, member_no: p.memberNo, isim: p.isim,
      photo: p.photo, bio: p.bio, social: p.social,
      status: 'pending', submitted_at: entry.submittedAt,
    });
    set((state) => ({ pendingProfiles: [...state.pendingProfiles, entry] }));
  },

  approveProfile: async (id) => {
    const entry = get().pendingProfiles.find(p => p.id === id);
    if (!entry) return;
    await supabase.from('pending_profiles').update({ status: 'approved' }).eq('id', id);
    await supabase.from('profiles').upsert({ member_no: entry.memberNo, photo: entry.photo, bio: entry.bio, social: entry.social });
    const profiles = { ...get().profiles, [entry.memberNo]: { memberNo: entry.memberNo, photo: entry.photo, bio: entry.bio, social: entry.social } };
    set((state) => ({
      profiles,
      pendingProfiles: state.pendingProfiles.filter(p => p.id !== id),
    }));
  },

  rejectProfile: async (id) => {
    await supabase.from('pending_profiles').update({ status: 'rejected' }).eq('id', id);
    set((state) => ({ pendingProfiles: state.pendingProfiles.filter(p => p.id !== id) }));
  },

  submitDonation: async (d) => {
    const entry: PendingDonation = {
      ...d, type: 'donation', id: Date.now(), status: 'pending', submittedAt: new Date().toISOString(),
    };
    await supabase.from('pending_donations').insert({
      id: entry.id, member_no: d.memberNo, isim: d.isim, unvan: d.unvan,
      amount: d.amount, date: d.date, note: d.note,
      dekont_data: d.dekontData, dekont_name: d.dekontName, dekont_type: d.dekontType,
      status: 'pending', submitted_at: entry.submittedAt,
    });
    set((state) => ({ pendingDonations: [...state.pendingDonations, entry] }));
  },

  approveDonation: async (id) => {
    const entry = get().pendingDonations.find(p => p.id === id);
    if (!entry) return;
    await supabase.from('pending_donations').update({ status: 'approved' }).eq('id', id);
    await supabase.from('donations').upsert({
      member_no: entry.memberNo, amount: entry.amount, date: entry.date, note: entry.note,
      dekont_data: entry.dekontData, dekont_name: entry.dekontName, dekont_type: entry.dekontType,
    });
    const donations = { ...get().donations, [entry.memberNo]: { amount: entry.amount, date: entry.date, note: entry.note, dekontData: entry.dekontData, dekontName: entry.dekontName, dekontType: entry.dekontType } };
    set((state) => ({
      donations,
      pendingDonations: state.pendingDonations.filter(p => p.id !== id),
    }));
  },

  rejectDonation: async (id) => {
    await supabase.from('pending_donations').update({ status: 'rejected' }).eq('id', id);
    set((state) => ({ pendingDonations: state.pendingDonations.filter(p => p.id !== id) }));
  },

  adminSetDonation: async (memberNo, data) => {
    await supabase.from('donations').upsert({
      member_no: memberNo, amount: data.amount, date: data.date, note: data.note,
      dekont_data: data.dekontData, dekont_name: data.dekontName, dekont_type: data.dekontType,
    });
    set((state) => ({ donations: { ...state.donations, [memberNo]: data } }));
  },

  adminDeleteDonation: async (memberNo) => {
    await supabase.from('donations').delete().eq('member_no', memberNo);
    set((state) => {
      const d = { ...state.donations };
      delete d[memberNo];
      return { donations: d };
    });
  },

  adminSetProfile: async (memberNo, data) => {
    await supabase.from('profiles').upsert({ member_no: memberNo, photo: data.photo, bio: data.bio, social: data.social });
    set((state) => ({ profiles: { ...state.profiles, [memberNo]: { memberNo, ...data } } }));
  },

  adminDeleteProfile: async (memberNo) => {
    await supabase.from('profiles').delete().eq('member_no', memberNo);
    set((state) => {
      const p = { ...state.profiles };
      delete p[memberNo];
      return { profiles: p };
    });
  },

  getPendingCount: () => get().pendingDonations.length + get().pendingProfiles.length,
}));
