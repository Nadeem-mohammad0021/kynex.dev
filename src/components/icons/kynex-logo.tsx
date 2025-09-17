"use client";

import { cn } from "@/lib/utils";
import Image from "next/image";
import { useState } from "react";

interface KynexLogoProps {
  className?: string;
  width?: number;
  height?: number;
}

export function KynexLogo({ className, width = 32, height = 32 }: KynexLogoProps) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  return (
    <div
      className={cn("relative inline-flex items-center justify-center p-0 m-0", className)}
      style={{ width, height }}
    >
      {!error ? (
        <Image
          src="/images/logo.png"
          alt="KYNEX Logo"
          width={width}
          height={height}
          className={cn("object-contain transition-opacity duration-300", loaded ? "opacity-100" : "opacity-80")}
          style={{ display: 'block' }}
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
          priority
        />
      ) : (
        <div
          className="text-xs font-semibold text-primary/70"
          aria-label="logo-fallback"
          style={{ lineHeight: 1 }}
        >
          K
        </div>
      )}
    </div>
  );
}
