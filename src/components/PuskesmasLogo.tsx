interface PuskesmasLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  textColor?: 'dark' | 'light';
  title?: string;
  subtitle?: string;
  className?: string;
}

const sizeClasses = {
  sm: 'h-8 w-8',
  md: 'h-11 w-11',
  lg: 'h-14 w-14',
  xl: 'h-16 w-16',
};

export default function PuskesmasLogo({
  size = 'md',
  showText = false,
  textColor = 'dark',
  title = 'UPTD PUSKESMAS CIPATUJAH',
  subtitle = 'Dinas Kesehatan Kabupaten Tasikmalaya',
  className = '',
}: PuskesmasLogoProps) {
  const isLight = textColor === 'light';

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <img
        src="/logo-puskesmas.png"
        alt="Logo UPTD Puskesmas Cipatujah"
        className={`${sizeClasses[size]} object-contain shrink-0 drop-shadow-xs`}
        loading="eager"
      />

      {showText && (
        <div className="text-left min-w-0">
          <p
            className={`truncate text-xs sm:text-sm font-black uppercase tracking-wider leading-tight ${
              isLight ? 'text-white' : 'text-slate-800'
            }`}
          >
            {title}
          </p>
          {subtitle && (
            <p
              className={`hidden sm:block truncate text-[11px] font-medium leading-tight mt-0.5 ${
                isLight ? 'text-teal-100' : 'text-slate-500'
              }`}
            >
              {subtitle}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
