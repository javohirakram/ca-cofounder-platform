import { cn } from '@/lib/utils';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

export function Logo({ size = 'md', showText = true, className }: LogoProps) {
  const markClass = {
    sm: 'h-7 w-7 rounded-lg text-[11px]',
    md: 'h-8 w-8 rounded-[10px] text-[13px]',
    lg: 'h-10 w-10 rounded-xl text-[15px]',
  };

  const labelClass = {
    sm: 'text-sm',
    md: 'text-sm',
    lg: 'text-base',
  };

  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      {/* Icon mark — gradient square with CA */}
      <div
        className={cn(
          'flex shrink-0 items-center justify-center font-black tracking-tight text-white shadow-sm select-none',
          markClass[size]
        )}
        style={{ background: 'linear-gradient(135deg, #1A4F9A 0%, #1A7A50 100%)' }}
      >
        CA
      </div>

      {/* Wordmark */}
      {showText && (
        <div className={cn('font-semibold tracking-tight leading-none', labelClass[size])}>
          <span className="text-foreground">CoFound</span>
          <span className="text-primary"> CA</span>
        </div>
      )}
    </div>
  );
}
