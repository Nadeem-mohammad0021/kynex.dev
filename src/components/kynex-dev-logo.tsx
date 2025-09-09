'use client';

import { cn } from '@/lib/utils';
import { KynexLogo } from './icons/kynex-logo';

interface KynexDevLogoProps {
  className?: string;
  logoSize?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  textOnly?: boolean;
  onClick?: () => void;
  role?: string;
}

export function KynexDevLogo({ 
  className, 
  logoSize = 'md', 
  showIcon = true, 
  textOnly = false, 
  onClick,
  role
}: KynexDevLogoProps) {
  const logoSizes = {
    sm: { width: 24, height: 24, text: 'text-lg' },
    md: { width: 32, height: 32, text: 'text-2xl' },
    lg: { width: 40, height: 40, text: 'text-3xl' }
  };

  const { width, height, text } = logoSizes[logoSize];

  const logoContent = (
    <>
      {!textOnly && showIcon && (
        <KynexLogo 
          width={width} 
          height={height} 
          className={cn(
            logoSize === 'sm' ? 'h-6 w-6' : 
            logoSize === 'md' ? 'h-8 w-8' : 'h-10 w-10'
          )} 
        />
      )}
      <div className="flex items-baseline gap-0">
        <span className={cn("font-quador logo-text tracking-tight", text)}>
          KYNEX
        </span>
        <span className={cn("font-quador logo-text text-muted-foreground/80", 
          logoSize === 'sm' ? 'text-sm' : 
          logoSize === 'md' ? 'text-base' : 'text-lg'
        )}>
          .dev
        </span>
      </div>
    </>
  );

  if (onClick) {
    return (
      <button 
        type="button"
        onClick={onClick}
        role={role}
        className={cn(
          textOnly ? "flex items-baseline gap-0" : "flex items-center gap-2",
          className
        )}
        aria-label="KYNEX.dev Home"
      >
        {logoContent}
      </button>
    );
  }

  return (
    <div className={cn(
      textOnly ? "flex items-baseline gap-0" : "flex items-center gap-2",
      className
    )}>
      {logoContent}
    </div>
  );
}
