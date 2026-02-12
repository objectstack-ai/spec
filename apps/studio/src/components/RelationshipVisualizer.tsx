// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Database, Link, Key } from 'lucide-react';

// ─── Types ──────────────────────────────────────────────────────────

interface FieldInfo {
  name: string;
  label: string;
  type: string;
  required?: boolean;
  reference?: string;
}

interface ObjectInfo {
  name: string;
  label: string;
  fields: FieldInfo[];
}

interface Relationship {
  id: string;
  sourceObject: string;
  sourceField: string;
  targetObject: string;
  type: 'lookup' | 'master_detail';
  cardinality: '1:N' | '1:1' | 'N:M';
}

export interface RelationshipVisualizerProps {
  objects: ObjectInfo[];
}

// ─── Constants ──────────────────────────────────────────────────────

const BOX_WIDTH = 200;
const BOX_HEADER_HEIGHT = 36;
const FIELD_ROW_HEIGHT = 24;
const BOX_PADDING = 8;
const GRID_GAP_X = 260;
const GRID_GAP_Y = 40;
const GRID_COLS = 3;
const MARGIN = 20;

const TYPE_COLORS: Record<string, string> = {
  lookup: 'text-cyan-600 dark:text-cyan-400',
  master_detail: 'text-orange-600 dark:text-orange-400',
};

const CARDINALITY_LABEL: Record<string, string> = {
  lookup: '1:N',
  master_detail: '1:N',
};

// ─── Helpers ────────────────────────────────────────────────────────

function getBoxHeight(fields: FieldInfo[]): number {
  return BOX_HEADER_HEIGHT + fields.length * FIELD_ROW_HEIGHT + BOX_PADDING * 2;
}

function extractRelationships(objects: ObjectInfo[]): Relationship[] {
  const rels: Relationship[] = [];
  for (const obj of objects) {
    for (const field of obj.fields) {
      if ((field.type === 'lookup' || field.type === 'master_detail') && field.reference) {
        const targetExists = objects.some((o) => o.name === field.reference);
        if (targetExists) {
          rels.push({
            id: `${obj.name}.${field.name}->${field.reference}`,
            sourceObject: obj.name,
            sourceField: field.name,
            targetObject: field.reference,
            type: field.type as 'lookup' | 'master_detail',
            cardinality: CARDINALITY_LABEL[field.type] as '1:N' | '1:1' | 'N:M',
          });
        }
      }
    }
  }
  return rels;
}

// ─── Component ──────────────────────────────────────────────────────

export function RelationshipVisualizer({ objects }: RelationshipVisualizerProps) {
  const [hoveredRel, setHoveredRel] = useState<string | null>(null);
  const [hoveredObject, setHoveredObject] = useState<string | null>(null);

  const relationships = useMemo(() => extractRelationships(objects), [objects]);

  // Calculate positions
  const objectPositions = useMemo(() => {
    const positions: Record<string, { x: number; y: number; height: number }> = {};
    // Stack rows: track cumulative y per column
    const colHeights = Array(GRID_COLS).fill(MARGIN);

    objects.forEach((obj, idx) => {
      const col = idx % GRID_COLS;
      const height = getBoxHeight(obj.fields);
      positions[obj.name] = {
        x: MARGIN + col * GRID_GAP_X,
        y: colHeights[col],
        height,
      };
      colHeights[col] += height + GRID_GAP_Y;
    });
    return positions;
  }, [objects]);

  // SVG canvas size
  const svgWidth = MARGIN * 2 + GRID_COLS * GRID_GAP_X;
  const svgHeight = useMemo(() => {
    const maxY = Object.values(objectPositions).reduce(
      (max, pos) => Math.max(max, pos.y + pos.height),
      0
    );
    return maxY + MARGIN * 2;
  }, [objectPositions]);

  if (objects.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          <Database className="h-8 w-8 mx-auto mb-2 opacity-30" />
          <p className="text-sm">No objects to visualize. Add objects to see the relationship diagram.</p>
        </CardContent>
      </Card>
    );
  }

  // Find highlighted objects (connected to hovered relationship)
  const highlightedObjects = new Set<string>();
  if (hoveredRel) {
    const rel = relationships.find((r) => r.id === hoveredRel);
    if (rel) {
      highlightedObjects.add(rel.sourceObject);
      highlightedObjects.add(rel.targetObject);
    }
  }
  if (hoveredObject) {
    highlightedObjects.add(hoveredObject);
    for (const rel of relationships) {
      if (rel.sourceObject === hoveredObject || rel.targetObject === hoveredObject) {
        highlightedObjects.add(rel.sourceObject);
        highlightedObjects.add(rel.targetObject);
      }
    }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Link className="h-4 w-4" />
            Relationship Diagram
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs gap-1">
              <Database className="h-3 w-3" />
              {objects.length} objects
            </Badge>
            <Badge variant="outline" className="text-xs gap-1">
              <Link className="h-3 w-3" />
              {relationships.length} relationships
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-auto border-t">
          <svg
            width={svgWidth}
            height={svgHeight}
            className="min-w-full"
            style={{ minHeight: 200 }}
          >
            {/* Connection lines */}
            {relationships.map((rel) => {
              const source = objectPositions[rel.sourceObject];
              const target = objectPositions[rel.targetObject];
              if (!source || !target) return null;

              const sourceFieldIdx = objects
                .find((o) => o.name === rel.sourceObject)
                ?.fields.findIndex((f) => f.name === rel.sourceField) ?? 0;

              const sx = source.x + BOX_WIDTH;
              const sy = source.y + BOX_HEADER_HEIGHT + BOX_PADDING + sourceFieldIdx * FIELD_ROW_HEIGHT + FIELD_ROW_HEIGHT / 2;
              const tx = target.x;
              const ty = target.y + BOX_HEADER_HEIGHT / 2;

              const isHighlighted = hoveredRel === rel.id ||
                hoveredObject === rel.sourceObject ||
                hoveredObject === rel.targetObject;

              const midX = (sx + tx) / 2;

              return (
                <g
                  key={rel.id}
                  onMouseEnter={() => setHoveredRel(rel.id)}
                  onMouseLeave={() => setHoveredRel(null)}
                  className="cursor-pointer"
                >
                  <path
                    d={`M ${sx} ${sy} C ${midX} ${sy}, ${midX} ${ty}, ${tx} ${ty}`}
                    fill="none"
                    stroke={isHighlighted ? (rel.type === 'master_detail' ? '#ea580c' : '#0891b2') : '#94a3b8'}
                    strokeWidth={isHighlighted ? 2.5 : 1.5}
                    strokeDasharray={rel.type === 'lookup' ? '6 3' : undefined}
                    className="transition-all"
                  />
                  {/* Cardinality label */}
                  <text
                    x={midX}
                    y={(sy + ty) / 2 - 6}
                    textAnchor="middle"
                    className={`text-[10px] font-mono fill-current ${
                      isHighlighted ? TYPE_COLORS[rel.type] : 'text-muted-foreground'
                    }`}
                  >
                    {rel.cardinality}
                  </text>
                  {/* Arrow */}
                  <polygon
                    points={`${tx},${ty} ${tx - 8},${ty - 4} ${tx - 8},${ty + 4}`}
                    fill={isHighlighted ? (rel.type === 'master_detail' ? '#ea580c' : '#0891b2') : '#94a3b8'}
                    className="transition-all"
                  />
                </g>
              );
            })}

            {/* Object boxes */}
            {objects.map((obj) => {
              const pos = objectPositions[obj.name];
              if (!pos) return null;

              const isHighlighted = highlightedObjects.size === 0 || highlightedObjects.has(obj.name);
              const opacity = highlightedObjects.size > 0 && !isHighlighted ? 0.35 : 1;

              return (
                <g
                  key={obj.name}
                  onMouseEnter={() => setHoveredObject(obj.name)}
                  onMouseLeave={() => setHoveredObject(null)}
                  style={{ opacity, transition: 'opacity 0.2s' }}
                >
                  {/* Box background */}
                  <rect
                    x={pos.x}
                    y={pos.y}
                    width={BOX_WIDTH}
                    height={pos.height}
                    rx={6}
                    className="fill-background stroke-border"
                    strokeWidth={isHighlighted && highlightedObjects.size > 0 ? 2 : 1}
                  />
                  {/* Header */}
                  <rect
                    x={pos.x}
                    y={pos.y}
                    width={BOX_WIDTH}
                    height={BOX_HEADER_HEIGHT}
                    rx={6}
                    className="fill-muted"
                  />
                  <rect
                    x={pos.x}
                    y={pos.y + BOX_HEADER_HEIGHT - 6}
                    width={BOX_WIDTH}
                    height={6}
                    className="fill-muted"
                  />
                  <text
                    x={pos.x + 10}
                    y={pos.y + BOX_HEADER_HEIGHT / 2 + 4}
                    className="text-xs font-semibold fill-foreground"
                  >
                    {obj.label}
                  </text>

                  {/* Fields */}
                  {obj.fields.map((field, fIdx) => {
                    const fy = pos.y + BOX_HEADER_HEIGHT + BOX_PADDING + fIdx * FIELD_ROW_HEIGHT;
                    const isRelField = field.type === 'lookup' || field.type === 'master_detail';
                    return (
                      <g key={field.name}>
                        <text
                          x={pos.x + 10}
                          y={fy + FIELD_ROW_HEIGHT / 2 + 3}
                          className={`text-[10px] font-mono fill-current ${
                            isRelField ? TYPE_COLORS[field.type] : 'text-muted-foreground'
                          }`}
                        >
                          {field.required ? '● ' : '○ '}
                          {field.name}
                        </text>
                        <text
                          x={pos.x + BOX_WIDTH - 10}
                          y={fy + FIELD_ROW_HEIGHT / 2 + 3}
                          textAnchor="end"
                          className="text-[9px] fill-current text-muted-foreground/60"
                        >
                          {field.type}
                        </text>
                      </g>
                    );
                  })}
                </g>
              );
            })}
          </svg>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 px-4 py-2 border-t text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <svg width="20" height="10"><line x1="0" y1="5" x2="20" y2="5" stroke="#0891b2" strokeWidth="1.5" strokeDasharray="4 2" /></svg>
            Lookup (1:N)
          </span>
          <span className="flex items-center gap-1">
            <svg width="20" height="10"><line x1="0" y1="5" x2="20" y2="5" stroke="#ea580c" strokeWidth="1.5" /></svg>
            Master-Detail (1:N)
          </span>
          <span className="flex items-center gap-1">
            <Key className="h-3 w-3" />
            ● Required ○ Optional
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

export default RelationshipVisualizer;
