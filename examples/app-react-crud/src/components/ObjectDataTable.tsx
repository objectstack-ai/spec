import { useState, useEffect } from 'react';
import { ObjectStackClient } from '@objectstack/client';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, ArrowRight, Edit, Trash2, Plus } from 'lucide-react';

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
                const found: any = await client.meta.getItem('object', objectApiName);
                if (mounted && found) {
                    const def = found.data || found;
                    setDef(def);
                }
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
                const result: any = await client.data.find(objectApiName, {
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

    if (!def) return <div className="p-4 text-muted-foreground animate-pulse">Loading metadata for {objectApiName}...</div>;

    // Determine columns from fields
    const fields = def.fields || {};
    const columns = Object.keys(fields).map(key => {
        const f = fields[key];
        return {
            name: f.name || key,
            label: f.label || key,
            type: f.type || 'text'
        };
    }).filter(c => !['formatted_summary'].includes(c.name)); 

    return (
        <Card className="flex flex-col h-full border-border/60 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between p-4 border-b space-y-0 bg-muted/30">
                <div className="space-y-1">
                    <CardTitle className="text-xl font-semibold tracking-tight">
                        {def.label}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                        {def.name} • {total > 0 ? total : records.length} records
                    </p>
                </div>
                <Button onClick={() => onEdit({})} size="sm" className="gap-1">
                    <Plus className="h-4 w-4" />
                    New
                </Button>
            </CardHeader>
            
            <CardContent className="flex-1 p-0 overflow-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            {columns.map(col => (
                                <TableHead key={col.name}>
                                    {col.label}
                                </TableHead>
                            ))}
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading && records.length === 0 ? (
                            <TableRow><TableCell colSpan={columns.length + 1} className="h-24 text-center">Loading...</TableCell></TableRow>
                        ) : records.map(record => (
                            <TableRow key={record.id || record._id}>
                                {columns.map(col => (
                                    <TableCell key={col.name}>
                                        {String(record[col.name] !== undefined ? record[col.name] : '')}
                                    </TableCell>
                                ))}
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                        <Button 
                                            variant="ghost" 
                                            size="sm"
                                            className="h-8 w-8 p-0"
                                            onClick={() => onEdit(record)}
                                        >
                                            <Edit className="h-4 w-4 text-muted-foreground" />
                                            <span className="sr-only">Edit</span>
                                        </Button>
                                        <Button 
                                            variant="ghost" 
                                            size="sm"
                                            className="h-8 w-8 p-0"
                                            onClick={() => handleDelete(record.id || record._id)}
                                        >
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                            <span className="sr-only">Delete</span>
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                        {!loading && records.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={columns.length + 1} className="h-24 text-center">
                                    No records found
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>

            <CardFooter className="p-2 border-t bg-muted/30 flex justify-end items-center gap-2">
                <Button  
                    variant="outline" 
                    size="sm"
                    disabled={page === 1}
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    className="h-8 gap-1"
                >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    Previous
                </Button>
                <div className="text-sm font-medium text-muted-foreground min-w-[3rem] text-center">
                    Page {page}
                </div>
                <Button 
                    variant="outline" 
                    size="sm"
                    disabled={records.length < pageSize}
                    onClick={() => setPage(p => p + 1)}
                    className="h-8 gap-1"
                >
                    Next
                    <ArrowRight className="h-3.5 w-3.5" />
                </Button>
            </CardFooter>
        </Card>
    );
}
