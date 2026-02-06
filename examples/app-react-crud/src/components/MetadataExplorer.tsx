import { useState, useEffect } from 'react';
import { ObjectStackClient } from '@objectstack/client';

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
                const result = await client.meta.getItems('object');
                if (result && Array.isArray(result)) {
                    setObjects(result);
                    // Select first if none selected
                    // if (!selectedObject && result.length > 0) {
                    //     onSelectObject(result[0].name);
                    // }
                }
            } catch (err) {
                console.error("Failed to load objects", err);
            } finally {
                setLoading(false);
            }
        }
        loadObjects();
    }, [client]);

    return (
        <div className="bg-white rounded-lg border border-accents-2 shadow-sm h-full flex flex-col">
            <div className="p-4 border-b border-accents-2 bg-gray-50">
                <h3 className="font-bold text-gray-900">Registered Objects</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {loading && <div className="p-4 text-center text-gray-500">Loading objects...</div>}
                
                {objects.map(obj => (
                    <button
                        key={obj.name}
                        onClick={() => onSelectObject(obj.name)}
                        className={`w-full text-left px-3 py-2 rounded-md transition-colors flex items-center justify-between group
                            ${selectedObject === obj.name 
                                ? 'bg-primary/5 text-primary font-medium' 
                                : 'text-gray-700 hover:bg-gray-100'
                            }`}
                    >
                        <div className="flex items-center space-x-2">
                            {/* Icon placeholder could go here */}
                            <span>{obj.label}</span>
                        </div>
                        <span className="text-xs text-gray-400 group-hover:text-gray-600 font-mono">
                            {obj.name}
                        </span>
                    </button>
                ))}

                {!loading && objects.length === 0 && (
                     <div className="p-4 text-center text-gray-500 text-sm">No objects found in Metadata Service.</div>
                )}
            </div>
             <div className="p-3 border-t border-accents-2 bg-gray-50 text-xs text-center text-gray-500">
                Total: {objects.length} Objects
            </div>
        </div>
    );
}
