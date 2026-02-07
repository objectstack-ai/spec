import { cn } from '@/lib/utils';

interface CodePreviewProps {
  className?: string;
}

export function CodePreview({ className }: CodePreviewProps) {
  const kw = 'text-purple-600 dark:text-purple-400 font-semibold';
  const str = 'text-green-600 dark:text-green-300';
  const fn = 'text-blue-600 dark:text-blue-300';
  const typ = 'text-amber-600 dark:text-yellow-300';
  const prop = 'text-cyan-600 dark:text-sky-300';
  const bool = 'text-red-600 dark:text-red-300';
  const fg = 'text-foreground';
  const cm = 'text-foreground/40 italic';

  return (
    <div className={cn(
      "relative mx-auto mt-12 w-full max-w-3xl transform rounded-xl bg-gradient-to-br from-border/50 to-border/10 p-[2px] opacity-90 transition-all hover:scale-[1.01] hover:opacity-100 sm:mt-16",
      className
    )}>
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-2xl">
        {/* Window Controls */}
        <div className="flex items-center gap-2 border-b border-border bg-muted/50 px-4 py-3">
          <div className="h-3 w-3 rounded-full bg-red-500/80" />
          <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
          <div className="h-3 w-3 rounded-full bg-green-500/80" />
          <div className="ml-2 text-xs font-medium text-muted-foreground font-mono">
            src/objects/task.object.ts
          </div>
        </div>
        
        {/* Code Content — real ObjectStack API */}
        <div className="overflow-x-auto p-6 text-left bg-gradient-to-br from-card to-muted/20">
          <pre className="font-mono text-sm leading-7">
            <code>
              <span className={kw}>import</span>{' '}
              <span className={fg}>{'{'}</span>{' '}
              <span className={typ}>Data</span>{' '}
              <span className={fg}>{'}'}</span>{' '}
              <span className={kw}>from</span>{' '}
              <span className={str}>&apos;@objectstack/spec&apos;</span>;
              <br/><br/>
              <span className={kw}>const</span>{' '}
              <span className={fn}>task</span>:{' '}
              <span className={typ}>Data.Object</span>{' '}
              <span className={fg}>=</span>{' '}
              <span className={fg}>{'{'}</span>
              <br/>
              {'  '}<span className={prop}>name</span>:{' '}<span className={str}>&apos;task&apos;</span>,
              <br/>
              {'  '}<span className={prop}>label</span>:{' '}<span className={str}>&apos;Task&apos;</span>,
              <br/>
              {'  '}<span className={prop}>fields</span>:{' '}<span className={fg}>{'{'}</span>
              <br/>
              {'    '}<span className={prop}>subject</span>:{' '}<span className={fg}>{'{'}</span>{' '}
              <span className={prop}>type</span>:{' '}<span className={str}>&apos;text&apos;</span>,{' '}
              <span className={prop}>required</span>:{' '}<span className={bool}>true</span>{' '}
              <span className={fg}>{'}'}</span>,
              <br/>
              {'    '}<span className={prop}>status</span>:{' '}<span className={fg}>{'{'}</span>
              <br/>
              {'      '}<span className={prop}>type</span>:{' '}<span className={str}>&apos;select&apos;</span>,
              <br/>
              {'      '}<span className={prop}>options</span>:{' '}[<span className={str}>&apos;draft&apos;</span>, <span className={str}>&apos;active&apos;</span>, <span className={str}>&apos;done&apos;</span>],
              <br/>
              {'    '}<span className={fg}>{'}'}</span>,
              <br/>
              {'    '}<span className={prop}>assignee</span>:{' '}<span className={fg}>{'{'}</span>{' '}
              <span className={prop}>type</span>:{' '}<span className={str}>&apos;lookup&apos;</span>,{' '}
              <span className={prop}>reference</span>:{' '}<span className={str}>&apos;user&apos;</span>{' '}
              <span className={fg}>{'}'}</span>,
              <br/>
              {'  '}<span className={fg}>{'}'}</span>,
              <br/>
              <span className={fg}>{'}'}</span>;
              <br/><br/>
              <span className={cm}>{'// → REST API at /api/v1/task'}</span>
              <br/>
              <span className={cm}>{'// → Console UI at /_studio/'}</span>
            </code>
          </pre>
        </div>
      </div>
      
      {/* Glow Effect */}
      <div className="absolute -inset-4 -z-10 bg-primary/20 blur-3xl opacity-30 rounded-[50%]" />
    </div>
  );
}
