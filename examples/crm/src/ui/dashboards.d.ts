import type { Dashboard } from '@objectstack/spec';
export declare const SalesDashboard: Dashboard;
export declare const ServiceDashboard: Dashboard;
export declare const ExecutiveDashboard: Dashboard;
export declare const CrmDashboards: {
    SalesDashboard: {
        label: string;
        name: string;
        widgets: {
            type: "text" | "metric" | "bar" | "line" | "pie" | "donut" | "funnel" | "table";
            aggregate: "min" | "max" | "count" | "sum" | "avg";
            layout: {
                x: number;
                y: number;
                w: number;
                h: number;
            };
            object?: string | undefined;
            filter?: import("@objectstack/spec").FilterCondition | undefined;
            options?: any;
            title?: string | undefined;
            categoryField?: string | undefined;
            valueField?: string | undefined;
        }[];
        description?: string | undefined;
    };
    ServiceDashboard: {
        label: string;
        name: string;
        widgets: {
            type: "text" | "metric" | "bar" | "line" | "pie" | "donut" | "funnel" | "table";
            aggregate: "min" | "max" | "count" | "sum" | "avg";
            layout: {
                x: number;
                y: number;
                w: number;
                h: number;
            };
            object?: string | undefined;
            filter?: import("@objectstack/spec").FilterCondition | undefined;
            options?: any;
            title?: string | undefined;
            categoryField?: string | undefined;
            valueField?: string | undefined;
        }[];
        description?: string | undefined;
    };
    ExecutiveDashboard: {
        label: string;
        name: string;
        widgets: {
            type: "text" | "metric" | "bar" | "line" | "pie" | "donut" | "funnel" | "table";
            aggregate: "min" | "max" | "count" | "sum" | "avg";
            layout: {
                x: number;
                y: number;
                w: number;
                h: number;
            };
            object?: string | undefined;
            filter?: import("@objectstack/spec").FilterCondition | undefined;
            options?: any;
            title?: string | undefined;
            categoryField?: string | undefined;
            valueField?: string | undefined;
        }[];
        description?: string | undefined;
    };
};
//# sourceMappingURL=dashboards.d.ts.map