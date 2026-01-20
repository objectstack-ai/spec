import { cn } from '@/lib/utils';

interface CodePreviewProps {
  filename: string;
  className?: string;
}

export function CodePreview({ filename, className }: CodePreviewProps) {
  return (
    <div className={cn(
      "relative mx-auto mt-12 w-full max-w-3xl transform rounded-xl bg-gradient-to-br from-border/50 to-border/10 p-[2px] opacity-90 transition-all hover:scale-[1.01] hover:opacity-100 sm:mt-16",
      className
    )}>
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-2xl">
        {/* Window Controls */}
        <div className="flex items-center gap-2 border-b border-border bg-muted/50 px-4 py-3">
          <div className="h-3 w-3 rounded-full bg-red-500/80 transition-colors hover:bg-red-500" />
          <div className="h-3 w-3 rounded-full bg-yellow-500/80 transition-colors hover:bg-yellow-500" />
          <div className="h-3 w-3 rounded-full bg-green-500/80 transition-colors hover:bg-green-500" />
          <div className="ml-2 text-xs font-medium text-muted-foreground font-mono">
            {filename}
          </div>
        </div>
        
        {/* Code Content */}
        <div className="overflow-x-auto p-6 text-left bg-gradient-to-br from-card to-muted/20">
          <pre className="font-mono text-sm leading-7">
            <code>
              <span className="text-purple-600 dark:text-purple-400 font-semibold">import</span>{' '}
              <span className="text-foreground">{'{'}</span>{' '}
              <span className="text-amber-600 dark:text-yellow-300">ObjectProtocol</span>{' '}
              <span className="text-foreground">{'}'}</span>{' '}
              <span className="text-purple-600 dark:text-purple-400 font-semibold">from</span>{' '}
              <span className="text-green-600 dark:text-green-300">&apos;@objectstack/spec&apos;</span>;
              <br/><br/>
              <span className="text-purple-600 dark:text-purple-400 font-semibold">export const</span>{' '}
              <span className="text-blue-600 dark:text-blue-300">Issue</span>{' '}
              <span className="text-purple-600 dark:text-purple-400">=</span>{' '}
              <span className="text-amber-600 dark:text-yellow-300">ObjectProtocol</span>.
              <span className="text-blue-600 dark:text-blue-300">define</span>
              <span className="text-foreground">(</span>
              <span className="text-foreground">{'{'}</span>
              <br/>
              &nbsp;&nbsp;<span className="text-cyan-600 dark:text-sky-300">code</span>: <span className="text-green-600 dark:text-green-300">&apos;issue_tracker&apos;</span>,
              <br/>
              &nbsp;&nbsp;<span className="text-cyan-600 dark:text-sky-300">fields</span>: <span className="text-foreground">{'{'}</span>
              <br/>
              &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-cyan-600 dark:text-sky-300">summary</span>: <span className="text-amber-600 dark:text-yellow-300">Field</span>.<span className="text-blue-600 dark:text-blue-300">text</span>(<span className="text-foreground">{'{'}</span> <span className="text-cyan-600 dark:text-sky-300">required</span>: <span className="text-red-600 dark:text-red-300">true</span> <span className="text-foreground">{'}'}</span>),
              <br/>
              &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-cyan-600 dark:text-sky-300">priority</span>: <span className="text-amber-600 dark:text-yellow-300">Field</span>.<span className="text-blue-600 dark:text-blue-300">select</span>([<span className="text-green-600 dark:text-green-300">&apos;P0&apos;</span>, <span className="text-green-600 dark:text-green-300">&apos;P1&apos;</span>, <span className="text-green-600 dark:text-green-300">&apos;P2&apos;</span>]),
              <br/>
              &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-cyan-600 dark:text-sky-300">assignee</span>: <span className="text-amber-600 dark:text-yellow-300">Field</span>.<span className="text-blue-600 dark:text-blue-300">lookup</span>(<span className="text-green-600 dark:text-green-300">&apos;users&apos;</span>)
              <br/>
              &nbsp;&nbsp;<span className="text-foreground">{'}'}</span>,
              <br/>
              &nbsp;&nbsp;<span className="text-cyan-600 dark:text-sky-300">policy</span>: <span className="text-foreground">{'{'}</span>{' '}
              <span className="text-cyan-600 dark:text-sky-300">audit</span>: <span className="text-red-600 dark:text-red-300">true</span>, {' '}
              <span className="text-cyan-600 dark:text-sky-300">api_access</span>: <span className="text-green-600 dark:text-green-300">&apos;public&apos;</span>{' '}
              <span className="text-foreground">{'}'}</span>
              <br/>
              <span className="text-foreground">{'}'}</span>);
            </code>
          </pre>
        </div>
      </div>
      
      {/* Glow Effect */}
      <div className="absolute -inset-4 -z-10 bg-primary/20 blur-3xl opacity-30 rounded-[50%]" />
    </div>
  );
}
