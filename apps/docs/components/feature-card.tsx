import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  href?: string;
  className?: string;
}

export function FeatureCard({ icon, title, description, href, className }: FeatureCardProps) {
  const CardContent = (
    <Card className={cn(
      "group relative h-full p-6 hover:border-primary/20 hover:shadow-md hover:shadow-primary/5 cursor-pointer transition-all duration-300",
      className
    )}>
      <div className="mb-4 inline-flex items-center justify-center rounded-lg bg-primary/10 p-3 text-primary transition-all duration-300 group-hover:bg-primary/20 group-hover:scale-110">
        {icon}
      </div>
      <h3 className="mb-2 text-lg font-semibold text-card-foreground group-hover:text-primary transition-colors">
        {title}
      </h3>
      <p className="text-sm text-foreground/70 leading-relaxed">
        {description}
      </p>
    </Card>
  );

  if (href) {
    return (
      <Link href={href} className="block h-full">
        {CardContent}
      </Link>
    );
  }

  return CardContent;
}
