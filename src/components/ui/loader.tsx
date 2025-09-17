import * as React from "react";
import { cn } from "@/lib/utils";
import { KynexLogo } from "../icons/kynex-logo";

interface LoaderProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'xs' | 'sm' | 'md' | 'lg';
  showText?: boolean;
  variant?: 'default' | 'inline';
}

const sizeMap = {
  xs: { width: 16, height: 16, textClass: 'text-xs', spacing: 'gap-1' },
  sm: { width: 20, height: 20, textClass: 'text-sm', spacing: 'gap-2' },
  md: { width: 24, height: 24, textClass: 'text-base', spacing: 'gap-3' },
  lg: { width: 32, height: 32, textClass: 'text-lg', spacing: 'gap-4' },
};

export const Loader = React.forwardRef<HTMLDivElement, LoaderProps>(
  ({ className, size = 'md', showText = false, variant = 'default', ...props }, ref) => {
  const { width, height, textClass, spacing } = sizeMap[size];
  
  // Inline variant for buttons - just the logo
  if (variant === 'inline') {
    return (
      <div
        ref={ref}
        className={cn("inline-flex items-center justify-center", className)}
        {...props}
      >
        <KynexLogo 
          width={width}
          height={height}
          className="animate-spin transition-all duration-300"
        />
      </div>
    );
  }
  
  // Default variant - full loader with text and dots
  return (
    <div
      ref={ref}
      className={cn(
        "flex flex-col items-center justify-center",
        spacing,
        className
      )}
      {...props}
    >
      {/* Logo image with bounce animation */}
      <div className="animate-bounce">
        <KynexLogo 
          width={width}
          height={height}
          className="transition-all duration-300"
        />
      </div>
      
      {showText && (
        <div className={cn("font-medium text-muted-foreground animate-pulse", textClass)}>
          Loading...
        </div>
      )}
    </div>
  );
  }
);

Loader.displayName = "Loader";

