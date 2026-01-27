import { Database, FileJson, Layers, ShieldCheck, Zap, Globe, Cpu, LayoutTemplate, Bot } from 'lucide-react';
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
          <FeatureCard 
            icon={<Database className="h-6 w-6" />}
            title={t.features.objectql.title}
            href="/docs/objectql"
            description={t.features.objectql.description}
          />
          <FeatureCard 
            icon={<Layers className="h-6 w-6" />}
            title={t.features.objectui.title}
            href="/docs/objectui"
            description={t.features.objectui.description}
          />
          <FeatureCard 
            icon={<Zap className="h-6 w-6" />}
            title={t.features.objectos.title}
            href="/docs/objectos"
            description={t.features.objectos.description}
          />
          <FeatureCard 
            icon={<ShieldCheck className="h-6 w-6" />}
            title={t.features.security.title}
            href="/docs/objectql/security"
            description={t.features.security.description}
          />
          <FeatureCard 
            icon={<FileJson className="h-6 w-6" />}
            title={t.features.zodFirst.title}
            href="/docs/objectql/schema"
            description={t.features.zodFirst.description}
          />
          <FeatureCard 
            icon={<Globe className="h-6 w-6" />}
            title={t.features.universal.title}
            href="/docs/introduction/architecture"
            description={t.features.universal.description}
          />
        </div>

        {/* Personas Section */}
        <div className="mt-32 mb-16 w-full max-w-5xl px-4">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-12 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            {t.personas.heading}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <PersonaCard 
              icon={<LayoutTemplate className="w-8 h-8 text-blue-500" />}
              title={t.personas.architect.title}
              description={t.personas.architect.description}
              href="/docs/introduction/architecture"
              action={t.personas.architect.action}
            />
            <PersonaCard 
              icon={<Bot className="w-8 h-8 text-purple-500" />}
              title={t.personas.aiEngineer.title}
              description={t.personas.aiEngineer.description}
              href="/docs/introduction/metadata-driven"
              action={t.personas.aiEngineer.action}
            />
            <PersonaCard 
              icon={<Cpu className="w-8 h-8 text-green-500" />}
              title={t.personas.frameworkBuilder.title}
              description={t.personas.frameworkBuilder.description}
              href="/docs/developers"
              action={t.personas.frameworkBuilder.action}
            />
          </div>
        </div>

      </main>
    </HomeLayout>
  );
}

