import { Suspense } from 'react';
import { LoginForm } from '@/components/LoginForm';

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="login-page">
          <div className="login-shell login-shell--loading">
            <div className="login-card-loading">Loading…</div>
          </div>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
