import Image from 'next/image';

/** Calidad corporate logo + Install EOS product line */
export function BrandLogo() {
  return (
    <div className="brand-logo-wrap px-0.5 py-1">
      <Image
        src="/calidad-logo.png"
        alt="Calidad Services, Inc."
        width={220}
        height={52}
        className="brand-logo-img h-auto w-full max-w-[210px] object-contain object-left"
        priority
      />
      <div className="install-product-line mt-3 flex items-center gap-2">
        <span className="install-product-badge">Install</span>
        <span className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-[var(--gold)]">
          EOS L10 Scorecard
        </span>
      </div>
    </div>
  );
}
