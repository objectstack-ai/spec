import Link from 'next/link';
import { Database, FileJson, Layers, ShieldCheck, Zap, Globe } from 'lucide-react';
import { HomeLayout } from 'fumadocs-ui/layouts/home';
import { baseOptions } from '@/app/layout.config';

export default function HomePage() {
  return (
    <HomeLayout {...baseOptions}>
      <main className="flex min-h-screen flex-col items-center justify-center text-center px-4 py-16 sm:py-24 md:py-32 overflow-hidden bg-background text-foreground selection:bg-primary/20">
        
        {/* Hero Section */}
        <div className="relative z-10 max-w-5xl space-y-8">
          <div className="inline-flex items-center rounded-full border border-fd-primary/20 bg-fd-primary/5 px-3 py-1 text-sm text-fd-primary backdrop-blur-sm transition-colors hover:bg-fd-primary/10 hover:border-fd-primary/30">
            <span className="flex h-2 w-2 rounded-full bg-fd-primary mr-2 animate-pulse"></span>
            Protocol Specification v1.0
          </div>

          <h1 className="text-5xl font-extrabold tracking-tight sm:text-7xl md:text-8xl bg-gradient-to-br from-foreground via-foreground/90 to-fd-primary/60 bg-clip-text text-transparent pb-4">
            The ObjectStack <br/> Protocol
          </h1>
          
          <p className="mx-auto max-w-2xl text-lg text-fd-muted-foreground sm:text-xl leading-relaxed">
            The Open Standard for Metadata-Driven Enterprise Software.
            <br className="hidden sm:inline" />
            <span className="text-fd-foreground font-medium">Validatable. Database-Agnostic. AI-Native.</span>
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
              className="inline-flex h-12 items-center justify-center rounded-lg border border-fd-border bg-fd-card/50 px-8 text-sm font-medium shadow-sm transition-all hover:bg-fd-accent hover:text-fd-accent-foreground backdrop-blur-sm hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-ring disabled:pointer-events-none disabled:opacity-50"
            >
              View on GitHub
            </a>
          </div>

          {/* Code Preview Decorator */}
          <div className="relative mx-auto mt-12 w-full max-w-3xl transform rounded-xlbg-gradient-to-br from-fd-border/50 to-fd-border/10 p-2 opacity-90 transition-all hover:scale-[1.01] hover:opacity-100 sm:mt-16">
            <div className="overflow-hidden rounded-xl border border-fd-border bg-fd-card shadow-2xl">
              <div className="flex items-center gap-2 border-b border-fd-border bg-fd-muted/50 px-4 py-3">
                <div className="h-3 w-3 rounded-full bg-red-500/80" />
                <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
                <div className="h-3 w-3 rounded-full bg-green-500/80" />
                <div className="ml-2 text-xs font-medium text-fd-muted-foreground font-mono">
                  contract.zod.ts
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
            title="ObjectQL Data Layer"
            description="Strict JSON schemas for entities, fields, and relationships. It is the SQL you can send over the wire."
          />
          <FeatureCard 
            icon={<Layers className="h-6 w-6" />}
            title="ObjectUI View Layer"
            description="Server-Driven UI protocol defining forms, grids, and dashboards. Decouples logic from the frontend implementation."
          />
          <FeatureCard 
            icon={<Zap className="h-6 w-6" />}
            title="ObjectOS Kernel"
            description="The runtime contract for permissions, workflows, and automation. Stateless business logic execution."
          />
          <FeatureCard 
            icon={<ShieldCheck className="h-6 w-6" />}
            title="Zero-Trust Security"
            description="Policy-as-Code. ACLs and Field Level Security are compiled into the database query engine."
          />
          <FeatureCard 
            icon={<FileJson className="h-6 w-6" />}
            title="Zod-First Definition"
            description="The entire protocol is defined in Zod. Runtime validation and static type inference come for free."
          />
          <FeatureCard 
            icon={<Globe className="h-6 w-6" />}
            title="Universal Backend"
            description="Protocol adapters for Postgres, MongoDB, REST and GraphQL. Write once, run on any infrastructure."
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
