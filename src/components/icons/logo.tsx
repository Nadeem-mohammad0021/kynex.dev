import * as React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface LogoProps extends React.HTMLAttributes<HTMLDivElement> {
  width?: number;
  height?: number;
}

export function Logo({ className, width = 40, height = 40, ...props }: LogoProps) {
  return (
    <div
      className={cn("relative inline-flex items-center justify-center", className)}
      style={{ width, height }}
      {...props}
    >
      <Image
        src="/images/logo.png"
        alt="Logo"
        width={width}
        height={height}
        className="object-contain transition-opacity duration-300"
        priority
      />
    </div>
  );
}
