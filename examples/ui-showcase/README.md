# UI Showcase Examples

This example demonstrates the comprehensive UI capabilities of ObjectStack, including:

## 📋 FormView Examples

Demonstrates all 6 form layout types with advanced features:

- **Simple**: Basic sectioned forms with collapsible sections and 1-4 column layouts
- **Tabbed**: Multi-tab forms for organizing complex data
- **Wizard**: Step-by-step guided processes
- **Split**: Master-detail split view
- **Drawer**: Side panel forms
- **Modal**: Dialog-based forms

### Form Features Showcased

- **Section Configuration**: Collapsible sections with 1-4 column layouts
- **Field-Level Controls**:
  - `readonly` - Read-only fields
  - `required` - Required field validation
  - `hidden` - Conditionally hide fields
  - `colSpan` - Multi-column spanning (1-4)
  - `visibleOn` - Conditional visibility expressions
  - `dependsOn` - Cascading field dependencies
  - Custom `widget` - Custom field renderers
- **Multiple Named Views**: Switch between different form layouts per scenario

## 📄 PageSchema Examples

Demonstrates component-based page layouts similar to Salesforce Lightning:

- **Record Pages**: Detail pages for individual records
- **Home Pages**: Dashboard-style landing pages
- **App Pages**: Application launcher pages
- **Utility Pages**: Utility bar components

### Page Features Showcased

- **Template-Based Layouts**: Regions-based component composition
- **Rich Component Types**:
  - `record:details` - Record detail view with 1-4 columns
  - `record:highlights` - Key field highlights (1-7 fields)
  - `record:related_list` - Related records list
  - `page:tabs` - Tabbed content areas
  - `page:accordion` - Collapsible panels
  - `ai:chat_window` - AI assistant integration
- **Visibility Rules**: Component-level conditional visibility
- **Profile Assignment**: Assign pages to specific user profiles

## 🧩 Component Properties

Comprehensive component property schemas:

- `RecordDetailsProps`: 1-4 columns, auto/custom layout modes
- `RecordHighlightsProps`: 1-7 key fields highlighted
- `RecordRelatedListProps`: Related object, columns, sorting, limits

## 📁 Structure

```
ui-showcase/
├── README.md (this file)
└── src/
    ├── objects/
    │   └── lead.object.ts (sample object for UI examples)
    ├── views/
    │   └── lead.view.ts (all 6 form types + multiple list views)
    └── pages/
        ├── lead_detail.page.ts (record page)
        ├── home.page.ts (home page)
        ├── app_launcher.page.ts (app page)
        └── utility_bar.page.ts (utility page)
```

## 🚀 Usage

These examples serve as reference implementations demonstrating best practices for:

1. **Salesforce Developers**: Familiar patterns like Page Layouts and FlexiPages
2. **Low-Code Builders**: Visual form and page composition
3. **AI Agents**: Structured metadata for code generation

All examples follow ObjectStack naming conventions:
- Configuration properties: `camelCase`
- Machine names/identifiers: `snake_case`
