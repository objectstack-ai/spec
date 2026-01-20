import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface PersonaCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  href: string;
  action: string;
  className?: string;
}

export function PersonaCard({ icon, title, description, href, action, className }: PersonaCardProps) {
  return (
    <Link href={href} className="block h-full group">
      <Card className={cn(
        "flex flex-col items-start p-8 bg-secondary/30 border-border/50 hover:bg-secondary/60 hover:border-primary/30 transition-all duration-300 h-full",
        className
      )}>
        <div className="mb-4 transition-transform duration-300 group-hover:scale-110">
          {icon}
        </div>
        <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">
          {title}
        </h3>
        <p className="text-foreground/70 mb-6 text-sm leading-relaxed flex-grow">
          {description}
        </p>
        <div className="flex items-center gap-2 text-sm font-semibold text-primary mt-auto group-hover:gap-3 transition-all duration-300">
          <span>{action}</span>
          <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
        </div>
      </Card>
    </Link>
  );
}
