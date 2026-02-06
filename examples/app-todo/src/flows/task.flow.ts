/** Task Reminder Flow — scheduled flow to send reminders for upcoming tasks */
export const TaskReminderFlow = {
  name: 'task_reminder',
  label: 'Task Reminder Notification',
  description: 'Automated flow to send reminders for tasks approaching their due date',
  type: 'autolaunched',
  triggerType: 'schedule',
  schedule: '0 8 * * *', // Daily at 8 AM
  objectName: 'task',

  variables: [
    { name: 'tasksToRemind', type: 'record_collection', isInput: false, isOutput: false },
  ],

  steps: [
    {
      id: 'get_upcoming_tasks',
      type: 'record_lookup',
      label: 'Get Tasks Due Tomorrow',
      objectName: 'task',
      filter: { 
        due_date: '{tomorrow}',
        is_completed: false,
      },
      outputVariable: 'tasksToRemind',
      getAll: true,
    },
    {
      id: 'loop_tasks',
      type: 'loop',
      label: 'Loop Through Tasks',
      collection: '{tasksToRemind}',
      iteratorVariable: 'currentTask',
      nextStep: 'send_reminder',
    },
    {
      id: 'send_reminder',
      type: 'action',
      label: 'Send Reminder Email',
      actionType: 'email',
      inputs: {
        to: '{currentTask.owner.email}',
        subject: 'Task Due Tomorrow: {currentTask.subject}',
        template: 'task_reminder_email',
        data: {
          taskSubject: '{currentTask.subject}',
          dueDate: '{currentTask.due_date}',
          priority: '{currentTask.priority}',
        },
      },
    },
  ],
};

/** Overdue Task Escalation Flow */
export const OverdueEscalationFlow = {
  name: 'overdue_escalation',
  label: 'Overdue Task Escalation',
  description: 'Escalates tasks that have been overdue for more than 3 days',
  type: 'autolaunched',
  triggerType: 'schedule',
  schedule: '0 9 * * *', // Daily at 9 AM
  objectName: 'task',

  variables: [
    { name: 'overdueTasks', type: 'record_collection', isInput: false, isOutput: false },
  ],

  steps: [
    {
      id: 'get_overdue_tasks',
      type: 'record_lookup',
      label: 'Get Severely Overdue Tasks',
      objectName: 'task',
      filter: { 
        due_date: { $lt: '{3_days_ago}' },
        is_completed: false,
        is_overdue: true,
      },
      outputVariable: 'overdueTasks',
      getAll: true,
    },
    {
      id: 'loop_overdue',
      type: 'loop',
      label: 'Loop Through Overdue Tasks',
      collection: '{overdueTasks}',
      iteratorVariable: 'currentTask',
      nextStep: 'update_priority',
    },
    {
      id: 'update_priority',
      type: 'record_update',
      label: 'Escalate Priority',
      objectName: 'task',
      filter: { id: '{currentTask.id}' },
      fields: {
        priority: 'urgent',
        tags: ['important', 'follow_up'],
      },
    },
    {
      id: 'notify_owner',
      type: 'action',
      label: 'Notify Task Owner',
      actionType: 'email',
      inputs: {
        to: '{currentTask.owner.email}',
        subject: 'URGENT: Task Overdue - {currentTask.subject}',
        template: 'overdue_escalation_email',
        data: {
          taskSubject: '{currentTask.subject}',
          dueDate: '{currentTask.due_date}',
          daysOverdue: '{currentTask.days_overdue}',
        },
      },
    },
  ],
};

/** Task Completion Flow */
export const TaskCompletionFlow = {
  name: 'task_completion',
  label: 'Task Completion Process',
  description: 'Flow triggered when a task is marked as complete',
  type: 'autolaunched',
  triggerType: 'record_change',
  objectName: 'task',
  triggerCondition: 'ISCHANGED(status) AND status = "completed"',

  variables: [
    { name: 'taskId', type: 'text', isInput: true, isOutput: false },
    { name: 'completedTask', type: 'record', isInput: false, isOutput: false },
  ],

  steps: [
    {
      id: 'get_task',
      type: 'record_lookup',
      label: 'Get Completed Task',
      objectName: 'task',
      filter: { id: '{taskId}' },
      outputVariable: 'completedTask',
    },
    {
      id: 'check_recurring',
      type: 'decision',
      label: 'Is Recurring Task?',
      condition: '{completedTask.is_recurring} == true',
      ifTrue: 'create_next_task',
      ifFalse: 'end_flow',
    },
    {
      id: 'create_next_task',
      type: 'record_create',
      label: 'Create Next Recurring Task',
      objectName: 'task',
      fields: {
        subject: '{completedTask.subject}',
        description: '{completedTask.description}',
        priority: '{completedTask.priority}',
        category: '{completedTask.category}',
        owner: '{completedTask.owner}',
        is_recurring: true,
        recurrence_type: '{completedTask.recurrence_type}',
        recurrence_interval: '{completedTask.recurrence_interval}',
        due_date: 'DATEADD({completedTask.due_date}, {completedTask.recurrence_interval}, "{completedTask.recurrence_type}")',
        status: 'not_started',
        is_completed: false,
      },
      outputVariable: 'newTaskId',
    },
    {
      id: 'end_flow',
      type: 'end',
      label: 'End Flow',
    },
  ],
};

/** Quick Add Task Flow — screen flow for quickly adding tasks */
export const QuickAddTaskFlow = {
  name: 'quick_add_task',
  label: 'Quick Add Task',
  description: 'Screen flow for quickly creating a new task',
  type: 'screen',
  triggerType: 'manual',

  variables: [
    { name: 'subject', type: 'text', isInput: true, isOutput: false },
    { name: 'priority', type: 'text', isInput: true, isOutput: false },
    { name: 'dueDate', type: 'date', isInput: true, isOutput: false },
    { name: 'newTaskId', type: 'text', isInput: false, isOutput: true },
  ],

  steps: [
    {
      id: 'screen_1',
      type: 'screen',
      label: 'Task Details',
      fields: [
        { name: 'subject', label: 'Task Subject', type: 'text', required: true },
        { name: 'priority', label: 'Priority', type: 'select', options: ['low', 'normal', 'high', 'urgent'], defaultValue: 'normal' },
        { name: 'dueDate', label: 'Due Date', type: 'date', required: false },
        { name: 'category', label: 'Category', type: 'select', options: ['Personal', 'Work', 'Shopping', 'Health', 'Finance', 'Other'] },
      ],
    },
    {
      id: 'create_task',
      type: 'record_create',
      label: 'Create Task',
      objectName: 'task',
      fields: {
        subject: '{subject}',
        priority: '{priority}',
        due_date: '{dueDate}',
        category: '{category}',
        status: 'not_started',
        owner: '{$User.Id}',
      },
      outputVariable: 'newTaskId',
    },
    {
      id: 'success_screen',
      type: 'screen',
      label: 'Success',
      message: 'Task "{subject}" created successfully!',
      buttons: [
        { label: 'Create Another', action: 'restart' },
        { label: 'View Task', action: 'navigate', target: '/task/{newTaskId}' },
        { label: 'Done', action: 'finish' },
      ],
    },
  ],
};
