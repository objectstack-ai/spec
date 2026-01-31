#!/usr/bin/env bash
# Quick template generator for common ObjectStack development tasks

set -e

# Colors
BLUE='\033[0;34m'
GREEN='\033[0;32m'
NC='\033[0m'

info() { echo -e "${BLUE}ℹ ${NC}$1"; }
success() { echo -e "${GREEN}✓ ${NC}$1"; }

# Generate a new Zod schema template
generate_schema() {
    local NAME=$1
    local CATEGORY=${2:-data}
    
    if [ -z "$NAME" ]; then
        echo "Usage: ./scripts/generate.sh schema <name> [category]"
        echo "Categories: data, ui, system, automation, ai, api"
        exit 1
    fi
    
    local FILENAME="packages/spec/src/${CATEGORY}/${NAME}.zod.ts"
    
    if [ -f "$FILENAME" ]; then
        echo "Error: File already exists: $FILENAME"
        exit 1
    fi
    
    cat > "$FILENAME" << EOF
import { z } from 'zod';

/**
 * ${NAME^} Schema
 * @description TODO: Add description
 */
export const ${NAME^}Schema = z.object({
  /** Unique identifier */
  id: z.string().optional().describe('Unique identifier'),
  
  /** Machine name (snake_case) */
  name: z.string()
    .regex(/^[a-z_][a-z0-9_]*$/)
    .describe('Machine name (snake_case)'),
  
  /** Display label */
  label: z.string().describe('Human-readable label'),
  
  // TODO: Add more fields
});

/**
 * ${NAME^} type
 */
export type ${NAME^} = z.infer<typeof ${NAME^}Schema>;

/**
 * ${NAME^} input type (for configuration files)
 */
export type ${NAME^}Input = z.input<typeof ${NAME^}Schema>;
EOF
    
    success "Created schema: $FILENAME"
    info "Next steps:"
    echo "  1. Edit $FILENAME to add fields"
    echo "  2. Export from packages/spec/src/${CATEGORY}/index.ts"
    echo "  3. Run: pnpm --filter @objectstack/spec build"
}

# Generate a test file template
generate_test() {
    local FILE=$1
    
    if [ -z "$FILE" ]; then
        echo "Usage: ./scripts/generate.sh test <schema-file>"
        exit 1
    fi
    
    if [ ! -f "$FILE" ]; then
        echo "Error: Schema file not found: $FILE"
        exit 1
    fi
    
    local TEST_FILE="${FILE%.zod.ts}.test.ts"
    
    if [ -f "$TEST_FILE" ]; then
        echo "Error: Test file already exists: $TEST_FILE"
        exit 1
    fi
    
    local SCHEMA_NAME=$(basename "$FILE" .zod.ts)
    local SCHEMA_NAME_CAMEL=$(echo "$SCHEMA_NAME" | sed 's/-\([a-z]\)/\U\1/g' | sed 's/^\([a-z]\)/\U\1/')
    
    cat > "$TEST_FILE" << EOF
import { describe, it, expect } from 'vitest';
import { ${SCHEMA_NAME_CAMEL}Schema } from './${SCHEMA_NAME}.zod.js';

describe('${SCHEMA_NAME_CAMEL}Schema', () => {
  describe('validation', () => {
    it('should accept valid data', () => {
      const result = ${SCHEMA_NAME_CAMEL}Schema.safeParse({
        name: 'valid_name',
        label: 'Valid Label',
      });
      
      expect(result.success).toBe(true);
    });
    
    it('should reject invalid name format', () => {
      const result = ${SCHEMA_NAME_CAMEL}Schema.safeParse({
        name: 'Invalid-Name',
        label: 'Label',
      });
      
      expect(result.success).toBe(false);
    });
    
    it('should reject missing required fields', () => {
      const result = ${SCHEMA_NAME_CAMEL}Schema.safeParse({});
      
      expect(result.success).toBe(false);
    });
  });
  
  describe('type inference', () => {
    it('should infer correct TypeScript types', () => {
      const data = {
        name: 'test_name',
        label: 'Test Label',
      };
      
      const validated = ${SCHEMA_NAME_CAMEL}Schema.parse(data);
      
      expect(validated.name).toBe('test_name');
      expect(validated.label).toBe('Test Label');
    });
  });
});
EOF
    
    success "Created test: $TEST_FILE"
    info "Run tests: pnpm --filter @objectstack/spec test"
}

# Main command router
case "${1:-help}" in
    schema)
        generate_schema "$2" "$3"
        ;;
    test)
        generate_test "$2"
        ;;
    help|--help|-h)
        echo "ObjectStack Template Generator"
        echo ""
        echo "Usage:"
        echo "  ./scripts/generate.sh <command> [options]"
        echo ""
        echo "Commands:"
        echo "  schema <name> [category] - Generate a new Zod schema"
        echo "  test <schema-file>       - Generate a test file for a schema"
        echo ""
        echo "Examples:"
        echo "  ./scripts/generate.sh schema widget ui"
        echo "  ./scripts/generate.sh test packages/spec/src/ui/widget.zod.ts"
        ;;
    *)
        echo "Unknown command: $1"
        echo "Run './scripts/generate.sh help' for usage"
        exit 1
        ;;
esac
