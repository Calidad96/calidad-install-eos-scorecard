import Image from 'next/image';

type BrandLogoProps = {
  /** sidebar = dashboard nav; login = centered on auth page */
  variant?: 'sidebar' | 'login';
};

/** Calidad corporate logo + Install EOS product line */
export function BrandLogo({ variant = 'sidebar' }: BrandLogoProps) {
  const isLogin = variant === 'login';

  return (
    <div className={`brand-logo-wrap ${isLogin ? 'brand-logo-wrap--login' : ''}`}>
      <Image
        src="/calidad-logo.png"
        alt="Calidad Services, Inc."
        width={220}
        height={52}
        className={`brand-logo-img h-auto object-contain ${
          isLogin ? 'mx-auto max-w-[200px] w-full' : 'w-full max-w-[210px] object-left'
        }`}
        priority
      />
      <div
        className={`install-product-line mt-3 flex items-center gap-2 ${
          isLogin ? 'justify-center' : ''
        }`}
      >
        <span className="install-product-badge">Install</span>
        <span className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-[var(--gold)]">
          EOS L10 Scorecard
        </span>
      </div>
    </div>
  );
}
