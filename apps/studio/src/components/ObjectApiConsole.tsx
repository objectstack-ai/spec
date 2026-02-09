import { useState, useCallback } from 'react';
import { useClient } from '@objectstack/client-react';
import { Badge } from '@/components/ui/badge';
import { Globe, Play, Copy, Check, ChevronDown, ChevronRight, Clock, Loader2 } from 'lucide-react';

// ─── Types ──────────────────────────────────────────────────────────

type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'DELETE';

interface EndpointDef {
  method: HttpMethod;
  path: string;
  desc: string;
  bodyTemplate?: Record<string, unknown>;
}

interface RequestHistoryEntry {
  id: number;
  method: HttpMethod;
  url: string;
  body?: string;
  status: number;
  duration: number;
  response: string;
  timestamp: Date;
}

// ─── Constants ──────────────────────────────────────────────────────

const METHOD_COLORS: Record<HttpMethod, string> = {
  GET:    'text-emerald-600 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-950/50',
  POST:   'text-blue-600 bg-blue-50 border-blue-200 dark:text-blue-400 dark:bg-blue-950/50',
  PATCH:  'text-amber-600 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-950/50',
  DELETE: 'text-red-600 bg-red-50 border-red-200 dark:text-red-400 dark:bg-red-950/50',
};

const STATUS_COLORS: Record<string, string> = {
  '2': 'text-emerald-600 dark:text-emerald-400',
  '3': 'text-blue-600 dark:text-blue-400',
  '4': 'text-amber-600 dark:text-amber-400',
  '5': 'text-red-600 dark:text-red-400',
};

// ─── Component ──────────────────────────────────────────────────────

interface ObjectApiConsoleProps {
  objectApiName: string;
}

export function ObjectApiConsole({ objectApiName }: ObjectApiConsoleProps) {
  const client = useClient();

  const endpoints: EndpointDef[] = [
    { method: 'GET',    path: `/api/v1/data/${objectApiName}`,          desc: 'List records' },
    { method: 'POST',   path: `/api/v1/data/${objectApiName}`,          desc: 'Create record',  bodyTemplate: { name: 'example' } },
    { method: 'GET',    path: `/api/v1/data/${objectApiName}/:id`,      desc: 'Get by ID' },
    { method: 'PATCH',  path: `/api/v1/data/${objectApiName}/:id`,      desc: 'Update record',  bodyTemplate: { name: 'updated' } },
    { method: 'DELETE', path: `/api/v1/data/${objectApiName}/:id`,      desc: 'Delete record' },
    { method: 'GET',    path: `/api/v1/meta/object/${objectApiName}`,   desc: 'Object schema' },
  ];

  const [selectedEndpoint, setSelectedEndpoint] = useState<EndpointDef>(endpoints[0]);
  const [urlOverride, setUrlOverride] = useState('');
  const [requestBody, setRequestBody] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<{ status: number; body: string; duration: number } | null>(null);
  const [history, setHistory] = useState<RequestHistoryEntry[]>([]);
  const [expandedHistory, setExpandedHistory] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  // Resolve effective URL (replace :id placeholder, allow override)
  const effectiveUrl = urlOverride || selectedEndpoint.path;

  const selectEndpoint = useCallback((ep: EndpointDef) => {
    setSelectedEndpoint(ep);
    setUrlOverride(ep.path);
    setRequestBody(ep.bodyTemplate ? JSON.stringify(ep.bodyTemplate, null, 2) : '');
    setResponse(null);
  }, []);

  const sendRequest = useCallback(async () => {
    if (loading) return;

    // Resolve the base URL from the client
    const baseUrl = (client as any)?.baseUrl ?? '';
    const fullUrl = `${baseUrl}${effectiveUrl}`;

    setLoading(true);
    const start = performance.now();

    try {
      const fetchOptions: RequestInit = {
        method: selectedEndpoint.method,
        headers: { 'Content-Type': 'application/json' },
      };

      if (['POST', 'PATCH'].includes(selectedEndpoint.method) && requestBody.trim()) {
        fetchOptions.body = requestBody;
      }

      const res = await fetch(fullUrl, fetchOptions);
      const duration = Math.round(performance.now() - start);

      let bodyText: string;
      const contentType = res.headers.get('content-type') ?? '';
      if (contentType.includes('json')) {
        const json = await res.json();
        bodyText = JSON.stringify(json, null, 2);
      } else {
        bodyText = await res.text();
      }

      const result = { status: res.status, body: bodyText, duration };
      setResponse(result);

      // Add to history (newest first, keep last 20)
      setHistory(prev => [{
        id: Date.now(),
        method: selectedEndpoint.method,
        url: effectiveUrl,
        body: requestBody || undefined,
        status: res.status,
        duration,
        response: bodyText,
        timestamp: new Date(),
      }, ...prev].slice(0, 20));
    } catch (err: any) {
      const duration = Math.round(performance.now() - start);
      setResponse({
        status: 0,
        body: `Network Error: ${err.message}`,
        duration,
      });
    } finally {
      setLoading(false);
    }
  }, [client, effectiveUrl, selectedEndpoint, requestBody, loading]);

  const copyResponse = useCallback(() => {
    if (response?.body) {
      navigator.clipboard.writeText(response.body);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  }, [response]);

  const statusColor = (status: number) => STATUS_COLORS[String(status)[0]] ?? 'text-muted-foreground';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-4 h-full">

      {/* ── Left: Endpoint List ─────────────────────────────── */}
      <div className="space-y-3 lg:border-r lg:pr-4">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Endpoints</h3>
        <div className="space-y-1">
          {endpoints.map((ep, i) => {
            const isActive = ep === selectedEndpoint;
            return (
              <button
                key={i}
                onClick={() => selectEndpoint(ep)}
                className={`w-full text-left flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
                  isActive
                    ? 'bg-accent text-accent-foreground'
                    : 'hover:bg-muted/50 text-muted-foreground hover:text-foreground'
                }`}
              >
                <Badge variant="outline" className={`font-mono text-[10px] shrink-0 ${METHOD_COLORS[ep.method]}`}>
                  {ep.method}
                </Badge>
                <span className="truncate text-xs">{ep.desc}</span>
              </button>
            );
          })}
        </div>

        {/* Query params cheatsheet */}
        <div className="pt-3 border-t">
          <h4 className="text-xs font-medium text-muted-foreground mb-2">Query Parameters</h4>
          <div className="space-y-1 text-xs text-muted-foreground">
            <p><code className="text-foreground">?$top=10</code> — limit</p>
            <p><code className="text-foreground">?$skip=20</code> — offset</p>
            <p><code className="text-foreground">?$sort=name</code> — sort</p>
            <p><code className="text-foreground">?$select=name,email</code> — fields</p>
            <p><code className="text-foreground">?$count=true</code> — total count</p>
          </div>
        </div>
      </div>

      {/* ── Right: Request / Response ──────────────────────── */}
      <div className="flex flex-col gap-3 min-w-0">

        {/* URL bar */}
        <div className="flex items-center gap-2">
          <Badge variant="outline" className={`font-mono text-xs shrink-0 ${METHOD_COLORS[selectedEndpoint.method]}`}>
            {selectedEndpoint.method}
          </Badge>
          <input
            type="text"
            value={urlOverride || effectiveUrl}
            onChange={e => setUrlOverride(e.target.value)}
            className="flex-1 rounded-md border bg-background px-3 py-1.5 font-mono text-sm focus:outline-none focus:ring-1 focus:ring-ring"
            placeholder={selectedEndpoint.path}
          />
          <button
            onClick={sendRequest}
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />}
            Send
          </button>
        </div>

        {/* Request Body (for POST/PATCH) */}
        {['POST', 'PATCH'].includes(selectedEndpoint.method) && (
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Request Body (JSON)</label>
            <textarea
              value={requestBody}
              onChange={e => setRequestBody(e.target.value)}
              rows={4}
              className="w-full rounded-md border bg-background px-3 py-2 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-ring resize-y"
              placeholder='{ "name": "value" }'
            />
          </div>
        )}

        {/* Response */}
        {response && (
          <div className="flex-1 min-h-0 flex flex-col rounded-lg border overflow-hidden">
            <div className="flex items-center justify-between px-3 py-2 bg-muted/30 border-b">
              <div className="flex items-center gap-3 text-sm">
                <span className={`font-mono font-semibold ${statusColor(response.status)}`}>
                  {response.status || 'ERR'}
                </span>
                <span className="text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {response.duration}ms
                </span>
              </div>
              <button
                onClick={copyResponse}
                className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
            <pre className="flex-1 overflow-auto p-3 text-xs font-mono bg-muted/10 whitespace-pre-wrap break-all">
              {response.body}
            </pre>
          </div>
        )}

        {/* No response yet */}
        {!response && !loading && (
          <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
            <div className="text-center space-y-1">
              <Globe className="h-8 w-8 mx-auto opacity-30" />
              <p>Select an endpoint and click <strong>Send</strong> to test</p>
            </div>
          </div>
        )}

        {/* History */}
        {history.length > 0 && (
          <div className="border-t pt-3 space-y-1">
            <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">History</h4>
            <div className="space-y-1 max-h-48 overflow-auto">
              {history.map(entry => (
                <div key={entry.id} className="rounded border">
                  <button
                    onClick={() => setExpandedHistory(expandedHistory === entry.id ? null : entry.id)}
                    className="w-full flex items-center gap-2 px-2 py-1.5 text-xs hover:bg-muted/30 transition-colors"
                  >
                    {expandedHistory === entry.id
                      ? <ChevronDown className="h-3 w-3 shrink-0" />
                      : <ChevronRight className="h-3 w-3 shrink-0" />
                    }
                    <Badge variant="outline" className={`font-mono text-[9px] shrink-0 ${METHOD_COLORS[entry.method]}`}>
                      {entry.method}
                    </Badge>
                    <span className="font-mono truncate">{entry.url}</span>
                    <span className={`ml-auto shrink-0 font-mono ${statusColor(entry.status)}`}>
                      {entry.status}
                    </span>
                    <span className="shrink-0 text-muted-foreground">{entry.duration}ms</span>
                  </button>
                  {expandedHistory === entry.id && (
                    <pre className="px-3 py-2 text-xs font-mono bg-muted/10 border-t overflow-auto max-h-40 whitespace-pre-wrap break-all">
                      {entry.response}
                    </pre>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
