import type { Report } from '@objectstack/spec';
export declare const OpportunitiesByStageReport: Report;
export declare const WonOpportunitiesByOwnerReport: Report;
export declare const AccountsByIndustryTypeReport: Report;
export declare const CasesByStatusPriorityReport: Report;
export declare const SlaPerformanceReport: Report;
export declare const LeadsBySourceReport: Report;
export declare const ContactsByAccountReport: Report;
export declare const TasksByOwnerReport: Report;
export declare const CrmReports: {
    OpportunitiesByStageReport: {
        type: "summary" | "tabular" | "matrix" | "joined";
        label: string;
        name: string;
        objectName: string;
        columns: {
            field: string;
            label?: string | undefined;
            aggregate?: "unique" | "min" | "max" | "count" | "sum" | "avg" | undefined;
        }[];
        filter?: import("@objectstack/spec").FilterCondition | undefined;
        description?: string | undefined;
        groupingsDown?: {
            field: string;
            sortOrder: "asc" | "desc";
            dateGranularity?: "day" | "week" | "month" | "quarter" | "year" | undefined;
        }[] | undefined;
        groupingsAcross?: {
            field: string;
            sortOrder: "asc" | "desc";
            dateGranularity?: "day" | "week" | "month" | "quarter" | "year" | undefined;
        }[] | undefined;
        chart?: {
            type: "bar" | "line" | "pie" | "donut" | "funnel" | "column" | "scatter";
            showLegend: boolean;
            xAxis: string;
            yAxis: string;
            title?: string | undefined;
        } | undefined;
    };
    WonOpportunitiesByOwnerReport: {
        type: "summary" | "tabular" | "matrix" | "joined";
        label: string;
        name: string;
        objectName: string;
        columns: {
            field: string;
            label?: string | undefined;
            aggregate?: "unique" | "min" | "max" | "count" | "sum" | "avg" | undefined;
        }[];
        filter?: import("@objectstack/spec").FilterCondition | undefined;
        description?: string | undefined;
        groupingsDown?: {
            field: string;
            sortOrder: "asc" | "desc";
            dateGranularity?: "day" | "week" | "month" | "quarter" | "year" | undefined;
        }[] | undefined;
        groupingsAcross?: {
            field: string;
            sortOrder: "asc" | "desc";
            dateGranularity?: "day" | "week" | "month" | "quarter" | "year" | undefined;
        }[] | undefined;
        chart?: {
            type: "bar" | "line" | "pie" | "donut" | "funnel" | "column" | "scatter";
            showLegend: boolean;
            xAxis: string;
            yAxis: string;
            title?: string | undefined;
        } | undefined;
    };
    AccountsByIndustryTypeReport: {
        type: "summary" | "tabular" | "matrix" | "joined";
        label: string;
        name: string;
        objectName: string;
        columns: {
            field: string;
            label?: string | undefined;
            aggregate?: "unique" | "min" | "max" | "count" | "sum" | "avg" | undefined;
        }[];
        filter?: import("@objectstack/spec").FilterCondition | undefined;
        description?: string | undefined;
        groupingsDown?: {
            field: string;
            sortOrder: "asc" | "desc";
            dateGranularity?: "day" | "week" | "month" | "quarter" | "year" | undefined;
        }[] | undefined;
        groupingsAcross?: {
            field: string;
            sortOrder: "asc" | "desc";
            dateGranularity?: "day" | "week" | "month" | "quarter" | "year" | undefined;
        }[] | undefined;
        chart?: {
            type: "bar" | "line" | "pie" | "donut" | "funnel" | "column" | "scatter";
            showLegend: boolean;
            xAxis: string;
            yAxis: string;
            title?: string | undefined;
        } | undefined;
    };
    CasesByStatusPriorityReport: {
        type: "summary" | "tabular" | "matrix" | "joined";
        label: string;
        name: string;
        objectName: string;
        columns: {
            field: string;
            label?: string | undefined;
            aggregate?: "unique" | "min" | "max" | "count" | "sum" | "avg" | undefined;
        }[];
        filter?: import("@objectstack/spec").FilterCondition | undefined;
        description?: string | undefined;
        groupingsDown?: {
            field: string;
            sortOrder: "asc" | "desc";
            dateGranularity?: "day" | "week" | "month" | "quarter" | "year" | undefined;
        }[] | undefined;
        groupingsAcross?: {
            field: string;
            sortOrder: "asc" | "desc";
            dateGranularity?: "day" | "week" | "month" | "quarter" | "year" | undefined;
        }[] | undefined;
        chart?: {
            type: "bar" | "line" | "pie" | "donut" | "funnel" | "column" | "scatter";
            showLegend: boolean;
            xAxis: string;
            yAxis: string;
            title?: string | undefined;
        } | undefined;
    };
    SlaPerformanceReport: {
        type: "summary" | "tabular" | "matrix" | "joined";
        label: string;
        name: string;
        objectName: string;
        columns: {
            field: string;
            label?: string | undefined;
            aggregate?: "unique" | "min" | "max" | "count" | "sum" | "avg" | undefined;
        }[];
        filter?: import("@objectstack/spec").FilterCondition | undefined;
        description?: string | undefined;
        groupingsDown?: {
            field: string;
            sortOrder: "asc" | "desc";
            dateGranularity?: "day" | "week" | "month" | "quarter" | "year" | undefined;
        }[] | undefined;
        groupingsAcross?: {
            field: string;
            sortOrder: "asc" | "desc";
            dateGranularity?: "day" | "week" | "month" | "quarter" | "year" | undefined;
        }[] | undefined;
        chart?: {
            type: "bar" | "line" | "pie" | "donut" | "funnel" | "column" | "scatter";
            showLegend: boolean;
            xAxis: string;
            yAxis: string;
            title?: string | undefined;
        } | undefined;
    };
    LeadsBySourceReport: {
        type: "summary" | "tabular" | "matrix" | "joined";
        label: string;
        name: string;
        objectName: string;
        columns: {
            field: string;
            label?: string | undefined;
            aggregate?: "unique" | "min" | "max" | "count" | "sum" | "avg" | undefined;
        }[];
        filter?: import("@objectstack/spec").FilterCondition | undefined;
        description?: string | undefined;
        groupingsDown?: {
            field: string;
            sortOrder: "asc" | "desc";
            dateGranularity?: "day" | "week" | "month" | "quarter" | "year" | undefined;
        }[] | undefined;
        groupingsAcross?: {
            field: string;
            sortOrder: "asc" | "desc";
            dateGranularity?: "day" | "week" | "month" | "quarter" | "year" | undefined;
        }[] | undefined;
        chart?: {
            type: "bar" | "line" | "pie" | "donut" | "funnel" | "column" | "scatter";
            showLegend: boolean;
            xAxis: string;
            yAxis: string;
            title?: string | undefined;
        } | undefined;
    };
    ContactsByAccountReport: {
        type: "summary" | "tabular" | "matrix" | "joined";
        label: string;
        name: string;
        objectName: string;
        columns: {
            field: string;
            label?: string | undefined;
            aggregate?: "unique" | "min" | "max" | "count" | "sum" | "avg" | undefined;
        }[];
        filter?: import("@objectstack/spec").FilterCondition | undefined;
        description?: string | undefined;
        groupingsDown?: {
            field: string;
            sortOrder: "asc" | "desc";
            dateGranularity?: "day" | "week" | "month" | "quarter" | "year" | undefined;
        }[] | undefined;
        groupingsAcross?: {
            field: string;
            sortOrder: "asc" | "desc";
            dateGranularity?: "day" | "week" | "month" | "quarter" | "year" | undefined;
        }[] | undefined;
        chart?: {
            type: "bar" | "line" | "pie" | "donut" | "funnel" | "column" | "scatter";
            showLegend: boolean;
            xAxis: string;
            yAxis: string;
            title?: string | undefined;
        } | undefined;
    };
    TasksByOwnerReport: {
        type: "summary" | "tabular" | "matrix" | "joined";
        label: string;
        name: string;
        objectName: string;
        columns: {
            field: string;
            label?: string | undefined;
            aggregate?: "unique" | "min" | "max" | "count" | "sum" | "avg" | undefined;
        }[];
        filter?: import("@objectstack/spec").FilterCondition | undefined;
        description?: string | undefined;
        groupingsDown?: {
            field: string;
            sortOrder: "asc" | "desc";
            dateGranularity?: "day" | "week" | "month" | "quarter" | "year" | undefined;
        }[] | undefined;
        groupingsAcross?: {
            field: string;
            sortOrder: "asc" | "desc";
            dateGranularity?: "day" | "week" | "month" | "quarter" | "year" | undefined;
        }[] | undefined;
        chart?: {
            type: "bar" | "line" | "pie" | "donut" | "funnel" | "column" | "scatter";
            showLegend: boolean;
            xAxis: string;
            yAxis: string;
            title?: string | undefined;
        } | undefined;
    };
};
//# sourceMappingURL=reports.d.ts.map