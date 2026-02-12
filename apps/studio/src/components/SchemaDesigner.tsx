// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Select, SelectContent, SelectGroup, SelectItem, SelectLabel,
  SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Plus, Trash2, ChevronUp, ChevronDown, Code2, Database,
  Copy, Check, GripVertical, Layers,
} from 'lucide-react';
import { FieldTypePicker, FIELD_TYPES, CATEGORIES } from './FieldTypePicker';

// ─── Types ──────────────────────────────────────────────────────────

interface FieldDef {
  id: string;
  name: string;
  label: string;
  type: string;
  required: boolean;
  multiple: boolean;
  reference?: string;
  description?: string;
}

interface ObjectDef {
  id: string;
  name: string;
  label: string;
  fields: FieldDef[];
}

export interface SchemaDesignerProps {
  initialObjects?: ObjectDef[];
  onExport?: (code: string) => void;
}

// ─── Helpers ────────────────────────────────────────────────────────

let _uid = 0;
function uid(): string {
  return `_${++_uid}_${Date.now().toString(36)}`;
}

function toSnakeCase(str: string): string {
  return str
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '');
}

function generateCode(objects: ObjectDef[]): string {
  const lines: string[] = [
    "import { defineStack } from '@objectstack/spec';",
    '',
    'export default defineStack({',
    '  objects: {',
  ];

  for (const obj of objects) {
    lines.push(`    ${obj.name}: {`);
    lines.push(`      label: '${obj.label}',`);
    lines.push('      fields: {');
    for (const field of obj.fields) {
      const props: string[] = [
        `label: '${field.label}'`,
        `type: '${field.type}'`,
      ];
      if (field.required) props.push('required: true');
      if (field.multiple) props.push('multiple: true');
      if (field.reference) props.push(`reference: '${field.reference}'`);
      if (field.description) props.push(`description: '${field.description}'`);
      lines.push(`        ${field.name}: { ${props.join(', ')} },`);
    }
    lines.push('      },');
    lines.push('    },');
  }

  lines.push('  },');
  lines.push('});');
  return lines.join('\n');
}

function createDefaultField(): FieldDef {
  return {
    id: uid(),
    name: 'new_field',
    label: 'New Field',
    type: 'text',
    required: false,
    multiple: false,
  };
}

function createDefaultObject(): ObjectDef {
  return {
    id: uid(),
    name: 'new_object',
    label: 'New Object',
    fields: [
      { id: uid(), name: 'name', label: 'Name', type: 'text', required: true, multiple: false },
    ],
  };
}

// ─── Component ──────────────────────────────────────────────────────

export function SchemaDesigner({ initialObjects, onExport }: SchemaDesignerProps) {
  const [objects, setObjects] = useState<ObjectDef[]>(
    initialObjects && initialObjects.length > 0 ? initialObjects : [createDefaultObject()]
  );
  const [selectedObjectId, setSelectedObjectId] = useState<string>(objects[0]?.id ?? '');
  const [showFieldTypePicker, setShowFieldTypePicker] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showCode, setShowCode] = useState(false);

  const selectedObject = objects.find((o) => o.id === selectedObjectId) ?? null;

  // ── Object operations ───────────────────────────────────────────

  const addObject = useCallback(() => {
    const newObj = createDefaultObject();
    setObjects((prev) => [...prev, newObj]);
    setSelectedObjectId(newObj.id);
  }, []);

  const removeObject = useCallback(
    (id: string) => {
      setObjects((prev) => {
        const next = prev.filter((o) => o.id !== id);
        if (selectedObjectId === id && next.length > 0) {
          setSelectedObjectId(next[0].id);
        }
        return next;
      });
    },
    [selectedObjectId]
  );

  const updateObject = useCallback((id: string, patch: Partial<Pick<ObjectDef, 'name' | 'label'>>) => {
    setObjects((prev) =>
      prev.map((o) => (o.id === id ? { ...o, ...patch } : o))
    );
  }, []);

  // ── Field operations ────────────────────────────────────────────

  const updateFields = useCallback(
    (objectId: string, updater: (fields: FieldDef[]) => FieldDef[]) => {
      setObjects((prev) =>
        prev.map((o) => (o.id === objectId ? { ...o, fields: updater(o.fields) } : o))
      );
    },
    []
  );

  const addField = useCallback(() => {
    if (!selectedObject) return;
    updateFields(selectedObject.id, (fields) => [...fields, createDefaultField()]);
  }, [selectedObject, updateFields]);

  const removeField = useCallback(
    (fieldId: string) => {
      if (!selectedObject) return;
      updateFields(selectedObject.id, (fields) => fields.filter((f) => f.id !== fieldId));
    },
    [selectedObject, updateFields]
  );

  const updateField = useCallback(
    (fieldId: string, patch: Partial<FieldDef>) => {
      if (!selectedObject) return;
      updateFields(selectedObject.id, (fields) =>
        fields.map((f) => (f.id === fieldId ? { ...f, ...patch } : f))
      );
    },
    [selectedObject, updateFields]
  );

  const moveField = useCallback(
    (fieldId: string, direction: 'up' | 'down') => {
      if (!selectedObject) return;
      updateFields(selectedObject.id, (fields) => {
        const idx = fields.findIndex((f) => f.id === fieldId);
        if (idx < 0) return fields;
        const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
        if (targetIdx < 0 || targetIdx >= fields.length) return fields;
        const next = [...fields];
        [next[idx], next[targetIdx]] = [next[targetIdx], next[idx]];
        return next;
      });
    },
    [selectedObject, updateFields]
  );

  // ── Export ──────────────────────────────────────────────────────

  const code = generateCode(objects);

  const handleExport = useCallback(() => {
    setShowCode(true);
    onExport?.(code);
  }, [code, onExport]);

  const handleCopyCode = useCallback(() => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [code]);

  // ── Field type groups for select ────────────────────────────────

  const fieldTypesByCategory: Record<string, typeof FIELD_TYPES> = {};
  for (const cat of CATEGORIES) {
    fieldTypesByCategory[cat] = FIELD_TYPES.filter((ft) => ft.category === cat);
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-4 h-full">
      {/* ── Left: Object List ──────────────────────────────── */}
      <div className="space-y-3 lg:border-r lg:pr-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Objects</h3>
          <Button variant="outline" size="sm" onClick={addObject} className="h-7 gap-1 text-xs">
            <Plus className="h-3 w-3" />
            Add Object
          </Button>
        </div>
        <div className="space-y-1">
          {objects.map((obj) => (
            <div key={obj.id} className="group flex items-center gap-1">
              <button
                onClick={() => setSelectedObjectId(obj.id)}
                className={`flex-1 flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors text-left ${
                  selectedObjectId === obj.id
                    ? 'bg-accent text-accent-foreground'
                    : 'hover:bg-muted/50 text-muted-foreground hover:text-foreground'
                }`}
              >
                <Database className="h-3.5 w-3.5 shrink-0" />
                <div className="min-w-0">
                  <div className="font-medium truncate">{obj.label}</div>
                  <div className="text-[10px] font-mono text-muted-foreground truncate">{obj.name}</div>
                </div>
                <Badge variant="secondary" className="ml-auto text-[10px] shrink-0">
                  {obj.fields.length}
                </Badge>
              </button>
              {objects.length > 1 && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                  onClick={() => removeObject(obj.id)}
                >
                  <Trash2 className="h-3 w-3 text-destructive" />
                </Button>
              )}
            </div>
          ))}
        </div>

        <Separator />

        <Button variant="default" size="sm" className="w-full gap-1.5" onClick={handleExport}>
          <Code2 className="h-3.5 w-3.5" />
          Export as Code
        </Button>
      </div>

      {/* ── Right: Field Editor ────────────────────────────── */}
      <div className="flex flex-col gap-4 min-w-0">
        {selectedObject ? (
          <>
            {/* Object header */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Layers className="h-4.5 w-4.5" />
                  Object Configuration
                </CardTitle>
                <CardDescription>Configure the object name, label, and fields.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Label</Label>
                    <Input
                      value={selectedObject.label}
                      onChange={(e) => {
                        const label = e.target.value;
                        updateObject(selectedObject.id, {
                          label,
                          name: toSnakeCase(label),
                        });
                      }}
                      placeholder="e.g. Project Task"
                      className="h-8 text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">API Name</Label>
                    <Input
                      value={selectedObject.name}
                      onChange={(e) => updateObject(selectedObject.id, { name: e.target.value })}
                      placeholder="e.g. project_task"
                      className="h-8 text-sm font-mono"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Fields */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Fields</CardTitle>
                  <Button variant="outline" size="sm" onClick={addField} className="h-7 gap-1 text-xs">
                    <Plus className="h-3 w-3" />
                    Add Field
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y">
                  {selectedObject.fields.map((field, idx) => (
                    <div key={field.id} className="group flex items-start gap-2 px-4 py-3">
                      {/* Reorder */}
                      <div className="flex flex-col gap-0.5 pt-1 shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5"
                          disabled={idx === 0}
                          onClick={() => moveField(field.id, 'up')}
                        >
                          <ChevronUp className="h-3 w-3" />
                        </Button>
                        <GripVertical className="h-3 w-3 mx-auto text-muted-foreground/40" />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5"
                          disabled={idx === selectedObject.fields.length - 1}
                          onClick={() => moveField(field.id, 'down')}
                        >
                          <ChevronDown className="h-3 w-3" />
                        </Button>
                      </div>

                      {/* Field config */}
                      <div className="flex-1 grid grid-cols-1 sm:grid-cols-[1fr_1fr_140px] gap-2 min-w-0">
                        {/* Name */}
                        <div className="space-y-1">
                          <Label className="text-[10px] text-muted-foreground">Name</Label>
                          <Input
                            value={field.name}
                            onChange={(e) => updateField(field.id, { name: e.target.value })}
                            placeholder="field_name"
                            className="h-7 text-xs font-mono"
                          />
                        </div>
                        {/* Label */}
                        <div className="space-y-1">
                          <Label className="text-[10px] text-muted-foreground">Label</Label>
                          <Input
                            value={field.label}
                            onChange={(e) => {
                              const label = e.target.value;
                              updateField(field.id, {
                                label,
                                name: toSnakeCase(label),
                              });
                            }}
                            placeholder="Field Label"
                            className="h-7 text-xs"
                          />
                        </div>
                        {/* Type */}
                        <div className="space-y-1">
                          <Label className="text-[10px] text-muted-foreground">Type</Label>
                          <Select
                            value={field.type}
                            onValueChange={(val) => updateField(field.id, { type: val })}
                          >
                            <SelectTrigger className="h-7 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {CATEGORIES.map((cat) => {
                                const types = fieldTypesByCategory[cat];
                                if (!types || types.length === 0) return null;
                                return (
                                  <SelectGroup key={cat}>
                                    <SelectLabel className="text-[10px]">{cat}</SelectLabel>
                                    {types.map((ft) => (
                                      <SelectItem key={ft.value} value={ft.value} className="text-xs">
                                        {ft.label}
                                      </SelectItem>
                                    ))}
                                  </SelectGroup>
                                );
                              })}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Required toggle */}
                      <div className="flex items-center gap-1.5 pt-5 shrink-0">
                        <Switch
                          checked={field.required}
                          onCheckedChange={(checked) => updateField(field.id, { required: checked })}
                          className="scale-75"
                        />
                        <span className="text-[10px] text-muted-foreground">Req</span>
                      </div>

                      {/* Remove */}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 mt-4 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                        onClick={() => removeField(field.id)}
                      >
                        <Trash2 className="h-3 w-3 text-destructive" />
                      </Button>
                    </div>
                  ))}
                  {selectedObject.fields.length === 0 && (
                    <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                      No fields yet. Click &ldquo;Add Field&rdquo; to get started.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Field Type Picker (expanded) */}
            {showFieldTypePicker && (
              <FieldTypePicker
                value={
                  selectedObject.fields.find((f) => f.id === showFieldTypePicker)?.type
                }
                onSelect={(type) => {
                  updateField(showFieldTypePicker, { type });
                  setShowFieldTypePicker(null);
                }}
              />
            )}

            {/* Code preview */}
            {showCode && (
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Code2 className="h-4 w-4" />
                      Generated Code
                    </CardTitle>
                    <Button variant="outline" size="sm" onClick={handleCopyCode} className="h-7 gap-1 text-xs">
                      {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                      {copied ? 'Copied' : 'Copy'}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <pre className="overflow-auto p-4 text-xs font-mono bg-muted/30 rounded-b-lg whitespace-pre-wrap break-all">
                    <code>{code}</code>
                  </pre>
                </CardContent>
              </Card>
            )}
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
            <div className="text-center space-y-1">
              <Database className="h-8 w-8 mx-auto opacity-30" />
              <p>Select an object or create a new one</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default SchemaDesigner;
