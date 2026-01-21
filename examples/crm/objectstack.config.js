"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const spec_1 = require("@objectstack/spec");
const account_object_1 = require("./src/domains/crm/account.object");
const contact_object_1 = require("./src/domains/crm/contact.object");
const opportunity_object_1 = require("./src/domains/crm/opportunity.object");
const lead_object_1 = require("./src/domains/crm/lead.object");
const case_object_1 = require("./src/domains/crm/case.object");
const task_object_1 = require("./src/domains/crm/task.object");
const server_1 = require("./src/server");
const actions_1 = require("./src/ui/actions");
const dashboards_1 = require("./src/ui/dashboards");
const reports_1 = require("./src/ui/reports");
exports.default = spec_1.App.create({
    name: 'crm_example',
    label: 'CRM App',
    description: 'Comprehensive CRM example demonstrating all ObjectStack Protocol features',
    version: '2.0.0',
    icon: 'briefcase',
    // All objects in the app
    objects: [
        account_object_1.Account,
        contact_object_1.Contact,
        opportunity_object_1.Opportunity,
        lead_object_1.Lead,
        case_object_1.Case,
        task_object_1.Task
    ],
    // Custom APIs
    apis: [
        server_1.PipelineStatsApi,
        server_1.LeadConvertApi
    ],
    // Navigation menu structure
    navigation: [
        {
            id: 'group_sales',
            type: 'group',
            label: 'Sales',
            children: [
                { id: 'nav_lead', type: 'object', objectName: 'lead', label: 'Leads' },
                { id: 'nav_account', type: 'object', objectName: 'account', label: 'Accounts' },
                { id: 'nav_contact', type: 'object', objectName: 'contact', label: 'Contacts' },
                { id: 'nav_opportunity', type: 'object', objectName: 'opportunity', label: 'Opportunities' },
                { id: 'nav_sales_dashboard', type: 'dashboard', dashboardName: 'sales_dashboard', label: 'Sales Dashboard' },
            ]
        },
        {
            id: 'group_service',
            type: 'group',
            label: 'Service',
            children: [
                { id: 'nav_case', type: 'object', objectName: 'case', label: 'Cases' },
                { id: 'nav_service_dashboard', type: 'dashboard', dashboardName: 'service_dashboard', label: 'Service Dashboard' },
            ]
        },
        {
            id: 'group_activities',
            type: 'group',
            label: 'Activities',
            children: [
                { id: 'nav_task', type: 'object', objectName: 'task', label: 'Tasks' },
            ]
        },
        {
            id: 'group_analytics',
            type: 'group',
            label: 'Analytics',
            children: [
                { id: 'nav_exec_dashboard', type: 'dashboard', dashboardName: 'executive_dashboard', label: 'Executive Dashboard' },
                { id: 'nav_analytics_sales_db', type: 'dashboard', dashboardName: 'sales_dashboard', label: 'Sales Dashboard' },
                { id: 'nav_analytics_service_db', type: 'dashboard', dashboardName: 'service_dashboard', label: 'Service Dashboard' },
            ]
        }
    ],
    // Actions available in the app
    actions: Object.values(actions_1.CrmActions),
    // Dashboards
    dashboards: Object.values(dashboards_1.CrmDashboards),
    // Reports
    reports: Object.values(reports_1.CrmReports),
    // App-level branding
    branding: {
        primaryColor: '#4169E1',
        logo: '/assets/crm-logo.png',
        favicon: '/assets/crm-favicon.ico',
    }
});
