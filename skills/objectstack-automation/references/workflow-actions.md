# Automation Design — Workflow Actions Reference

> Auto-derived from `packages/spec/src/automation/workflow.zod.ts`, `approval.zod.ts`, and related schemas.
> This file is bundled with the skill for offline/external use.

## Workflow Action Types

| Type | Key Properties | Description |
|:-----|:---------------|:------------|
| `field_update` | `field`, `value` | Set a field to a formula-capable value |
| `email_alert` | `template`, `recipients[]` | Send email notification |
| `connector_action` | `connectorId`, `actionId`, `input{}` | Invoke pre-built integration |
| `http_call` | `url`, `method`, `headers`, `body` | Call external HTTP API |

## Workflow Trigger Types

| Trigger | Description |
|:--------|:------------|
| `on_create` | Fires when a record is created |
| `on_update` | Fires when a record is updated |
| `on_create_or_update` | Fires on create or update |
| `on_delete` | Fires when a record is deleted |
| `schedule` | Fires on a cron schedule |

## Approval Process Properties

| Property | Required | Description |
|:---------|:---------|:------------|
| `name` | ✅ | Unique identifier (snake_case) |
| `object` | ✅ | Target object name |
| `entryCondition` | ✅ | Formula — when to start approval |
| `steps` | ✅ | Ordered approval steps |
| `onApproved` | — | Actions when fully approved |
| `onRejected` | — | Actions when rejected |
| `onRecalled` | — | Actions when recalled by submitter |

## Approval Step Properties

| Property | Description |
|:---------|:------------|
| `assignTo.type` | `field` (record field), `role`, or `user` |
| `assignTo.value` | Field name, role name, or user ID |
| `unanimousRequired` | All assignees must approve (default: false) |
| `escalation.timeout` | Time before escalation (e.g., `"48h"`) |
| `escalation.action` | `approve`, `reject`, or `reassign` |

## Flow Variable Schema

| Property | Required | Description |
|:---------|:---------|:------------|
| `name` | ✅ | Variable name (snake_case) |
| `type` | ✅ | `text`, `number`, `boolean`, `object`, `list` |
| `isInput` | — | Exposed as flow input parameter |
| `isOutput` | — | Exposed as flow output value |

## Flow Node Config (by type)

| Node Type | Key Config Properties |
|:----------|:---------------------|
| `decision` | `conditions[]` with `expression` and `targetNodeId` |
| `assignment` | `assignments[]` with `variable`, `operator`, `value` |
| `create_record` | `object`, `fieldValues{}` |
| `update_record` | `object`, `filters`, `fieldValues{}` |
| `delete_record` | `object`, `filters` |
| `query_record` | `object`, `filters`, `sortBy`, `limit` |
| `http_request` | `url`, `method`, `headers`, `body`, `outputVariable` |
| `script` | `code` (JS/TS), `inputVariables`, `outputVariables` |
| `screen` | `components[]` (form fields, buttons) |
| `loop` | `collection`, `iterationVariable` |
| `wait` | `waitEventConfig` with `type` and `condition` |
| `subflow` | `flowName`, `inputAssignments`, `outputAssignments` |

## State Machine Properties

| Property | Required | Description |
|:---------|:---------|:------------|
| `field` | ✅ | State field name (e.g., `status`) |
| `states` | ✅ | Map of state name → `{ initial?, final? }` |
| `transitions` | ✅ | Array of `{ from, to, trigger?, guard?, actions? }` |

## ETL Pipeline Properties

| Property | Description |
|:---------|:------------|
| `source` | Input data source config |
| `transforms` | Array of transformation steps |
| `destination` | Output target config |
| `schedule` | Cron expression for recurring runs |
| `errorHandling` | `skip`, `abort`, or `retry` |
