import type { Action } from '@objectstack/spec/ui';
export declare const ConvertLeadAction: Action;
export declare const CloneOpportunityAction: Action;
export declare const MarkPrimaryContactAction: Action;
export declare const SendEmailAction: Action;
export declare const LogCallAction: Action;
export declare const EscalateCaseAction: Action;
export declare const CloseCaseAction: Action;
export declare const MassUpdateStageAction: Action;
export declare const ExportToCsvAction: Action;
export declare const CreateCampaignAction: Action;
export declare const CrmActions: {
    ConvertLeadAction: {
        type: "url" | "script" | "api" | "flow" | "modal";
        label: string;
        name: string;
        refreshAfter: boolean;
        location?: any;
        params?: {
            type: "number" | "boolean" | "text" | "textarea" | "email" | "url" | "phone" | "password" | "markdown" | "html" | "richtext" | "currency" | "percent" | "date" | "datetime" | "time" | "select" | "lookup" | "master_detail" | "image" | "file" | "avatar" | "formula" | "summary" | "autonumber" | "location" | "address" | "code" | "color" | "rating" | "signature";
            label: string;
            name: string;
            required: boolean;
            options?: {
                value: string;
                label: string;
            }[] | undefined;
        }[] | undefined;
        icon?: string | undefined;
        target?: string | undefined;
        execute?: string | undefined;
        visible?: string | undefined;
        locations?: ("list_toolbar" | "list_item" | "record_header" | "record_more" | "record_related" | "global_nav")[] | undefined;
        confirmText?: string | undefined;
        successMessage?: string | undefined;
    };
    CloneOpportunityAction: {
        type: "url" | "script" | "api" | "flow" | "modal";
        label: string;
        name: string;
        refreshAfter: boolean;
        location?: any;
        params?: {
            type: "number" | "boolean" | "text" | "textarea" | "email" | "url" | "phone" | "password" | "markdown" | "html" | "richtext" | "currency" | "percent" | "date" | "datetime" | "time" | "select" | "lookup" | "master_detail" | "image" | "file" | "avatar" | "formula" | "summary" | "autonumber" | "location" | "address" | "code" | "color" | "rating" | "signature";
            label: string;
            name: string;
            required: boolean;
            options?: {
                value: string;
                label: string;
            }[] | undefined;
        }[] | undefined;
        icon?: string | undefined;
        target?: string | undefined;
        execute?: string | undefined;
        visible?: string | undefined;
        locations?: ("list_toolbar" | "list_item" | "record_header" | "record_more" | "record_related" | "global_nav")[] | undefined;
        confirmText?: string | undefined;
        successMessage?: string | undefined;
    };
    MarkPrimaryContactAction: {
        type: "url" | "script" | "api" | "flow" | "modal";
        label: string;
        name: string;
        refreshAfter: boolean;
        location?: any;
        params?: {
            type: "number" | "boolean" | "text" | "textarea" | "email" | "url" | "phone" | "password" | "markdown" | "html" | "richtext" | "currency" | "percent" | "date" | "datetime" | "time" | "select" | "lookup" | "master_detail" | "image" | "file" | "avatar" | "formula" | "summary" | "autonumber" | "location" | "address" | "code" | "color" | "rating" | "signature";
            label: string;
            name: string;
            required: boolean;
            options?: {
                value: string;
                label: string;
            }[] | undefined;
        }[] | undefined;
        icon?: string | undefined;
        target?: string | undefined;
        execute?: string | undefined;
        visible?: string | undefined;
        locations?: ("list_toolbar" | "list_item" | "record_header" | "record_more" | "record_related" | "global_nav")[] | undefined;
        confirmText?: string | undefined;
        successMessage?: string | undefined;
    };
    SendEmailAction: {
        type: "url" | "script" | "api" | "flow" | "modal";
        label: string;
        name: string;
        refreshAfter: boolean;
        location?: any;
        params?: {
            type: "number" | "boolean" | "text" | "textarea" | "email" | "url" | "phone" | "password" | "markdown" | "html" | "richtext" | "currency" | "percent" | "date" | "datetime" | "time" | "select" | "lookup" | "master_detail" | "image" | "file" | "avatar" | "formula" | "summary" | "autonumber" | "location" | "address" | "code" | "color" | "rating" | "signature";
            label: string;
            name: string;
            required: boolean;
            options?: {
                value: string;
                label: string;
            }[] | undefined;
        }[] | undefined;
        icon?: string | undefined;
        target?: string | undefined;
        execute?: string | undefined;
        visible?: string | undefined;
        locations?: ("list_toolbar" | "list_item" | "record_header" | "record_more" | "record_related" | "global_nav")[] | undefined;
        confirmText?: string | undefined;
        successMessage?: string | undefined;
    };
    LogCallAction: {
        type: "url" | "script" | "api" | "flow" | "modal";
        label: string;
        name: string;
        refreshAfter: boolean;
        location?: any;
        params?: {
            type: "number" | "boolean" | "text" | "textarea" | "email" | "url" | "phone" | "password" | "markdown" | "html" | "richtext" | "currency" | "percent" | "date" | "datetime" | "time" | "select" | "lookup" | "master_detail" | "image" | "file" | "avatar" | "formula" | "summary" | "autonumber" | "location" | "address" | "code" | "color" | "rating" | "signature";
            label: string;
            name: string;
            required: boolean;
            options?: {
                value: string;
                label: string;
            }[] | undefined;
        }[] | undefined;
        icon?: string | undefined;
        target?: string | undefined;
        execute?: string | undefined;
        visible?: string | undefined;
        locations?: ("list_toolbar" | "list_item" | "record_header" | "record_more" | "record_related" | "global_nav")[] | undefined;
        confirmText?: string | undefined;
        successMessage?: string | undefined;
    };
    EscalateCaseAction: {
        type: "url" | "script" | "api" | "flow" | "modal";
        label: string;
        name: string;
        refreshAfter: boolean;
        location?: any;
        params?: {
            type: "number" | "boolean" | "text" | "textarea" | "email" | "url" | "phone" | "password" | "markdown" | "html" | "richtext" | "currency" | "percent" | "date" | "datetime" | "time" | "select" | "lookup" | "master_detail" | "image" | "file" | "avatar" | "formula" | "summary" | "autonumber" | "location" | "address" | "code" | "color" | "rating" | "signature";
            label: string;
            name: string;
            required: boolean;
            options?: {
                value: string;
                label: string;
            }[] | undefined;
        }[] | undefined;
        icon?: string | undefined;
        target?: string | undefined;
        execute?: string | undefined;
        visible?: string | undefined;
        locations?: ("list_toolbar" | "list_item" | "record_header" | "record_more" | "record_related" | "global_nav")[] | undefined;
        confirmText?: string | undefined;
        successMessage?: string | undefined;
    };
    CloseCaseAction: {
        type: "url" | "script" | "api" | "flow" | "modal";
        label: string;
        name: string;
        refreshAfter: boolean;
        location?: any;
        params?: {
            type: "number" | "boolean" | "text" | "textarea" | "email" | "url" | "phone" | "password" | "markdown" | "html" | "richtext" | "currency" | "percent" | "date" | "datetime" | "time" | "select" | "lookup" | "master_detail" | "image" | "file" | "avatar" | "formula" | "summary" | "autonumber" | "location" | "address" | "code" | "color" | "rating" | "signature";
            label: string;
            name: string;
            required: boolean;
            options?: {
                value: string;
                label: string;
            }[] | undefined;
        }[] | undefined;
        icon?: string | undefined;
        target?: string | undefined;
        execute?: string | undefined;
        visible?: string | undefined;
        locations?: ("list_toolbar" | "list_item" | "record_header" | "record_more" | "record_related" | "global_nav")[] | undefined;
        confirmText?: string | undefined;
        successMessage?: string | undefined;
    };
    MassUpdateStageAction: {
        type: "url" | "script" | "api" | "flow" | "modal";
        label: string;
        name: string;
        refreshAfter: boolean;
        location?: any;
        params?: {
            type: "number" | "boolean" | "text" | "textarea" | "email" | "url" | "phone" | "password" | "markdown" | "html" | "richtext" | "currency" | "percent" | "date" | "datetime" | "time" | "select" | "lookup" | "master_detail" | "image" | "file" | "avatar" | "formula" | "summary" | "autonumber" | "location" | "address" | "code" | "color" | "rating" | "signature";
            label: string;
            name: string;
            required: boolean;
            options?: {
                value: string;
                label: string;
            }[] | undefined;
        }[] | undefined;
        icon?: string | undefined;
        target?: string | undefined;
        execute?: string | undefined;
        visible?: string | undefined;
        locations?: ("list_toolbar" | "list_item" | "record_header" | "record_more" | "record_related" | "global_nav")[] | undefined;
        confirmText?: string | undefined;
        successMessage?: string | undefined;
    };
    ExportToCsvAction: {
        type: "url" | "script" | "api" | "flow" | "modal";
        label: string;
        name: string;
        refreshAfter: boolean;
        location?: any;
        params?: {
            type: "number" | "boolean" | "text" | "textarea" | "email" | "url" | "phone" | "password" | "markdown" | "html" | "richtext" | "currency" | "percent" | "date" | "datetime" | "time" | "select" | "lookup" | "master_detail" | "image" | "file" | "avatar" | "formula" | "summary" | "autonumber" | "location" | "address" | "code" | "color" | "rating" | "signature";
            label: string;
            name: string;
            required: boolean;
            options?: {
                value: string;
                label: string;
            }[] | undefined;
        }[] | undefined;
        icon?: string | undefined;
        target?: string | undefined;
        execute?: string | undefined;
        visible?: string | undefined;
        locations?: ("list_toolbar" | "list_item" | "record_header" | "record_more" | "record_related" | "global_nav")[] | undefined;
        confirmText?: string | undefined;
        successMessage?: string | undefined;
    };
    CreateCampaignAction: {
        type: "url" | "script" | "api" | "flow" | "modal";
        label: string;
        name: string;
        refreshAfter: boolean;
        location?: any;
        params?: {
            type: "number" | "boolean" | "text" | "textarea" | "email" | "url" | "phone" | "password" | "markdown" | "html" | "richtext" | "currency" | "percent" | "date" | "datetime" | "time" | "select" | "lookup" | "master_detail" | "image" | "file" | "avatar" | "formula" | "summary" | "autonumber" | "location" | "address" | "code" | "color" | "rating" | "signature";
            label: string;
            name: string;
            required: boolean;
            options?: {
                value: string;
                label: string;
            }[] | undefined;
        }[] | undefined;
        icon?: string | undefined;
        target?: string | undefined;
        execute?: string | undefined;
        visible?: string | undefined;
        locations?: ("list_toolbar" | "list_item" | "record_header" | "record_more" | "record_related" | "global_nav")[] | undefined;
        confirmText?: string | undefined;
        successMessage?: string | undefined;
    };
};
//# sourceMappingURL=actions.d.ts.map