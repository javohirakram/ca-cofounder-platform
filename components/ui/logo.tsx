import { cn } from '@/lib/utils';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

export function Logo({ size = 'md', showText = true, className }: LogoProps) {
  const sizes = {
    sm: 'h-7 w-7',
    md: 'h-8 w-8',
    lg: 'h-10 w-10',
  };

  const textSizes = {
    sm: 'text-sm',
    md: 'text-sm',
    lg: 'text-lg',
  };

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div
        className={cn(
          'relative flex items-center justify-center rounded-xl bg-gradient-to-br from-primary via-primary to-primary/80 text-primary-foreground shadow-sm',
          sizes[size]
        )}
      >
        <svg
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-[60%] w-[60%]"
        >
          {/* Two interlocking circles representing co-founders connecting */}
          <circle
            cx="11"
            cy="16"
            r="8"
            stroke="currentColor"
            strokeWidth="2.5"
            fill="none"
            opacity="0.9"
          />
          <circle
            cx="21"
            cy="16"
            r="8"
            stroke="currentColor"
            strokeWidth="2.5"
            fill="none"
            opacity="0.9"
          />
        </svg>
      </div>
      {showText && (
        <div className={cn('font-semibold tracking-tight leading-none', textSizes[size])}>
          <span className="text-foreground">CoFound</span>
          <span className="text-primary/70"> CA</span>
        </div>
      )}
    </div>
  );
}
