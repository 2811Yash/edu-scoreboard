
import React from 'react';
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function Logo({ className, size = 'md' }: LogoProps) {
  const sizeClasses = {
    sm: 'h-8',
    md: 'h-10',
    lg: 'h-12',
  };

  return (
    <div className={cn('flex items-center', className)}>
      <div className="relative">
        <div className={cn('text-primary font-bold flex items-center gap-2', sizeClasses[size])}>
          <div className="relative">
            <div className="absolute -inset-1 rounded-full bg-primary/20 animate-pulse"></div>
            <div className="relative rounded-full h-8 w-8 bg-primary flex items-center justify-center">
              <span className="text-white font-bold text-sm">GS</span>
            </div>
          </div>
          <span className="tracking-tight">GradeSync</span>
        </div>
      </div>
    </div>
  );
}
