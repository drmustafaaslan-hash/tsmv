export function initials(name: string): string {
  const parts = name.trim().split(' ');
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function formatDate(d: string): string {
  if (!d) return '—';
  const [y, m, day] = d.split('-');
  return `${day}.${m}.${y}`;
}

export function formatMoney(n: number): string {
  return '₺' + n.toLocaleString('tr-TR');
}

export function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function openBase64PDF(data: string) {
  const win = window.open();
  if (win) win.document.write(`<iframe src="${data}" style="width:100%;height:100%;border:none;"></iframe>`);
}

export function exportMembersCSV(
  members: { no: number; isim: string; unvan: string; tel: string }[],
  donations: Record<number, { amount: number }>,
  profiles: Record<number, { bio: string }>
) {
  const rows = [['No', 'İsim', 'Unvan', 'Telefon', 'Bağış (TL)', 'Durum', 'Bio']];
  members.forEach((m) => {
    const d = donations[m.no];
    const has = d && d.amount > 0;
    const prof = profiles[m.no] || {};
    rows.push([
      String(m.no), m.isim, m.unvan, m.tel,
      has ? String(d.amount) : '',
      has ? 'Onaylı' : 'Bildirilmemiş',
      (prof as { bio?: string }).bio || '',
    ]);
  });
  const csv = '\uFEFF' + rows.map((r) => r.map((v) => `"${v.replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'vakif-uyeler.csv';
  a.click();
  URL.revokeObjectURL(url);
}
