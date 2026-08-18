'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle2, Loader2, ShieldCheck } from 'lucide-react';
import { BrandLogo } from './BrandLogo';

const FEATURES = [
  'Accountability, KPIs, rocks, and to-dos in one place',
  'Monday hub boards synced daily',
  'CAPA/IDS and SOP tracking for Install',
];

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const json = await res.json();

      if (!res.ok) {
        setError(json.error ?? 'Sign in failed');
        return;
      }

      const from = searchParams.get('from');
      router.push(from && from !== '/login' ? from : '/');
      router.refresh();
    } catch {
      setError('Could not reach the server. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-ambient" aria-hidden>
        <span className="login-grid" />
        <span className="login-orb login-orb-royal" />
        <span className="login-orb login-orb-gold" />
      </div>

      <div className="login-shell">
        <section className="login-brand-panel" aria-label="Install EOS Scorecard">
          <div className="login-brand-inner">
            <BrandLogo variant="login" />

            <div className="login-brand-copy">
              <p className="login-brand-eyebrow">Install Department</p>
              <h1 className="login-brand-title">EOS L10 Scorecard</h1>
              <p className="login-brand-desc">
                Executive command center for Install accountability, weekly metrics, rocks, and
                operations.
              </p>
            </div>

            <ul className="login-brand-features">
              {FEATURES.map((item) => (
                <li key={item}>
                  <CheckCircle2 size={15} className="login-brand-feature-icon" aria-hidden />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="login-form-panel" aria-label="Sign in">
          <div className="login-form-inner">
            <header className="login-form-header">
              <h2 className="login-form-title">Sign in</h2>
              <p className="login-form-subtitle">Use your Calidad credentials to access the dashboard</p>
            </header>

            <form className="login-form" onSubmit={handleSubmit}>
              <label className="login-field">
                <span className="login-label">Email</span>
                <input
                  type="email"
                  name="email"
                  autoComplete="username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="login-input"
                  placeholder="you@company.com"
                  required
                />
              </label>

              <label className="login-field">
                <span className="login-label">Password</span>
                <input
                  type="password"
                  name="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="login-input"
                  placeholder="Enter password"
                  required
                />
              </label>

              {error && (
                <p className="login-error" role="alert">
                  {error}
                </p>
              )}

              <button type="submit" className="login-submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 size={15} className="animate-spin" />
                    Signing in…
                  </>
                ) : (
                  'Sign in'
                )}
              </button>
            </form>

            <footer className="login-footnote">
              <ShieldCheck size={13} className="login-footnote-icon" aria-hidden />
              <span>Authorized team access only</span>
            </footer>
          </div>
        </section>
      </div>
    </div>
  );
}
