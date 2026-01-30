# 🏭 AI Agent 实战教程：从零构建 ERP 系统
# Hands-on Tutorial: Building an ERP System from Scratch

> **学习目标 | Learning Objectives:**  
> 通过实际构建一个简单的 ERP 系统，掌握 ObjectStack 协议的完整开发流程。  
> Build a simple ERP system to master the complete ObjectStack development workflow.

---

## 📋 教程概览 | Tutorial Overview

**项目名称**: SimpleERP - 简单企业资源管理系统  
**核心功能**:
- 产品管理 (Product Management)
- 库存管理 (Inventory Management)
- 采购管理 (Purchase Management)
- 销售管理 (Sales Management)

**开发时间**: 约 2-3 小时  
**难度级别**: 初级到中级

---

## 🎯 第一阶段：项目初始化 (15 分钟)

### Step 1.1: 创建项目目录

```bash
# 在 spec 仓库的 examples 目录下创建项目
cd /path/to/spec/examples
mkdir simple-erp
cd simple-erp

# 创建目录结构
mkdir -p src/{objects,ui,workflows}
mkdir -p src/objects/{product,inventory,purchase,sales}
```

### Step 1.2: 初始化 package.json

```bash
# 创建 package.json
cat > package.json << 'EOF'
{
  "name": "@objectstack/example-simple-erp",
  "version": "1.0.0",
  "description": "Simple ERP system built with ObjectStack",
  "type": "module",
  "scripts": {
    "build": "tsc",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@objectstack/spec": "workspace:*"
  },
  "devDependencies": {
    "typescript": "^5.3.0"
  }
}
EOF

# 安装依赖
pnpm install
```

### Step 1.3: 配置 TypeScript

```bash
cat > tsconfig.json << 'EOF'
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*", "objectstack.config.ts"]
}
EOF
```

---

## 📦 第二阶段：核心数据模型 (45 分钟)

### Step 2.1: 创建 Product 对象 (产品)

```typescript
// File: src/objects/product/product.object.ts

import { defineObject } from '@objectstack/spec/data';
import type { ObjectDefinition } from '@objectstack/spec/data';

export const Product: ObjectDefinition = defineObject({
  name: 'product',
  label: 'Product',
  labelPlural: 'Products',
  description: 'Product catalog and specifications',
  
  fields: {
    // 基本信息
    sku: {
      type: 'text',
      label: 'SKU',
      description: 'Stock Keeping Unit',
      required: true,
      unique: true,
      maxLength: 50
    },
    
    productName: {
      type: 'text',
      label: 'Product Name',
      required: true,
      maxLength: 255
    },
    
    description: {
      type: 'textarea',
      label: 'Description',
      maxLength: 2000
    },
    
    // 分类
    category: {
      type: 'select',
      label: 'Category',
      options: [
        { value: 'raw_material', label: 'Raw Material', color: 'blue' },
        { value: 'finished_good', label: 'Finished Good', color: 'green' },
        { value: 'consumable', label: 'Consumable', color: 'gray' }
      ],
      required: true
    },
    
    // 定价
    unitPrice: {
      type: 'currency',
      label: 'Unit Price',
      required: true,
      min: 0,
      precision: 2
    },
    
    cost: {
      type: 'currency',
      label: 'Unit Cost',
      required: true,
      min: 0,
      precision: 2
    },
    
    // 库存单位
    unit: {
      type: 'select',
      label: 'Unit of Measure',
      options: [
        { value: 'piece', label: 'Piece' },
        { value: 'kg', label: 'Kilogram' },
        { value: 'liter', label: 'Liter' },
        { value: 'meter', label: 'Meter' }
      ],
      defaultValue: 'piece'
    },
    
    // 状态
    status: {
      type: 'select',
      label: 'Status',
      options: [
        { value: 'active', label: 'Active', color: 'green' },
        { value: 'discontinued', label: 'Discontinued', color: 'red' },
        { value: 'pending', label: 'Pending', color: 'yellow' }
      ],
      defaultValue: 'active'
    },
    
    // 计算字段：利润率
    profitMargin: {
      type: 'formula',
      label: 'Profit Margin %',
      returnType: 'percent',
      formula: '((unitPrice - cost) / unitPrice) * 100',
      precision: 2
    }
  },
  
  // 视图配置
  views: [
    {
      type: 'list',
      name: 'all_products',
      viewType: 'grid',
      label: 'All Products',
      columns: ['sku', 'productName', 'category', 'unitPrice', 'cost', 'profitMargin', 'status'],
      defaultSort: { field: 'productName', direction: 'asc' },
      filters: []
    },
    {
      type: 'list',
      name: 'active_products',
      viewType: 'grid',
      label: 'Active Products',
      columns: ['sku', 'productName', 'category', 'unitPrice', 'status'],
      filters: [
        { field: 'status', operator: 'equals', value: 'active' }
      ]
    },
    {
      type: 'form',
      name: 'product_form',
      layout: 'simple',
      sections: [
        {
          label: 'Basic Information',
          columns: 2,
          fields: ['sku', 'productName', 'category', 'unit']
        },
        {
          label: 'Description',
          columns: 1,
          fields: ['description']
        },
        {
          label: 'Pricing',
          columns: 2,
          fields: ['cost', 'unitPrice', 'profitMargin']
        },
        {
          label: 'Status',
          columns: 1,
          fields: ['status']
        }
      ]
    }
  ],
  
  // 验证规则
  validations: [
    {
      type: 'script',
      name: 'price_greater_than_cost',
      errorMessage: 'Unit price must be greater than cost',
      formula: 'unitPrice > cost'
    },
    {
      type: 'uniqueness',
      fields: ['sku'],
      errorMessage: 'SKU must be unique'
    }
  ],
  
  // 功能启用
  enable: {
    trackHistory: true,
    apiEnabled: true,
    searchEnabled: true
  }
});
```

### Step 2.2: 创建 Inventory 对象 (库存)

```typescript
// File: src/objects/inventory/inventory.object.ts

import { defineObject } from '@objectstack/spec/data';
import type { ObjectDefinition } from '@objectstack/spec/data';

export const Inventory: ObjectDefinition = defineObject({
  name: 'inventory',
  label: 'Inventory',
  labelPlural: 'Inventory',
  description: 'Product inventory tracking',
  
  fields: {
    // 关联产品
    product: {
      type: 'lookup',
      label: 'Product',
      reference: 'product',
      relationshipName: 'inventory_records',
      required: true
    },
    
    // 仓库位置
    warehouse: {
      type: 'select',
      label: 'Warehouse',
      options: [
        { value: 'main', label: 'Main Warehouse' },
        { value: 'secondary', label: 'Secondary Warehouse' },
        { value: 'retail', label: 'Retail Store' }
      ],
      required: true
    },
    
    // 库存数量
    quantityOnHand: {
      type: 'number',
      label: 'Quantity on Hand',
      required: true,
      defaultValue: 0,
      min: 0
    },
    
    quantityReserved: {
      type: 'number',
      label: 'Quantity Reserved',
      description: 'Reserved for orders',
      defaultValue: 0,
      min: 0
    },
    
    // 可用库存（计算字段）
    quantityAvailable: {
      type: 'formula',
      label: 'Available Quantity',
      returnType: 'number',
      formula: 'quantityOnHand - quantityReserved'
    },
    
    // 安全库存
    minimumStock: {
      type: 'number',
      label: 'Minimum Stock Level',
      description: 'Reorder point',
      defaultValue: 10,
      min: 0
    },
    
    maximumStock: {
      type: 'number',
      label: 'Maximum Stock Level',
      defaultValue: 1000,
      min: 0
    },
    
    // 库存状态
    stockStatus: {
      type: 'formula',
      label: 'Stock Status',
      returnType: 'text',
      formula: `
        quantityAvailable <= 0 ? 'Out of Stock' :
        quantityAvailable <= minimumStock ? 'Low Stock' :
        quantityAvailable >= maximumStock ? 'Overstock' :
        'In Stock'
      `
    },
    
    // 最后盘点
    lastCountDate: {
      type: 'date',
      label: 'Last Count Date'
    }
  },
  
  // 视图
  views: [
    {
      type: 'list',
      name: 'all_inventory',
      viewType: 'grid',
      label: 'All Inventory',
      columns: [
        'product',
        'warehouse',
        'quantityOnHand',
        'quantityReserved',
        'quantityAvailable',
        'stockStatus'
      ],
      defaultSort: { field: 'product', direction: 'asc' }
    },
    {
      type: 'list',
      name: 'low_stock',
      viewType: 'grid',
      label: 'Low Stock Items',
      columns: ['product', 'warehouse', 'quantityAvailable', 'minimumStock'],
      filters: [
        {
          type: 'script',
          formula: 'quantityAvailable <= minimumStock'
        }
      ]
    }
  ],
  
  // 验证规则
  validations: [
    {
      type: 'script',
      name: 'reserved_not_exceed_onhand',
      errorMessage: 'Reserved quantity cannot exceed on-hand quantity',
      formula: 'quantityReserved <= quantityOnHand'
    },
    {
      type: 'script',
      name: 'minimum_less_than_maximum',
      errorMessage: 'Minimum stock must be less than maximum stock',
      formula: 'minimumStock < maximumStock'
    },
    {
      type: 'uniqueness',
      fields: ['product', 'warehouse'],
      errorMessage: 'Product already exists in this warehouse'
    }
  ],
  
  // 工作流：低库存警报
  workflows: [
    {
      type: 'email_alert',
      name: 'low_stock_alert',
      trigger: {
        on: 'update',
        when: 'quantityAvailable <= minimumStock && PREV(quantityAvailable) > minimumStock'
      },
      actions: [
        {
          type: 'send_email',
          to: 'inventory@company.com',
          subject: 'Low Stock Alert: {product.productName}',
          body: `
            Product: {product.productName}
            Warehouse: {warehouse}
            Available: {quantityAvailable}
            Minimum: {minimumStock}
            
            Please reorder immediately.
          `
        }
      ]
    }
  ],
  
  enable: {
    trackHistory: true,
    apiEnabled: true,
    searchEnabled: true
  },
  
  // 索引优化
  indexes: [
    { fields: ['product', 'warehouse'], unique: true },
    { fields: ['warehouse'] }
  ]
});
```

### Step 2.3: 创建 PurchaseOrder 对象 (采购订单)

```typescript
// File: src/objects/purchase/purchase_order.object.ts

import { defineObject } from '@objectstack/spec/data';
import type { ObjectDefinition } from '@objectstack/spec/data';

export const PurchaseOrder: ObjectDefinition = defineObject({
  name: 'purchase_order',
  label: 'Purchase Order',
  labelPlural: 'Purchase Orders',
  description: 'Purchase orders from suppliers',
  
  fields: {
    // 订单编号
    orderNumber: {
      type: 'autonumber',
      label: 'PO Number',
      format: 'PO-{0000}',
      startingNumber: 1
    },
    
    // 供应商
    supplier: {
      type: 'text',
      label: 'Supplier Name',
      required: true,
      maxLength: 255
    },
    
    // 订单日期
    orderDate: {
      type: 'date',
      label: 'Order Date',
      required: true,
      defaultValue: '$Today'
    },
    
    expectedDeliveryDate: {
      type: 'date',
      label: 'Expected Delivery',
      required: true
    },
    
    // 状态
    status: {
      type: 'select',
      label: 'Status',
      options: [
        { value: 'draft', label: 'Draft', color: 'gray' },
        { value: 'submitted', label: 'Submitted', color: 'blue' },
        { value: 'approved', label: 'Approved', color: 'green' },
        { value: 'received', label: 'Received', color: 'green' },
        { value: 'cancelled', label: 'Cancelled', color: 'red' }
      ],
      defaultValue: 'draft'
    },
    
    // 总金额
    totalAmount: {
      type: 'currency',
      label: 'Total Amount',
      required: true,
      min: 0
    },
    
    // 备注
    notes: {
      type: 'textarea',
      label: 'Notes',
      maxLength: 1000
    },
    
    // 审批人
    approvedBy: {
      type: 'text',
      label: 'Approved By'
    },
    
    approvalDate: {
      type: 'date',
      label: 'Approval Date'
    }
  },
  
  views: [
    {
      type: 'list',
      name: 'all_purchase_orders',
      viewType: 'grid',
      label: 'All Purchase Orders',
      columns: [
        'orderNumber',
        'supplier',
        'orderDate',
        'expectedDeliveryDate',
        'totalAmount',
        'status'
      ],
      defaultSort: { field: 'orderDate', direction: 'desc' }
    },
    {
      type: 'list',
      name: 'pending_approval',
      viewType: 'kanban',
      label: 'Pending Approval',
      groupBy: 'status',
      cardFields: ['orderNumber', 'supplier', 'totalAmount', 'orderDate'],
      filters: [
        { field: 'status', operator: 'in', value: ['draft', 'submitted'] }
      ]
    }
  ],
  
  validations: [
    {
      type: 'script',
      name: 'delivery_after_order',
      errorMessage: 'Expected delivery must be after order date',
      formula: 'expectedDeliveryDate >= orderDate'
    },
    {
      type: 'state_machine',
      field: 'status',
      transitions: [
        { from: 'draft', to: ['submitted', 'cancelled'] },
        { from: 'submitted', to: ['approved', 'cancelled'] },
        { from: 'approved', to: ['received', 'cancelled'] },
        { from: 'received', to: [] },
        { from: 'cancelled', to: [] }
      ]
    }
  ],
  
  workflows: [
    {
      type: 'field_update',
      name: 'set_approval_info',
      trigger: {
        on: 'update',
        when: 'status == "approved" && PREV(status) != "approved"'
      },
      actions: [
        {
          type: 'update_field',
          field: 'approvedBy',
          value: '$CurrentUser'
        },
        {
          type: 'update_field',
          field: 'approvalDate',
          value: '$Today'
        }
      ]
    }
  ],
  
  enable: {
    trackHistory: true,
    apiEnabled: true,
    searchEnabled: true
  }
});
```

### Step 2.4: 创建 SalesOrder 对象 (销售订单)

```typescript
// File: src/objects/sales/sales_order.object.ts

import { defineObject } from '@objectstack/spec/data';
import type { ObjectDefinition } from '@objectstack/spec/data';

export const SalesOrder: ObjectDefinition = defineObject({
  name: 'sales_order',
  label: 'Sales Order',
  labelPlural: 'Sales Orders',
  description: 'Customer sales orders',
  
  fields: {
    orderNumber: {
      type: 'autonumber',
      label: 'Order Number',
      format: 'SO-{0000}',
      startingNumber: 1
    },
    
    customerName: {
      type: 'text',
      label: 'Customer Name',
      required: true,
      maxLength: 255
    },
    
    customerEmail: {
      type: 'email',
      label: 'Customer Email',
      required: true
    },
    
    orderDate: {
      type: 'date',
      label: 'Order Date',
      required: true,
      defaultValue: '$Today'
    },
    
    deliveryDate: {
      type: 'date',
      label: 'Requested Delivery Date'
    },
    
    status: {
      type: 'select',
      label: 'Status',
      options: [
        { value: 'pending', label: 'Pending', color: 'yellow' },
        { value: 'confirmed', label: 'Confirmed', color: 'blue' },
        { value: 'shipped', label: 'Shipped', color: 'purple' },
        { value: 'delivered', label: 'Delivered', color: 'green' },
        { value: 'cancelled', label: 'Cancelled', color: 'red' }
      ],
      defaultValue: 'pending'
    },
    
    totalAmount: {
      type: 'currency',
      label: 'Total Amount',
      required: true,
      min: 0
    },
    
    paymentStatus: {
      type: 'select',
      label: 'Payment Status',
      options: [
        { value: 'unpaid', label: 'Unpaid', color: 'red' },
        { value: 'partial', label: 'Partially Paid', color: 'yellow' },
        { value: 'paid', label: 'Paid', color: 'green' }
      ],
      defaultValue: 'unpaid'
    },
    
    shippingAddress: {
      type: 'textarea',
      label: 'Shipping Address',
      required: true,
      maxLength: 500
    },
    
    notes: {
      type: 'textarea',
      label: 'Notes',
      maxLength: 1000
    }
  },
  
  views: [
    {
      type: 'list',
      name: 'all_sales_orders',
      viewType: 'grid',
      label: 'All Orders',
      columns: [
        'orderNumber',
        'customerName',
        'orderDate',
        'totalAmount',
        'status',
        'paymentStatus'
      ],
      defaultSort: { field: 'orderDate', direction: 'desc' }
    },
    {
      type: 'list',
      name: 'orders_kanban',
      viewType: 'kanban',
      label: 'Order Pipeline',
      groupBy: 'status',
      cardFields: ['orderNumber', 'customerName', 'totalAmount', 'orderDate'],
      sumField: 'totalAmount'
    },
    {
      type: 'list',
      name: 'delivery_calendar',
      viewType: 'calendar',
      label: 'Delivery Calendar',
      dateField: 'deliveryDate',
      titleField: 'orderNumber',
      colorField: 'status'
    }
  ],
  
  validations: [
    {
      type: 'state_machine',
      field: 'status',
      transitions: [
        { from: 'pending', to: ['confirmed', 'cancelled'] },
        { from: 'confirmed', to: ['shipped', 'cancelled'] },
        { from: 'shipped', to: ['delivered'] },
        { from: 'delivered', to: [] },
        { from: 'cancelled', to: [] }
      ]
    }
  ],
  
  workflows: [
    {
      type: 'email_alert',
      name: 'notify_customer_confirmation',
      trigger: {
        on: 'update',
        when: 'status == "confirmed" && PREV(status) == "pending"'
      },
      actions: [
        {
          type: 'send_email',
          to: '{customerEmail}',
          subject: 'Order Confirmed: {orderNumber}',
          body: `
            Dear {customerName},
            
            Your order {orderNumber} has been confirmed.
            Order Date: {orderDate}
            Total Amount: {totalAmount}
            
            Thank you for your business!
          `
        }
      ]
    }
  ],
  
  enable: {
    trackHistory: true,
    apiEnabled: true,
    searchEnabled: true
  }
});
```

---

## 🎨 第三阶段：UI 配置 (30 分钟)

### Step 3.1: 创建仪表盘

```typescript
// File: src/ui/dashboards.ts

import { defineDashboard } from '@objectstack/spec/ui';

export const ERPOverviewDashboard = defineDashboard({
  name: 'erp_overview',
  label: 'ERP Overview',
  description: 'Key metrics and overview',
  
  layout: {
    type: 'grid',
    columns: 12,
    gap: 16
  },
  
  widgets: [
    // 产品总数
    {
      type: 'metric',
      title: 'Total Products',
      object: 'product',
      aggregation: 'count',
      filters: [
        { field: 'status', operator: 'equals', value: 'active' }
      ],
      size: { w: 3, h: 2 },
      position: { x: 0, y: 0 }
    },
    
    // 库存总值
    {
      type: 'metric',
      title: 'Total Inventory Value',
      description: 'Based on unit cost',
      object: 'inventory',
      aggregation: 'custom',
      formula: 'SUM(quantityOnHand * product.cost)',
      format: 'currency',
      size: { w: 3, h: 2 },
      position: { x: 3, y: 0 }
    },
    
    // 待处理采购订单
    {
      type: 'metric',
      title: 'Pending Purchase Orders',
      object: 'purchase_order',
      aggregation: 'count',
      filters: [
        { field: 'status', operator: 'in', value: ['draft', 'submitted'] }
      ],
      size: { w: 3, h: 2 },
      position: { x: 6, y: 0 }
    },
    
    // 本月销售额
    {
      type: 'metric',
      title: 'Sales This Month',
      object: 'sales_order',
      aggregation: 'sum',
      field: 'totalAmount',
      filters: [
        {
          field: 'orderDate',
          operator: 'this_month'
        },
        {
          field: 'status',
          operator: 'not_equals',
          value: 'cancelled'
        }
      ],
      size: { w: 3, h: 2 },
      position: { x: 9, y: 0 }
    },
    
    // 销售趋势图
    {
      type: 'chart',
      title: 'Sales Trend (Last 6 Months)',
      chartType: 'line',
      object: 'sales_order',
      groupBy: { field: 'orderDate', interval: 'month' },
      aggregations: [
        { field: 'totalAmount', function: 'sum', label: 'Revenue' },
        { field: 'id', function: 'count', label: 'Orders' }
      ],
      filters: [
        {
          field: 'orderDate',
          operator: 'last_n_months',
          value: 6
        }
      ],
      size: { w: 6, h: 4 },
      position: { x: 0, y: 2 }
    },
    
    // 低库存产品
    {
      type: 'table',
      title: 'Low Stock Items',
      object: 'inventory',
      columns: ['product.productName', 'warehouse', 'quantityAvailable', 'minimumStock'],
      filters: [
        {
          type: 'script',
          formula: 'quantityAvailable <= minimumStock'
        }
      ],
      sortBy: { field: 'quantityAvailable', direction: 'asc' },
      limit: 10,
      size: { w: 6, h: 4 },
      position: { x: 6, y: 2 }
    }
  ]
});

export const InventoryDashboard = defineDashboard({
  name: 'inventory_dashboard',
  label: 'Inventory Dashboard',
  description: 'Inventory analysis and metrics',
  
  layout: {
    type: 'grid',
    columns: 12,
    gap: 16
  },
  
  widgets: [
    {
      type: 'chart',
      title: 'Inventory by Warehouse',
      chartType: 'pie',
      object: 'inventory',
      groupBy: 'warehouse',
      aggregations: [
        { field: 'quantityOnHand', function: 'sum' }
      ],
      size: { w: 6, h: 4 },
      position: { x: 0, y: 0 }
    },
    {
      type: 'chart',
      title: 'Inventory by Category',
      chartType: 'bar',
      object: 'inventory',
      groupBy: 'product.category',
      aggregations: [
        { field: 'quantityOnHand', function: 'sum', label: 'Quantity' }
      ],
      size: { w: 6, h: 4 },
      position: { x: 6, y: 0 }
    }
  ]
});
```

### Step 3.2: 创建自定义操作

```typescript
// File: src/ui/actions.ts

import { defineAction } from '@objectstack/spec/ui';

// 批量更新产品价格
export const BulkUpdatePrice = defineAction({
  name: 'bulk_update_price',
  label: 'Bulk Update Prices',
  type: 'script',
  icon: 'dollar-sign',
  context: 'list',
  objectName: 'product',
  
  parameters: [
    {
      name: 'adjustmentType',
      label: 'Adjustment Type',
      type: 'select',
      options: [
        { value: 'percentage', label: 'Percentage' },
        { value: 'fixed', label: 'Fixed Amount' }
      ],
      required: true
    },
    {
      name: 'adjustmentValue',
      label: 'Adjustment Value',
      type: 'number',
      required: true
    }
  ],
  
  script: `
    const records = getSelectedRecords();
    const { adjustmentType, adjustmentValue } = parameters;
    
    for (const record of records) {
      let newPrice;
      if (adjustmentType === 'percentage') {
        newPrice = record.unitPrice * (1 + adjustmentValue / 100);
      } else {
        newPrice = record.unitPrice + adjustmentValue;
      }
      
      updateRecord('product', record.id, {
        unitPrice: newPrice
      });
    }
    
    return {
      success: true,
      message: \`Updated \${records.length} products\`
    };
  `
});

// 接收采购订单
export const ReceivePurchaseOrder = defineAction({
  name: 'receive_purchase_order',
  label: 'Receive Order',
  type: 'script',
  icon: 'package',
  context: 'record',
  objectName: 'purchase_order',
  showWhen: 'status == "approved"',
  
  script: `
    // 更新采购订单状态
    updateRecord('purchase_order', currentRecord.id, {
      status: 'received'
    });
    
    // TODO: 更新库存数量（需要订单明细）
    
    return {
      success: true,
      message: 'Purchase order received successfully'
    };
  `
});
```

---

## 🔧 第四阶段：应用配置 (15 分钟)

### Step 4.1: 创建主配置文件

```typescript
// File: objectstack.config.ts

import { defineStack } from '@objectstack/spec';
import { App } from '@objectstack/spec/ui';

// Import objects
import { Product } from './src/objects/product/product.object';
import { Inventory } from './src/objects/inventory/inventory.object';
import { PurchaseOrder } from './src/objects/purchase/purchase_order.object';
import { SalesOrder } from './src/objects/sales/sales_order.object';

// Import UI
import { ERPOverviewDashboard, InventoryDashboard } from './src/ui/dashboards';
import { BulkUpdatePrice, ReceivePurchaseOrder } from './src/ui/actions';

export default defineStack({
  manifest: {
    id: 'com.example.simple-erp',
    version: '1.0.0',
    type: 'app',
    name: 'SimpleERP',
    description: 'Simple Enterprise Resource Planning system',
    author: 'Your Company',
    license: 'MIT'
  },
  
  // 注册所有对象
  objects: [
    Product,
    Inventory,
    PurchaseOrder,
    SalesOrder
  ],
  
  // 注册自定义操作
  actions: [
    BulkUpdatePrice,
    ReceivePurchaseOrder
  ],
  
  // 注册仪表盘
  dashboards: [
    ERPOverviewDashboard,
    InventoryDashboard
  ],
  
  // 应用配置
  apps: [
    App.create({
      name: 'simple_erp',
      label: 'SimpleERP',
      description: 'Enterprise Resource Planning',
      icon: 'factory',
      
      branding: {
        primaryColor: '#2563EB',
        logo: '/assets/logo.png'
      },
      
      navigation: [
        {
          id: 'home',
          type: 'dashboard',
          dashboardName: 'erp_overview',
          label: 'Dashboard',
          icon: 'layout-dashboard'
        },
        {
          id: 'product_management',
          type: 'group',
          label: 'Product Management',
          icon: 'package',
          children: [
            {
              id: 'products',
              type: 'object',
              objectName: 'product',
              label: 'Products'
            },
            {
              id: 'inventory',
              type: 'object',
              objectName: 'inventory',
              label: 'Inventory'
            },
            {
              id: 'inventory_dashboard',
              type: 'dashboard',
              dashboardName: 'inventory_dashboard',
              label: 'Inventory Dashboard'
            }
          ]
        },
        {
          id: 'procurement',
          type: 'group',
          label: 'Procurement',
          icon: 'shopping-cart',
          children: [
            {
              id: 'purchase_orders',
              type: 'object',
              objectName: 'purchase_order',
              label: 'Purchase Orders'
            }
          ]
        },
        {
          id: 'sales',
          type: 'group',
          label: 'Sales',
          icon: 'trending-up',
          children: [
            {
              id: 'sales_orders',
              type: 'object',
              objectName: 'sales_order',
              label: 'Sales Orders'
            }
          ]
        }
      ]
    })
  ]
});
```

---

## ✅ 第五阶段：构建与测试 (15 分钟)

### Step 5.1: 构建项目

```bash
# 从项目根目录
cd /path/to/spec

# 先构建 spec 包
pnpm --filter @objectstack/spec build

# 构建 ERP 项目
pnpm --filter @objectstack/example-simple-erp build
```

### Step 5.2: 类型检查

```bash
# 运行类型检查
pnpm --filter @objectstack/example-simple-erp typecheck

# 应该输出：没有错误
```

### Step 5.3: 验证配置

创建验证脚本：

```typescript
// File: scripts/validate.ts

import config from '../objectstack.config';

console.log('✅ Configuration loaded successfully!');
console.log(`📦 App: ${config.manifest.name} v${config.manifest.version}`);
console.log(`📊 Objects: ${config.objects?.length || 0}`);
console.log(`🎨 Dashboards: ${config.dashboards?.length || 0}`);
console.log(`⚡ Actions: ${config.actions?.length || 0}`);

// 验证每个对象
config.objects?.forEach(obj => {
  console.log(`\n🔹 Object: ${obj.name}`);
  console.log(`   Fields: ${Object.keys(obj.fields).length}`);
  console.log(`   Views: ${obj.views?.length || 0}`);
  console.log(`   Validations: ${obj.validations?.length || 0}`);
  console.log(`   Workflows: ${obj.workflows?.length || 0}`);
});
```

运行验证：

```bash
pnpm tsx scripts/validate.ts
```

---

## 📝 第六阶段：文档与部署 (15 分钟)

### Step 6.1: 创建 README

```markdown
# SimpleERP - 简单企业资源管理系统

基于 ObjectStack 协议构建的轻量级 ERP 系统。

## 功能模块

### 产品管理
- 产品目录维护
- 多分类管理
- 成本与价格管理
- 利润率自动计算

### 库存管理
- 多仓库库存跟踪
- 安全库存预警
- 可用库存自动计算
- 低库存自动通知

### 采购管理
- 采购订单创建
- 审批流程
- 状态跟踪

### 销售管理
- 销售订单处理
- 订单状态跟踪
- 客户邮件通知
- 交付日历视图

## 快速开始

\`\`\`bash
# 安装依赖
pnpm install

# 构建
pnpm build

# 类型检查
pnpm typecheck
\`\`\`

## 数据模型

### Product (产品)
- SKU（唯一）
- 产品名称
- 分类
- 单价、成本
- 利润率（自动计算）

### Inventory (库存)
- 产品关联
- 仓库
- 在手数量、预留数量
- 可用数量（自动计算）
- 库存状态（自动计算）

### PurchaseOrder (采购订单)
- 订单编号（自动生成）
- 供应商
- 订单日期、预期交付日期
- 状态流转（草稿→提交→批准→收货）

### SalesOrder (销售订单)
- 订单编号（自动生成）
- 客户信息
- 订单日期、交付日期
- 状态流转（待处理→确认→发货→交付）
- 自动邮件通知

## 视图类型

- **Grid**: 表格列表
- **Kanban**: 看板视图（采购/销售状态）
- **Calendar**: 日历视图（销售交付）

## 下一步扩展

1. 添加订单明细（OrderItem）对象
2. 实现库存自动更新逻辑
3. 添加财务报表
4. 集成支付功能
5. 添加更多自动化工作流

## 许可证

MIT
```

### Step 6.2: 创建 CHANGELOG

```markdown
# Changelog

## [1.0.0] - 2024-01-30

### Added
- 产品管理模块（Product）
- 库存管理模块（Inventory）
- 采购管理模块（PurchaseOrder）
- 销售管理模块（SalesOrder）
- ERP 总览仪表盘
- 库存仪表盘
- 批量更新价格操作
- 接收采购订单操作

### Features
- 自动计算利润率
- 自动计算可用库存
- 低库存邮件警报
- 订单确认邮件通知
- 状态机验证（防止非法状态转换）
- 多种视图类型（Grid, Kanban, Calendar）
```

---

## 🎉 总结与下一步

### 你已经完成了什么？

✅ 创建了完整的 ERP 系统基础架构  
✅ 定义了 4 个核心业务对象  
✅ 配置了 10+ 个视图  
✅ 实现了数据验证规则  
✅ 添加了自动化工作流  
✅ 创建了 2 个仪表盘  
✅ 实现了自定义操作  

### 学到的核心概念

1. **对象定义**: 如何使用 `defineObject` 创建业务对象
2. **字段类型**: 文本、数字、货币、日期、公式等
3. **关系管理**: Lookup 关系建立对象关联
4. **数据验证**: Script、Uniqueness、State Machine 验证
5. **工作流**: Field Update、Email Alert 自动化
6. **视图配置**: Grid、Kanban、Calendar 多种视图
7. **仪表盘**: Metric、Chart、Table 组件
8. **应用配置**: Navigation、Branding 配置

### 扩展建议

#### 立即可以做的：

1. **添加订单明细对象**
```typescript
// OrderItem 关联 Product 和 Order
export const PurchaseOrderItem = defineObject({
  name: 'purchase_order_item',
  fields: {
    purchaseOrder: { type: 'master_detail', reference: 'purchase_order' },
    product: { type: 'lookup', reference: 'product' },
    quantity: { type: 'number' },
    unitPrice: { type: 'currency' },
    lineTotal: { 
      type: 'formula',
      formula: 'quantity * unitPrice'
    }
  }
});
```

2. **实现库存自动更新**
```typescript
// 在 PurchaseOrder 的 workflow 中
workflows: [{
  type: 'record_update',
  trigger: { when: 'status == "received"' },
  actions: [{
    type: 'update_related',
    relatedObject: 'inventory',
    updateField: 'quantityOnHand',
    increment: true
  }]
}]
```

3. **添加更多报表**
```typescript
// 销售分析报表、库存周转报表等
```

#### 长期规划：

1. **多公司支持**: 添加 Company 对象
2. **用户权限**: 细化角色权限（采购员、销售员、仓管员）
3. **财务模块**: 应收账款、应付账款
4. **生产模块**: BOM（物料清单）、工单
5. **AI 集成**: 智能补货建议、需求预测

### 资源链接

- [完整开发指南](../AI_DEVELOPMENT_GUIDE.md)
- [快速参考](../content/docs/ai-agent-quick-reference.md)
- [CRM 完整示例](../examples/crm/)
- [协议文档](../packages/spec/README.md)

---

**恭喜！🎊**  
你已经成功使用 ObjectStack 协议从零构建了一个功能完整的 ERP 系统！

**下一步**: 尝试根据自己的业务需求定制和扩展这个系统。
