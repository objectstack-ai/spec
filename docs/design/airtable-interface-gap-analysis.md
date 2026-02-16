# Design Document: Airtable Interface Gap Analysis — ObjectStack UI Protocol Evaluation

> **Author:** ObjectStack Core Team  
> **Created:** 2026-02-16  
> **Status:** Phase A Implemented  
> **Target Version:** v3.2 – v4.0

---

## Table of Contents

- [1. Executive Summary](#1-executive-summary)
- [2. Airtable Interfaces Overview](#2-airtable-interfaces-overview)
  - [2.1 Page Types](#21-page-types)
  - [2.2 Interface Elements](#22-interface-elements)
  - [2.3 Design Philosophy](#23-design-philosophy)
- [3. Feature Comparison Matrix](#3-feature-comparison-matrix)
  - [3.1 Page Types & Layouts](#31-page-types--layouts)
  - [3.2 View Types (Data Visualization)](#32-view-types-data-visualization)
  - [3.3 Interface Elements](#33-interface-elements)
  - [3.4 Interaction & Permissions](#34-interaction--permissions)
  - [3.5 Sharing & Distribution](#35-sharing--distribution)
- [4. Gap Analysis — What ObjectStack Is Missing](#4-gap-analysis--what-objectstack-is-missing)
  - [4.1 Critical Gaps (P0)](#41-critical-gaps-p0)
  - [4.2 Important Gaps (P1)](#42-important-gaps-p1)
  - [4.3 Nice-to-Have Gaps (P2)](#43-nice-to-have-gaps-p2)
- [5. ObjectStack Advantages Over Airtable](#5-objectstack-advantages-over-airtable)
- [6. Schema Improvement Proposals](#6-schema-improvement-proposals)
  - [6.1 Interface Schema (New)](#61-interface-schema-new)
  - [6.2 Interface Page Schema (New)](#62-interface-page-schema-new)
  - [6.3 Interface Element Schema (New)](#63-interface-element-schema-new)
  - [6.4 View Schema Enhancements](#64-view-schema-enhancements)
  - [6.5 Sharing & Embedding Schema (New)](#65-sharing--embedding-schema-new)
- [7. Implementation Road Map](#7-implementation-road-map)
  - [7.1 Phase A: Interface Foundation (v3.2)](#71-phase-a-interface-foundation-v32)
  - [7.2 Phase B: Element Library & Builder (v3.3)](#72-phase-b-element-library--builder-v33)
  - [7.3 Phase C: Sharing, Embedding & Permissions (v4.0)](#73-phase-c-sharing-embedding--permissions-v40)
  - [7.4 Phase D: Advanced Interface Features (v4.1)](#74-phase-d-advanced-interface-features-v41)
- [8. Risk Analysis](#8-risk-analysis)
- [9. Decision Log](#9-decision-log)
- [10. References](#10-references)

---

## 1. Executive Summary

This document evaluates the gap between ObjectStack's current UI Protocol (`packages/spec/src/ui/`) and
**Airtable Interfaces** — the industry-leading no-code interface builder for data-centric applications.

**Key Finding:** ObjectStack already possesses a **technically richer** schema foundation than Airtable
(45+ chart types, Gantt/Map views, full theme system, offline support, AI components, drag-and-drop).
However, it lacks Airtable's **"Interface" abstraction** — the concept of a self-contained, shareable,
role-specific application surface that stitches together multiple views, elements, and actions into a
cohesive experience.

The core gap is **not** in individual component capabilities, but in the **composition layer** that
ties them together — specifically:

| Area | Airtable | ObjectStack |
|:---|:---|:---|
| **Interface as a first-class entity** | ✅ Multi-page app per base | ✅ `InterfaceSchema` + `App.interfaces[]` drives sidebar |
| **Drag-and-drop element canvas** | ✅ Free-form element placement | 🟡 Region-based composition |
| **Record Review workflow** | ✅ Built-in record-by-record review | ✅ `RecordReviewConfigSchema` in `PageSchema` |
| **Element-level data binding** | ✅ Each element binds to any table/view | ✅ `ElementDataSourceSchema` per component |
| **Shareable interface URLs** | ✅ Public/private share links | ❌ Not modeled (Phase C) |
| **Interface-level permissions** | ✅ Per-interface user access | ✅ `assignedRoles` on `InterfaceSchema` |
| **Embeddable interfaces** | ✅ iframe embed codes | ❌ Not modeled (Phase C) |

This document proposes specific schema additions and a phased roadmap to close these gaps while
preserving ObjectStack's superior extensibility and enterprise capabilities.

---

## 2. Airtable Interfaces Overview

### 2.1 Page Types

Airtable Interfaces organize data presentations into **page types** — pre-configured layouts
optimized for specific workflows:

| Page Type | Purpose | Key Elements |
|:---|:---|:---|
| **Dashboard** | KPI summary, executive overview | Charts, numbers, text, buttons |
| **Grid** | Spreadsheet-like data management | Sortable/filterable table with inline editing |
| **List** | Record list with quick actions | Compact record cards, status indicators |
| **Gallery** | Visual browsing (images/cards) | Large cards with cover images |
| **Kanban** | Status-based workflow boards | Drag-and-drop columns |
| **Calendar** | Date-based scheduling | Monthly/weekly event display |
| **Timeline** | Gantt-like project timelines | Date range bars on a timeline axis |
| **Form** | Data collection and entry | Custom form fields with validation |
| **Record Detail** | Single record deep-dive | All fields, linked records, comments |
| **Record Review** | Sequential record review/approval | Record flipper, approval actions |
| **Overview** | Landing/navigation hub | Links, instructions, bookmarks |
| **Blank** | Free-form canvas | Any combination of elements |

### 2.2 Interface Elements

Each page can contain **elements** — modular UI building blocks:

| Element | Description |
|:---|:---|
| **Grid** | Embedded data table (read-only or editable) |
| **Chart** | Bar, line, pie, donut visualizations |
| **Number** | Single metric/aggregate (count, sum, avg) |
| **Text** | Static text, headers, instructions (Markdown) |
| **Button** | Trigger actions (update record, open URL, run automation) |
| **Filter** | User-interactive filter controls |
| **Divider** | Visual separator between sections |
| **Form** | Inline data entry form |
| **Record Detail** | Selected record's field values |
| **Record List** | Compact list of records from any table |
| **Image** | Static image or attachment preview |
| **Link/Bookmark** | Navigation link to another page or external URL |

### 2.3 Design Philosophy

Airtable's approach is characterized by:

1. **Data-first composition** — Every element is bound to a data source (table + view + filter)
2. **Role-specific surfaces** — Same data, different interfaces for different stakeholders
3. **Zero-code building** — Drag-and-drop, no configuration files
4. **Progressive disclosure** — Simple defaults, advanced options on demand
5. **Shareable artifacts** — Interfaces are independently shareable/embeddable
6. **Record-centric workflow** — Review, approve, and edit records inline

---

## 3. Feature Comparison Matrix

### 3.1 Page Types & Layouts

| Page Type | Airtable | ObjectStack | Gap |
|:---|:---:|:---:|:---|
| Dashboard | ✅ | ✅ `DashboardSchema` | Parity — ObjectStack has richer widget/chart options |
| Grid/Table | ✅ | ✅ `ListViewSchema` (type: grid) | Parity |
| Kanban Board | ✅ | ✅ `ListViewSchema` (type: kanban) | Parity |
| Gallery | ✅ | ✅ `ListViewSchema` (type: gallery) | Parity |
| Calendar | ✅ | ✅ `ListViewSchema` (type: calendar) | Parity |
| Timeline | ✅ | ✅ `ListViewSchema` (type: timeline) | Parity |
| Form | ✅ | ✅ `FormViewSchema` | ObjectStack has more form types (wizard, split, drawer) |
| Record Detail | ✅ | ✅ `PageSchema` (type: record) | ObjectStack has component-based region model |
| Record Review | ✅ | ❌ | **GAP** — No sequential review/approval page type |
| Overview/Landing | ✅ | ✅ `PageSchema` (type: home) | Parity — ObjectStack uses component regions |
| Blank/Free-form | ✅ | 🟡 `PageSchema` (type: utility) | Partial — region-based, not free-form canvas |
| Gantt | ❌ | ✅ `ListViewSchema` (type: gantt) | **ObjectStack advantage** |
| Map | ❌ | ✅ `ListViewSchema` (type: map) | **ObjectStack advantage** |

### 3.2 View Types (Data Visualization)

| View Feature | Airtable | ObjectStack | Gap |
|:---|:---:|:---:|:---|
| Grid with inline editing | ✅ | ✅ `inlineEdit` | Parity |
| Column pinning | ✅ | ✅ `pinned: left/right` | Parity |
| Row grouping (multi-level) | ✅ (1 level) | ✅ (3 levels) | **ObjectStack advantage** |
| Column summaries | ✅ | ✅ `summary` (6 aggregates) | Parity |
| Row coloring | ✅ | ✅ `RowColorConfigSchema` | Parity |
| Row height density | ✅ | ✅ (5 levels) | **ObjectStack advantage** (5 vs 4) |
| Quick filters | ✅ | ✅ `quickFilters` | Parity |
| Virtual scrolling | ❌ | ✅ | **ObjectStack advantage** |
| Export (CSV/XLSX/PDF/JSON) | 🟡 (CSV only) | ✅ (4 formats) | **ObjectStack advantage** |
| Personal/collaborative views | ✅ | ✅ `ViewSharingSchema` | Parity |
| View locking | ✅ | ✅ `lockedBy` | Parity |
| Conditional formatting | 🟡 (record coloring) | ✅ `conditionalFormatting` | **ObjectStack advantage** |

### 3.3 Interface Elements

| Element | Airtable | ObjectStack | Gap |
|:---|:---:|:---:|:---|
| Chart widget | ✅ (4 types) | ✅ (45+ types) | **ObjectStack advantage** |
| Number/Metric | ✅ | ✅ `DashboardWidgetSchema` (metric) | Parity |
| Static text/Markdown | ✅ | 🟡 `PageHeaderProps` | **GAP** — No standalone text element |
| Button/Action | ✅ | ✅ `ActionSchema` | Parity |
| Filter control | ✅ | ✅ `quickFilters`, `GlobalFilterSchema` | Parity |
| Divider/Separator | ✅ | ❌ | **GAP** — No divider element |
| Image element | ✅ | ❌ | **GAP** — No standalone image element |
| Record picker/selector | ✅ | ❌ | **GAP** — No record picker element |
| Linked record list | ✅ | ✅ `RecordRelatedListProps` | Parity |
| Inline form | ✅ | 🟡 `FormViewSchema` (standalone) | Partial — form is a full view, not an embeddable element |
| Bookmark/Link | ✅ | 🟡 `UrlNavItemSchema` | Partial — navigation only, not in-page element |
| Cover image/Branding | ✅ | ✅ `AppBrandingSchema` | Parity |

### 3.4 Interaction & Permissions

| Feature | Airtable | ObjectStack | Gap |
|:---|:---:|:---:|:---|
| Per-interface user access | ✅ | 🟡 `requiredPermissions` (app-level) | **GAP** — No per-interface/page-level sharing |
| Conditional field visibility | ✅ (Business/Enterprise) | ✅ `visibleOn` in FormView | Parity |
| Element group visibility | ✅ | 🟡 Component visibility in Page | Partial |
| Record-level commenting | ✅ | ✅ `record:chatter` component | Parity |
| Activity feed | ✅ | ✅ `record:activity` component | Parity |
| Record approval workflow | ✅ | 🟡 `WorkflowSchema` (separate system) | Partial — exists but not integrated into UI |
| Drag-and-drop record reorder | ✅ | ✅ `DnDSchema` | Parity |
| Button → Automation trigger | ✅ | ✅ `ActionSchema` (type: flow) | Parity |
| Button → Record update | ✅ | ✅ `ActionSchema` (type: script) | Parity |
| Button → URL navigation | ✅ | ✅ `ActionSchema` (type: url) | Parity |

### 3.5 Sharing & Distribution

| Feature | Airtable | ObjectStack | Gap |
|:---|:---:|:---:|:---|
| Public share link | ✅ | ❌ | **GAP** — No share link generation |
| Password-protected share | ✅ | ❌ | **GAP** |
| Email domain restriction | ✅ | ❌ | **GAP** |
| Embeddable iframe | ✅ | ❌ | **GAP** — No embed configuration |
| Share with specific users | ✅ | 🟡 `requiredPermissions` | Partial — permission-based, not user-list-based |
| Share with edit/view-only | ✅ | ❌ | **GAP** — No access level on share |
| Shareable form (public) | ✅ | ❌ | **GAP** |
| Preview as another user | ✅ | ❌ | **GAP** |

---

## 4. Gap Analysis — What ObjectStack Is Missing

### 4.1 Critical Gaps (P0)

#### G1: Interface as a First-Class Entity

**Problem:** Airtable treats an "Interface" as a top-level entity — a multi-page, shareable
application bound to a data base. ObjectStack has `AppSchema` and `PageSchema` separately but
lacks the **intermediate "Interface"** concept that bundles pages into a shareable, role-specific
surface.

**Impact:** Cannot model the Airtable use case: "Marketing team sees Dashboard + Gallery, Sales
team sees Kanban + Record Review, External clients see Form + Overview".

**Proposed Solution:** Introduce `InterfaceSchema` — a self-contained, shareable application
surface containing ordered pages, branding, and access controls.

#### G2: Record Review Page Type

**Problem:** Airtable's "Record Review" page enables sequential record-by-record review with
approval/rejection actions. ObjectStack has no equivalent page type — the closest is
`PageSchema` (type: record) which shows a single record.

**Impact:** Cannot model approval queues, content review workflows, or data QA processes
natively in the UI protocol.

**Proposed Solution:** Add `recordReview` type to `PageSchema` or introduce a
`RecordReviewConfigSchema` with record navigation, approval actions, and filter criteria.

#### G3: Standalone Interface Elements

**Problem:** Airtable allows placing **standalone elements** (text, number, divider, image,
button) freely on any page. ObjectStack's `PageSchema` uses a **region → component** model
which is more structured but doesn't include simple content elements.

**Impact:** Cannot create rich informational pages with mixed content (text + metrics + charts +
dividers) as flexibly as Airtable.

**Proposed Solution:** Extend `PageComponentType` to include content elements:
`element:text`, `element:number`, `element:image`, `element:divider`, `element:button`,
`element:filter`.

### 4.2 Important Gaps (P1)

#### G4: Sharing & Embedding Configuration

**Problem:** ObjectStack has no schema for generating share links, configuring embed codes,
or controlling public access to interfaces/views/forms.

**Impact:** Cannot model the common Airtable pattern of sharing a dashboard with stakeholders
or embedding a form in an external website.

**Proposed Solution:** Introduce `SharingSchema` with share type (public link, password, domain
restriction, embed), access level (view/comment/edit), and expiration.

#### G5: Per-Element Data Binding

**Problem:** In Airtable, each element (grid, chart, number) can independently bind to a
different table and view. In ObjectStack, `PageSchema` binds to a single `object` at the page
level, and components operate within that context.

**Impact:** Cannot create pages that combine data from multiple objects (e.g., a dashboard page
with a "Projects" grid alongside a "Tasks" kanban and a "Team" gallery).

**Proposed Solution:** Add `dataSource` property to individual page components, allowing
per-element object/view binding that overrides the page-level context.

#### G6: Inline Form Element

**Problem:** Airtable can embed a form element within any page. ObjectStack treats `FormView`
as a standalone view type, not an embeddable page component.

**Impact:** Cannot create pages that combine informational content with data entry (e.g.,
"Overview page with embedded quick-add form").

**Proposed Solution:** Add `element:form` to `PageComponentType` with props for target object,
visible fields, and submission action.

### 4.3 Nice-to-Have Gaps (P2)

#### G7: User Impersonation Preview

**Problem:** Airtable allows interface builders to preview the interface "as another user" to
verify role-based visibility. ObjectStack has no equivalent in its protocol.

**Proposed Solution:** Add `previewAs` option to `InterfaceSchema` or `PageSchema` for design-time
impersonation support in Studio.

#### G8: Interface Templates & Duplication

**Problem:** Airtable allows duplicating interface pages and using templates. ObjectStack's
`AppSchema` doesn't model template inheritance or duplication.

**Proposed Solution:** Add `template` field to `InterfaceSchema` referencing a base template,
and support `clone` operations in Studio.

#### G9: Record Picker Element

**Problem:** Airtable has a "Record Picker" element that lets users select a record from a
dropdown to populate context for other elements on the page. ObjectStack has no equivalent
standalone element.

**Proposed Solution:** Add `element:recordPicker` to `PageComponentType` with props for source
object, display field, filter criteria, and variable binding.

---

## 5. ObjectStack Advantages Over Airtable

ObjectStack's UI Protocol already **exceeds Airtable** in several significant areas:

| Capability | Airtable | ObjectStack |
|:---|:---:|:---:|
| Chart types | 4 (bar, line, pie, donut) | 45+ (including sankey, treemap, heatmap, radar, waterfall, candlestick) |
| Gantt view | ❌ | ✅ with dependencies and progress tracking |
| Map view | ❌ | ✅ with clustering and zoom |
| Form types | 1 (simple) | 6 (simple, tabbed, wizard, split, drawer, modal) |
| Theme system | ❌ (fixed branding) | ✅ Full design system (colors, typography, spacing, shadows, animations) |
| Offline support | ❌ | ✅ Cache strategies, sync queuing, conflict resolution |
| Custom widgets | ❌ (limited extensions) | ✅ NPM, Module Federation, inline code |
| AI components | ❌ | ✅ Chat window, suggestions, agent integration |
| Keyboard shortcuts | Limited | ✅ Full keyboard navigation, focus management, shortcuts |
| Touch/gesture support | Basic | ✅ Swipe, pinch, long-press, haptic feedback |
| Drag-and-drop protocol | Basic (kanban) | ✅ Full DnD with constraints, drop zones, sortable lists |
| Responsive design | Basic | ✅ 6 breakpoints, per-component columns, visibility rules |
| Animation/transitions | ❌ | ✅ Page transitions, component animations, easing functions |
| Internationalization | ❌ | ✅ Full i18n with plurals, number/date formatting |
| Multi-level grouping | 1 level | 3 levels with independent sort |
| Export formats | CSV | CSV, XLSX, PDF, JSON |
| Report types | ❌ | 4 (tabular, summary, matrix, joined) |
| Notification system | ❌ | ✅ Toast, snackbar, banner, alert, inline |

---

## 6. Schema Improvement Proposals

This section details the schema changes to support Airtable Interface parity.

**Note:** Many of these proposals have been **IMPLEMENTED** in Phase A (see Section 7.1).
The code samples below reflect the current state of the schemas.

### 6.0 App Schema Enhancements

To enable the new Interface-driven navigation model, `AppSchema` has been enhanced with:

```typescript
// Implemented: src/ui/app.zod.ts

export const AppSchema = z.object({
  // ... existing fields ...
  
  /** 
   * Interface names registered in this App.
   * Sidebar renders as a two-level menu: Interface (collapsible group) → Pages (menu items).
   */
  interfaces: z.array(z.string()).optional()
    .describe('Interface names available in this App. Sidebar renders as Interface→Pages two-level menu.'),

  /** Default interface to activate on App launch */
  defaultInterface: z.string().optional()
    .describe('Default interface to show when the App opens'),
  
  /** 
   * Navigation Tree Structure (Global Utility Entries Only).
   * Now repurposed for global utility items (Settings, Help, external links)
   * rendered at the bottom of the sidebar.
   */
  navigation: z.array(NavigationItemSchema).optional()
    .describe('Global utility navigation items (Settings, Help, external links) — rendered at bottom of sidebar'),
  
  // ... remaining fields ...
});
```

**Key Changes:**
- Added `interfaces[]` — declares which interfaces belong to the app
- Added `defaultInterface` — specifies which interface to show on app launch
- Repurposed `navigation[]` — now for global utility entries only (Settings, Help, etc.)
- The runtime auto-generates the main sidebar from `interfaces[]` and their `pages[]`

### 6.1 Interface Schema (New)

A new `InterfaceSchema` to represent the Airtable "Interface" concept — a self-contained,
shareable, multi-page application surface:

```typescript
// Proposed: src/ui/interface.zod.ts

export const InterfaceSchema = z.object({
  name: z.string().regex(/^[a-z_][a-z0-9_]*$/)
    .describe('Machine name (snake_case)'),
  label: z.string()
    .describe('Display name'),
  description: z.string().optional()
    .describe('Purpose description'),
  icon: z.string().optional()
    .describe('Icon name for sidebar display (Lucide icon)'),
  group: z.string().optional()
    .describe('Business group label for sidebar grouping (e.g. "Sales Cloud", "Service Cloud")'),
  object: z.string().optional()
    .describe('Primary object binding (snake_case)'),
  pages: z.array(InterfacePageSchema)
    .describe('Ordered list of pages in this interface'),
  homePageId: z.string().optional()
    .describe('Default landing page ID'),
  branding: InterfaceBrandingSchema.optional()
    .describe('Visual branding overrides'),
  sharing: SharingConfigSchema.optional()
    .describe('Sharing and access configuration'),
  assignedRoles: z.array(z.string()).optional()
    .describe('Roles that can access this interface'),
  isDefault: z.boolean().optional()
    .describe('Whether this is the default interface for the object'),
});
```

### 6.2 Interface Page Schema (New)

Extends the existing `PageSchema` with Airtable-inspired page types:

```typescript
// Proposed additions to PageSchema types

export const InterfacePageTypeSchema = z.enum([
  'dashboard',      // KPI summary with charts/metrics
  'grid',           // Spreadsheet-like data table
  'list',           // Record list with quick actions
  'gallery',        // Card-based visual browsing
  'kanban',         // Status-based board
  'calendar',       // Date-based scheduling
  'timeline',       // Gantt-like project timeline
  'form',           // Data entry form
  'record_detail',  // Single record deep-dive
  'record_review',  // Sequential record review/approval (NEW)
  'overview',       // Landing/navigation hub
  'blank',          // Free-form canvas
]);

export const RecordReviewConfigSchema = z.object({
  object: z.string().describe('Target object for review'),
  filter: z.any().optional().describe('Filter criteria for review queue'),
  sort: z.array(SortItemSchema).optional().describe('Sort order for review queue'),
  displayFields: z.array(z.string()).optional()
    .describe('Fields to display on the review page'),
  actions: z.array(z.object({
    label: z.string().describe('Action button label'),
    type: z.enum(['approve', 'reject', 'skip', 'custom'])
      .describe('Action type'),
    field: z.string().optional()
      .describe('Field to update on action'),
    value: z.any().optional()
      .describe('Value to set on action'),
    nextRecord: z.boolean().optional().default(true)
      .describe('Auto-advance to next record after action'),
  })).describe('Review actions'),
  navigation: z.enum(['sequential', 'random', 'filtered'])
    .optional().default('sequential')
    .describe('Record navigation mode'),
  showProgress: z.boolean().optional().default(true)
    .describe('Show review progress indicator'),
});
```

### 6.3 Interface Element Schema (New)

Extends `PageComponentType` with standalone interface elements:

```typescript
// Proposed additions to PageComponentType

// Content elements (new)
'element:text'          // Static text / Markdown block
'element:number'        // Single metric / aggregate value
'element:image'         // Static image or dynamic attachment
'element:divider'       // Visual horizontal separator
'element:button'        // Standalone action button
'element:filter'        // User-interactive filter control
'element:form'          // Inline embedded form
'element:record_picker' // Record selector dropdown

// Props for new elements
export const ElementTextPropsSchema = z.object({
  content: z.string().describe('Text or Markdown content'),
  variant: z.enum(['heading', 'subheading', 'body', 'caption'])
    .optional().default('body'),
  align: z.enum(['left', 'center', 'right']).optional().default('left'),
});

export const ElementNumberPropsSchema = z.object({
  object: z.string().describe('Source object'),
  field: z.string().optional().describe('Field to aggregate'),
  aggregate: z.enum(['count', 'sum', 'avg', 'min', 'max'])
    .describe('Aggregation function'),
  filter: z.any().optional().describe('Filter criteria'),
  format: z.enum(['number', 'currency', 'percent']).optional(),
  prefix: z.string().optional(),
  suffix: z.string().optional(),
});

export const ElementImagePropsSchema = z.object({
  src: z.string().describe('Image URL or attachment field'),
  alt: z.string().optional().describe('Alt text'),
  fit: z.enum(['cover', 'contain', 'fill']).optional().default('cover'),
  height: z.number().optional().describe('Fixed height in pixels'),
});

export const ElementRecordPickerPropsSchema = z.object({
  object: z.string().describe('Source object for record selection'),
  displayField: z.string().describe('Field to display in dropdown'),
  filter: z.any().optional().describe('Filter criteria'),
  placeholder: z.string().optional(),
  variable: z.string().describe('Page variable to bind selected record ID'),
});

export const ElementFormPropsSchema = z.object({
  object: z.string().describe('Target object for form submission'),
  fields: z.array(z.string()).optional()
    .describe('Specific fields to include'),
  submitLabel: z.string().optional().default('Submit'),
  successMessage: z.string().optional(),
  resetAfterSubmit: z.boolean().optional().default(true),
});
```

### 6.4 View Schema Enhancements

Proposed enhancements to existing `ListViewSchema`:

```typescript
// Per-element data source binding (for multi-object pages)
export const ElementDataSourceSchema = z.object({
  object: z.string().describe('Object to query'),
  view: z.string().optional().describe('Named view to apply'),
  filter: z.any().optional().describe('Additional filter criteria'),
  sort: z.array(SortItemSchema).optional(),
  limit: z.number().optional().describe('Max records to display'),
});

// Add to page component instances:
// dataSource: ElementDataSourceSchema.optional()
//   .describe('Per-element data binding, overrides page-level object context')
```

### 6.5 Sharing & Embedding Schema (New)

```typescript
// Proposed: additions to src/ui/app.zod.ts or new src/ui/sharing.zod.ts

export const ShareAccessLevelSchema = z.enum([
  'view',       // Read-only access
  'comment',    // Can view and comment
  'edit',       // Can view, comment, and edit records
]);

export const ShareTypeSchema = z.enum([
  'private',     // Only assigned users/roles
  'link',        // Anyone with the link
  'password',    // Link + password required
  'domain',      // Restricted to email domain
  'embed',       // Embeddable in external sites
]);

export const SharingConfigSchema = z.object({
  enabled: z.boolean().default(false)
    .describe('Whether sharing is active'),
  type: ShareTypeSchema
    .describe('Share access method'),
  accessLevel: ShareAccessLevelSchema.optional().default('view')
    .describe('What shared users can do'),
  password: z.string().optional()
    .describe('Password for password-protected shares'),
  allowedDomains: z.array(z.string()).optional()
    .describe('Allowed email domains for domain-restricted shares'),
  expiresAt: z.string().optional()
    .describe('ISO 8601 expiration date for the share link'),
  allowDownload: z.boolean().optional().default(false)
    .describe('Whether shared users can export/download data'),
  showBranding: z.boolean().optional().default(true)
    .describe('Whether to show ObjectStack branding on shared views'),
});

export const EmbedConfigSchema = z.object({
  enabled: z.boolean().default(false)
    .describe('Whether embedding is allowed'),
  allowedOrigins: z.array(z.string()).optional()
    .describe('Allowed parent origins for iframe embedding'),
  width: z.string().optional().default('100%')
    .describe('Embed width (CSS value)'),
  height: z.string().optional().default('600px')
    .describe('Embed height (CSS value)'),
  hideNavigation: z.boolean().optional().default(false)
    .describe('Hide interface navigation in embedded mode'),
  hideToolbar: z.boolean().optional().default(false)
    .describe('Hide toolbar controls in embedded mode'),
});
```

---

## 7. Implementation Road Map

### 7.1 Phase A: Interface Foundation (v3.2 — Q3 2026) ✅

> **Goal:** Establish the "Interface" abstraction as a first-class protocol entity.

- [x] Define `InterfaceSchema` in `src/ui/interface.zod.ts`
- [x] Add `RecordReviewConfigSchema` to `PageSchema` types
- [x] Add content elements to `PageComponentType` (`element:text`, `element:number`, `element:image`, `element:divider`)
- [x] Add `ElementTextPropsSchema`, `ElementNumberPropsSchema`, `ElementImagePropsSchema` to component props
- [x] Add `dataSource` property to `PageComponentSchema` for per-element data binding
- [x] Write comprehensive tests for all new schemas
- [x] Update `src/ui/index.ts` exports
- [x] Merge `InterfacePageSchema` into `PageSchema` — unified `PageTypeSchema` with 16 types
- [x] Extract shared `SortItemSchema` to `shared/enums.zod.ts`
- [x] Export `defineInterface()` from root index.ts
- [x] Add `InterfaceNavItemSchema` to `AppSchema` navigation for App↔Interface bridging
- [x] Disambiguate overlapping page types (`record`/`record_detail`, `home`/`overview`) in `PageTypeSchema` docs
- [ ] Generate JSON Schema for new types

**Estimated effort:** 2–3 weeks

### 7.2 Phase B: Element Library & Builder (v3.3 — Q4 2026)

> **Goal:** Complete the element library and enable free-form page composition.

- [ ] Add interactive elements: `element:button`, `element:filter`, `element:form`, `element:record_picker`
- [ ] Add `ElementFormPropsSchema`, `ElementRecordPickerPropsSchema`, `ElementButtonPropsSchema`, `ElementFilterPropsSchema`
- [ ] Define `BlankPageLayoutSchema` for free-form canvas composition (grid-based positioning)
- [ ] Add `PageVariableSchema` integration with `element:record_picker` (variable binding)
- [ ] Add `RecordReviewConfigSchema` with approval actions, navigation modes, and progress indicators
- [ ] Implement Studio Interface Builder UI (drag-and-drop element placement)
- [ ] Write integration tests for multi-element page composition

**Estimated effort:** 4–6 weeks

### 7.3 Phase C: Sharing, Embedding & Permissions (v4.0 — Q1 2027)

> **Goal:** Enable Airtable-level sharing and access control for interfaces.

- [ ] Define `SharingConfigSchema` in `src/ui/sharing.zod.ts`
- [ ] Define `EmbedConfigSchema` for iframe embedding configuration
- [ ] Add `sharing` property to `InterfaceSchema` and `FormViewSchema` (public forms)
- [ ] Add per-interface role assignment (`assignedRoles`)
- [ ] Implement share link generation in runtime (service layer)
- [ ] Implement embed code generation with origin restrictions
- [ ] Add `previewAs` option for design-time user impersonation
- [ ] Security audit for shared/embedded interface access control
- [ ] Write permission and sharing tests

**Estimated effort:** 4–6 weeks

### 7.4 Phase D: Advanced Interface Features (v4.1 — Q2 2027)

> **Goal:** Polish and advanced capabilities matching or exceeding Airtable.

- [ ] Interface templates and duplication
- [ ] Interface versioning (draft → published → archived lifecycle)
- [ ] Multi-table dashboard pages (cross-object data binding)
- [ ] Real-time collaborative interface editing (multiple builders)
- [ ] Interface analytics (page views, element interactions, user engagement)
- [ ] Mobile-optimized interface rendering with responsive element layout
- [ ] A/B testing support for interface variants

**Estimated effort:** 8–12 weeks

---

## 8. Risk Analysis

| Risk | Impact | Probability | Mitigation |
|:---|:---:|:---:|:---|
| **Schema bloat** — Adding too many element types increases spec complexity | Medium | Medium | Use discriminated unions; keep element props minimal; provide sensible defaults |
| **Backward compatibility** — New `InterfaceSchema` may conflict with existing `AppSchema` | High | Low | `InterfaceSchema` is additive; `AppSchema` remains as the top-level navigation container; `InterfaceSchema` lives within or alongside `AppSchema` |
| **Security of shared interfaces** — Public share links expose data | High | Medium | Default to read-only; require explicit opt-in; enforce row-level security on shared views; origin restrictions for embeds |
| **Performance of multi-source pages** — Pages binding to multiple objects create N+1 query patterns | Medium | High | Implement query batching in runtime; add `limit` to `ElementDataSourceSchema`; use caching service |
| **Scope creep** — Attempting to replicate all Airtable features at once | High | Medium | Phased approach; prioritize schema definitions first (spec repo), defer runtime to service implementations |

---

## 9. Decision Log

| # | Decision | Rationale | Date |
|:---:|:---|:---|:---|
| 1 | Introduce `InterfaceSchema` as separate from `AppSchema` | `AppSchema` is the navigation container; `InterfaceSchema` is a shareable, role-specific surface. They serve different architectural purposes. An App can contain multiple Interfaces. | 2026-02-16 |
| 2 | Add elements as `PageComponentType` extensions, not a separate system | Reuses existing region → component model; avoids a parallel composition system; maintains consistency | 2026-02-16 |
| 3 | Phase sharing/embedding to v4.0 | Requires security infrastructure (RLS, share tokens, origin validation) that depends on service implementations in v3.x | 2026-02-16 |
| 4 | Keep `RecordReviewConfig` as part of `PageSchema` rather than a new view type | Record Review is a page layout pattern, not a data visualization (view). It combines record display with workflow actions. | 2026-02-16 |
| 5 | Support per-element `dataSource` instead of page-level-only binding | Critical for dashboards and overview pages that aggregate data from multiple objects | 2026-02-16 |
| 6 | Merge `InterfacePageSchema` into `PageSchema` | 7 of 9 properties were identical. Unified `PageTypeSchema` with 16 types (4 platform + 12 interface) eliminates duplication while preserving both use cases. `InterfaceSchema.pages` now references `PageSchema` directly. | 2026-02-16 |
| 7 | Extract shared `SortItemSchema` to `shared/enums.zod.ts` | Sort item pattern `{ field, order }` was defined inline in 4+ schemas (ElementDataSource, RecordReview, ListView, RecordRelatedList). Shared schema ensures consistency and reduces duplication. | 2026-02-16 |
| 8 | `InterfaceBrandingSchema` extends `AppBrandingSchema` | 2 of 3 fields (`primaryColor`, `logo`) were identical. Using `.extend()` adds only `coverImage`, avoiding property divergence. | 2026-02-16 |
| 9 | Keep `InterfaceSchema` and `AppSchema` separate — do NOT merge | **App** = navigation container (menu tree, routing, mobile nav). **Interface** = content surface (ordered pages, data binding, role-specific views). Merging would conflate navigation topology with page composition. An App can embed multiple Interfaces via `InterfaceNavItemSchema`. This mirrors Salesforce App/FlexiPage and Airtable Base/Interface separation. | 2026-02-16 |
| 10 | Add `InterfaceNavItemSchema` to bridge App↔Interface | `AppSchema.navigation` lacked a way to reference Interfaces. Added `type: 'interface'` nav item with `interfaceName` and optional `pageName` to enable App→Interface navigation without merging the schemas. | 2026-02-16 |
| 11 | Keep all 16 page types — no merge, disambiguate in docs | Reviewed overlapping pairs: `record` vs `record_detail` (component-based layout vs auto-generated field display), `home` vs `overview` (platform landing vs interface navigation hub), `app`/`utility`/`blank` (distinct layout contexts). Each serves a different use case at a different abstraction level. Added disambiguation comments to `PageTypeSchema`. | 2026-02-16 |
| 12 | App.interfaces[] drives sidebar as Interface→Pages two-level menu | App's `navigation` was a hand-written tree that conflicted with Interface's `pages[]`. New model: App declares `interfaces[]`, runtime renders Interface.label as collapsible group → Interface.pages[] as menu items. `navigation` retained for global utility entries only (Settings, Help). Eliminates dual-navigation confusion. Added `defaultInterface` to specify startup interface. Interface gets `icon` and `group` fields for sidebar rendering. | 2026-02-16 |

---

## 10. References

| Source | URL |
|:---|:---|
| Airtable Interface Designer Docs | https://support.airtable.com/docs/interface-layouts |
| Airtable Record Detail Layout | https://support.airtable.com/docs/airtable-interface-layout-record-detail |
| Airtable Dynamic Filtering | https://support.airtable.com/docs/dynamic-filtering-in-linked-record-fields |
| Airtable Legacy Interface Elements | https://support.airtable.com/docs/legacy-interface-designer-functionality |
| ObjectStack UI Protocol | `packages/spec/src/ui/` |
| ObjectStack Page Schema | `packages/spec/src/ui/page.zod.ts` |
| ObjectStack View Schema | `packages/spec/src/ui/view.zod.ts` |
| ObjectStack Dashboard Schema | `packages/spec/src/ui/dashboard.zod.ts` |
| ObjectStack App Schema | `packages/spec/src/ui/app.zod.ts` |
