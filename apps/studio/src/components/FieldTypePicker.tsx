// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Search, Type, FileText, Hash, ToggleLeft, List, Link, Calculator,
  Calendar, Clock, Image, Upload, Lock, Fingerprint, Braces, Binary,
  Mail, Phone, Globe, MapPin, Star, CircleDot,
} from 'lucide-react';

// ─── Types ──────────────────────────────────────────────────────────

export interface FieldTypeOption {
  value: string;
  label: string;
  description: string;
  icon: React.ElementType;
  category: string;
}

export interface FieldTypePickerProps {
  value?: string;
  onSelect: (type: string) => void;
}

// ─── Field Type Catalog ─────────────────────────────────────────────

const FIELD_TYPES: FieldTypeOption[] = [
  // Text
  { value: 'text', label: 'Text', description: 'Single-line text input', icon: Type, category: 'Text' },
  { value: 'textarea', label: 'Text Area', description: 'Multi-line text input', icon: FileText, category: 'Text' },
  { value: 'email', label: 'Email', description: 'Email address field', icon: Mail, category: 'Text' },
  { value: 'phone', label: 'Phone', description: 'Phone number field', icon: Phone, category: 'Text' },
  { value: 'url', label: 'URL', description: 'Web address field', icon: Globe, category: 'Text' },
  // Number
  { value: 'number', label: 'Number', description: 'Numeric value', icon: Hash, category: 'Number' },
  { value: 'currency', label: 'Currency', description: 'Money amount with currency', icon: Hash, category: 'Number' },
  { value: 'percent', label: 'Percent', description: 'Percentage value', icon: Hash, category: 'Number' },
  { value: 'autonumber', label: 'Auto Number', description: 'Auto-incrementing number', icon: Binary, category: 'Number' },
  // Date/Time
  { value: 'date', label: 'Date', description: 'Date without time', icon: Calendar, category: 'Date/Time' },
  { value: 'datetime', label: 'Date/Time', description: 'Date with time', icon: Clock, category: 'Date/Time' },
  { value: 'time', label: 'Time', description: 'Time only', icon: Clock, category: 'Date/Time' },
  // Relationship
  { value: 'lookup', label: 'Lookup', description: 'Reference to another object', icon: Link, category: 'Relationship' },
  { value: 'master_detail', label: 'Master-Detail', description: 'Parent-child relationship', icon: Link, category: 'Relationship' },
  // Choice
  { value: 'boolean', label: 'Boolean', description: 'True/false toggle', icon: ToggleLeft, category: 'Choice' },
  { value: 'select', label: 'Select', description: 'Pick from predefined options', icon: List, category: 'Choice' },
  { value: 'multiselect', label: 'Multi-Select', description: 'Pick multiple options', icon: List, category: 'Choice' },
  // Media
  { value: 'image', label: 'Image', description: 'Image file upload', icon: Image, category: 'Media' },
  { value: 'file', label: 'File', description: 'File attachment', icon: Upload, category: 'Media' },
  // System
  { value: 'formula', label: 'Formula', description: 'Calculated field', icon: Calculator, category: 'System' },
  { value: 'rollup', label: 'Rollup', description: 'Aggregate child records', icon: Calculator, category: 'System' },
  // Advanced
  { value: 'json', label: 'JSON', description: 'Structured JSON data', icon: Braces, category: 'Advanced' },
  { value: 'encrypted', label: 'Encrypted', description: 'Encrypted sensitive data', icon: Lock, category: 'Advanced' },
  { value: 'geolocation', label: 'Geolocation', description: 'Latitude/longitude coordinates', icon: MapPin, category: 'Advanced' },
  { value: 'rating', label: 'Rating', description: 'Star rating field', icon: Star, category: 'Advanced' },
  { value: 'external_id', label: 'External ID', description: 'Unique external identifier', icon: Fingerprint, category: 'Advanced' },
];

const CATEGORIES = ['Text', 'Number', 'Date/Time', 'Relationship', 'Choice', 'Media', 'System', 'Advanced'];

const CATEGORY_COLORS: Record<string, string> = {
  Text: 'text-blue-600 dark:text-blue-400',
  Number: 'text-amber-600 dark:text-amber-400',
  'Date/Time': 'text-pink-600 dark:text-pink-400',
  Relationship: 'text-cyan-600 dark:text-cyan-400',
  Choice: 'text-purple-600 dark:text-purple-400',
  Media: 'text-emerald-600 dark:text-emerald-400',
  System: 'text-orange-600 dark:text-orange-400',
  Advanced: 'text-gray-600 dark:text-gray-400',
};

// ─── Component ──────────────────────────────────────────────────────

export function FieldTypePicker({ value, onSelect }: FieldTypePickerProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredByCategory = useMemo(() => {
    const query = searchQuery.toLowerCase();
    const filtered = query
      ? FIELD_TYPES.filter(
          (ft) =>
            ft.label.toLowerCase().includes(query) ||
            ft.value.toLowerCase().includes(query) ||
            ft.description.toLowerCase().includes(query) ||
            ft.category.toLowerCase().includes(query)
        )
      : FIELD_TYPES;

    const grouped: Record<string, FieldTypeOption[]> = {};
    for (const cat of CATEGORIES) {
      const items = filtered.filter((ft) => ft.category === cat);
      if (items.length > 0) grouped[cat] = items;
    }
    return grouped;
  }, [searchQuery]);

  return (
    <Card>
      <CardContent className="p-3 space-y-3">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search field types..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-8 text-sm"
          />
        </div>

        {/* Grouped types */}
        <div className="max-h-80 overflow-y-auto space-y-3">
          {Object.entries(filteredByCategory).map(([category, types]) => (
            <div key={category}>
              <h4 className={`text-xs font-semibold uppercase tracking-wider mb-1.5 ${CATEGORY_COLORS[category] ?? ''}`}>
                {category}
              </h4>
              <div className="space-y-0.5">
                {types.map((ft) => {
                  const Icon = ft.icon;
                  const isSelected = value === ft.value;
                  return (
                    <button
                      key={ft.value}
                      onClick={() => onSelect(ft.value)}
                      className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm transition-colors ${
                        isSelected
                          ? 'bg-accent text-accent-foreground'
                          : 'hover:bg-muted/50 text-foreground'
                      }`}
                    >
                      <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <div className="flex-1 text-left min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-medium">{ft.label}</span>
                          {isSelected && (
                            <Badge variant="secondary" className="text-[10px] px-1 py-0">
                              Selected
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground truncate">{ft.description}</p>
                      </div>
                      <code className="text-[10px] font-mono text-muted-foreground shrink-0">{ft.value}</code>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
          {Object.keys(filteredByCategory).length === 0 && (
            <div className="py-6 text-center text-sm text-muted-foreground">
              <CircleDot className="h-6 w-6 mx-auto mb-1.5 opacity-30" />
              No field types matching &ldquo;{searchQuery}&rdquo;
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export { FIELD_TYPES, CATEGORIES };
export default FieldTypePicker;
