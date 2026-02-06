import { useState, useEffect } from 'react';
import { ObjectStackClient } from '@objectstack/client';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Database, Package } from 'lucide-react';

interface MetadataExplorerProps {
    client: ObjectStackClient;
    selectedObject: string | null;
    onSelectObject: (name: string) => void;
}

export function MetadataExplorer({ client, selectedObject, onSelectObject }: MetadataExplorerProps) {
    const [objects, setObjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        async function loadObjects() {
            if (!client) return;
            setLoading(true);
            try {
                // Use plural 'objects' to ensure HttpDispatcher treats it as a list request
                // Singular 'object' is interpreted as getObject('object')
                const result: any = await client.meta.getItems('objects');
                // Support Standard Envelope { success, data } or direct array
                let items = [];
                if (Array.isArray(result)) {
                    items = result;
                } else if (result && result.success && Array.isArray(result.data)) {
                    items = result.data;
                } else if (result && Array.isArray(result.value)) {
                    items = result.value;
                }
                
                setObjects(items);
            } catch (err) {
                console.error("Failed to load objects", err);
            } finally {
                setLoading(false);
            }
        }
        loadObjects();
    }, [client]);

    return (
        <Card className="h-full flex flex-col border-border/60">
            <CardHeader className="p-4 border-b bg-muted/20">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <Database className="h-4 w-4" />
                    Registered Objects
                </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 p-0 overflow-hidden">
                <ScrollArea className="h-full">
                    <div className="p-2 space-y-1">
                        {loading && (
                            <div className="p-4 text-center text-sm text-muted-foreground animate-pulse">
                                Loading objects...
                            </div>
                        )}
                        
                        {objects.map(obj => (
                            <Button
                                key={obj.name}
                                variant={selectedObject === obj.name ? "secondary" : "ghost"}
                                size="sm"
                                onClick={() => onSelectObject(obj.name)}
                                className="w-full justify-between font-normal h-9"
                            >
                                <div className="flex items-center gap-2 truncate">
                                    <Package className="h-3.5 w-3.5 text-muted-foreground" />
                                    <span>{obj.label}</span>
                                </div>
                                <span className="text-xs text-muted-foreground font-mono opacity-50 ml-2 shrink-0">
                                    {obj.name}
                                </span>
                            </Button>
                        ))}

                        {!loading && objects.length === 0 && (
                             <div className="p-8 text-center text-muted-foreground text-sm flex flex-col items-center gap-2">
                                <Database className="h-8 w-8 opacity-20" />
                                <p>No objects found</p>
                             </div>
                        )}
                    </div>
                </ScrollArea>
            </CardContent>
            <CardFooter className="p-2 border-t bg-muted/20 text-xs text-muted-foreground justify-center">
                Total: {objects.length} Objects
            </CardFooter>
        </Card>
    );
}
