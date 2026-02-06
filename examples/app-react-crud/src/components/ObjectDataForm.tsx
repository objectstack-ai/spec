import { useState, useEffect } from 'react';
import { ObjectStackClient } from '@objectstack/client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { SelectNative } from "@/components/ui/select-native";
import { X, Save } from "lucide-react";

interface ObjectDataFormProps {
    client: ObjectStackClient;
    objectApiName: string;
    record?: any; // If present, edit mode
    onSuccess: () => void;
    onCancel: () => void;
}

export function ObjectDataForm({ client, objectApiName, record, onSuccess, onCancel }: ObjectDataFormProps) {
    const [def, setDef] = useState<any>(null);
    const [formData, setFormData] = useState<any>({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Load Definition
    useEffect(() => {
        let mounted = true;
        async function loadDef() {
            if (!client) return;
            try {
                const found = await client.meta.getItem('object', objectApiName);
                if (mounted && found) {
                    setDef(found);
                    if (record) {
                        // Initialize form data with record values
                        setFormData({ ...record });
                    } else {
                        // Initialize defaults (optional)
                        setFormData({});
                    }
                }
            } catch (err) {
                console.error('Failed to load definition', err);
            }
        }
        loadDef();
        return () => { mounted = false; };
    }, [client, objectApiName, record]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        
        try {
            const dataToSubmit = { ...formData };
            // Cleanup: remove system fields that shouldn't be sent back often
            delete dataToSubmit._id;
            delete dataToSubmit.id;
            delete dataToSubmit.created_at;
            delete dataToSubmit.updated_at;
            
            // Format conversions
            if (def && def.fields) {
                Object.keys(def.fields).forEach(key => {
                    const f = def.fields[key];
                    if (f.type === 'number' && dataToSubmit[key]) {
                        dataToSubmit[key] = parseFloat(dataToSubmit[key]);
                    }
                });
            }

            if (record && (record.id || record._id)) {
                // UPDATE
                await client.data.update(objectApiName, record.id || record._id, dataToSubmit);
            } else {
                // CREATE
                await client.data.create(objectApiName, dataToSubmit);
            }
            onSuccess();
        } catch (err: any) {
            setError(err.message || 'Operation failed');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (field: string, value: any) => {
        setFormData((prev: any) => ({
            ...prev,
            [field]: value
        }));
    };

    if (!def) return <div>Loading form...</div>;

    const fields = def.fields || {};
    // Sort fields? Or just use object keys order
    const fieldKeys = Object.keys(fields).filter(k => {
        // Filter out system read-only fields for UI
        return !['created_at', 'updated_at', 'created_by', 'modified_by'].includes(k);
    });

    return (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-background rounded-lg border border-border shadow-lg w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
                <div className="p-4 border-b border-border bg-muted/40 flex justify-between items-center">
                    <h3 className="font-semibold text-lg">
                        {record ? `Edit ${def.label}` : `New ${def.label}`}
                    </h3>
                    <Button variant="ghost" size="icon" onClick={onCancel}>
                        <X className="h-4 w-4" />
                    </Button>
                </div>
                
                <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
                    <div className="flex-1 overflow-y-auto p-6 space-y-4">
                        {error && (
                            <div className="bg-destructive/15 text-destructive p-3 rounded text-sm mb-4">
                                {error}
                            </div>
                        )}
                        
                        {fieldKeys.map(key => {
                            const field = fields[key];
                            const label = field.label || key;
                            const required = field.required;

                            return (
                                <div key={key} className="space-y-2">
                                    <Label>
                                        {label} {required && <span className="text-destructive">*</span>}
                                    </Label>
                                    
                                    {field.type === 'boolean' ? (
                                        <div className="flex items-center space-x-2">
                                            <input 
                                                type="checkbox"
                                                checked={!!formData[key]}
                                                onChange={e => handleChange(key, e.target.checked)}
                                                className="h-4 w-4 rounded border-primary text-primary focus:ring-ring"
                                            />
                                            <span className="text-sm text-muted-foreground">Enabled</span>
                                        </div>
                                    ) : field.type === 'select' ? (
                                        <SelectNative
                                            value={formData[key] || ''}
                                            onChange={e => handleChange(key, e.target.value)}
                                            required={required}
                                        >
                                            <option value="">-- Select --</option>
                                            {field.options?.map((opt: any) => (
                                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                                            ))}
                                        </SelectNative>
                                    ) : field.type === 'textarea' ? (
                                        <Textarea
                                            value={formData[key] || ''}
                                            onChange={e => handleChange(key, e.target.value)}
                                            rows={3}
                                            required={required}
                                        />
                                    ) : (
                                        <Input
                                            type={field.type === 'number' ? 'number' : 'text'}
                                            value={formData[key] || ''}
                                            onChange={e => handleChange(key, e.target.value)}
                                            required={required}
                                        />
                                    )}
                                    {field.description && (
                                        <p className="text-xs text-muted-foreground">{field.description}</p>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    <div className="p-4 border-t border-border bg-muted/40 flex items-center justify-end space-x-3">
                        <Button variant="outline" onClick={onCancel} type="button">
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Saving...' : (
                                <>
                                    <Save className="mr-2 h-4 w-4" /> Save
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
