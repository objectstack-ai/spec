"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Opportunity = void 0;
const spec_1 = require("@objectstack/spec");
exports.Opportunity = spec_1.ObjectSchema.create({
    name: 'opportunity',
    label: 'Opportunity',
    pluralLabel: 'Opportunities',
    icon: 'dollar-sign',
    description: 'Sales opportunities and deals in the pipeline',
    nameField: 'name',
    fields: {
        // Basic Information
        name: spec_1.Field.text({
            label: 'Opportunity Name',
            required: true,
            searchable: true,
        }),
        // Relationships
        account: spec_1.Field.lookup('account', {
            label: 'Account',
            required: true,
        }),
        primary_contact: spec_1.Field.lookup('contact', {
            label: 'Primary Contact',
            referenceFilters: ['account = {opportunity.account}'], // Filter contacts by account
        }),
        owner: spec_1.Field.lookup('user', {
            label: 'Opportunity Owner',
            required: true,
        }),
        // Financial Information
        amount: spec_1.Field.currency({
            label: 'Amount',
            required: true,
            scale: 2,
            min: 0,
        }),
        expected_revenue: spec_1.Field.currency({
            label: 'Expected Revenue',
            scale: 2,
            readonly: true, // Calculated field
        }),
        // Sales Process
        stage: spec_1.Field.select({
            label: 'Stage',
            required: true,
            options: [
                { label: 'Prospecting', value: 'prospecting', color: '#808080', default: true },
                { label: 'Qualification', value: 'qualification', color: '#FFA500' },
                { label: 'Needs Analysis', value: 'needs_analysis', color: '#FFD700' },
                { label: 'Proposal', value: 'proposal', color: '#4169E1' },
                { label: 'Negotiation', value: 'negotiation', color: '#9370DB' },
                { label: 'Closed Won', value: 'closed_won', color: '#00AA00' },
                { label: 'Closed Lost', value: 'closed_lost', color: '#FF0000' },
            ]
        }),
        probability: spec_1.Field.percent({
            label: 'Probability (%)',
            min: 0,
            max: 100,
            defaultValue: 10,
        }),
        // Important Dates
        close_date: spec_1.Field.date({
            label: 'Close Date',
            required: true,
        }),
        created_date: spec_1.Field.datetime({
            label: 'Created Date',
            readonly: true,
        }),
        // Additional Classification
        type: spec_1.Field.select(['New Business', 'Existing Customer - Upgrade', 'Existing Customer - Renewal', 'Existing Customer - Expansion'], {
            label: 'Opportunity Type',
        }),
        lead_source: spec_1.Field.select(['Web', 'Referral', 'Event', 'Partner', 'Advertisement', 'Cold Call'], {
            label: 'Lead Source',
        }),
        // Competitor Analysis
        competitors: spec_1.Field.select(['Competitor A', 'Competitor B', 'Competitor C'], {
            label: 'Competitors',
            multiple: true,
        }),
        // Campaign tracking
        campaign: spec_1.Field.lookup('campaign', {
            label: 'Campaign',
            description: 'Marketing campaign that generated this opportunity',
        }),
        // Sales cycle metrics
        days_in_stage: spec_1.Field.number({
            label: 'Days in Current Stage',
            readonly: true,
        }),
        // Additional information
        description: spec_1.Field.markdown({
            label: 'Description',
        }),
        next_step: spec_1.Field.textarea({
            label: 'Next Steps',
        }),
        // Flags
        is_private: spec_1.Field.boolean({
            label: 'Private',
            defaultValue: false,
        }),
        forecast_category: spec_1.Field.select(['Pipeline', 'Best Case', 'Commit', 'Omitted', 'Closed'], {
            label: 'Forecast Category',
        }),
    },
    // Database indexes for performance
    indexes: [
        { fields: ['name'], unique: false },
        { fields: ['account'], unique: false },
        { fields: ['owner'], unique: false },
        { fields: ['stage'], unique: false },
        { fields: ['close_date'], unique: false },
    ],
    // Enable advanced features
    enable: {
        trackHistory: true, // Critical for tracking stage changes
        searchable: true,
        apiEnabled: true,
        apiMethods: ['get', 'list', 'create', 'update', 'delete', 'aggregate', 'search'], // Whitelist allowed API operations
        files: true, // Attach proposals, contracts
        feedEnabled: true, // Team collaboration
        trash: true,
    },
    // List Views - Multiple visualization types
    list_views: {
        all: {
            label: 'All Opportunities',
            type: 'grid',
            columns: ['name', 'account', 'amount', 'close_date', 'stage', 'probability', 'owner'],
            sort: [{ field: 'close_date', order: 'asc' }],
            searchableFields: ['name', 'account'],
        },
        my_opportunities: {
            label: 'My Opportunities',
            type: 'grid',
            columns: ['name', 'account', 'amount', 'close_date', 'stage', 'probability'],
            filter: [['owner', '=', '{current_user}']],
            sort: [{ field: 'close_date', order: 'asc' }],
        },
        closing_this_month: {
            label: 'Closing This Month',
            type: 'grid',
            columns: ['name', 'account', 'amount', 'stage', 'probability', 'owner'],
            filter: [
                ['close_date', '>=', '{current_month_start}'],
                ['close_date', '<=', '{current_month_end}'],
                ['stage', '!=', 'closed_won'],
                ['stage', '!=', 'closed_lost'],
            ],
            sort: [{ field: 'amount', order: 'desc' }],
        },
        won_opportunities: {
            label: 'Won Opportunities',
            type: 'grid',
            columns: ['name', 'account', 'amount', 'close_date', 'owner'],
            filter: [['stage', '=', 'closed_won']],
            sort: [{ field: 'close_date', order: 'desc' }],
        },
        pipeline: {
            label: 'Sales Pipeline',
            type: 'kanban',
            columns: ['name', 'account', 'amount', 'probability', 'close_date'],
            filter: [
                ['stage', '!=', 'closed_won'],
                ['stage', '!=', 'closed_lost'],
            ],
            kanban: {
                groupByField: 'stage',
                summarizeField: 'amount',
                columns: ['name', 'account', 'amount', 'close_date'],
            }
        },
        timeline: {
            label: 'Close Date Timeline',
            type: 'gantt',
            columns: ['name', 'account', 'amount', 'stage'],
            filter: [
                ['stage', '!=', 'closed_won'],
                ['stage', '!=', 'closed_lost'],
            ],
            gantt: {
                startDateField: 'created_date',
                endDateField: 'close_date',
                titleField: 'name',
                progressField: 'probability',
            }
        }
    },
    // Form Views
    form_views: {
        default: {
            type: 'tabbed',
            sections: [
                {
                    label: 'Opportunity Information',
                    columns: 2,
                    fields: ['name', 'account', 'primary_contact', 'owner', 'amount', 'close_date'],
                },
                {
                    label: 'Sales Process',
                    columns: 2,
                    fields: ['stage', 'probability', 'forecast_category', 'expected_revenue', 'days_in_stage'],
                },
                {
                    label: 'Classification',
                    columns: 2,
                    fields: ['type', 'lead_source', 'campaign', 'competitors'],
                },
                {
                    label: 'Details',
                    columns: 1,
                    fields: ['description', 'next_step'],
                },
                {
                    label: 'System Information',
                    columns: 2,
                    collapsible: true,
                    collapsed: true,
                    fields: ['created_date', 'is_private'],
                }
            ]
        }
    },
    // Validation Rules
    validations: [
        {
            name: 'close_date_future',
            type: 'script',
            severity: 'warning',
            message: 'Close date should not be in the past unless opportunity is closed',
            condition: 'close_date < TODAY() AND stage != "closed_won" AND stage != "closed_lost"',
        },
        {
            name: 'amount_positive',
            type: 'script',
            severity: 'error',
            message: 'Amount must be greater than zero',
            condition: 'amount <= 0',
        },
        {
            name: 'stage_progression',
            type: 'state_machine',
            severity: 'error',
            message: 'Invalid stage transition',
            field: 'stage',
            transitions: {
                'prospecting': ['qualification', 'closed_lost'],
                'qualification': ['needs_analysis', 'closed_lost'],
                'needs_analysis': ['proposal', 'closed_lost'],
                'proposal': ['negotiation', 'closed_lost'],
                'negotiation': ['closed_won', 'closed_lost'],
                'closed_won': [], // Terminal state
                'closed_lost': [] // Terminal state
            }
        },
    ],
    // Workflow Rules
    workflows: [
        {
            name: 'update_probability_by_stage',
            objectName: 'opportunity',
            triggerType: 'on_create_or_update',
            criteria: 'ISCHANGED(stage)',
            active: true,
            actions: [
                {
                    name: 'set_probability',
                    type: 'field_update',
                    field: 'probability',
                    value: `CASE(stage,
            "prospecting", 10,
            "qualification", 25,
            "needs_analysis", 40,
            "proposal", 60,
            "negotiation", 80,
            "closed_won", 100,
            "closed_lost", 0,
            probability
          )`,
                },
                {
                    name: 'set_forecast_category',
                    type: 'field_update',
                    field: 'forecast_category',
                    value: `CASE(stage,
            "prospecting", "pipeline",
            "qualification", "pipeline",
            "needs_analysis", "best_case",
            "proposal", "commit",
            "negotiation", "commit",
            "closed_won", "closed",
            "closed_lost", "omitted",
            forecast_category
          )`,
                }
            ],
        },
        {
            name: 'calculate_expected_revenue',
            objectName: 'opportunity',
            triggerType: 'on_create_or_update',
            criteria: 'ISCHANGED(amount) OR ISCHANGED(probability)',
            active: true,
            actions: [
                {
                    name: 'update_expected_revenue',
                    type: 'field_update',
                    field: 'expected_revenue',
                    value: 'amount * (probability / 100)',
                }
            ],
        },
        {
            name: 'notify_on_large_deal_won',
            objectName: 'opportunity',
            triggerType: 'on_update',
            criteria: 'ISCHANGED(stage) AND stage = "closed_won" AND amount > 100000',
            active: true,
            actions: [
                {
                    name: 'notify_management',
                    type: 'email_alert',
                    template: 'large_deal_won',
                    recipients: ['sales_management@example.com'],
                }
            ],
        }
    ],
});
