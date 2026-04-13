# UI Design — Dashboard & Chart Reference

> Auto-derived from `packages/spec/src/ui/dashboard.zod.ts`, `chart.zod.ts`, and related schemas.
> This file is bundled with the skill for offline/external use.

## Chart Types

| Category | Types |
|:---------|:------|
| **Bar** | `bar`, `horizontal-bar`, `column`, `grouped-bar`, `stacked-bar` |
| **Line** | `line`, `area`, `stacked-area` |
| **Circular** | `pie`, `donut`, `funnel`, `pyramid`, `sunburst` |
| **Scatter** | `scatter`, `bubble` |
| **Hierarchical** | `treemap` |
| **Gauge** | `gauge`, `metric`, `kpi` |
| **Spatial** | `choropleth`, `heatmap` |
| **Comparison** | `radar`, `waterfall` |
| **Tabular** | `table`, `pivot` |

## Dashboard Widget Schema

| Property | Required | Description |
|:---------|:---------|:------------|
| `id` | ✅ | Unique widget ID (snake_case) |
| `title` | ✅ | Display title |
| `type` | ✅ | Widget type (see below) |
| `position` | ✅ | `{ x, y, w, h }` on the grid |
| `description` | — | Widget description |
| `dataQuery` | — | Data source query config |
| `visualization` | — | Chart/display config |
| `actions` | — | Interactive actions |

## Widget Types

| Type | Description |
|:-----|:------------|
| `chart` | Any chart visualization |
| `table` | Embedded data table |
| `metric` | Single KPI number |
| `custom` | Custom HTML/React component |

## Widget Color Variants

| Variant | Use Case |
|:--------|:---------|
| `default` | Neutral |
| `blue` | Information |
| `teal` | Secondary metric |
| `orange` | Attention |
| `purple` | Highlight |
| `success` | Positive/green |
| `warning` | Caution/yellow |
| `danger` | Alert/red |

## Widget Action Types

| Type | Description |
|:-----|:------------|
| `script` | Run JavaScript/TypeScript |
| `url` | Navigate to URL |
| `modal` | Open modal dialog |
| `flow` | Launch automation flow |
| `api` | Call API endpoint |

## Report Types

| Type | Description |
|:-----|:------------|
| `tabular` | Flat data table |
| `summary` | Grouped with subtotals |
| `matrix` | Cross-tab / pivot table |
| `chart` | Visual chart report |

## App Navigation Item Types (Discriminated Union)

| Type | Key Properties | Description |
|:-----|:---------------|:------------|
| `object` | `object` | Link to object list view |
| `dashboard` | `dashboard` | Link to dashboard |
| `page` | `page` | Link to custom page |
| `url` | `url` | External URL |
| `report` | `report` | Link to report |
| `action` | `action` | Trigger an action |

## I18n Label Schema

Labels support two formats:
- **Simple string:** `"My Label"` — single language
- **Localized object:** `{ en: "My Label", zh: "我的标签", ja: "マイラベル" }`

## Theme Properties

| Property | Description |
|:---------|:------------|
| `colors` | Primary, secondary, accent, background, text |
| `typography` | Font family, sizes, weights |
| `spacing` | Grid system, gaps, paddings |
| `borderRadius` | Corner rounding values |
| `darkMode` | Dark theme overrides |

## Responsive Breakpoints

| Breakpoint | Min Width | Description |
|:-----------|:----------|:------------|
| `sm` | 640px | Mobile landscape |
| `md` | 768px | Tablet |
| `lg` | 1024px | Desktop |
| `xl` | 1280px | Large desktop |
| `2xl` | 1536px | Extra large |
