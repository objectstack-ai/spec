import Link from 'next/link';
import { Database, FileJson, Layers, ShieldCheck, Zap, Globe, Cpu, LayoutTemplate, Bot } from 'lucide-react';
import { HomeLayout } from 'fumadocs-ui/layouts/home';
import { baseOptions } from '@/app/layout.config';
import { getHomepageTranslations } from '@/lib/homepage-i18n';

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
        <div className="relative z-10 max-w-5xl space-y-8">
          <div className="inline-flex items-center rounded-full border border-fd-primary/20 bg-fd-primary/5 px-3 py-1 text-sm text-fd-primary backdrop-blur-sm transition-colors hover:bg-fd-primary/10 hover:border-fd-primary/30">
            <span className="flex h-2 w-2 rounded-full bg-fd-primary mr-2 animate-pulse"></span>
            {t.badge.status} {t.badge.version}
          </div>

          <h1 className="text-5xl font-extrabold tracking-tight sm:text-7xl md:text-8xl bg-gradient-to-br from-foreground via-foreground/90 to-fd-primary/60 bg-clip-text text-transparent pb-4">
            {t.hero.title.line1} <br/> {t.hero.title.line2}
          </h1>
          
          <p className="mx-auto max-w-2xl text-lg text-fd-foreground/80 sm:text-xl leading-relaxed">
            {t.hero.subtitle.line1}
            <br className="hidden sm:inline" />
            <span className="text-fd-foreground font-semibold">{t.hero.subtitle.line2}</span>
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/docs/guides/getting-started"
              className="inline-flex h-12 items-center justify-center rounded-lg bg-fd-primary px-8 text-sm font-medium text-fd-primary-foreground shadow-lg shadow-fd-primary/20 transition-all hover:bg-fd-primary/90 hover:scale-105 hover:shadow-fd-primary/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-ring disabled:pointer-events-none disabled:opacity-50"
            >
              {t.hero.cta.primary}
            </Link>
            <Link
              href="/docs"
              className="inline-flex h-12 items-center justify-center rounded-lg border border-fd-border bg-fd-card/50 px-8 text-sm font-medium shadow-sm transition-all hover:bg-fd-accent hover:text-fd-accent-foreground backdrop-blur-sm hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-ring disabled:pointer-events-none disabled:opacity-50"
            >
              {t.hero.cta.secondary}
            </Link>
          </div>

          {/* Code Preview Decorator */}
          <div className="relative mx-auto mt-12 w-full max-w-3xl transform rounded-xlbg-gradient-to-br from-fd-border/50 to-fd-border/10 p-2 opacity-90 transition-all hover:scale-[1.01] hover:opacity-100 sm:mt-16">
            <div className="overflow-hidden rounded-xl border border-fd-border bg-fd-card shadow-2xl">
              <div className="flex items-center gap-2 border-b border-fd-border bg-fd-muted/50 px-4 py-3">
                <div className="h-3 w-3 rounded-full bg-red-500/80" />
                <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
                <div className="h-3 w-3 rounded-full bg-green-500/80" />
                <div className="ml-2 text-xs font-medium text-fd-muted-foreground font-mono">
                  {t.codePreview.filename}
                </div>
              </div>
              <div className="overflow-x-auto p-6 text-left">
                <pre className="font-mono text-sm leading-6">
                  <span className="text-purple-400">import</span> <span className="text-fd-foreground">{'{'}</span> <span className="text-yellow-300">ObjectProtocol</span> <span className="text-fd-foreground">{'}'}</span> <span className="text-purple-400">from</span> <span className="text-green-300">'@objectstack/spec'</span>;<br/><br/>
                  <span className="text-purple-400">export const</span> <span className="text-blue-300">Issue</span> <span className="text-purple-400">=</span> <span className="text-yellow-300">ObjectProtocol</span>.<span className="text-blue-300">define</span>(<span className="text-fd-foreground">{'{'}</span><br/>
                  &nbsp;&nbsp;code: <span className="text-green-300">'issue_tracker'</span>,<br/>
                  &nbsp;&nbsp;fields: <span className="text-fd-foreground">{'{'}</span><br/>
                  &nbsp;&nbsp;&nbsp;&nbsp;summary: <span className="text-yellow-300">Field</span>.<span className="text-blue-300">text</span>(<span className="text-fd-foreground">{'{'}</span> required: <span className="text-red-300">true</span> <span className="text-fd-foreground">{'}'}</span>),<br/>
                  &nbsp;&nbsp;&nbsp;&nbsp;priority: <span className="text-yellow-300">Field</span>.<span className="text-blue-300">select</span>([<span className="text-green-300">'P0'</span>, <span className="text-green-300">'P1'</span>, <span className="text-green-300">'P2'</span>]),<br/>
                  &nbsp;&nbsp;&nbsp;&nbsp;assignee: <span className="text-yellow-300">Field</span>.<span className="text-blue-300">lookup</span>(<span className="text-green-300">'users'</span>)<br/>
                  &nbsp;&nbsp;<span className="text-fd-foreground">{'}'}</span>,<br/>
                  &nbsp;&nbsp;policy: <span className="text-fd-foreground">{'{'}</span> <span className="text-blue-300">audit</span>: <span className="text-red-300">true</span>, <span className="text-blue-300">api_access</span>: <span className="text-green-300">'public'</span> <span className="text-fd-foreground">{'}'}</span><br/>
                  <span className="text-fd-foreground">{'}'}</span>);
                </pre>
              </div>
            </div>
            {/* Glow Effect behind Code */}
            <div className="absolute -inset-4 -z-10 bg-fd-primary/20 blur-3xl opacity-30 rounded-[50%]" />
          </div>
        </div>

        {/* Grid Pattern Background */}
        <div className="absolute inset-0 -z-10 h-full w-full bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

        {/* Feature Grid */}
        <div className="mt-24 grid grid-cols-1 gap-8 text-left sm:grid-cols-2 lg:grid-cols-3 max-w-6xl w-full">
          <FeatureCard 
            icon={<Database className="h-6 w-6" />}
            title={t.features.objectql.title}
            href="/docs/specifications/data/architecture"
            description={t.features.objectql.description}
          />
          <FeatureCard 
            icon={<Layers className="h-6 w-6" />}
            title={t.features.objectui.title}
            href="/docs/specifications/ui/sdui-protocol"
            description={t.features.objectui.description}
          />
          <FeatureCard 
            icon={<Zap className="h-6 w-6" />}
            title={t.features.objectos.title}
            href="/docs/specifications/server/kernel-architecture"
            description={t.features.objectos.description}
          />
          <FeatureCard 
            icon={<ShieldCheck className="h-6 w-6" />}
            title={t.features.security.title}
            href="/docs/specifications/server/permission-governance"
            description={t.features.security.description}
          />
          <FeatureCard 
            icon={<FileJson className="h-6 w-6" />}
            title={t.features.zodFirst.title}
            href="/docs/specifications/data/schema-definition"
            description={t.features.zodFirst.description}
          />
          <FeatureCard 
            icon={<Globe className="h-6 w-6" />}
            title={t.features.universal.title}
            href="/docs/concepts/architecture"
            description={t.features.universal.description}
          />
        </div>

        {/* Personas Section */}
        <div className="mt-32 mb-16 w-full max-w-5xl px-4">
          <h2 className="text-3xl font-bold tracking-tight mb-12 bg-gradient-to-r from-fd-foreground to-fd-foreground/70 bg-clip-text text-transparent">
             {t.personas.heading}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             <PersonaCard 
                icon={<LayoutTemplate className="w-8 h-8 mb-4 text-blue-500" />}
                title={t.personas.architect.title}
                description={t.personas.architect.description}
                href="/docs/concepts/enterprise-patterns"
                action={t.personas.architect.action}
             />
             <PersonaCard 
                icon={<Bot className="w-8 h-8 mb-4 text-purple-500" />}
                title={t.personas.aiEngineer.title}
                description={t.personas.aiEngineer.description}
                href="/docs/concepts/ai-codex"
                action={t.personas.aiEngineer.action}
             />
             <PersonaCard 
                icon={<Cpu className="w-8 h-8 mb-4 text-green-500" />}
                title={t.personas.frameworkBuilder.title}
                description={t.personas.frameworkBuilder.description}
                href="/docs/specifications/data/architecture"
                action={t.personas.frameworkBuilder.action}
             />
          </div>
        </div>

      </main>
    </HomeLayout>
  );
}

function FeatureCard({ icon, title, description, href }: { icon: React.ReactNode; title: string; description: string; href?: string }) {
  const CardContent = (
    <div className="group relative h-full rounded-2xl border border-fd-border bg-fd-card p-6 shadow-sm transition-all hover:border-fd-primary/20 hover:shadow-md hover:shadow-fd-primary/5 cursor-pointer">
      <div className="mb-4 inline-flex items-center justify-center rounded-lg bg-fd-primary/10 p-2 text-fd-primary transition-colors group-hover:bg-fd-primary/20">
        {icon}
      </div>
      <h3 className="mb-2 text-lg font-semibold text-fd-card-foreground group-hover:text-fd-primary transition-colors">
        {title}
      </h3>
      <p className="text-sm text-fd-foreground/70 leading-relaxed">
        {description}
      </p>
    </div>
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

function PersonaCard({ icon, title, description, href, action }: { icon: React.ReactNode; title: string; description: string; href: string; action: string }) {
  return (
    <Link href={href} className="flex flex-col items-start p-8 rounded-2xl bg-fd-secondary/30 border border-fd-border/50 hover:bg-fd-secondary/60 hover:border-fd-primary/30 transition-all group text-left">
      {icon}
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-fd-foreground/70 mb-6 text-sm leading-relaxed flex-grow text-left">
        {description}
      </p>
      <div className="flex items-center text-sm font-semibold text-fd-primary mt-auto group-hover:translate-x-1 transition-transform">
        {action} <span className="ml-1">→</span>
      </div>
    </Link>
  )
}
