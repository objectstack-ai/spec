# UI Showcase Examples - Implementation Guide

## Overview

This directory contains comprehensive examples demonstrating ObjectStack's UI capabilities, including FormView (类似 Salesforce Page Layout), PageSchema (类似 Salesforce Lightning Record Page / FlexiPage), and component properties.

## 📋 What's Included

### 1. FormView Examples (`src/views/lead.view.ts`)

#### All 6 Form Layout Types

1. **Simple Layout** (`form` and `quick_create`)
   - Basic sectioned forms
   - Collapsible sections
   - 1-4 column layouts per section
   - Example: Contact information form with multiple sections

2. **Tabbed Layout** (`detail_form`)
   - Multiple tabs for complex data organization
   - Each tab can have different column configurations
   - Example: General, Qualification, Address, Details tabs

3. **Wizard Layout** (`lead_conversion_wizard`)
   - Step-by-step guided process
   - Multi-step data collection
   - Review step at the end
   - Example: Lead conversion process

4. **Split Layout** (`split_edit`)
   - Master-detail split view
   - Primary info on one side, extended details on the other
   - Example: Quick info + detailed fields

5. **Drawer Layout** (`quick_edit_drawer`)
   - Side panel form
   - Typically single column
   - Perfect for quick edits from list views
   - Example: Quick edit form

6. **Modal Layout** (`status_update_modal`)
   - Dialog-based form
   - Focused quick actions
   - Example: Status update dialog

#### Advanced Form Features

**Section Configuration:**
```typescript
{
  label: 'Contact Information',
  collapsible: true,     // Can be collapsed
  collapsed: false,      // Initial state
  columns: 2,            // 1, 2, 3, or 4 columns
  fields: [...]
}
```

**Field-Level Controls:**
```typescript
{
  field: 'first_name',
  required: true,        // Override field required status
  readonly: false,       // Make field read-only
  hidden: false,         // Hide field
  colSpan: 2,           // Span 2 columns (1-4)
  visibleOn: 'status != "new"',  // Conditional visibility
  dependsOn: 'country', // Cascading dependency
  widget: 'star_rating', // Custom widget override
  placeholder: 'Enter first name',
  helpText: 'The lead\'s first name'
}
```

### 2. PageSchema Examples (`src/pages/`)

#### Page Types

1. **Record Page** (`lead_detail.page.ts`)
   - Template: `header-sidebar-main`
   - Components: highlights, details, tabs, accordion, related lists
   - Features: AI chat, activity timeline, field history
   - Regions: header, sidebar, main

2. **Home Page** (`home.page.ts`)
   - Template: `three-column`
   - Components: KPIs, recent items, quick create
   - Features: Dashboard widgets, quick access
   - Regions: header, left_sidebar, main, right_sidebar

3. **App Page** (`app_launcher.page.ts`)
   - Template: `centered`
   - Components: global search, app grid
   - Features: Application launcher
   - Regions: header, main

4. **Utility Page** (`utility_bar.page.ts`)
   - Template: `utility-bar`
   - Components: notifications, chat, notes, search
   - Features: Floating utility panels
   - Regions: utilities

#### Component Types Demonstrated

**Record Context Components:**
- `record:details` - Field display with 1-4 columns
  ```typescript
  {
    type: 'record:details',
    properties: {
      columns: '2',
      layout: 'auto',  // or 'custom'
      fields: ['name', 'email', 'phone']  // optional override
    }
  }
  ```

- `record:highlights` - Key field highlights (1-7 fields)
  ```typescript
  {
    type: 'record:highlights',
    properties: {
      fields: ['status', 'rating', 'owner', 'email'],
      layout: 'horizontal'  // or 'vertical'
    }
  }
  ```

- `record:related_list` - Related records list
  ```typescript
  {
    type: 'record:related_list',
    properties: {
      objectName: 'task',
      relationshipField: 'lead_id',
      columns: ['subject', 'status', 'due_date'],
      sort: [{ field: 'due_date', order: 'asc' }],
      limit: 10,
      filter: [['status', '!=', 'completed']],
      showViewAll: true,
      actions: ['new_task', 'edit']
    }
  }
  ```

- `record:activity` - Activity timeline
- `record:path` - Status path/progress indicator

**Structural Components:**
- `page:header` - Page header with title, breadcrumb, actions
- `page:tabs` - Tabbed content areas
- `page:accordion` - Collapsible panels
- `page:card` - Card containers

**AI Components:**
- `ai:chat_window` - AI assistant integration
  ```typescript
  {
    type: 'ai:chat_window',
    properties: {
      mode: 'sidebar',  // 'float', 'sidebar', or 'inline'
      agentId: 'sales_assistant',
      context: {
        recordType: 'lead',
        recordId: '{record.id}'
      }
    }
  }
  ```

#### Page Features

**Component Visibility Rules:**
```typescript
{
  type: 'ai:chat_window',
  visibility: 'status == "qualified" OR status == "contacted"'
}
```

**Profile Assignment:**
```typescript
{
  assignedProfiles: ['sales_user', 'sales_manager', 'system_administrator']
}
```

**Page Variables:**
```typescript
variables: [
  {
    name: 'showHistory',
    type: 'boolean',
    defaultValue: false
  }
]
```

### 3. List Views (`src/views/lead.view.ts`)

Demonstrates multiple list view types:

1. **Grid View** (`all_leads`) - Standard data table with:
   - Enhanced column configuration
   - Quick filters (Salesforce-style)
   - Row/bulk actions
   - Inline editing
   - Export options

2. **Kanban View** (`kanban_by_status`) - Board layout
3. **Calendar View** (`calendar_by_created`) - Calendar display
4. **Gallery View** (`gallery_view`) - Card/masonry layout

## 🎯 Key Patterns

### Pattern 1: Conditional Field Visibility

```typescript
{
  field: 'owner',
  visibleOn: 'status == "contacted" OR status == "qualified"'
}
```

### Pattern 2: Cascading Dependencies

```typescript
{
  field: 'state',
  dependsOn: 'country'  // State options based on country selection
}
```

### Pattern 3: Custom Widgets

```typescript
{
  field: 'rating',
  widget: 'star_rating'  // Use custom star rating widget
}
```

### Pattern 4: Multi-Column Spanning

```typescript
{
  field: 'description',
  colSpan: 2  // Span 2 columns in a 2-column layout
}
```

### Pattern 5: Component Composition in Pages

```typescript
regions: [
  {
    name: 'main',
    components: [
      {
        type: 'page:tabs',
        properties: {
          items: [
            {
              label: 'Details',
              children: [
                {
                  type: 'record:details',
                  properties: { columns: '2' }
                }
              ]
            }
          ]
        }
      }
    ]
  }
]
```

## 🚀 Usage Examples

### Using a Named Form View

```typescript
// In your navigation config
navigation: {
  mode: 'page',
  view: 'detail_form'  // Reference the named form view
}
```

### Switching Between Form Layouts

```typescript
// Simple form for quick create
formViews: {
  quick_create: { type: 'simple', ... },
  
  // Wizard for complex process
  conversion: { type: 'wizard', ... },
  
  // Drawer for quick edit
  quick_edit: { type: 'drawer', ... }
}
```

### Profile-Based Page Assignment

```typescript
// Assign different pages to different profiles
{
  name: 'lead_detail_sales',
  assignedProfiles: ['sales_user'],
  ...
},
{
  name: 'lead_detail_admin',
  assignedProfiles: ['system_administrator'],
  ...
}
```

## 📐 Best Practices

1. **Form Sections**: Use 1-2 columns for most forms, 3-4 for compact displays
2. **Field Spanning**: Use colSpan for full-width text areas and descriptions
3. **Collapsible Sections**: Collapse less frequently used sections by default
4. **Conditional Visibility**: Use visibleOn for dynamic forms that adapt to data
5. **Dependencies**: Use dependsOn for cascading field relationships
6. **Named Views**: Create multiple named views for different user scenarios
7. **Page Templates**: Choose appropriate templates based on layout needs
8. **Component Composition**: Nest components logically within regions
9. **ARIA Attributes**: Always include accessibility attributes
10. **Profile Assignment**: Assign pages to appropriate user profiles

## 🔍 Reference

- **Naming Convention**: All identifiers (object names, field names, view names) use `snake_case`
- **Configuration Properties**: All config keys use `camelCase` (e.g., `colSpan`, `visibleOn`)
- **Salesforce Equivalents**:
  - FormView → Page Layout
  - PageSchema → Lightning Record Page / FlexiPage
  - Components → Lightning Components
  - Regions → Component regions in Lightning pages

## 📚 Related Documentation

- See `packages/spec/src/ui/view.zod.ts` for complete FormView schema
- See `packages/spec/src/ui/page.zod.ts` for complete PageSchema
- See `packages/spec/src/ui/component.zod.ts` for all component property schemas
