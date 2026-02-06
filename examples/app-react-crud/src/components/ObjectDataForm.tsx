import { useState, useEffect } from 'react';
import { ObjectStackClient } from '@objectstack/client';

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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg overflow-hidden">
                <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                    <h3 className="font-bold text-lg">
                        {record ? `Edit ${def.label}` : `New ${def.label}`}
                    </h3>
                    <button onClick={onCancel} className="text-gray-500 hover:text-gray-700">✕</button>
                </div>
                
                <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
                    {error && (
                        <div className="bg-red-50 text-error p-3 rounded text-sm mb-4">
                            {error}
                        </div>
                    )}
                    
                    {fieldKeys.map(key => {
                        const field = fields[key];
                        const label = field.label || key;
                        const required = field.required;

                        return (
                            <div key={key} className="space-y-1">
                                <label className="block text-sm font-medium text-gray-700">
                                    {label} {required && <span className="text-red-500">*</span>}
                                </label>
                                
                                {field.type === 'boolean' ? (
                                    <input 
                                        type="checkbox"
                                        checked={!!formData[key]}
                                        onChange={e => handleChange(key, e.target.checked)}
                                        className="h-4 w-4 text-primary rounded border-gray-300 focus:ring-primary"
                                    />
                                ) : field.type === 'select' ? (
                                    <select
                                        value={formData[key] || ''}
                                        onChange={e => handleChange(key, e.target.value)}
                                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2 border"
                                        required={required}
                                    >
                                        <option value="">-- Select --</option>
                                        {field.options?.map((opt: any) => (
                                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                                        ))}
                                    </select>
                                ) : field.type === 'textarea' ? (
                                    <textarea
                                        value={formData[key] || ''}
                                        onChange={e => handleChange(key, e.target.value)}
                                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2 border"
                                        rows={3}
                                        required={required}
                                    />
                                ) : (
                                    <input
                                        type={field.type === 'number' ? 'number' : 'text'}
                                        value={formData[key] || ''}
                                        onChange={e => handleChange(key, e.target.value)}
                                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2 border"
                                        required={required}
                                    />
                                )}
                                {field.description && (
                                    <p className="text-xs text-gray-500">{field.description}</p>
                                )}
                            </div>
                        );
                    })}

                    <div className="pt-4 flex items-center justify-end space-x-3">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-foreground hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
                        >
                            {loading ? 'Saving...' : 'Save'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
