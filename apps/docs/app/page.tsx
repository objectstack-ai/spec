import Link from 'next/link';
import { Database, FileJson, Layers, ShieldCheck, Zap, Globe } from 'lucide-react';
import { HomeLayout } from 'fumadocs-ui/layouts/home';
import { baseOptions } from '@/app/layout.config';

export default function HomePage() {
  return (
    <HomeLayout {...baseOptions}>
      <main className="flex min-h-screen flex-col items-center justify-center text-center px-4 py-16 sm:py-24 md:py-32 overflow-hidden bg-background text-foreground selection:bg-primary/20">
        
        {/* Hero Section */}
        <div className="relative z-10 max-w-4xl space-y-8">
          <div className="inline-flex items-center rounded-full border border-fd-primary/20 bg-fd-primary/5 px-3 py-1 text-sm text-fd-primary backdrop-blur-sm transition-colors hover:bg-fd-primary/10 hover:border-fd-primary/30">
            <span className="flex h-2 w-2 rounded-full bg-fd-primary mr-2 animate-pulse"></span>
            v1.0 Public Draft
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl md:text-7xl bg-gradient-to-br from-foreground to-foreground/60 bg-clip-text text-transparent pb-2">
            The Post-SaaS <br/> Operatings System
          </h1>
          
          <p className="mx-auto max-w-2xl text-lg text-fd-muted-foreground sm:text-xl leading-relaxed">
            ObjectStack is an open-standard protocol for defining enterprise software.
            <br className="hidden sm:inline" />
            Metadata-driven. Local-first. AI-native.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/docs"
              className="inline-flex h-12 items-center justify-center rounded-lg bg-fd-primary px-8 text-sm font-medium text-fd-primary-foreground shadow-lg shadow-fd-primary/20 transition-all hover:bg-fd-primary/90 hover:scale-105 hover:shadow-fd-primary/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-ring disabled:pointer-events-none disabled:opacity-50"
            >
              Read the Specification
            </Link>
            <a
              href="https://github.com/objectstack-ai/spec"
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-12 items-center justify-center rounded-lg border border-fd-border bg-fd-background/50 px-8 text-sm font-medium shadow-sm transition-all hover:bg-fd-accent hover:text-fd-accent-foreground backdrop-blur-sm hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-ring disabled:pointer-events-none disabled:opacity-50"
            >
              View on GitHub
            </a>
          </div>
        </div>

        {/* Grid Pattern Background */}
        <div className="absolute inset-0 -z-10 h-full w-full bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

        {/* Feature Grid */}
        <div className="mt-24 grid grid-cols-1 gap-8 text-left sm:grid-cols-2 lg:grid-cols-3 max-w-6xl w-full">
          <FeatureCard 
            icon={<Database className="h-6 w-6" />}
            title="ObjectQL Data Layer"
            description="A universal schema definition language (SDL) that abstracts SQL, NoSQL, and API datasources into a unified graph."
          />
          <FeatureCard 
            icon={<Layers className="h-6 w-6" />}
            title="ObjectUI Presentation"
            description="Declarative UI definitions for layouts, views, reports, and dashboards. Write once, render on Web, Mobile, and CLI."
          />
          <FeatureCard 
            icon={<Zap className="h-6 w-6" />}
            title="ObjectOS Runtime"
            description="Power workflows, validations, permissions, and automation rules through a portable, stateless execution engine."
          />
          <FeatureCard 
            icon={<ShieldCheck className="h-6 w-6" />}
            title="Enterprise Security"
            description="Built-in RBAC, Field-level security, and audit logs defined directly in your metadata codebase."
          />
          <FeatureCard 
            icon={<FileJson className="h-6 w-6" />}
            title="100% Typed Metadata"
            description="Every protocol definition is backed by Zod schemas and TypeScript interfaces, ensuring type-safety from definition to runtime."
          />
          <FeatureCard 
            icon={<Globe className="h-6 w-6" />}
            title="Local-First Ecosystem"
            description="Designed for edge computing and local execution. Git-ops ready with simple JSON/YAML file structures."
          />
        </div>

      </main>
    </HomeLayout>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="group relative rounded-2xl border border-fd-border bg-fd-card p-6 shadow-sm transition-all hover:border-fd-primary/20 hover:shadow-md hover:shadow-fd-primary/5">
      <div className="mb-4 inline-flex items-center justify-center rounded-lg bg-fd-primary/10 p-2 text-fd-primary transition-colors group-hover:bg-fd-primary/20">
        {icon}
      </div>
      <h3 className="mb-2 text-lg font-semibold text-fd-card-foreground group-hover:text-fd-primary transition-colors">
        {title}
      </h3>
      <p className="text-sm text-fd-muted-foreground leading-relaxed">
        {description}
      </p>
    </div>
  );
}
