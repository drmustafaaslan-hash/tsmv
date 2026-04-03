'use client';
import { useState } from 'react';
import { useStore } from '@/lib/store';
import { Field, Input, Btn } from './ui';

export default function LoginPage({
  onSuccess,
  onToast,
}: {
  onSuccess: () => void;
  onToast: (m: string, t: 'success' | 'error') => void;
}) {
  const { login } = useStore();
  const [pass, setPass] = useState('');
  const [err, setErr] = useState(false);

  const handleLogin = () => {
    if (login(pass)) {
      setErr(false);
      onToast('Giriş başarılı.', 'success');
      onSuccess();
    } else {
      setErr(true);
    }
  };

  return (
    <div className="flex items-center justify-center py-20">
      <div className="bg-white border border-[rgba(26,22,18,0.12)] rounded-xl p-9 w-full max-w-sm shadow-sm">
        <h2 className="font-serif text-[22px] text-center mb-1">Yönetim Paneli</h2>
        <p className="text-[12px] text-muted text-center mb-6">Devam etmek için şifrenizi giriniz</p>

        <Field label="Şifre">
          <Input
            type="password"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleLogin(); }}
            placeholder="••••••••"
          />
        </Field>

        {err && (
          <p className="text-[12px] text-center mb-3" style={{ color: '#8B2020' }}>
            Hatalı şifre. Lütfen tekrar deneyin.
          </p>
        )}

        <Btn variant="primary" className="w-full justify-center" onClick={handleLogin}>
          Giriş Yap
        </Btn>
      </div>
    </div>
  );
}
