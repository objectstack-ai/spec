# ObjectStack CRM Example

这是一个全面的 CRM (客户关系管理) 示例，展示了 ObjectStack 协议的所有核心功能。
This is a comprehensive CRM (Customer Relationship Management) example that demonstrates all core features of the ObjectStack Protocol.

## 🎯 Features Demonstrated

### Data Protocol (数据协议)

#### Objects (对象)
- **Account** - 客户账户 (Companies and organizations)
- **Contact** - 联系人 (People associated with accounts)
- **Opportunity** - 销售机会 (Sales opportunities and deals)
- **Lead** - 潜在客户 (Potential customers)
- **Case** - 客户支持案例 (Customer support cases)
- **Task** - 任务活动 (Activities and to-do items)

#### Field Types (字段类型)
- ✅ **Text/String**: text, textarea, email, url, phone, password
- ✅ **Rich Content**: markdown, html
- ✅ **Numbers**: number, currency, percent
- ✅ **Date/Time**: date, datetime, time
- ✅ **Logic**: boolean
- ✅ **Selection**: select, multiselect
- ✅ **Relational**: lookup, master_detail
- ✅ **Media**: avatar, image, file
- ✅ **Calculated**: formula, summary, autonumber

#### Advanced Features (高级功能)
- ✅ **Validation Rules** - Script, uniqueness, state machine, format validation
- ✅ **Workflow Rules** - Field updates, email alerts, automated actions
- ✅ **Permissions** - Object-level and field-level security
- ✅ **History Tracking** - Audit trail for field changes
- ✅ **Relationships** - Lookup and master-detail relationships
- ✅ **Indexes** - Database performance optimization

### UI Protocol (用户界面协议)

#### List Views (列表视图)
- ✅ **Grid View** - Traditional table view
- ✅ **Kanban View** - Card-based workflow view
- ✅ **Calendar View** - Date-based visualization
- ✅ **Gantt View** - Timeline/project view

#### Form Views (表单视图)
- ✅ **Simple Forms** - Single page layout
- ✅ **Tabbed Forms** - Multi-section layout
- ✅ **Dynamic Sections** - Collapsible sections

#### Actions (操作)
- ✅ **Script Actions** - JavaScript execution
- ✅ **URL Actions** - Navigation
- ✅ **Modal Actions** - Popup forms
- ✅ **Flow Actions** - Visual process automation

#### Dashboards (仪表盘)
- ✅ **Sales Dashboard** - Pipeline and revenue metrics
- ✅ **Service Dashboard** - Support case analytics
- ✅ **Executive Dashboard** - High-level overview

#### Reports (报表)
- ✅ **Tabular Reports** - Simple lists
- ✅ **Summary Reports** - Grouped data
- ✅ **Matrix Reports** - Cross-tabulation
- ✅ **Charts** - Bar, line, pie, donut, funnel

## 📂 Structure

```
examples/crm/
├── src/
│   ├── domains/
│   │   └── crm/
│   │       ├── account.object.ts      # Account object with all field types
│   │       ├── contact.object.ts      # Contact with master-detail
│   │       ├── opportunity.object.ts  # Opportunity with workflow
│   │       ├── lead.object.ts         # Lead with conversion logic
│   │       ├── case.object.ts         # Case with SLA tracking
│   │       └── task.object.ts         # Task with polymorphic relations
│   └── ui/
│       ├── actions.ts                 # Custom actions
│       ├── dashboards.ts              # Dashboard definitions
│       └── reports.ts                 # Report definitions
├── objectstack.config.ts              # App configuration
└── README.md                          # This file
```

## 🚀 Key Highlights

### 1. Account Object
Demonstrates:
- Autonumber fields (`account_number`)
- Formula fields (`full_address`)
- Select with custom colors
- Kanban view by type
- Validation rules (positive revenue, unique name)
- Workflow automation (update last activity)

### 2. Contact Object
Demonstrates:
- Master-detail relationship to Account
- Formula field (`full_name`)
- Email and phone field formats
- Avatar field
- Multiple list views (grid, kanban, calendar)
- Tabbed form layout

### 3. Opportunity Object
Demonstrates:
- Complex workflow with stage-based automation
- State machine validation for stage progression
- Multiple visualizations (grid, kanban, gantt)
- Probability and forecast calculations
- History tracking for audit trail
- Reference filters (contact filtered by account)

### 4. Lead Object
Demonstrates:
- Lead conversion process
- Boolean flags (is_converted)
- Readonly fields for conversion tracking
- Kanban view by status
- Lead source tracking

### 5. Case Object
Demonstrates:
- SLA tracking and violations
- Customer satisfaction ratings
- Escalation workflow
- Priority-based automation
- Resolution time calculation
- Multiple status transitions

### 6. Task Object
Demonstrates:
- Polymorphic relationships (related_to multiple objects)
- Recurring task support
- Time tracking (estimated vs actual)
- Progress percentage
- Calendar visualization
- Overdue detection

### 7. UI Components

**Actions:**
- Convert Lead (Flow action)
- Clone Opportunity (Script action)
- Send Email (Modal action)
- Mass Update (Bulk action with parameters)

**Dashboards:**
- Metric widgets (KPIs)
- Chart widgets (bar, line, pie, funnel)
- Table widgets (top lists)
- Grid layout system

**Reports:**
- Summary reports with grouping
- Matrix reports (2D grouping)
- Embedded charts
- Filter criteria
- Aggregations (sum, avg, count)

## 💡 Usage

This package is part of the `examples` workspace. To build it and verify types:

```bash
# Build the example
pnpm build

# Run type checking
pnpm typecheck
```

## 📖 Learning Resources

Each object file contains detailed comments explaining:
- Field configuration options
- View setup patterns
- Validation rule syntax
- Workflow automation examples

Study the code to understand:
1. How to define object schemas with Zod
2. How to create relationships between objects
3. How to set up validation and workflow rules
4. How to configure different view types
5. How to create actions, dashboards, and reports

## 🎓 Protocol Coverage

This example demonstrates:

| Protocol Area | Coverage | Examples |
|--------------|----------|----------|
| **Data Protocol** | 100% | All field types, validations, workflows |
| **UI Protocol** | 100% | All view types, actions, dashboards, reports |
| **System Protocol** | 80% | App manifest, menus, settings |

## 🔗 References

- [ObjectStack Documentation](https://objectstack.dev)
- [Protocol Specification](../../packages/spec/README.md)
- [Field Types Reference](../../packages/spec/src/data/field.zod.ts)
- [Object Schema Reference](../../packages/spec/src/data/object.zod.ts)

## 📝 License

MIT
