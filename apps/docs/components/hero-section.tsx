import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface HeroSectionProps {
  badge: {
    status: string;
    version: string;
  };
  title: {
    line1: string;
    line2: string;
  };
  subtitle: {
    line1: string;
    line2: string;
  };
  cta: {
    primary: string;
    secondary: string;
  };
  className?: string;
}

export function HeroSection({ badge, title, subtitle, cta, className }: HeroSectionProps) {
  return (
    <div className={cn("relative z-10 max-w-5xl space-y-8 animate-fade-in-up", className)}>
      {/* Badge */}
      <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm text-primary backdrop-blur-sm transition-all duration-300 hover:bg-primary/10 hover:border-primary/30 hover:scale-105">
        <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-pulse"></span>
        <span className="font-medium">{badge.status}</span>
        <span className="mx-2 text-primary/50">•</span>
        <span className="font-semibold">{badge.version}</span>
      </div>

      {/* Title */}
      <h1 className="text-5xl font-extrabold tracking-tight sm:text-7xl md:text-8xl bg-gradient-to-br from-foreground via-foreground/90 to-primary/60 bg-clip-text text-transparent pb-4 leading-tight">
        {title.line1}
        <br/>
        {title.line2}
      </h1>
      
      {/* Subtitle */}
      <p className="mx-auto max-w-2xl text-lg text-foreground/80 sm:text-xl leading-relaxed">
        {subtitle.line1}
        <br className="hidden sm:inline" />
        <span className="text-foreground font-semibold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
          {subtitle.line2}
        </span>
      </p>

      {/* CTA Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
        <Link
          href="/docs"
          className="inline-flex h-12 items-center justify-center rounded-lg border border-border bg-card/50 px-8 text-sm font-medium shadow-sm transition-all hover:bg-accent hover:text-accent-foreground backdrop-blur-sm hover:scale-105 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
        >
          {cta.secondary}
        </Link>
      </div>
    </div>
  );
}
