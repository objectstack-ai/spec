import { Database, Monitor, HardDrive, ShieldCheck, Puzzle, Code2, Rocket, Users, Blocks, LucideIcon } from 'lucide-react';
import { HomeLayout } from 'fumadocs-ui/layouts/home';
import { baseOptions } from '@/lib/layout.shared';
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
      key: 'restApi',
      icon: Rocket,
      href: '/docs/getting-started/quick-start',
      title: t.features.restApi.title,
      description: t.features.restApi.description,
    },
    {
      key: 'studio',
      icon: Monitor,
      href: '/docs/getting-started/cli',
      title: t.features.studio.title,
      description: t.features.studio.description,
    },
    {
      key: 'multiDb',
      icon: HardDrive,
      href: '/docs/guides/driver-configuration',
      title: t.features.multiDb.title,
      description: t.features.multiDb.description,
    },
    {
      key: 'typeSafety',
      icon: ShieldCheck,
      href: '/docs/references/data',
      title: t.features.typeSafety.title,
      description: t.features.typeSafety.description,
    },
    {
      key: 'namespace',
      icon: Blocks,
      href: '/docs/concepts/core',
      title: t.features.namespace.title,
      description: t.features.namespace.description,
    },
    {
      key: 'plugins',
      icon: Puzzle,
      href: '/docs/getting-started/examples',
      title: t.features.plugins.title,
      description: t.features.plugins.description,
    },
  ];

  const personas = [
    {
      key: 'fullStack',
      icon: Code2,
      color: 'text-blue-500',
      href: '/docs/getting-started/quick-start',
      title: t.personas.fullStack.title,
      description: t.personas.fullStack.description,
      action: t.personas.fullStack.action,
    },
    {
      key: 'platformTeam',
      icon: Users,
      color: 'text-purple-500',
      href: '/docs/concepts',
      title: t.personas.platformTeam.title,
      description: t.personas.platformTeam.description,
      action: t.personas.platformTeam.action,
    },
    {
      key: 'lowCode',
      icon: Blocks,
      color: 'text-green-500',
      href: '/docs/getting-started/examples',
      title: t.personas.lowCode.title,
      description: t.personas.lowCode.description,
      action: t.personas.lowCode.action,
    },
  ];

  return (
    <HomeLayout {...baseOptions()} i18n>
      <main className="flex min-h-screen flex-col items-center justify-center text-center px-4 py-16 sm:py-24 md:py-32 overflow-hidden bg-background text-foreground selection:bg-primary/20">
        
        {/* Hero Section */}
        <HeroSection
          badge={t.badge}
          title={t.hero.title}
          subtitle={t.hero.subtitle}
          cta={t.hero.cta}
          quickStart={t.hero.quickStart}
        />

        {/* Code Preview */}
        <CodePreview />

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

