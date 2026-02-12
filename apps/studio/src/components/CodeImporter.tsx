// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Upload, AlertCircle, Check, FileCode, Eye, ArrowRight,
} from 'lucide-react';

// ─── Types ──────────────────────────────────────────────────────────

interface ParsedDefinition {
  type: 'object' | 'view' | 'flow' | 'agent' | 'app' | 'unknown';
  name: string;
  definition: Record<string, unknown>;
}

export interface CodeImporterProps {
  onImport: (parsed: ParsedDefinition) => void;
}

// ─── Parser ─────────────────────────────────────────────────────────

function parseObjectStackCode(code: string): ParsedDefinition {
  const trimmed = code.trim();

  // Try JSON first
  if (trimmed.startsWith('{')) {
    const parsed = JSON.parse(trimmed);
    const detectedType = detectDefinitionType(parsed);
    return {
      type: detectedType,
      name: parsed.name || 'imported',
      definition: parsed,
    };
  }

  // Try to extract defineStack() content
  const defineStackMatch = trimmed.match(/defineStack\s*\(\s*(\{[\s\S]*\})\s*\)/);
  if (defineStackMatch) {
    // Safely evaluate the object literal using Function constructor
    const objStr = defineStackMatch[1];
    const evaluated = parseObjectLiteral(objStr);

    // Detect the type from the top-level key
    for (const key of ['objects', 'views', 'flows', 'agents', 'apps'] as const) {
      if (evaluated[key]) {
        const typeMap: Record<string, ParsedDefinition['type']> = {
          objects: 'object',
          views: 'view',
          flows: 'flow',
          agents: 'agent',
          apps: 'app',
        };
        const entries = Object.entries(evaluated[key] as Record<string, unknown>);
        if (entries.length > 0) {
          const [name, def] = entries[0];
          return {
            type: typeMap[key],
            name,
            definition: def as Record<string, unknown>,
          };
        }
      }
    }

    return { type: 'unknown', name: 'imported', definition: evaluated };
  }

  // Try plain object literal
  if (trimmed.startsWith('{') || trimmed.match(/^\w+\s*:/)) {
    const wrapped = trimmed.startsWith('{') ? trimmed : `{${trimmed}}`;
    const parsed = parseObjectLiteral(wrapped);
    return {
      type: detectDefinitionType(parsed),
      name: (parsed.name as string) || 'imported',
      definition: parsed,
    };
  }

  throw new Error('Could not parse the code. Supported formats: defineStack({...}), JSON, or object literal.');
}

function parseObjectLiteral(str: string): Record<string, unknown> {
  // Convert JS object literal to JSON-parseable form
  let jsonStr = str
    // Replace single-quoted strings with double-quoted
    .replace(/'([^'\\]*(\\.[^'\\]*)*)'/g, '"$1"')
    // Add quotes around unquoted keys
    .replace(/(\s*)(\w+)\s*:/g, '$1"$2":')
    // Remove trailing commas before } or ]
    .replace(/,\s*([\]}])/g, '$1')
    // Replace undefined/true/false
    .replace(/:\s*undefined/g, ': null');

  try {
    return JSON.parse(jsonStr);
  } catch {
    // Fallback: try to extract key-value pairs manually
    throw new Error('Failed to parse object literal. Please use valid JSON or TypeScript syntax.');
  }
}

function detectDefinitionType(obj: Record<string, unknown>): ParsedDefinition['type'] {
  if (obj.fields) return 'object';
  if (obj.columns || obj.viewType || obj.layout) return 'view';
  if (obj.steps || obj.trigger || obj.flowType) return 'flow';
  if (obj.role || obj.instructions || obj.tools) return 'agent';
  if (obj.navigation || obj.branding) return 'app';
  return 'unknown';
}

// ─── Constants ──────────────────────────────────────────────────────

const TYPE_LABELS: Record<string, string> = {
  object: 'Object Definition',
  view: 'View Definition',
  flow: 'Flow Definition',
  agent: 'Agent Definition',
  app: 'App Definition',
  unknown: 'Unknown Definition',
};

const PLACEHOLDER_CODE = `// Paste ObjectStack code here. Examples:

// defineStack() format:
import { defineStack } from '@objectstack/spec';

export default defineStack({
  objects: {
    project_task: {
      label: 'Project Task',
      fields: {
        name: { label: 'Name', type: 'text', required: true },
        status: { label: 'Status', type: 'select' },
        due_date: { label: 'Due Date', type: 'date' },
      },
    },
  },
});

// Or plain JSON:
// { "label": "Task", "fields": { ... } }`;

// ─── Component ──────────────────────────────────────────────────────

export function CodeImporter({ onImport }: CodeImporterProps) {
  const [code, setCode] = useState('');
  const [parsed, setParsed] = useState<ParsedDefinition | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleParse = useCallback(() => {
    if (!code.trim()) {
      setError('Please paste some code first.');
      setParsed(null);
      return;
    }

    try {
      const result = parseObjectStackCode(code);
      setParsed(result);
      setError(null);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to parse code.';
      setError(message);
      setParsed(null);
    }
  }, [code]);

  const handleImport = useCallback(() => {
    if (parsed) {
      onImport(parsed);
    }
  }, [parsed, onImport]);

  const handleClear = useCallback(() => {
    setCode('');
    setParsed(null);
    setError(null);
  }, []);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Upload className="h-4 w-4" />
          Import from Code
        </CardTitle>
        <CardDescription>
          Paste <code className="font-mono text-xs bg-muted px-1 py-0.5 rounded">defineStack()</code> code
          or JSON to import into the visual designer.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Code input */}
        <Textarea
          value={code}
          onChange={(e) => {
            setCode(e.target.value);
            // Clear previous results when code changes
            if (parsed || error) {
              setParsed(null);
              setError(null);
            }
          }}
          placeholder={PLACEHOLDER_CODE}
          className="font-mono text-xs min-h-[200px] resize-y"
          rows={10}
        />

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button onClick={handleParse} size="sm" className="gap-1.5">
            <Eye className="h-3.5 w-3.5" />
            Parse
          </Button>
          {code.trim() && (
            <Button variant="outline" size="sm" onClick={handleClear} className="gap-1.5">
              Clear
            </Button>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2.5 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Parse preview */}
        {parsed && (
          <div className="space-y-3">
            <div className="rounded-md border bg-muted/20 p-3 space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-500" />
                  Successfully parsed
                </h4>
                <Badge variant="outline" className="text-xs gap-1">
                  <FileCode className="h-3 w-3" />
                  {TYPE_LABELS[parsed.type]}
                </Badge>
              </div>

              <div className="text-xs text-muted-foreground space-y-1">
                <p>
                  <strong>Name:</strong>{' '}
                  <code className="font-mono bg-muted px-1 py-0.5 rounded">{parsed.name}</code>
                </p>
                <p>
                  <strong>Type:</strong> {TYPE_LABELS[parsed.type]}
                </p>
              </div>

              {/* Preview */}
              <pre className="text-xs font-mono bg-muted/30 rounded-md p-2 overflow-auto max-h-40 whitespace-pre-wrap break-all">
                {JSON.stringify(parsed.definition, null, 2)}
              </pre>
            </div>

            <Button onClick={handleImport} className="gap-1.5">
              <ArrowRight className="h-3.5 w-3.5" />
              Import to Designer
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default CodeImporter;
