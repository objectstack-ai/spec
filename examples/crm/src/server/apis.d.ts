/**
 * Custom API: Close Won Opportunities
 * A business-specific endpoint that encapsulates complex logic.
 * Path: GET /api/v1/crm/stats/pipeline
 */
export declare const PipelineStatsApi: {
    name: string;
    path: string;
    method: "GET";
    summary: string;
    description: string;
    type: "script";
    target: string;
    authRequired: true;
    cacheTtl: number;
};
/**
 * Custom API: Quick Lead Conversion (RPC Style)
 * Path: POST /api/v1/crm/leads/convert
 */
export declare const LeadConvertApi: {
    name: string;
    path: string;
    method: "POST";
    summary: string;
    type: "flow";
    target: string;
    inputMapping: {
        source: string;
        target: string;
    }[];
};
//# sourceMappingURL=apis.d.ts.map