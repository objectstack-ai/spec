# Metadata Migration Guide: Filesystem to Database

This guide walks you through migrating your ObjectStack metadata from filesystem-based storage to database-backed storage.

## Prerequisites

- ObjectStack installed and configured
- Database server (PostgreSQL, MySQL, MongoDB, etc.)
- Backup of existing metadata files
- Database credentials with CREATE TABLE permissions

## Step-by-Step Migration

### Step 1: Backup Existing Metadata

First, export all your existing metadata to a backup file:

```typescript
import { metadataManager } from '@objectstack/kernel';

// Export all metadata to JSON
await metadataManager.export({
  output: './backups/metadata-backup-2025-02-11.json',
  format: 'json',
  prettify: true,
  includeStats: true,
});

console.log('✓ Metadata backed up successfully');
```

Or using CLI:

```bash
objectstack metadata export --output ./backups/metadata-backup.json --format json
```

### Step 2: Set Up Database

Create a new database for metadata storage:

**PostgreSQL:**
```sql
CREATE DATABASE objectstack_metadata;
CREATE USER objectstack_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE objectstack_metadata TO objectstack_user;
```

**MySQL:**
```sql
CREATE DATABASE objectstack_metadata;
CREATE USER 'objectstack_user'@'%' IDENTIFIED BY 'secure_password';
GRANT ALL PRIVILEGES ON objectstack_metadata.* TO 'objectstack_user'@'%';
FLUSH PRIVILEGES;
```

**MongoDB:**
```javascript
use objectstack_metadata;
db.createUser({
  user: "objectstack_user",
  pwd: "secure_password",
  roles: [{ role: "readWrite", db: "objectstack_metadata" }]
});
```

### Step 3: Configure Datasource

Add datasource configuration to your `objectstack.config.ts`:

```typescript
import { defineConfig } from '@objectstack/spec';

export default defineConfig({
  version: '1.0.0',
  
  datasources: [
    {
      name: 'metadata_db',
      driver: 'postgres', // or 'mysql', 'mongodb'
      config: {
        host: process.env.DB_HOST || 'localhost',
        port: 5432,
        database: 'objectstack_metadata',
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        
        // SSL for production
        ssl: process.env.NODE_ENV === 'production' ? {
          rejectUnauthorized: true,
        } : false,
      },
      pool: {
        min: 2,
        max: 10,
      },
    },
  ],
  
  // ... other config
});
```

### Step 4: Configure Metadata Loader

Add database-backed metadata loader:

```typescript
export default defineConfig({
  // ... datasources from Step 3
  
  metadata: {
    loaders: [
      {
        name: 'database-loader',
        protocol: 'database:',
        capabilities: {
          read: true,
          write: true,
          watch: false,
          list: true,
        },
        datasourceConfig: {
          datasource: 'metadata_db',
          table: '_framework_metadata',
          schema: 'public', // For PostgreSQL/MySQL
          autoMigrate: true,
          cache: {
            enabled: true,
            ttlSeconds: 3600,
            invalidateOnWrite: true,
          },
        },
      },
    ],
    defaultLoader: 'database-loader',
  },
});
```

### Step 5: Run Migration

The `autoMigrate: true` setting will automatically create the metadata table on first run. 

Start your application to trigger the migration:

```bash
objectstack serve
```

Check the logs for migration output:

```
[INFO] Metadata driver initializing...
[INFO] Creating metadata table: _framework_metadata
[INFO] Creating indexes...
[INFO] Migration completed successfully
```

### Step 6: Import Metadata

Import your backed-up metadata into the database:

```typescript
import { metadataManager } from '@objectstack/kernel';

await metadataManager.import({
  source: './backups/metadata-backup-2025-02-11.json',
  strategy: 'merge', // or 'replace', 'skip'
  validate: true,
  continueOnError: false,
});

console.log('✓ Metadata imported successfully');
```

Or using CLI:

```bash
objectstack metadata import --source ./backups/metadata-backup.json --strategy merge
```

### Step 7: Verify Migration

Verify that all metadata was imported correctly:

```typescript
import { metadataService } from '@objectstack/kernel';

// List all objects
const objects = metadataService.listObjects();
console.log(`Found ${objects.length} objects`);

// Verify specific metadata
const accountObject = metadataService.getObject('account');
if (accountObject) {
  console.log('✓ Account object migrated successfully');
}

// Compare counts
const stats = await metadataManager.stats();
console.log('Metadata statistics:', stats);
```

Or using CLI:

```bash
# List all metadata
objectstack metadata list --type object

# Get specific item
objectstack metadata get --type object --name account

# Show statistics
objectstack metadata stats
```

### Step 8: Test Application

Test your application thoroughly to ensure all metadata is working:

1. **Load views**: Verify all views load correctly
2. **CRUD operations**: Test creating, reading, updating, deleting records
3. **Lookups**: Verify relationships and lookups work
4. **Permissions**: Check permission sets and access control
5. **Flows**: Test workflow and automation flows

### Step 9: Clean Up (Optional)

Once you've verified everything works, you can optionally remove the filesystem metadata files:

```bash
# CAUTION: Only do this after thorough testing!
# Keep a backup just in case

# Move to archive instead of deleting
mkdir -p ./archive/metadata-files
mv ./metadata/*.object.ts ./archive/metadata-files/
mv ./metadata/*.view.ts ./archive/metadata-files/
```

## Hybrid Approach (Recommended for Production)

For production, consider a hybrid approach:

- **System metadata**: Keep in filesystem (version controlled, deployed with code)
- **User metadata**: Store in database (runtime configurable, per-user customization)

```typescript
export default defineConfig({
  metadata: {
    loaders: [
      // File loader for system metadata
      {
        name: 'file-loader',
        protocol: 'file:',
        capabilities: {
          read: true,
          write: true,
          watch: true,
          list: true,
        },
      },
      
      // Database loader for user metadata
      {
        name: 'database-loader',
        protocol: 'database:',
        capabilities: {
          read: true,
          write: true,
          watch: false,
          list: true,
        },
        datasourceConfig: {
          datasource: 'metadata_db',
          table: 'user_metadata',
          autoMigrate: true,
        },
      },
    ],
    
    // Custom loader selection
    loaderStrategy: (type, scope) => {
      if (scope === 'system') return 'file-loader';
      if (scope === 'user') return 'database-loader';
      return 'file-loader'; // Default
    },
  },
});
```

## Rollback Plan

If you need to rollback to filesystem-based metadata:

### 1. Export from Database

```typescript
await metadataManager.export({
  output: './metadata-from-db.json',
  format: 'json',
});
```

### 2. Restore File-Based Loader

Update `objectstack.config.ts`:

```typescript
export default defineConfig({
  metadata: {
    loaders: [
      {
        name: 'file-loader',
        protocol: 'file:',
        capabilities: {
          read: true,
          write: true,
          watch: true,
          list: true,
        },
      },
    ],
    defaultLoader: 'file-loader',
  },
});
```

### 3. Restore Files

```bash
cp -r ./archive/metadata-files/* ./metadata/
```

### 4. Restart Application

```bash
objectstack serve
```

## Troubleshooting

### Migration Failed: Table Already Exists

If migration fails because the table already exists:

**Option 1: Drop and recreate**
```sql
DROP TABLE _framework_metadata;
```

Then restart the application to recreate the table.

**Option 2: Manual migration**
```sql
-- Check existing table structure
\d _framework_metadata  -- PostgreSQL
DESCRIBE _framework_metadata;  -- MySQL

-- Add missing columns if needed
ALTER TABLE _framework_metadata ADD COLUMN IF NOT EXISTS scope VARCHAR(50);
```

### Import Failed: Validation Errors

If import fails with validation errors:

```typescript
// Import with relaxed validation
await metadataManager.import({
  source: './backups/metadata-backup.json',
  validate: false, // Skip validation
  continueOnError: true, // Continue on errors
});

// Then check what failed
const errors = await metadataManager.getImportErrors();
console.log('Import errors:', errors);
```

### Performance Issues

If you experience slow metadata loading:

1. **Add indexes:**
```sql
CREATE INDEX idx_type_name ON _framework_metadata(type, name);
CREATE INDEX idx_namespace ON _framework_metadata(namespace);
```

2. **Enable caching:**
```typescript
datasourceConfig: {
  cache: {
    enabled: true,
    ttlSeconds: 7200, // Increase TTL
  },
}
```

3. **Enable prefetch:**
```typescript
performance: {
  prefetchOnInit: true,
  parallelLoad: true,
}
```

### Database Connection Errors

Check connection settings:

```typescript
// Add connection logging
datasource: {
  config: {
    // ... connection details
    logging: true, // Enable query logging
  },
}
```

Test connection manually:

```bash
# PostgreSQL
psql -h localhost -U objectstack_user -d objectstack_metadata

# MySQL
mysql -h localhost -u objectstack_user -p objectstack_metadata

# MongoDB
mongosh "mongodb://localhost:27017/objectstack_metadata"
```

## Best Practices

1. **Always backup before migration**
2. **Test in staging environment first**
3. **Migrate during low-traffic periods**
4. **Monitor database performance after migration**
5. **Keep file backups for at least 30 days**
6. **Document your custom column mappings**
7. **Set up database backups (daily recommended)**
8. **Use connection pooling for better performance**
9. **Enable SSL/TLS for production databases**
10. **Rotate database credentials regularly**

## Next Steps

After successful migration:

1. **Set up monitoring**: Monitor database performance and metadata access patterns
2. **Configure backups**: Set up automated database backups
3. **Optimize indexes**: Add indexes based on your query patterns
4. **Tune cache**: Adjust cache TTL based on update frequency
5. **Document**: Update your deployment documentation

## Support

For issues or questions:

- Check logs: `./logs/objectstack.log`
- GitHub Issues: https://github.com/objectstack-ai/spec/issues
- Documentation: https://docs.objectstack.ai
