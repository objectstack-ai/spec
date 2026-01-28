import { IObjectStackProtocol } from '@objectstack/spec/api';
import { IDataEngine } from '@objectstack/core';

// We import SchemaRegistry directly since this class lives in the same package
import { SchemaRegistry } from './registry';

export class ObjectStackProtocolImplementation implements IObjectStackProtocol {
    private engine: IDataEngine;

    constructor(engine: IDataEngine) {
        this.engine = engine;
    }

    getDiscovery() {
        return {
            name: 'ObjectStack API',
            version: '1.0',
            capabilities: {
                metadata: true,
                data: true,
                ui: true
            }
        };
    }

    getMetaTypes() {
        return SchemaRegistry.getRegisteredTypes();
    }

    getMetaItems(type: string) {
        return SchemaRegistry.listItems(type);
    }

    getMetaItem(type: string, name: string) {
        return SchemaRegistry.getItem(type, name);
    }

    getUiView(object: string, type: 'list' | 'form') {
        const schema = SchemaRegistry.getObject(object);
        if (!schema) throw new Error(`Object ${object} not found`);

        if (type === 'list') {
            return {
                type: 'list',
                object: object,
                columns: Object.keys(schema.fields || {}).slice(0, 5).map(f => ({
                    field: f,
                    label: schema.fields[f].label || f
                }))
            };
        } else {
             return {
                type: 'form',
                object: object,
                sections: [
                    {
                        label: 'General',
                        fields: Object.keys(schema.fields || {}).map(f => ({
                            field: f
                        }))
                    }
                ]
            };
        }
    }

    findData(object: string, query: any) {
        return this.engine.find(object, query);
    }

    async getData(object: string, id: string) {
        // IDataEngine doesn't have findOne, so we simulate it with find and limit 1
        // Assuming the ID field is named '_id' or 'id'. 
        // For broad compatibility, we might need to know the ID field name.
        // But traditionally it is _id in ObjectStack/mongo or id in others.
        // Let's rely on finding by ID if the engine supports it via find?
        // Actually, ObjectQL (the implementation) DOES have findOne.
        // But we are programming against IDataEngine interface here.
        
        // If the engine IS ObjectQL (which it practically is), we could cast it.
        // But let's try to stick to interface.
        
        const results = await this.engine.find(object, {
            filter: { _id: id }, // Default Assumption: _id
            limit: 1
        });
        if (results && results.length > 0) {
            return results[0];
        }
        throw new Error(`Record ${id} not found in ${object}`);
    }

    createData(object: string, data: any) {
        return this.engine.insert(object, data);
    }

    updateData(object: string, id: string, data: any) {
        return this.engine.update(object, id, data);
    }

    deleteData(object: string, id: string) {
        return this.engine.delete(object, id);
    }
}
