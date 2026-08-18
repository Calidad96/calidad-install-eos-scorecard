import Image from 'next/image';

type BrandLogoProps = {
  /** sidebar = dashboard nav; login = logo + stacked product label */
  variant?: 'sidebar' | 'login';
};

/** Calidad corporate logo + Install EOS product label */
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
          isLogin ? 'mx-auto max-w-[200px] w-full md:mx-0' : 'w-full max-w-[210px] object-left'
        }`}
        priority
      />

      <div className={`product-label ${isLogin ? 'product-label--login' : 'product-label--sidebar mt-3'}`}>
        <p className="product-label-dept">Install</p>
        <p className="product-label-title">EOS L10 Scorecard</p>
      </div>
    </div>
  );
}
