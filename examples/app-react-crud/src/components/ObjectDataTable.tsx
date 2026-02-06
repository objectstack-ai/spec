import { useState, useEffect } from 'react';
import { ObjectStackClient } from '@objectstack/client';

interface ObjectDataTableProps {
    client: ObjectStackClient;
    objectApiName: string;
    onEdit: (record: any) => void;
}

export function ObjectDataTable({ client, objectApiName, onEdit }: ObjectDataTableProps) {
    const [def, setDef] = useState<any>(null);
    const [records, setRecords] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const pageSize = 5;

    // Load Definition
    useEffect(() => {
        let mounted = true;
        async function loadDef() {
            if (!client) return;
            try {
                // Get definition via proper API
                const found = await client.meta.getItem('object', objectApiName);
                if (mounted && found) setDef(found);
            } catch (err) {
                console.error('Failed to load definition', err);
            }
        }
        loadDef();
        return () => { mounted = false; };
    }, [client, objectApiName]);

    // Load Data
    useEffect(() => {
        let mounted = true;
        async function loadData() {
            if (!client) return;
            setLoading(true);
            try {
                const result = await client.data.find(objectApiName, {
                    filters: {
                        top: pageSize,
                        skip: (page - 1) * pageSize,
                        count: true // Request total count
                    }
                });
                
                if (mounted) {
                    if (result && Array.isArray(result.value)) {
                        setRecords(result.value);
                        // If count is supported
                        if (typeof result.count === 'number') setTotal(result.count);
                    } else if (result && result.success && Array.isArray(result.data)) {
                        // Handle Standard Envelope { success: true, data: [], meta: { count } }
                        setRecords(result.data);
                        if (result.meta && typeof result.meta.count === 'number') setTotal(result.meta.count);
                    } else if (Array.isArray(result)) {
                        setRecords(result); // Fallback for simulation that might just return array
                    } else if (result && typeof result === 'object' && result?.data && Array.isArray(result.data)) {
                        /* Fallback for partial envelope */
                        setRecords(result.data);
                    }
                }
            } catch (err) {
                console.error('Failed to load data', err);
            } finally {
                if (mounted) setLoading(false);
            }
        }
        loadData();
        return () => { mounted = false; };
    }, [client, objectApiName, page]);

    async function handleDelete(id: string) {
        if (!confirm('Are you sure?')) return;
        try {
            await client.data.delete(objectApiName, id);
            // Reload
            const result = await client.data.find(objectApiName, {
                filters: {
                    top: pageSize,
                    skip: (page - 1) * pageSize
                }
            });
            if (result && (result.value || Array.isArray(result))) {
                setRecords(result.value || result);
            }
        } catch (err) {
            alert('Failed to delete: ' + err);
        }
    }

    // Helper to allow debugging and simple formatting
    function formatRecords(recs: any[], cols: any[]) {
        if (!recs || recs.length === 0) return [];
        // Optional: Ensure fields that match columns exist or default to ''
        return recs;
    }

    if (!def) return <div className="p-4 text-accents-5">Loading metadata for {objectApiName}...</div>;

    // Determine columns from fields
    // fields is usually a map or array depending on the internal structure. 
    // Based on previous logs: objects: [{ fields: { ... } }]
    const fields = def.fields || {};
    const columns = Object.keys(fields).map(key => {
        const f = fields[key];
        return {
            name: f.name || key,
            label: f.label || key,
            type: f.type || 'text'
        };
    }).filter(c => !['formatted_summary'].includes(c.name)); // hide system fields if any

    return (
        <div className="bg-background rounded-lg border border-accents-2 overflow-hidden shadow-sm">
            <div className="p-4 border-b border-accents-2 flex justify-between items-center bg-gray-50">
                <h3 className="font-bold text-lg">{def.label} ({def.name})</h3>
                <span className="text-sm text-accents-5">
                    Records: {total > 0 ? total : records.length}
                </span>
            </div>
            
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-100 text-accents-6 uppercase font-medium">
                        <tr>
                            {columns.map(col => (
                                <th key={col.name} className="px-4 py-3 whitespace-nowrap">{col.label}</th>
                            ))}
                            <th className="px-4 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-accents-2">
                        {loading && records.length === 0 ? (
                            <tr><td colSpan={columns.length + 1} className="p-4 text-center">Loading...</td></tr>
                        ) : formatRecords(records, columns).map(record => (
                            <tr key={record.id || record._id} className="hover:bg-gray-50 transition-colors">
                                {columns.map(col => (
                                    <td key={col.name} className="px-4 py-3 whitespace-nowrap">
                                        {String(record[col.name] !== undefined ? record[col.name] : '')}
                                    </td>
                                ))}
                                <td className="px-4 py-3 text-right space-x-2">
                                    <button 
                                        onClick={() => onEdit(record)}
                                        className="text-primary hover:text-primary-dark font-medium"
                                    >
                                        Edit
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(record.id || record._id)}
                                        className="text-error hover:text-red-700 font-medium"
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {!loading && records.length === 0 && (
                            <tr><td colSpan={columns.length + 1} className="p-8 text-center text-accents-5">No records found</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            <div className="p-3 border-t border-accents-2 flex justify-end items-center gap-2 bg-gray-50">
                <button 
                    disabled={page === 1}
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    className="px-3 py-1 border border-accents-3 rounded text-sm disabled:opacity-50 bg-white"
                >
                    Previous
                </button>
                <span className="text-sm font-medium px-2">Page {page}</span>
                <button 
                    disabled={records.length < pageSize} // Simple check
                    onClick={() => setPage(p => p + 1)}
                    className="px-3 py-1 border border-accents-3 rounded text-sm disabled:opacity-50 bg-white"
                >
                    Next
                </button>
            </div>
        </div>
    );
}
