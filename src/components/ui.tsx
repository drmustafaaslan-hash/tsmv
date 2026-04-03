'use client';
import { useEffect, useRef, ReactNode } from 'react';
import { X } from 'lucide-react';
import { initials } from '@/lib/utils';

// ── BADGE ──
type BadgeVariant = 'paid' | 'pending' | 'waiting' | 'rejected' | 'profile';
const badgeStyles: Record<BadgeVariant, string> = {
  paid: 'bg-[#E8F3EC] text-[#1A5C3A]',
  pending: 'bg-[#FFF8E6] text-[#8B6400]',
  waiting: 'bg-gray-100 text-gray-500',
  rejected: 'bg-[#FEE8E8] text-[#8B2020]',
  profile: 'bg-[#E8F0FE] text-[#1A3A8B]',
};
export function Badge({ variant, children }: { variant: BadgeVariant; children: ReactNode }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium ${badgeStyles[variant]}`}>
      {children}
    </span>
  );
}

// ── BUTTON ──
type BtnVariant = 'primary' | 'secondary' | 'danger' | 'success' | 'ghost';
const btnStyles: Record<BtnVariant, string> = {
  primary: 'bg-ink text-cream border-ink hover:bg-gold hover:border-gold hover:text-ink',
  secondary: 'bg-white text-ink border-[rgba(26,22,18,0.28)] hover:border-gold hover:bg-[#F5EDD0]',
  danger: 'bg-transparent text-[#8B2020] border-[#8B2020] hover:bg-[#FEE8E8]',
  success: 'bg-[#1A5C3A] text-white border-[#1A5C3A] hover:bg-[#14472D]',
  ghost: 'bg-transparent border-transparent text-muted hover:bg-cream hover:border-[rgba(26,22,18,0.12)]',
};
export function Btn({
  variant = 'secondary', size = 'md', children, onClick, disabled, className = '', type = 'button',
}: {
  variant?: BtnVariant; size?: 'sm' | 'md'; children: ReactNode;
  onClick?: () => void; disabled?: boolean; className?: string; type?: 'button' | 'submit';
}) {
  const sizes = { sm: 'px-2.5 py-1 text-xs', md: 'px-4 py-2 text-[13px]' };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center gap-1.5 border rounded font-sans transition-all duration-150 whitespace-nowrap cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${sizes[size]} ${btnStyles[variant]} ${className}`}
    >
      {children}
    </button>
  );
}

// ── MODAL ──
export function Modal({
  open, onClose, title, subtitle, children, maxWidth = 'max-w-lg',
}: {
  open: boolean; onClose: () => void; title: string; subtitle?: string;
  children: ReactNode; maxWidth?: string;
}) {
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;
  return (
    <div
      className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(26,22,18,0.6)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className={`modal-box bg-white rounded-xl w-full ${maxWidth} shadow-2xl relative max-h-[90vh] overflow-y-auto`}>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-7 h-7 rounded-full flex items-center justify-center text-muted hover:bg-cream transition-colors"
        >
          <X size={16} />
        </button>
        <div className="p-7">
          <h2 className="font-serif text-[20px] font-semibold text-ink mb-1">{title}</h2>
          {subtitle && <p className="text-[12px] text-muted mb-5">{subtitle}</p>}
          {children}
        </div>
      </div>
    </div>
  );
}

// ── FORM FIELD ──
export function Field({
  label, hint, children,
}: { label: string; hint?: string; children: ReactNode }) {
  return (
    <div className="mb-4">
      <label className="block text-[11px] font-medium uppercase tracking-[0.07em] text-muted mb-1.5">{label}</label>
      {children}
      {hint && <p className="text-[11px] text-muted mt-1">{hint}</p>}
    </div>
  );
}

const inputBase = "w-full px-3 py-2.5 border border-[rgba(26,22,18,0.28)] rounded bg-cream text-ink text-[14px] font-sans outline-none transition-colors focus:border-gold focus:bg-white";

export function Input({ className = '', ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className={`${inputBase} ${className}`} {...props} />;
}
export function Select({ className = '', children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={`${inputBase} ${className}`} {...props}>{children}</select>;
}
export function Textarea({ className = '', ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={`${inputBase} min-h-[90px] resize-y ${className}`} {...props} />;
}

// ── AVATAR ──
export function Avatar({
  photo, name, size = 'md',
}: { photo?: string | null; name: string; size?: 'sm' | 'md' | 'lg' | 'xl' }) {
  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-9 h-9 text-sm',
    lg: 'w-16 h-16 text-xl',
    xl: 'w-20 h-20 text-2xl',
  };
  if (photo) {
    return (
      <img
        src={photo}
        alt={name}
        className={`${sizes[size]} rounded-full object-cover border border-[rgba(26,22,18,0.12)] flex-shrink-0`}
      />
    );
  }
  return (
    <div
      className={`${sizes[size]} rounded-full flex items-center justify-center flex-shrink-0 font-semibold font-serif`}
      style={{ background: '#F5EDD0', border: '1.5px solid #B8860B', color: '#B8860B' }}
    >
      {initials(name)}
    </div>
  );
}

// ── TOAST ──
export function Toast({ message, type, onClose }: { message: string; type: 'success' | 'error' | 'info'; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);

  const colors = {
    success: '#2ECC71',
    error: '#8B2020',
    info: '#B8860B',
  };

  return (
    <div
      className="toast-enter fixed bottom-5 right-5 z-[999] max-w-xs px-4 py-3 rounded-lg text-[13px] font-sans text-cream shadow-xl"
      style={{ background: '#1A1612', borderLeft: `3px solid ${colors[type]}` }}
    >
      {message}
    </div>
  );
}

// ── FILE DROP ──
export function FileDrop({
  accept, maxMB, onFile, currentName, onClear, icon = '📄', label,
}: {
  accept: string; maxMB: number; onFile: (file: File, data: string) => void;
  currentName?: string | null; onClear: () => void; icon?: string; label: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handle = async (file: File) => {
    if (file.size > maxMB * 1024 * 1024) {
      alert(`Dosya boyutu ${maxMB} MB'ı geçemez.`);
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => onFile(file, e.target?.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <div>
      <div
        className="file-drop-zone border-2 border-dashed border-[rgba(26,22,18,0.28)] rounded-lg p-5 text-center cursor-pointer hover:border-gold hover:bg-[#F5EDD0]"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('dragover'); }}
        onDragLeave={(e) => e.currentTarget.classList.remove('dragover')}
        onDrop={(e) => {
          e.preventDefault();
          e.currentTarget.classList.remove('dragover');
          const f = e.dataTransfer.files[0];
          if (f) handle(f);
        }}
      >
        <div className="text-2xl mb-1.5">{currentName ? '✅' : icon}</div>
        <div className="text-[13px] text-muted">
          <strong className="text-ink">{label}</strong> veya sürükle bırak
        </div>
        <div className="text-[11px] text-muted mt-1">{accept.toUpperCase()} — Max {maxMB} MB</div>
      </div>
      {currentName && (
        <div className="mt-2 px-3 py-2 bg-[#E8F3EC] rounded text-[12px] text-[#1A5C3A] flex items-center gap-2">
          <span>✓</span><span className="flex-1 truncate">{currentName}</span>
          <button onClick={onClear} className="text-[16px] text-muted hover:text-ink leading-none">×</button>
        </div>
      )}
      <input ref={inputRef} type="file" accept={accept} className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handle(f); }} />
    </div>
  );
}

// ── CONFIRM DIALOG ──
export function ConfirmDialog({
  open, title, message, onConfirm, onCancel,
}: { open: boolean; title: string; message: string; onConfirm: () => void; onCancel: () => void }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" style={{ background: 'rgba(26,22,18,0.7)' }}>
      <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-2xl">
        <h3 className="font-serif text-[18px] mb-2">{title}</h3>
        <p className="text-[13px] text-muted mb-5">{message}</p>
        <div className="flex gap-2 justify-end">
          <Btn variant="ghost" onClick={onCancel}>İptal</Btn>
          <Btn variant="danger" onClick={onConfirm}>Evet, Devam Et</Btn>
        </div>
      </div>
    </div>
  );
}
