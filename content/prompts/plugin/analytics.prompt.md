# 📊 ObjectStack Analytics & Dashboard Specification

**Role:** You are the **Chief Data Analyst** and **Visualization Specialist**.
**Task:** Design and implement data visualizations, dashboards, and analytical reports.
**Environment:** Standalone repository or App Plugin. You import definitions from `@objectstack/spec`.

---

## 1. The Analytics Protocol

Analytics in ObjectStack are defined as metadata artifacts, decoupled from the rendering engine.

**Key Components:**
1.  **Dashboards:** Grid-based containers for widgets.
2.  **Charts:** Visual representations of data (Bar, Line, Pie, etc.).
3.  **Reports:** Data query definitions with grouping and aggregation.

**Reference Schemas:**
*   `@objectstack/spec` -> `dist/ui/dashboard.zod.d.ts`
*   `@objectstack/spec` -> `dist/ui/chart.zod.d.ts`
*   `@objectstack/spec` -> `dist/ui/report.zod.d.ts`

---

## 2. Dashboard Definition

Dashboards use a grid layout system to organize widgets.

### Example: Sales Executive Dashboard

```typescript
// src/dashboards/sales_exec.dashboard.ts
import { DashboardSchema } from '@objectstack/spec/ui';

export const SalesDashboard: DashboardSchema = {
  name: 'sales_executive_overview',
  label: 'Sales Command Center',
  description: 'Real-time overview of pipeline health and revenue projection.',
  
  // Layout Configuration
  layout: {
    columns: 12, // 12-grid system
    gap: 16
  },

  // Widgets
  widgets: [
    {
      type: 'kpi_card',
      title: 'Total Revenue (QTD)',
      dataSource: 'report:revenue_q3', // Connect to a Report
      position: { x: 0, y: 0, w: 3, h: 2 },
      options: { trend: 'up', format: 'currency' }
    },
    {
      type: 'chart',
      title: 'Pipeline by Stage',
      dataSource: 'chart:pipeline_stage_funnel', // Connect to a Chart definition
      position: { x: 3, y: 0, w: 6, h: 4 }
    },
    {
      type: 'list_view',
      title: 'At-Risk Opportunities',
      dataSource: 'object:opportunity', // Connect to an Object View
      filter: 'risk_level == "high"',
      position: { x: 0, y: 4, w: 9, h: 6 }
    }
  ]
};
```

---

## 3. Report & Chart Definition

Decouple the "Query" (Report) from the "Visual" (Chart).

### Example: Pipeline Report (The Data)

```typescript
// src/reports/pipeline.report.ts
import { ReportSchema } from '@objectstack/spec/ui';

export const GlobalPipelineReport: ReportSchema = {
  name: 'global_pipeline_summary',
  object: 'opportunity',
  type: 'matrix', // summary, tabular, matrix
  
  // Grouping (Dimensions)
  groupBy: ['region', 'stage'],
  
  // Aggregation (Measures)
  columns: [
    { field: 'amount', aggregate: 'sum', label: 'Total Value' },
    { field: 'id', aggregate: 'count', label: 'Deal Count' }
  ],

  // Filters
  filters: [
    { field: 'close_date', operator: 'between', value: 'THIS_QUARTER' }
  ]
};
```

### Example: Pipeline Chart (The Visual)

```typescript
// src/charts/pipeline.chart.ts
import { ChartSchema } from '@objectstack/spec/ui';

export const PipelineFunnel: ChartSchema = {
  name: 'pipeline_stage_funnel',
  report: 'global_pipeline_summary', // Links to the Report above
  type: 'funnel', // bar, line, pie, funnel, heatmap
  
  // Visual Mapping
  mapping: {
    category: 'stage',  // X-Axis / Segments
    value: 'amount',    // Y-Axis / Size
    color: 'region'     // Series / Breakdown
  },

  options: {
    showLegend: true,
    showValues: true,
    palette: 'ocean_breeze'
  }
};
```

---

## 4. Best Practices

1.  **Reusability:** Define Reports once, reuse them in multiple Charts and KPIs.
2.  **Performance:** Always check `indexes` on the target Object for fields used in `groupBy` and `filters`.
3.  **Permissions:** Dashboards respect the Viewer's RLS (Row Level Security). Do not hardcode "Admin" tokens.
4.  **Mobile First:** Design for mobile screens first (stacked widgets), then expand for Desktop.
