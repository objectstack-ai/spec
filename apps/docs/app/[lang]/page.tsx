import { Database, FileJson, Layers, ShieldCheck, Zap, Globe, Cpu, LayoutTemplate, Bot, LucideIcon } from 'lucide-react';
import { HomeLayout } from 'fumadocs-ui/layouts/home';
import { baseOptions } from '@/app/layout.config';
import { getHomepageTranslations } from '@/lib/homepage-i18n';
import { HeroSection } from '@/components/hero-section';
import { CodePreview } from '@/components/code-preview';
import { FeatureCard } from '@/components/feature-card';
import { PersonaCard } from '@/components/persona-card';

export default async function HomePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const t = getHomepageTranslations(lang);

  const features = [
    {
      key: 'objectql',
      icon: Database,
      href: '/docs/objectql',
      title: t.features.objectql.title,
      description: t.features.objectql.description,
    },
    {
      key: 'objectui',
      icon: Layers,
      href: '/docs/objectui',
      title: t.features.objectui.title,
      description: t.features.objectui.description,
    },
    {
      key: 'objectos',
      icon: Zap,
      href: '/docs/objectos',
      title: t.features.objectos.title,
      description: t.features.objectos.description,
    },
    {
      key: 'security',
      icon: ShieldCheck,
      href: '/docs/objectql/security',
      title: t.features.security.title,
      description: t.features.security.description,
    },
    {
      key: 'zodFirst',
      icon: FileJson,
      href: '/docs/objectql/schema',
      title: t.features.zodFirst.title,
      description: t.features.zodFirst.description,
    },
    {
      key: 'universal',
      icon: Globe,
      href: '/docs/introduction/architecture',
      title: t.features.universal.title,
      description: t.features.universal.description,
    },
  ];

  const personas = [
    {
      key: 'architect',
      icon: LayoutTemplate,
      color: 'text-blue-500',
      href: '/docs/introduction/architecture',
      title: t.personas.architect.title,
      description: t.personas.architect.description,
      action: t.personas.architect.action,
    },
    {
      key: 'aiEngineer',
      icon: Bot,
      color: 'text-purple-500',
      href: '/docs/introduction/metadata-driven',
      title: t.personas.aiEngineer.title,
      description: t.personas.aiEngineer.description,
      action: t.personas.aiEngineer.action,
    },
    {
      key: 'frameworkBuilder',
      icon: Cpu,
      color: 'text-green-500',
      href: '/docs/developers',
      title: t.personas.frameworkBuilder.title,
      description: t.personas.frameworkBuilder.description,
      action: t.personas.frameworkBuilder.action,
    },
  ];

  return (
    <HomeLayout {...baseOptions} i18n>
      <main className="flex min-h-screen flex-col items-center justify-center text-center px-4 py-16 sm:py-24 md:py-32 overflow-hidden bg-background text-foreground selection:bg-primary/20">
        
        {/* Hero Section */}
        <HeroSection
          badge={t.badge}
          title={t.hero.title}
          subtitle={t.hero.subtitle}
          cta={t.hero.cta}
        />

        {/* Code Preview */}
        <CodePreview filename={t.codePreview.filename} />

        {/* Grid Pattern Background */}
        <div className="absolute inset-0 -z-10 h-full w-full bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

        {/* Feature Grid */}
        <div className="mt-24 grid grid-cols-1 gap-6 text-left sm:grid-cols-2 lg:grid-cols-3 max-w-6xl w-full">
          {features.map((feature) => (
            <FeatureCard 
              key={feature.key}
              icon={<feature.icon className="h-6 w-6" />}
              title={feature.title}
              href={feature.href}
              description={feature.description}
            />
          ))}
        </div>

        {/* Personas Section */}
        <div className="mt-32 mb-16 w-full max-w-5xl px-4">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-12 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            {t.personas.heading}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {personas.map((persona) => (
              <PersonaCard 
                key={persona.key}
                icon={<persona.icon className={`w-8 h-8 ${persona.color}`} />}
                title={persona.title}
                description={persona.description}
                href={persona.href}
                action={persona.action}
              />
            ))}
          </div>
        </div>

      </main>
    </HomeLayout>
  );
}

