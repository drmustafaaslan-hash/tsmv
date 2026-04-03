export interface Member {
  no: number;
  isim: string;
  unvan: string;
  tel: string;
}

export interface MemberProfile {
  memberNo: number;
  photo: string | null;
  bio: string;
  social: string;
}

export interface ApprovedDonation {
  amount: number;
  date: string;
  note: string;
  dekontData: string | null;
  dekontName: string | null;
  dekontType: string | null;
}

export type PendingStatus = 'pending' | 'approved' | 'rejected';

export interface PendingProfileUpdate {
  id: number;
  type: 'profile';
  memberNo: number;
  isim: string;
  photo: string | null;
  bio: string;
  social: string;
  status: PendingStatus;
  submittedAt: string;
}

export interface PendingDonation {
  id: number;
  type: 'donation';
  memberNo: number;
  isim: string;
  unvan: string;
  amount: number;
  date: string;
  note: string;
  dekontData: string | null;
  dekontName: string | null;
  dekontType: string | null;
  status: PendingStatus;
  submittedAt: string;
}

export interface PendingMemberChange {
  id: number;
  type: 'member_add' | 'member_edit' | 'member_delete';
  memberNo: number;
  isim: string;
  unvan: string;
  tel: string;
  status: PendingStatus;
  submittedAt: string;
  requestedBy?: string;
}

export type PendingItem = PendingProfileUpdate | PendingDonation | PendingMemberChange;

export interface SiteSettings {
  title: string;
  subtitle: string;
  headerTitle: string;
  description: string;
}
