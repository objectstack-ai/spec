"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Task = void 0;
const spec_1 = require("@objectstack/spec");
exports.Task = spec_1.ObjectSchema.create({
    name: 'task',
    label: 'Task',
    pluralLabel: 'Tasks',
    icon: 'check-square',
    description: 'Activities and to-do items',
    fields: {
        // Task Information
        subject: spec_1.Field.text({
            label: 'Subject',
            required: true,
            searchable: true,
            maxLength: 255,
        }),
        description: spec_1.Field.markdown({
            label: 'Description',
        }),
        // Task Management
        status: {
            type: 'select',
            label: 'Status',
            required: true,
            options: [
                { label: 'Not Started', value: 'not_started', color: '#808080', default: true },
                { label: 'In Progress', value: 'in_progress', color: '#FFA500' },
                { label: 'Waiting', value: 'waiting', color: '#FFD700' },
                { label: 'Completed', value: 'completed', color: '#00AA00' },
                { label: 'Deferred', value: 'deferred', color: '#999999' },
            ]
        },
        priority: {
            type: 'select',
            label: 'Priority',
            required: true,
            options: [
                { label: 'Low', value: 'low', color: '#4169E1', default: true },
                { label: 'Normal', value: 'normal', color: '#00AA00' },
                { label: 'High', value: 'high', color: '#FFA500' },
                { label: 'Urgent', value: 'urgent', color: '#FF0000' },
            ]
        },
        type: spec_1.Field.select(['Call', 'Email', 'Meeting', 'Follow-up', 'Demo', 'Other'], {
            label: 'Task Type',
        }),
        // Dates
        due_date: spec_1.Field.date({
            label: 'Due Date',
        }),
        reminder_date: spec_1.Field.datetime({
            label: 'Reminder Date/Time',
        }),
        completed_date: spec_1.Field.datetime({
            label: 'Completed Date',
            readonly: true,
        }),
        // Assignment
        owner: spec_1.Field.lookup('user', {
            label: 'Assigned To',
            required: true,
        }),
        // Related To (Polymorphic relationship - can link to multiple object types)
        related_to_type: spec_1.Field.select(['Account', 'Contact', 'Opportunity', 'Lead', 'Case'], {
            label: 'Related To Type',
        }),
        related_to_account: spec_1.Field.lookup('account', {
            label: 'Related Account',
        }),
        related_to_contact: spec_1.Field.lookup('contact', {
            label: 'Related Contact',
        }),
        related_to_opportunity: spec_1.Field.lookup('opportunity', {
            label: 'Related Opportunity',
        }),
        related_to_lead: spec_1.Field.lookup('lead', {
            label: 'Related Lead',
        }),
        related_to_case: spec_1.Field.lookup('case', {
            label: 'Related Case',
        }),
        // Recurrence (for recurring tasks)
        is_recurring: spec_1.Field.boolean({
            label: 'Recurring Task',
            defaultValue: false,
        }),
        recurrence_type: spec_1.Field.select(['Daily', 'Weekly', 'Monthly', 'Yearly'], {
            label: 'Recurrence Type',
        }),
        recurrence_interval: spec_1.Field.number({
            label: 'Recurrence Interval',
            defaultValue: 1,
            min: 1,
        }),
        recurrence_end_date: spec_1.Field.date({
            label: 'Recurrence End Date',
        }),
        // Flags
        is_completed: spec_1.Field.boolean({
            label: 'Is Completed',
            defaultValue: false,
            readonly: true,
        }),
        is_overdue: spec_1.Field.boolean({
            label: 'Is Overdue',
            defaultValue: false,
            readonly: true,
        }),
        // Progress
        progress_percent: spec_1.Field.percent({
            label: 'Progress (%)',
            min: 0,
            max: 100,
            defaultValue: 0,
        }),
        // Time tracking
        estimated_hours: spec_1.Field.number({
            label: 'Estimated Hours',
            scale: 2,
            min: 0,
        }),
        actual_hours: spec_1.Field.number({
            label: 'Actual Hours',
            scale: 2,
            min: 0,
        }),
    },
    enable: {
        trackHistory: true,
        searchable: true,
        apiEnabled: true,
        files: true,
        feedEnabled: true,
        trash: true,
    },
    nameField: 'subject',
    list_views: {
        all: {
            label: 'All Tasks',
            type: 'grid',
            columns: ['subject', 'status', 'priority', 'due_date', 'owner'],
            sort: [{ field: 'due_date', order: 'asc' }],
            searchableFields: ['subject', 'description'],
        },
        my_tasks: {
            label: 'My Tasks',
            type: 'grid',
            columns: ['subject', 'status', 'priority', 'due_date', 'related_to_type'],
            filter: [['owner', '=', '{current_user}']],
            sort: [{ field: 'due_date', order: 'asc' }],
        },
        open_tasks: {
            label: 'Open Tasks',
            type: 'grid',
            columns: ['subject', 'priority', 'due_date', 'owner'],
            filter: [['is_completed', '=', false]],
            sort: [{ field: 'priority', order: 'desc' }],
        },
        overdue_tasks: {
            label: 'Overdue Tasks',
            type: 'grid',
            columns: ['subject', 'priority', 'due_date', 'owner'],
            filter: [
                ['is_overdue', '=', true],
                ['is_completed', '=', false],
            ],
            sort: [{ field: 'due_date', order: 'asc' }],
        },
        today_tasks: {
            label: 'Today\'s Tasks',
            type: 'grid',
            columns: ['subject', 'status', 'priority', 'owner'],
            filter: [
                ['due_date', '=', 'TODAY()'],
            ],
        },
        by_status: {
            label: 'Tasks by Status',
            type: 'kanban',
            columns: ['subject', 'priority', 'due_date'],
            filter: [['is_completed', '=', false]],
            kanban: {
                groupByField: 'status',
                columns: ['subject', 'priority', 'due_date', 'owner'],
            }
        },
        calendar: {
            label: 'Task Calendar',
            type: 'calendar',
            columns: ['subject', 'priority', 'owner'],
            calendar: {
                startDateField: 'due_date',
                titleField: 'subject',
                colorField: 'priority',
            }
        },
    },
    form_views: {
        default: {
            type: 'simple',
            sections: [
                {
                    label: 'Task Information',
                    columns: 2,
                    fields: ['subject', 'status', 'priority', 'type', 'owner'],
                },
                {
                    label: 'Description',
                    columns: 1,
                    fields: ['description'],
                },
                {
                    label: 'Dates & Progress',
                    columns: 2,
                    fields: ['due_date', 'reminder_date', 'completed_date', 'progress_percent'],
                },
                {
                    label: 'Time Tracking',
                    columns: 2,
                    fields: ['estimated_hours', 'actual_hours'],
                },
                {
                    label: 'Related To',
                    columns: 2,
                    fields: ['related_to_type', 'related_to_account', 'related_to_contact', 'related_to_opportunity', 'related_to_lead', 'related_to_case'],
                },
                {
                    label: 'Recurrence',
                    columns: 2,
                    collapsible: true,
                    collapsed: true,
                    fields: ['is_recurring', 'recurrence_type', 'recurrence_interval', 'recurrence_end_date'],
                }
            ]
        }
    },
    validations: [
        {
            name: 'completed_date_required',
            type: 'script',
            severity: 'error',
            message: 'Completed date is required when status is Completed',
            condition: 'status = "completed" AND ISBLANK(completed_date)',
        },
        {
            name: 'recurrence_fields_required',
            type: 'script',
            severity: 'error',
            message: 'Recurrence type is required for recurring tasks',
            condition: 'is_recurring = true AND ISBLANK(recurrence_type)',
        },
        {
            name: 'related_to_required',
            type: 'script',
            severity: 'warning',
            message: 'At least one related record should be selected',
            condition: 'ISBLANK(related_to_account) AND ISBLANK(related_to_contact) AND ISBLANK(related_to_opportunity) AND ISBLANK(related_to_lead) AND ISBLANK(related_to_case)',
        },
    ],
    workflows: [
        {
            name: 'set_completed_flag',
            objectName: 'task',
            triggerType: 'on_create_or_update',
            criteria: 'ISCHANGED(status)',
            active: true,
            actions: [
                {
                    name: 'update_completed_flag',
                    type: 'field_update',
                    field: 'is_completed',
                    value: 'status = "completed"',
                }
            ],
        },
        {
            name: 'set_completed_date',
            objectName: 'task',
            triggerType: 'on_update',
            criteria: 'ISCHANGED(status) AND status = "completed"',
            active: true,
            actions: [
                {
                    name: 'set_date',
                    type: 'field_update',
                    field: 'completed_date',
                    value: 'NOW()',
                },
                {
                    name: 'set_progress',
                    type: 'field_update',
                    field: 'progress_percent',
                    value: '100',
                }
            ],
        },
        {
            name: 'check_overdue',
            objectName: 'task',
            triggerType: 'on_create_or_update',
            criteria: 'due_date < TODAY() AND is_completed = false',
            active: true,
            actions: [
                {
                    name: 'set_overdue_flag',
                    type: 'field_update',
                    field: 'is_overdue',
                    value: 'true',
                }
            ],
        },
        {
            name: 'notify_on_urgent',
            objectName: 'task',
            triggerType: 'on_create_or_update',
            criteria: 'priority = "urgent" AND is_completed = false',
            active: true,
            actions: [
                {
                    name: 'email_owner',
                    type: 'email_alert',
                    template: 'urgent_task_alert',
                    recipients: ['{owner.email}'],
                }
            ],
        },
    ],
});
