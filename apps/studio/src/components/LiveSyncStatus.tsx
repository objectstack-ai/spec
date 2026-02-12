// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import { useState, useEffect, useCallback } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Wifi, WifiOff, RefreshCw, Loader2, Clock, AlertCircle } from 'lucide-react';

// ─── Types ──────────────────────────────────────────────────────────

type SyncState = 'connected' | 'syncing' | 'disconnected' | 'error';

export interface LiveSyncStatusProps {
  /** Override the sync state (for controlled usage) */
  state?: SyncState;
  /** WebSocket URL to monitor (mock by default) */
  wsUrl?: string;
  /** Callback when refresh is clicked */
  onRefresh?: () => void;
  /** Error message to display */
  errorMessage?: string;
}

// ─── Constants ──────────────────────────────────────────────────────

const STATE_CONFIG: Record<SyncState, {
  label: string;
  icon: React.ElementType;
  badgeClass: string;
  dotClass: string;
}> = {
  connected: {
    label: 'Connected',
    icon: Wifi,
    badgeClass: 'border-emerald-200 text-emerald-700 bg-emerald-50 dark:border-emerald-800 dark:text-emerald-400 dark:bg-emerald-950/50',
    dotClass: 'bg-emerald-500',
  },
  syncing: {
    label: 'Syncing...',
    icon: Loader2,
    badgeClass: 'border-blue-200 text-blue-700 bg-blue-50 dark:border-blue-800 dark:text-blue-400 dark:bg-blue-950/50',
    dotClass: 'bg-blue-500',
  },
  disconnected: {
    label: 'Disconnected',
    icon: WifiOff,
    badgeClass: 'border-gray-200 text-gray-600 bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:bg-gray-900',
    dotClass: 'bg-gray-400',
  },
  error: {
    label: 'Error',
    icon: AlertCircle,
    badgeClass: 'border-red-200 text-red-700 bg-red-50 dark:border-red-800 dark:text-red-400 dark:bg-red-950/50',
    dotClass: 'bg-red-500',
  },
};

// ─── Helpers ────────────────────────────────────────────────────────

function formatLastSync(date: Date | null): string {
  if (!date) return 'Never';
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);

  if (diffSec < 5) return 'Just now';
  if (diffSec < 60) return `${diffSec}s ago`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  return date.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  });
}

// ─── Component ──────────────────────────────────────────────────────

export function LiveSyncStatus({
  state: controlledState,
  onRefresh,
  errorMessage,
}: LiveSyncStatusProps) {
  const [internalState, setInternalState] = useState<SyncState>('disconnected');
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [lastSyncLabel, setLastSyncLabel] = useState('Never');

  const syncState = controlledState ?? internalState;

  // Mock WebSocket connection simulation
  useEffect(() => {
    if (controlledState !== undefined) return;

    // Simulate initial connection
    const connectTimer = setTimeout(() => {
      setInternalState('connected');
      setLastSyncTime(new Date());
    }, 1000);

    return () => clearTimeout(connectTimer);
  }, [controlledState]);

  // Update "last sync" label periodically
  useEffect(() => {
    setLastSyncLabel(formatLastSync(lastSyncTime));
    const interval = setInterval(() => {
      setLastSyncLabel(formatLastSync(lastSyncTime));
    }, 10000);
    return () => clearInterval(interval);
  }, [lastSyncTime]);

  const handleRefresh = useCallback(() => {
    if (controlledState === undefined) {
      setInternalState('syncing');
      setTimeout(() => {
        setInternalState('connected');
        setLastSyncTime(new Date());
      }, 800);
    }
    onRefresh?.();
  }, [controlledState, onRefresh]);

  const config = STATE_CONFIG[syncState];
  const Icon = config.icon;
  const isAnimated = syncState === 'syncing';

  return (
    <TooltipProvider>
      <div className="flex items-center gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge
              variant="outline"
              className={`gap-1.5 text-xs font-normal cursor-default ${config.badgeClass}`}
            >
              {/* Status dot */}
              <span className="relative flex h-2 w-2">
                {syncState === 'connected' && (
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${config.dotClass} opacity-40`} />
                )}
                <span className={`relative inline-flex rounded-full h-2 w-2 ${config.dotClass}`} />
              </span>

              <Icon className={`h-3 w-3 ${isAnimated ? 'animate-spin' : ''}`} />
              {config.label}
            </Badge>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="text-xs">
            <div className="space-y-1">
              <p className="font-medium">File System Sync</p>
              <p className="text-muted-foreground">
                Status: {config.label}
              </p>
              <p className="text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Last sync: {lastSyncLabel}
              </p>
              {errorMessage && syncState === 'error' && (
                <p className="text-destructive">{errorMessage}</p>
              )}
            </div>
          </TooltipContent>
        </Tooltip>

        {/* Last sync timestamp */}
        <span className="text-[10px] text-muted-foreground hidden sm:inline-flex items-center gap-0.5">
          <Clock className="h-2.5 w-2.5" />
          {lastSyncLabel}
        </span>

        {/* Refresh button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={handleRefresh}
              disabled={syncState === 'syncing'}
            >
              <RefreshCw className={`h-3 w-3 ${syncState === 'syncing' ? 'animate-spin' : ''}`} />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">Refresh sync</TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}

export default LiveSyncStatus;
