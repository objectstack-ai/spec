import { useState } from 'react';
import { ObjectStackClient } from '@objectstack/client';
import { ObjectDataTable } from './ObjectDataTable';
import { ObjectSchemaInspector } from './ObjectSchemaInspector';
import { Badge } from "@/components/ui/badge";
import { Database, Code2, Table2, Globe } from 'lucide-react';

type ObjectTab = 'schema' | 'data' | 'api';

interface ObjectExplorerProps {
  client: ObjectStackClient;
  objectApiName: string;
  onEdit: (record: any) => void;
}

export function ObjectExplorer({ client, objectApiName, onEdit }: ObjectExplorerProps) {
  const [activeTab, setActiveTab] = useState<ObjectTab>('schema');

  const tabs: { id: ObjectTab; label: string; icon: React.ElementType }[] = [
    { id: 'schema', label: 'Schema', icon: Code2 },
    { id: 'data', label: 'Data', icon: Table2 },
    { id: 'api', label: 'API', icon: Globe },
  ];

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Tab bar */}
      <div className="flex items-center gap-1 border-b px-4 bg-muted/30">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium transition-colors border-b-2
                ${isActive
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                }
              `}
            >
              <Icon className="h-3.5 w-3.5" />
              {tab.label}
            </button>
          );
        })}
        <div className="ml-auto flex items-center gap-2 py-2">
          <Badge variant="outline" className="font-mono text-xs gap-1">
            <Database className="h-3 w-3" />
            {objectApiName}
          </Badge>
        </div>
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-auto p-4">
        {activeTab === 'schema' && (
          <ObjectSchemaInspector client={client} objectApiName={objectApiName} />
        )}
        {activeTab === 'data' && (
          <ObjectDataTable client={client} objectApiName={objectApiName} onEdit={onEdit} />
        )}
        {activeTab === 'api' && (
          <ObjectApiReference objectApiName={objectApiName} />
        )}
      </div>
    </div>
  );
}

/** API Reference panel for a specific object */
function ObjectApiReference({ objectApiName }: { objectApiName: string }) {
  const endpoints = [
    { method: 'GET',    path: `/api/v1/data/${objectApiName}`,       desc: 'Query records with filters, pagination, sorting' },
    { method: 'POST',   path: `/api/v1/data/${objectApiName}`,       desc: 'Create a new record' },
    { method: 'GET',    path: `/api/v1/data/${objectApiName}/:id`,   desc: 'Get a single record by ID' },
    { method: 'PATCH',  path: `/api/v1/data/${objectApiName}/:id`,   desc: 'Update a record by ID' },
    { method: 'DELETE', path: `/api/v1/data/${objectApiName}/:id`,   desc: 'Delete a record by ID' },
    { method: 'GET',    path: `/api/v1/meta/object/${objectApiName}`, desc: 'Get object schema definition' },
  ];

  const methodColors: Record<string, string> = {
    GET:    'text-emerald-600 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-950',
    POST:   'text-blue-600 bg-blue-50 border-blue-200 dark:text-blue-400 dark:bg-blue-950',
    PATCH:  'text-amber-600 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-950',
    DELETE: 'text-red-600 bg-red-50 border-red-200 dark:text-red-400 dark:bg-red-950',
  };

  const queryParams = [
    { name: '$top',    type: 'number', desc: 'Limit number of records (pagination)' },
    { name: '$skip',   type: 'number', desc: 'Skip records for pagination offset' },
    { name: '$sort',   type: 'string', desc: 'Sort fields, prefix with - for descending' },
    { name: '$select', type: 'string', desc: 'Comma-separated list of fields to return' },
    { name: '$count',  type: 'boolean', desc: 'Include total count in response' },
  ];

  return (
    <div className="space-y-6">
      {/* Endpoints */}
      <div className="space-y-3">
        <h3 className="text-base font-semibold flex items-center gap-2">
          <Globe className="h-4 w-4" />
          REST Endpoints
        </h3>
        <div className="space-y-2">
          {endpoints.map((ep, i) => (
            <div key={i} className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-muted/30 transition-colors">
              <Badge variant="outline" className={`font-mono text-xs shrink-0 mt-0.5 ${methodColors[ep.method] || ''}`}>
                {ep.method.padEnd(6)}
              </Badge>
              <div className="min-w-0">
                <p className="font-mono text-sm break-all">{ep.path}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{ep.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Query parameters */}
      <div className="space-y-3">
        <h3 className="text-base font-semibold">Query Parameters</h3>
        <div className="rounded-lg border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50">
                <th className="text-left px-3 py-2 font-medium">Parameter</th>
                <th className="text-left px-3 py-2 font-medium">Type</th>
                <th className="text-left px-3 py-2 font-medium">Description</th>
              </tr>
            </thead>
            <tbody>
              {queryParams.map(p => (
                <tr key={p.name} className="border-t">
                  <td className="px-3 py-2 font-mono text-xs">{p.name}</td>
                  <td className="px-3 py-2">
                    <Badge variant="outline" className="text-[10px] font-mono">{p.type}</Badge>
                  </td>
                  <td className="px-3 py-2 text-muted-foreground text-xs">{p.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Example */}
      <div className="space-y-3">
        <h3 className="text-base font-semibold">Example Request</h3>
        <pre className="rounded-lg border bg-muted/30 p-4 overflow-x-auto text-xs font-mono">
{`// Fetch first 10 records, sorted by name
const response = await client.data.find('${objectApiName}', {
  filters: { top: 10, sort: 'name' }
});

// Response: FindDataResponse
// { object: '${objectApiName}', records: [...], total: N }`}
        </pre>
      </div>
    </div>
  );
}
