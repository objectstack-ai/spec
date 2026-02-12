// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Clock, Trash2, Play, ChevronDown, ChevronRight, Globe, Copy, Check,
} from 'lucide-react';

// ─── Types ──────────────────────────────────────────────────────────

interface HistoryEntry {
  id: string;
  method: string;
  path: string;
  status: number;
  timestamp: string;
  duration: number;
  requestBody?: string;
  responseBody: string;
}

export interface RequestHistoryProps {
  onReplay?: (entry: { method: string; path: string; body?: string }) => void;
}

// ─── Constants ──────────────────────────────────────────────────────

const STORAGE_KEY = 'objectstack_request_history';

const METHOD_COLORS: Record<string, string> = {
  GET: 'text-emerald-600 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-950/50',
  POST: 'text-blue-600 bg-blue-50 border-blue-200 dark:text-blue-400 dark:bg-blue-950/50',
  PATCH: 'text-amber-600 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-950/50',
  PUT: 'text-amber-600 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-950/50',
  DELETE: 'text-red-600 bg-red-50 border-red-200 dark:text-red-400 dark:bg-red-950/50',
};

const STATUS_COLORS: Record<string, string> = {
  '2': 'text-emerald-600 dark:text-emerald-400',
  '3': 'text-blue-600 dark:text-blue-400',
  '4': 'text-amber-600 dark:text-amber-400',
  '5': 'text-red-600 dark:text-red-400',
};

// ─── Helpers ────────────────────────────────────────────────────────

function loadHistory(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveHistory(entries: HistoryEntry[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries.slice(0, 50)));
  } catch {
    // localStorage may be unavailable
  }
}

function formatTimestamp(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  } catch {
    return iso;
  }
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return '';
  }
}

function statusColor(status: number): string {
  return STATUS_COLORS[String(status)[0]] ?? 'text-muted-foreground';
}

// ─── Component ──────────────────────────────────────────────────────

export function RequestHistory({ onReplay }: RequestHistoryProps) {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    setEntries(loadHistory());
  }, []);

  const clearHistory = useCallback(() => {
    setEntries([]);
    saveHistory([]);
    setExpandedId(null);
  }, []);

  const handleReplay = useCallback(
    (entry: HistoryEntry) => {
      onReplay?.({
        method: entry.method,
        path: entry.path,
        body: entry.requestBody,
      });
    },
    [onReplay]
  );

  const handleCopyResponse = useCallback((id: string, body: string) => {
    navigator.clipboard.writeText(body);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  }, []);

  // Group entries by date
  const groupedEntries: Record<string, HistoryEntry[]> = {};
  for (const entry of entries) {
    const dateKey = formatDate(entry.timestamp);
    if (!groupedEntries[dateKey]) groupedEntries[dateKey] = [];
    groupedEntries[dateKey].push(entry);
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Request History
            {entries.length > 0 && (
              <Badge variant="secondary" className="text-xs">{entries.length}</Badge>
            )}
          </CardTitle>
          {entries.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearHistory}
              className="h-7 gap-1 text-xs text-destructive hover:text-destructive"
            >
              <Trash2 className="h-3 w-3" />
              Clear History
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {entries.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground">
            <Globe className="h-8 w-8 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No request history yet.</p>
            <p className="text-xs">Send API requests to see them here.</p>
          </div>
        ) : (
          <div className="divide-y max-h-[60vh] overflow-auto">
            {Object.entries(groupedEntries).map(([date, dateEntries]) => (
              <div key={date}>
                <div className="px-4 py-1.5 bg-muted/30 text-[10px] text-muted-foreground font-medium uppercase tracking-wider sticky top-0">
                  {date}
                </div>
                {dateEntries.map((entry) => {
                  const isExpanded = expandedId === entry.id;
                  const isCopied = copiedId === entry.id;

                  return (
                    <div key={entry.id} className="border-b last:border-b-0">
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : entry.id)}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-muted/30 transition-colors"
                      >
                        {isExpanded
                          ? <ChevronDown className="h-3 w-3 shrink-0 text-muted-foreground" />
                          : <ChevronRight className="h-3 w-3 shrink-0 text-muted-foreground" />
                        }
                        <Badge
                          variant="outline"
                          className={`font-mono text-[10px] shrink-0 ${METHOD_COLORS[entry.method] ?? ''}`}
                        >
                          {entry.method}
                        </Badge>
                        <span className="font-mono text-xs truncate text-left flex-1">{entry.path}</span>
                        <span className={`font-mono text-xs shrink-0 ${statusColor(entry.status)}`}>
                          {entry.status || 'ERR'}
                        </span>
                        <span className="text-[10px] text-muted-foreground shrink-0 flex items-center gap-0.5">
                          <Clock className="h-2.5 w-2.5" />
                          {entry.duration}ms
                        </span>
                        <span className="text-[10px] text-muted-foreground shrink-0">
                          {formatTimestamp(entry.timestamp)}
                        </span>
                      </button>

                      {isExpanded && (
                        <div className="px-4 pb-3 space-y-2">
                          {/* Request body */}
                          {entry.requestBody && (
                            <div className="space-y-1">
                              <h5 className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                                Request Body
                              </h5>
                              <pre className="text-xs font-mono bg-muted/30 rounded-md p-2 overflow-auto max-h-32 whitespace-pre-wrap break-all">
                                {entry.requestBody}
                              </pre>
                            </div>
                          )}

                          {/* Response body */}
                          <div className="space-y-1">
                            <div className="flex items-center justify-between">
                              <h5 className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                                Response Body
                              </h5>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleCopyResponse(entry.id, entry.responseBody)}
                                className="h-5 text-[10px] gap-0.5 px-1"
                              >
                                {isCopied ? <Check className="h-2.5 w-2.5" /> : <Copy className="h-2.5 w-2.5" />}
                                {isCopied ? 'Copied' : 'Copy'}
                              </Button>
                            </div>
                            <pre className="text-xs font-mono bg-muted/30 rounded-md p-2 overflow-auto max-h-40 whitespace-pre-wrap break-all">
                              {entry.responseBody}
                            </pre>
                          </div>

                          {/* Actions */}
                          {onReplay && (
                            <div className="flex items-center gap-2 pt-1">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleReplay(entry)}
                                className="h-7 gap-1 text-xs"
                              >
                                <Play className="h-3 w-3" />
                                Replay
                              </Button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Export addEntry type for parent components
export type { HistoryEntry };
export default RequestHistory;
