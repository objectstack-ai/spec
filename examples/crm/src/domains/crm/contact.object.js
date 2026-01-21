"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Contact = void 0;
const spec_1 = require("@objectstack/spec");
exports.Contact = spec_1.ObjectSchema.create({
    name: 'contact',
    label: 'Contact',
    pluralLabel: 'Contacts',
    icon: 'user',
    description: 'People associated with accounts',
    fields: {
        // Name fields
        salutation: spec_1.Field.select(['Mr.', 'Ms.', 'Mrs.', 'Dr.', 'Prof.'], {
            label: 'Salutation',
        }),
        first_name: spec_1.Field.text({
            label: 'First Name',
            required: true,
            searchable: true,
        }),
        last_name: spec_1.Field.text({
            label: 'Last Name',
            required: true,
            searchable: true,
        }),
        // Formula field - Full name
        full_name: spec_1.Field.formula({
            label: 'Full Name',
            expression: 'CONCAT(salutation, " ", first_name, " ", last_name)',
        }),
        // Relationship: Link to Account (Master-Detail)
        account: spec_1.Field.masterDetail('account', {
            label: 'Account',
            required: true,
            writeRequiresMasterRead: true,
            deleteBehavior: 'cascade', // Delete contacts when account is deleted
        }),
        // Contact Information
        email: spec_1.Field.email({
            label: 'Email',
            required: true,
            unique: true,
        }),
        phone: spec_1.Field.text({
            label: 'Phone',
            format: 'phone',
        }),
        mobile: spec_1.Field.text({
            label: 'Mobile',
            format: 'phone',
        }),
        // Professional Information
        title: spec_1.Field.text({
            label: 'Job Title',
        }),
        department: spec_1.Field.select(['Executive', 'Sales', 'Marketing', 'Engineering', 'Support', 'Finance', 'HR', 'Operations'], {
            label: 'Department',
        }),
        // Relationship fields
        reports_to: spec_1.Field.lookup('contact', {
            label: 'Reports To',
            description: 'Direct manager/supervisor',
        }),
        owner: spec_1.Field.lookup('user', {
            label: 'Contact Owner',
            required: true,
        }),
        // Mailing Address
        mailing_street: spec_1.Field.textarea({ label: 'Mailing Street' }),
        mailing_city: spec_1.Field.text({ label: 'Mailing City' }),
        mailing_state: spec_1.Field.text({ label: 'Mailing State/Province' }),
        mailing_postal_code: spec_1.Field.text({ label: 'Mailing Postal Code' }),
        mailing_country: spec_1.Field.text({ label: 'Mailing Country' }),
        // Additional Information
        birthdate: spec_1.Field.date({
            label: 'Birthdate',
        }),
        lead_source: spec_1.Field.select(['Web', 'Referral', 'Event', 'Partner', 'Advertisement'], {
            label: 'Lead Source',
        }),
        description: spec_1.Field.markdown({
            label: 'Description',
        }),
        // Flags
        is_primary: spec_1.Field.boolean({
            label: 'Primary Contact',
            defaultValue: false,
            description: 'Is this the main contact for the account?',
        }),
        do_not_call: spec_1.Field.boolean({
            label: 'Do Not Call',
            defaultValue: false,
        }),
        email_opt_out: spec_1.Field.boolean({
            label: 'Email Opt Out',
            defaultValue: false,
        }),
        // Avatar field
        avatar: spec_1.Field.avatar({
            label: 'Profile Picture',
        }),
    },
    // Enable features
    enable: {
        trackHistory: true,
        searchable: true,
        apiEnabled: true,
        files: true,
        feedEnabled: true,
        trash: true,
    },
    // Name field configuration
    nameField: 'full_name',
    // List Views
    list_views: {
        all: {
            label: 'All Contacts',
            type: 'grid',
            columns: ['full_name', 'account', 'title', 'email', 'phone', 'owner'],
            sort: [{ field: 'last_name', order: 'asc' }],
            searchableFields: ['first_name', 'last_name', 'email', 'phone'],
        },
        my_contacts: {
            label: 'My Contacts',
            type: 'grid',
            columns: ['full_name', 'account', 'title', 'email', 'phone'],
            filter: [['owner', '=', '{current_user}']],
        },
        primary_contacts: {
            label: 'Primary Contacts',
            type: 'grid',
            columns: ['full_name', 'account', 'title', 'email', 'phone'],
            filter: [['is_primary', '=', true]],
        },
        by_department: {
            label: 'By Department',
            type: 'kanban',
            columns: ['full_name', 'account', 'title', 'email'],
            kanban: {
                groupByField: 'department',
                columns: ['full_name', 'title', 'email', 'phone'],
            }
        },
        birthdays: {
            label: 'Birthdays',
            type: 'calendar',
            columns: ['full_name', 'account', 'phone'],
            calendar: {
                startDateField: 'birthdate',
                titleField: 'full_name',
                colorField: 'department',
            }
        }
    },
    // Form Views
    form_views: {
        default: {
            type: 'simple',
            sections: [
                {
                    label: 'Contact Information',
                    columns: 2,
                    fields: ['salutation', 'first_name', 'last_name', 'full_name', 'account', 'title', 'department'],
                },
                {
                    label: 'Contact Details',
                    columns: 2,
                    fields: ['email', 'phone', 'mobile', 'reports_to', 'owner'],
                },
                {
                    label: 'Mailing Address',
                    columns: 2,
                    fields: ['mailing_street', 'mailing_city', 'mailing_state', 'mailing_postal_code', 'mailing_country'],
                },
                {
                    label: 'Additional Information',
                    columns: 2,
                    collapsible: true,
                    fields: ['birthdate', 'lead_source', 'is_primary', 'do_not_call', 'email_opt_out', 'description'],
                }
            ]
        }
    },
    // Validation Rules
    validations: [
        {
            name: 'email_required_for_opt_in',
            type: 'script',
            severity: 'error',
            message: 'Email is required when Email Opt Out is not checked',
            condition: 'email_opt_out = false AND ISBLANK(email)',
        },
        {
            name: 'email_unique_per_account',
            type: 'unique',
            severity: 'error',
            message: 'Email must be unique within an account',
            fields: ['email', 'account'],
            caseSensitive: false,
        },
    ],
    // Workflow Rules
    workflows: [
        {
            name: 'welcome_email',
            objectName: 'contact',
            triggerType: 'on_create',
            active: true,
            actions: [
                {
                    name: 'send_welcome',
                    type: 'email_alert',
                    template: 'contact_welcome',
                    recipients: ['{contact.email}'],
                }
            ],
        }
    ],
});
