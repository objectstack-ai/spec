// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

/**
 * IWorkflowService - Workflow State Machine Service Contract
 *
 * Defines the interface for workflow state management and approval processes
 * in ObjectStack. Concrete implementations (state machine engines, BPMN, etc.)
 * should implement this interface.
 *
 * Follows Dependency Inversion Principle - plugins depend on this interface,
 * not on concrete workflow engine implementations.
 *
 * Aligned with CoreServiceName 'workflow' in core-services.zod.ts.
 */

/**
 * A state transition request
 */
export interface WorkflowTransition {
    /** Record identifier */
    recordId: string;
    /** Object name the record belongs to */
    object: string;
    /** Target state to transition to */
    targetState: string;
    /** Optional comment for the transition */
    comment?: string;
    /** User performing the transition */
    userId?: string;
}

/**
 * Result of a transition attempt
 */
export interface WorkflowTransitionResult {
    /** Whether the transition succeeded */
    success: boolean;
    /** The new current state (if success) */
    currentState?: string;
    /** Error or rejection reason (if failure) */
    error?: string;
}

/**
 * Status of a workflow instance
 */
export interface WorkflowStatus {
    /** Record identifier */
    recordId: string;
    /** Object name */
    object: string;
    /** Current state */
    currentState: string;
    /** Available transitions from the current state */
    availableTransitions: string[];
}

export interface IWorkflowService {
    /**
     * Transition a record to a new workflow state
     * @param transition - Transition request details
     * @returns Transition result
     */
    transition(transition: WorkflowTransition): Promise<WorkflowTransitionResult>;

    /**
     * Get the current workflow status of a record
     * @param object - Object name
     * @param recordId - Record identifier
     * @returns Current workflow status with available transitions
     */
    getStatus(object: string, recordId: string): Promise<WorkflowStatus>;

    /**
     * Get transition history for a record
     * @param object - Object name
     * @param recordId - Record identifier
     * @returns Array of historical transitions
     */
    getHistory?(object: string, recordId: string): Promise<Array<{
        fromState: string;
        toState: string;
        userId?: string;
        comment?: string;
        timestamp: string;
    }>>;
}
