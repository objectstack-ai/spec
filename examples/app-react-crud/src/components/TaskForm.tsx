/**
 * TaskForm Component
 * 
 * Form for creating and updating tasks.
 * Demonstrates Metadata-Driven Form generation using @objectstack/client.
 */

import { useState, useEffect } from 'react';
import { ObjectStackClient } from '@objectstack/client';
import type { Task } from '../types';

interface TaskFormProps {
  client: ObjectStackClient;
  editingTask: Task | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export function TaskForm({ client, editingTask, onSuccess, onCancel }: TaskFormProps) {
  const [schema, setSchema] = useState<any>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 1. Fetch Metadata on Mount
  useEffect(() => {
    async function fetchMetadata() {
        try {
            // 'todo_task' should match the object name in Schema
            const res = await client.meta.getObject('todo_task');
            
            // In Protocol v1 (protocol.ts), getMetaItem returns { type: 'object', name: 'todo_task', item: { ...fields... } }
            // So we need res.item (the schema definition) or res (if it's direct)
            const schemaDef = res.item || res;
            
            setSchema(schemaDef);
        } catch (err) {
            console.error("Failed to fetch metadata:", err);
            setError("Could not load form definition");
        }
    }
    fetchMetadata();
  }, [client]);

  // 2. Initialize Form Data (Editing or Defaults)
  useEffect(() => {
    if (editingTask) {
      setFormData({ ...editingTask });
    } else if (schema) {
      // Initialize defaults from Schema
      const defaults: Record<string, any> = {};
      Object.entries(schema.fields || {}).forEach(([key, field]: [string, any]) => {
          if (field.defaultValue !== undefined) {
              defaults[key] = field.defaultValue;
          }
      });
      setFormData(defaults);
    }
  }, [editingTask, schema]);

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      // Basic Validation based on Schema
      if (schema) {
          for (const [key, field] of Object.entries(schema.fields || {}) as [string, any][]) {
              if (field.required && !formData[key] && formData[key] !== 0 && formData[key] !== false) {
                  throw new Error(`${field.label || key} is required`);
              }
          }
      }

      if (editingTask) {
        await client.data.update('todo_task', editingTask.id, formData);
      } else {
        await client.data.create('todo_task', formData);
      }

      // Reset
      if (!editingTask) setFormData({});
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save task');
    } finally {
      setSubmitting(false);
    }
  }

  // --- Dynamic Field Renderer ---
  const renderField = (name: string, field: any) => {
      // Skip system fields or incompatible UI types for this simple demo
      if (['id', '_id', 'created_at', 'updated_at', 'owner', 'created_by'].includes(name)) return null;
      if (field.type === 'formula' || field.type === 'summary') return null;

      const label = field.label || name;
      const isRequired = field.required;
      const value = formData[name] === undefined ? '' : formData[name];

      // 1. Boolean / Checkbox
      if (field.type === 'boolean') {
          return (
            <div className="flex items-center gap-2 pt-2" key={name}>
                <input
                    id={name}
                    type="checkbox"
                    checked={!!value}
                    onChange={(e) => handleChange(name, e.target.checked)}
                    disabled={submitting}
                    className="w-4 h-4 rounded border-accents-3 text-foreground focus:ring-offset-0 focus:ring-foreground transition-colors cursor-pointer"
                />
                <label htmlFor={name} className="select-none cursor-pointer text-sm text-foreground font-medium">
                    {label}
                </label>
            </div>
          );
      }

      // 2. Select / Option (Mocking Priority/Rating as Select)
      // If type is 'select' or 'rating', show a select box
      if (field.type === 'select' || field.type === 'rating') {
          // If rating, generate 1..N options
          let options = field.options || [];
          if (field.type === 'rating' && !options.length) {
             const max = field.max || 5; 
             options = Array.from({length: max}, (_, i) => ({ label: `${i+1} Stars`, value: i+1 }));
          }

          return (
            <div key={name}>
              <label htmlFor={name} className="block text-xs uppercase tracking-wider text-accents-5 font-semibold mb-2">
                {label} {isRequired && <span className="text-error">*</span>}
              </label>
              <div className="relative">
                <select
                  id={name}
                  value={value}
                  onChange={(e) => handleChange(name, field.type === 'rating' ? Number(e.target.value) : e.target.value)}
                  disabled={submitting}
                  className="w-full px-3 py-2 bg-background border border-accents-2 rounded-md focus:outline-none focus:ring-1 focus:ring-foreground focus:border-foreground transition-all duration-200 appearance-none"
                >
                  <option value="">Select...</option>
                  {options.map((opt: any) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                 <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-accents-4">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          );
      }
      
      // 3. Date
      if (field.type === 'date' || field.type === 'datetime') {
           // Simple handling: convert Date string to YYYY-MM-DD
           let dateVal = value;
           if (dateVal && typeof dateVal === 'string' && field.type === 'date') {
               dateVal = dateVal.split('T')[0];
           } else if (dateVal instanceof Date) {
               dateVal = dateVal.toISOString().split('T')[0];
           }

           return (
            <div key={name}>
              <label htmlFor={name} className="block text-xs uppercase tracking-wider text-accents-5 font-semibold mb-2">
                {label} {isRequired && <span className="text-error">*</span>}
              </label>
              <input
                id={name}
                type="date"
                value={dateVal}
                onChange={(e) => handleChange(name, e.target.value)}
                disabled={submitting}
                className="w-full px-3 py-2 bg-background border border-accents-2 rounded-md focus:outline-none focus:ring-1 focus:ring-foreground focus:border-foreground"
              />
            </div>
           );
      }
      
      // 4. Color
      if (field.type === 'color') {
        return (
            <div key={name}>
              <label htmlFor={name} className="block text-xs uppercase tracking-wider text-accents-5 font-semibold mb-2">
                {label}
              </label>
              <div className="flex gap-2">
                   <input
                    id={name}
                    type="color"
                    value={value || '#000000'}
                    onChange={(e) => handleChange(name, e.target.value)}
                    disabled={submitting}
                    className="h-9 w-16 p-0 border border-accents-2 rounded cursor-pointer"
                  />
                  <input 
                     type="text" 
                     value={value} 
                     onChange={(e) => handleChange(name, e.target.value)}
                     className="flex-1 px-3 py-2 bg-background border border-accents-2 rounded-md text-sm"
                     placeholder="#000000"
                  />
              </div>
            </div>
        )
      }

      // Default: Text Input (Text, Number, etc that fits in standard Input)
      const inputType = field.type === 'number' ? 'number' : 'text';
      
      return (
        <div key={name}>
          <label htmlFor={name} className="block text-xs uppercase tracking-wider text-accents-5 font-semibold mb-2">
            {label} {isRequired && <span className="text-error">*</span>}
          </label>
          {field.type === 'textarea' || field.type === 'code' || field.type === 'richtext' ? (
              <textarea
                id={name}
                value={value}
                onChange={(e) => handleChange(name, e.target.value)}
                disabled={submitting}
                rows={3}
                className="w-full px-3 py-2 bg-background border border-accents-2 rounded-md focus:outline-none focus:ring-1 focus:ring-foreground focus:border-foreground"
              />
          ) : (
              <input
                id={name}
                type={inputType}
                value={value}
                onChange={(e) => handleChange(name, inputType === 'number' ? (e.target.value ? Number(e.target.value) : '') : e.target.value)}
                placeholder={field.description || `Enter ${label.toLowerCase()}...`}
                disabled={submitting}
                required={isRequired}
                className="w-full px-3 py-2 bg-background border border-accents-2 rounded-md focus:outline-none focus:ring-1 focus:ring-foreground focus:border-foreground transition-all duration-200 placeholder:text-accents-3"
              />
          )}
        </div>
      );
  };

  return (
    <div className="bg-background border border-accents-2 rounded-lg p-6 shadow-[0_0_15px_rgba(0,0,0,0.02)]">
      <h2 className="text-xl font-semibold mb-6 flex items-center justify-between">
        <span>{editingTask ? 'Edit Task' : 'Create New Task'}</span>
        {schema && <span className="text-xs font-normal text-accents-4 bg-accents-1 px-2 py-1 rounded border border-accents-2">Metadata Driven</span>}
      </h2>
      
      {!schema && !error && (
          <div className="flex justify-center p-8">
              <div className="w-6 h-6 rounded-full border-2 border-accents-2 border-t-foreground animate-spin"></div>
          </div>
      )}

      {schema && (
        <form onSubmit={handleSubmit} className="space-y-4">
            {/* Render fields based on schema definition order */}
            {Object.entries(schema.fields || {}).map(([fieldName, fieldDef]) => renderField(fieldName, fieldDef))}

            {error && (
            <div className="p-3 text-sm text-error bg-error-lighter border border-error-light rounded-md">
                {error}
            </div>
            )}

            <div className="flex items-center gap-3 pt-4 border-t border-accents-2 mt-6">
            <button
                type="submit"
                className="flex-1 px-4 py-2 bg-foreground text-background rounded-md font-medium text-sm hover:bg-accents-7 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 shadow-sm"
                disabled={submitting}
            >
                {submitting ? 'Saving...' : editingTask ? 'Update Task' : 'Create Task'}
            </button>
            
            {editingTask && (
                <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 bg-background text-foreground border border-accents-2 rounded-md font-medium text-sm hover:bg-accents-1 disabled:opacity-50 transition-colors duration-200"
                disabled={submitting}
                >
                Cancel
                </button>
            )}
            </div>
        </form>
      )}
    </div>
  );
}
