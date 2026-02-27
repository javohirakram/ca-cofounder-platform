import { cn } from '@/lib/utils';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

// CA brand colors
const BLUE = '#1A4F9A';
const GREEN = '#2E8B57';

export function Logo({ size = 'md', showText = true, className }: LogoProps) {
  const sizeMap = {
    sm: { letterClass: 'text-[20px]', labelClass: 'text-sm', arrow: 6 },
    md: { letterClass: 'text-[24px]', labelClass: 'text-sm', arrow: 7 },
    lg: { letterClass: 'text-[30px]', labelClass: 'text-lg', arrow: 9 },
  };

  const { letterClass, labelClass, arrow } = sizeMap[size];

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {/* ── CA logo mark ── */}
      <div className="relative flex items-baseline">
        {/* Blue C */}
        <span
          className={cn('font-black tracking-tighter leading-none select-none', letterClass)}
          style={{ color: BLUE }}
        >
          C
        </span>
        {/* Green A */}
        <span
          className={cn('font-black tracking-tighter leading-none select-none', letterClass)}
          style={{ color: GREEN }}
        >
          A
        </span>

        {/* Upward arrow decoration */}
        <svg
          aria-hidden="true"
          className="absolute"
          style={{ top: `-${arrow}px`, right: `-${arrow * 0.3}px` }}
          width={arrow}
          height={arrow + 2}
          viewBox="0 0 8 10"
          fill="none"
        >
          <path
            d="M4 9V2M4 2L1 5M4 2L7 5"
            stroke={GREEN}
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        {/* Sparkle dot */}
        <span
          aria-hidden="true"
          className="absolute rounded-full"
          style={{
            width: `${Math.round(arrow * 0.42)}px`,
            height: `${Math.round(arrow * 0.42)}px`,
            background: GREEN,
            top: `-${Math.round(arrow * 1.35)}px`,
            right: `-${Math.round(arrow * 1.1)}px`,
          }}
        />
      </div>

      {/* ── Wordmark ── */}
      {showText && (
        <div className={cn('font-semibold tracking-tight leading-none', labelClass)}>
          <span className="text-foreground">CoFound</span>
          <span style={{ color: GREEN }}>&nbsp;CA</span>
        </div>
      )}
    </div>
  );
}
