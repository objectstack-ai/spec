// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import { z } from 'zod';

/**
 * I18n Object Schema
 * Structured internationalization label with translation key and parameters.
 * 
 * @example
 * ```typescript
 * const label: I18nObject = {
 *   key: 'views.task_list.label',
 *   defaultValue: 'Task List',
 *   params: { count: 5 },
 * };
 * ```
 */
export const I18nObjectSchema = z.object({
  /** Translation key (e.g., "views.task_list.label", "apps.crm.description") */
  key: z.string().describe('Translation key (e.g., "views.task_list.label")'),

  /** Default value when translation is not available */
  defaultValue: z.string().optional().describe('Fallback value when translation key is not found'),

  /** Interpolation parameters for dynamic translations */
  params: z.record(z.string(), z.any()).optional().describe('Interpolation parameters (e.g., { count: 5 })'),
});

export type I18nObject = z.infer<typeof I18nObjectSchema>;

/**
 * I18n Label Schema (Union)
 * 
 * Supports two modes for backward compatibility:
 * 1. **Plain string** — Direct label text (legacy/simple usage)
 * 2. **I18n object** — Structured translation key with parameters
 * 
 * This union type allows gradual migration from hardcoded strings
 * to fully internationalized labels without breaking existing configurations.
 * 
 * @example Plain string (backward compatible)
 * ```typescript
 * const label: I18nLabel = "All Active";
 * ```
 * 
 * @example I18n object
 * ```typescript
 * const label: I18nLabel = {
 *   key: "views.task_list.label",
 *   defaultValue: "Task List",
 * };
 * ```
 */
export const I18nLabelSchema = z.union([
  z.string(),
  I18nObjectSchema,
]).describe('Display label: plain string or i18n translation object');

export type I18nLabel = z.infer<typeof I18nLabelSchema>;

/**
 * ARIA Accessibility Properties Schema
 * 
 * Common ARIA attributes for UI components to support screen readers
 * and assistive technologies.
 * 
 * Aligned with WAI-ARIA 1.2 specification.
 * 
 * @see https://www.w3.org/TR/wai-aria-1.2/
 * 
 * @example
 * ```typescript
 * const aria: AriaProps = {
 *   ariaLabel: 'Close dialog',
 *   ariaDescribedBy: 'dialog-description',
 *   role: 'dialog',
 * };
 * ```
 */
export const AriaPropsSchema = z.object({
  /** Accessible label for screen readers */
  ariaLabel: I18nLabelSchema.optional().describe('Accessible label for screen readers (WAI-ARIA aria-label)'),

  /** ID of element that describes this component */
  ariaDescribedBy: z.string().optional().describe('ID of element providing additional description (WAI-ARIA aria-describedby)'),

  /** WAI-ARIA role override */
  role: z.string().optional().describe('WAI-ARIA role attribute (e.g., "dialog", "navigation", "alert")'),
}).describe('ARIA accessibility attributes');

export type AriaProps = z.infer<typeof AriaPropsSchema>;
