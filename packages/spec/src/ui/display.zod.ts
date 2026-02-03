import { z } from 'zod';

/**
 * ══════════════════════════════════════════════════════════════════════════════
 * DISPLAY COMPONENTS PROTOCOL
 * ══════════════════════════════════════════════════════════════════════════════
 * 
 * Read-only components for displaying data in enterprise management software.
 * Optimized for both desktop and mobile viewing.
 * 
 * **Design Principles:**
 * - Semantic HTML for accessibility
 * - Responsive typography
 * - Clear visual hierarchy
 * - Mobile-optimized layouts
 * - Progressive loading
 */

// ══════════════════════════════════════════════════════════════════════════════
// 1. TEXT DISPLAY COMPONENTS
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Label/Text Display Props
 * Basic text display with formatting options
 */
export const LabelPropsSchema = z.object({
  text: z.string().describe('Text content'),
  size: z.enum(['xs', 'sm', 'base', 'lg', 'xl', '2xl', '3xl', '4xl']).default('base').describe('Text size'),
  weight: z.enum(['light', 'normal', 'medium', 'semibold', 'bold']).default('normal').describe('Font weight'),
  color: z.enum(['default', 'primary', 'secondary', 'success', 'warning', 'error', 'info', 'muted']).default('default').describe('Text color variant'),
  align: z.enum(['left', 'center', 'right', 'justify']).default('left').describe('Text alignment'),
  transform: z.enum(['none', 'uppercase', 'lowercase', 'capitalize']).optional().describe('Text transformation'),
  truncate: z.boolean().default(false).describe('Truncate with ellipsis'),
  maxLines: z.number().int().positive().optional().describe('Max lines before truncation'),
  italic: z.boolean().default(false).describe('Italic style'),
  underline: z.boolean().default(false).describe('Underline style'),
  strikethrough: z.boolean().default(false).describe('Strikethrough style'),
});

/**
 * Badge Props
 * Small status indicator or count
 */
export const BadgePropsSchema = z.object({
  text: z.string().describe('Badge text/count'),
  variant: z.enum(['default', 'primary', 'secondary', 'success', 'warning', 'error', 'info']).default('default').describe('Color variant'),
  size: z.enum(['small', 'medium', 'large']).default('medium').describe('Badge size'),
  shape: z.enum(['square', 'rounded', 'pill']).default('rounded').describe('Badge shape'),
  outline: z.boolean().default(false).describe('Outline style instead of filled'),
  dot: z.boolean().default(false).describe('Show as dot only (no text)'),
  position: z.enum(['top-right', 'top-left', 'bottom-right', 'bottom-left']).optional().describe('Position relative to parent'),
  pulse: z.boolean().default(false).describe('Pulsing animation'),
});

/**
 * Tag Props
 * Removable label/category indicator
 */
export const TagPropsSchema = z.object({
  text: z.string().describe('Tag text'),
  color: z.string().optional().describe('Custom color (hex, rgb, etc.)'),
  variant: z.enum(['default', 'primary', 'secondary', 'success', 'warning', 'error', 'info']).default('default').describe('Color variant'),
  size: z.enum(['small', 'medium', 'large']).default('medium').describe('Tag size'),
  closable: z.boolean().default(false).describe('Show close button'),
  icon: z.string().optional().describe('Icon name to display'),
  iconPosition: z.enum(['left', 'right']).default('left').describe('Icon position'),
  bordered: z.boolean().default(true).describe('Show border'),
});

/**
 * Pill Props
 * Rounded label (similar to tag but more prominent)
 */
export const PillPropsSchema = z.object({
  text: z.string().describe('Pill text'),
  variant: z.enum(['default', 'primary', 'secondary', 'success', 'warning', 'error', 'info']).default('default').describe('Color variant'),
  size: z.enum(['small', 'medium', 'large']).default('medium').describe('Pill size'),
  icon: z.string().optional().describe('Icon name'),
  removable: z.boolean().default(false).describe('Show remove button'),
  clickable: z.boolean().default(false).describe('Clickable pill'),
});

// ══════════════════════════════════════════════════════════════════════════════
// 2. RICH CONTENT DISPLAY COMPONENTS
// ══════════════════════════════════════════════════════════════════════════════

/**
 * HTML Content Display Props
 * Safely render HTML content
 */
export const HtmlContentPropsSchema = z.object({
  html: z.string().describe('HTML content'),
  sanitize: z.boolean().default(true).describe('Sanitize HTML to prevent XSS'),
  allowedTags: z.array(z.string()).optional().describe('Allowed HTML tags (when sanitizing)'),
  maxHeight: z.string().optional().describe('Maximum height before scroll'),
  className: z.string().optional().describe('Custom CSS class'),
});

/**
 * Markdown Content Display Props
 * Render Markdown as formatted HTML
 */
export const MarkdownContentPropsSchema = z.object({
  markdown: z.string().describe('Markdown content'),
  sanitize: z.boolean().default(true).describe('Sanitize output HTML'),
  enableGfm: z.boolean().default(true).describe('Enable GitHub Flavored Markdown'),
  enableCodeHighlight: z.boolean().default(true).describe('Enable syntax highlighting for code blocks'),
  theme: z.enum(['light', 'dark']).default('light').describe('Code highlight theme'),
  maxHeight: z.string().optional().describe('Maximum height before scroll'),
  showCopyButton: z.boolean().default(true).describe('Show copy button on code blocks'),
});

/**
 * Code Block Display Props
 * Syntax-highlighted code display
 */
export const CodeBlockPropsSchema = z.object({
  code: z.string().describe('Code content'),
  language: z.string().default('javascript').describe('Programming language'),
  theme: z.enum(['vs-light', 'vs-dark', 'github-light', 'github-dark']).default('vs-light').describe('Syntax theme'),
  showLineNumbers: z.boolean().default(true).describe('Show line numbers'),
  highlightLines: z.array(z.number().int().positive()).optional().describe('Line numbers to highlight'),
  wrapLines: z.boolean().default(false).describe('Wrap long lines'),
  showCopyButton: z.boolean().default(true).describe('Show copy to clipboard button'),
  fileName: z.string().optional().describe('Optional filename header'),
  maxHeight: z.string().optional().describe('Maximum height before scroll'),
});

// ══════════════════════════════════════════════════════════════════════════════
// 3. MEDIA DISPLAY COMPONENTS
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Image Display Props
 * Display images with various options
 */
export const ImagePropsSchema = z.object({
  src: z.string().url().describe('Image source URL'),
  alt: z.string().describe('Alternative text for accessibility'),
  width: z.union([z.number(), z.string()]).optional().describe('Image width'),
  height: z.union([z.number(), z.string()]).optional().describe('Image height'),
  fit: z.enum(['contain', 'cover', 'fill', 'none', 'scale-down']).default('cover').describe('Object-fit mode'),
  shape: z.enum(['square', 'rounded', 'circle']).default('square').describe('Image shape'),
  placeholder: z.string().optional().describe('Placeholder image URL'),
  lazy: z.boolean().default(true).describe('Lazy load image'),
  showSkeleton: z.boolean().default(true).describe('Show skeleton loader while loading'),
  preview: z.boolean().default(false).describe('Enable image preview/lightbox'),
  fallback: z.string().optional().describe('Fallback image on error'),
  caption: z.string().optional().describe('Image caption'),
});

/**
 * Avatar Display Props
 * User/entity avatar with fallback
 */
export const AvatarPropsSchema = z.object({
  src: z.string().url().optional().describe('Avatar image URL'),
  name: z.string().describe('Name for fallback initials'),
  size: z.enum(['xs', 'sm', 'md', 'lg', 'xl', '2xl']).default('md').describe('Avatar size'),
  shape: z.enum(['circle', 'square', 'rounded']).default('circle').describe('Avatar shape'),
  showBorder: z.boolean().default(false).describe('Show border'),
  status: z.enum(['online', 'offline', 'away', 'busy']).optional().describe('Status indicator'),
  statusPosition: z.enum(['top-right', 'top-left', 'bottom-right', 'bottom-left']).default('bottom-right').describe('Status indicator position'),
  fallbackIcon: z.string().optional().describe('Icon to show when no image'),
  backgroundColor: z.string().optional().describe('Background color for initials'),
});

/**
 * Avatar Group Props
 * Display multiple avatars in a group
 */
export const AvatarGroupPropsSchema = z.object({
  avatars: z.array(AvatarPropsSchema).describe('Array of avatar configurations'),
  max: z.number().int().positive().optional().describe('Maximum avatars to show'),
  size: z.enum(['xs', 'sm', 'md', 'lg', 'xl', '2xl']).default('md').describe('Avatar size'),
  spacing: z.enum(['none', 'small', 'medium', 'large']).default('medium').describe('Space between avatars'),
  overlap: z.boolean().default(true).describe('Overlap avatars'),
  showTooltip: z.boolean().default(true).describe('Show name on hover'),
});

/**
 * Icon Display Props
 * Display icons with various styles
 */
export const IconPropsSchema = z.object({
  name: z.string().describe('Icon name (Lucide icons)'),
  size: z.union([z.enum(['xs', 'sm', 'md', 'lg', 'xl', '2xl']), z.number()]).default('md').describe('Icon size'),
  color: z.string().optional().describe('Icon color'),
  strokeWidth: z.number().positive().optional().describe('Stroke width for outline icons'),
  fill: z.boolean().default(false).describe('Fill icon'),
  spin: z.boolean().default(false).describe('Spinning animation'),
  pulse: z.boolean().default(false).describe('Pulsing animation'),
});

/**
 * Video Embed Props
 * Embed video player
 */
export const VideoEmbedPropsSchema = z.object({
  src: z.string().url().describe('Video source URL or embed URL'),
  provider: z.enum(['youtube', 'vimeo', 'custom']).optional().describe('Video provider'),
  aspectRatio: z.enum(['16:9', '4:3', '1:1', '21:9']).default('16:9').describe('Video aspect ratio'),
  autoplay: z.boolean().default(false).describe('Autoplay video'),
  controls: z.boolean().default(true).describe('Show video controls'),
  muted: z.boolean().default(false).describe('Mute video'),
  loop: z.boolean().default(false).describe('Loop video'),
  thumbnail: z.string().url().optional().describe('Thumbnail image URL'),
});

// ══════════════════════════════════════════════════════════════════════════════
// 4. PROGRESS & LOADING COMPONENTS
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Progress Bar Props
 * Linear progress indicator
 */
export const ProgressBarPropsSchema = z.object({
  value: z.number().min(0).max(100).describe('Progress value (0-100)'),
  variant: z.enum(['default', 'primary', 'success', 'warning', 'error', 'info']).default('primary').describe('Color variant'),
  size: z.enum(['small', 'medium', 'large']).default('medium').describe('Progress bar height'),
  showLabel: z.boolean().default(false).describe('Show percentage label'),
  labelPosition: z.enum(['inside', 'outside', 'top']).default('outside').describe('Label position'),
  striped: z.boolean().default(false).describe('Striped pattern'),
  animated: z.boolean().default(false).describe('Animated stripes'),
  indeterminate: z.boolean().default(false).describe('Indeterminate/loading state'),
});

/**
 * Progress Circle Props
 * Circular progress indicator
 */
export const ProgressCirclePropsSchema = z.object({
  value: z.number().min(0).max(100).describe('Progress value (0-100)'),
  size: z.union([z.enum(['small', 'medium', 'large', 'xl']), z.number()]).default('medium').describe('Circle diameter'),
  strokeWidth: z.number().positive().optional().describe('Stroke width'),
  variant: z.enum(['default', 'primary', 'success', 'warning', 'error', 'info']).default('primary').describe('Color variant'),
  showLabel: z.boolean().default(true).describe('Show percentage in center'),
  labelFormat: z.enum(['percentage', 'fraction', 'custom']).default('percentage').describe('Label format'),
  customLabel: z.string().optional().describe('Custom label text'),
  indeterminate: z.boolean().default(false).describe('Indeterminate/loading state'),
});

/**
 * Spinner Props
 * Loading spinner
 */
export const SpinnerPropsSchema = z.object({
  size: z.union([z.enum(['xs', 'sm', 'md', 'lg', 'xl']), z.number()]).default('md').describe('Spinner size'),
  variant: z.enum(['default', 'primary', 'secondary']).default('default').describe('Color variant'),
  type: z.enum(['circle', 'dots', 'bars', 'pulse']).default('circle').describe('Spinner animation type'),
  label: z.string().optional().describe('Accessible label'),
  showLabel: z.boolean().default(false).describe('Show label text'),
});

/**
 * Skeleton Props
 * Placeholder loading skeleton
 */
export const SkeletonPropsSchema = z.object({
  variant: z.enum(['text', 'circle', 'rect', 'rounded']).default('text').describe('Skeleton shape'),
  width: z.union([z.number(), z.string()]).optional().describe('Skeleton width'),
  height: z.union([z.number(), z.string()]).optional().describe('Skeleton height'),
  count: z.number().int().positive().default(1).describe('Number of skeleton lines'),
  animation: z.enum(['pulse', 'wave', 'none']).default('pulse').describe('Animation type'),
  spacing: z.string().optional().describe('Spacing between skeleton items'),
});

// ══════════════════════════════════════════════════════════════════════════════
// 5. STATS & METRICS COMPONENTS
// ══════════════════════════════════════════════════════════════════════════════

/**
 * KPI Card Props
 * Key Performance Indicator display
 */
export const KpiCardPropsSchema = z.object({
  title: z.string().describe('KPI title'),
  value: z.union([z.string(), z.number()]).describe('KPI value'),
  icon: z.string().optional().describe('Icon name'),
  trend: z.object({
    value: z.number().describe('Trend value (e.g., +12.5)'),
    direction: z.enum(['up', 'down', 'neutral']).describe('Trend direction'),
    label: z.string().optional().describe('Trend label (e.g., "vs last month")'),
  }).optional().describe('Trend indicator'),
  variant: z.enum(['default', 'primary', 'success', 'warning', 'error', 'info']).default('default').describe('Color variant'),
  size: z.enum(['small', 'medium', 'large']).default('medium').describe('Card size'),
  loading: z.boolean().default(false).describe('Loading state'),
  prefix: z.string().optional().describe('Value prefix (e.g., "$")'),
  suffix: z.string().optional().describe('Value suffix (e.g., "%")'),
});

/**
 * Stat Group Props
 * Multiple statistics display
 */
export const StatGroupPropsSchema = z.object({
  stats: z.array(z.object({
    label: z.string(),
    value: z.union([z.string(), z.number()]),
    icon: z.string().optional(),
    change: z.number().optional(),
    changeLabel: z.string().optional(),
  })).describe('Array of statistics'),
  columns: z.number().int().min(1).max(6).default(3).describe('Number of columns'),
  bordered: z.boolean().default(false).describe('Show borders between stats'),
  divider: z.boolean().default(true).describe('Show divider between stats'),
});

/**
 * Trend Indicator Props
 * Show value change/trend
 */
export const TrendIndicatorPropsSchema = z.object({
  value: z.number().describe('Trend value'),
  direction: z.enum(['up', 'down', 'neutral']).optional().describe('Override auto-detected direction'),
  showIcon: z.boolean().default(true).describe('Show trend arrow icon'),
  showSign: z.boolean().default(true).describe('Show +/- sign'),
  format: z.enum(['number', 'percentage', 'currency']).default('number').describe('Value format'),
  colorCoded: z.boolean().default(true).describe('Color code (green=up, red=down)'),
  invertColors: z.boolean().default(false).describe('Invert color meaning (red=up, green=down)'),
  size: z.enum(['small', 'medium', 'large']).default('medium').describe('Indicator size'),
  label: z.string().optional().describe('Additional label text'),
});

/**
 * Gauge Display Props
 * Gauge/meter visualization
 */
export const GaugePropsSchema = z.object({
  value: z.number().describe('Current value'),
  min: z.number().default(0).describe('Minimum value'),
  max: z.number().default(100).describe('Maximum value'),
  size: z.union([z.enum(['small', 'medium', 'large']), z.number()]).default('medium').describe('Gauge size'),
  showValue: z.boolean().default(true).describe('Show value in center'),
  showRange: z.boolean().default(true).describe('Show min/max labels'),
  thresholds: z.array(z.object({
    value: z.number(),
    color: z.string(),
    label: z.string().optional(),
  })).optional().describe('Color thresholds'),
  unit: z.string().optional().describe('Unit label'),
  format: z.enum(['number', 'percentage', 'currency']).default('number').describe('Value format'),
  type: z.enum(['arc', 'circle', 'semi-circle']).default('arc').describe('Gauge shape'),
});

// ══════════════════════════════════════════════════════════════════════════════
// 6. INFORMATIONAL COMPONENTS
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Description List Props
 * Key-value pairs display
 */
export const DescriptionListPropsSchema = z.object({
  items: z.array(z.object({
    term: z.string().describe('Term/label'),
    description: z.union([z.string(), z.array(z.string())]).describe('Description/value'),
    icon: z.string().optional().describe('Icon for term'),
  })).describe('List items'),
  layout: z.enum(['horizontal', 'vertical']).default('horizontal').describe('Layout direction'),
  columns: z.number().int().min(1).max(4).default(1).describe('Number of columns'),
  bordered: z.boolean().default(false).describe('Show borders'),
  colon: z.boolean().default(true).describe('Show colon after term'),
  size: z.enum(['small', 'medium', 'large']).default('medium').describe('Text size'),
  labelStyle: z.enum(['default', 'bold', 'muted']).default('bold').describe('Label style'),
});

/**
 * Timeline Display Props
 * Chronological events timeline
 */
export const TimelinePropsSchema = z.object({
  items: z.array(z.object({
    timestamp: z.string().describe('Event timestamp (ISO 8601 or formatted)'),
    title: z.string().describe('Event title'),
    description: z.string().optional().describe('Event description'),
    icon: z.string().optional().describe('Custom icon'),
    color: z.string().optional().describe('Dot color'),
    status: z.enum(['default', 'success', 'warning', 'error', 'info']).optional().describe('Status variant'),
  })).describe('Timeline events'),
  mode: z.enum(['left', 'right', 'alternate']).default('left').describe('Timeline alignment'),
  pending: z.boolean().default(false).describe('Show pending indicator'),
  reverse: z.boolean().default(false).describe('Reverse chronological order'),
  size: z.enum(['small', 'medium', 'large']).default('medium').describe('Timeline size'),
});

/**
 * Divider Props
 * Visual separator
 */
export const DividerPropsSchema = z.object({
  orientation: z.enum(['horizontal', 'vertical']).default('horizontal').describe('Divider orientation'),
  variant: z.enum(['solid', 'dashed', 'dotted']).default('solid').describe('Line style'),
  thickness: z.enum(['thin', 'medium', 'thick']).default('thin').describe('Line thickness'),
  spacing: z.enum(['none', 'small', 'medium', 'large']).default('medium').describe('Spacing around divider'),
  text: z.string().optional().describe('Text in the middle of divider'),
  textAlign: z.enum(['left', 'center', 'right']).default('center').describe('Text alignment'),
});

// ══════════════════════════════════════════════════════════════════════════════
// COMPONENT REGISTRATION
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Display Component Props Map
 * Maps component types to their property schemas
 */
export const DisplayComponentPropsMap = {
  // Text
  'display:label': LabelPropsSchema,
  'display:badge': BadgePropsSchema,
  'display:tag': TagPropsSchema,
  'display:pill': PillPropsSchema,
  
  // Rich Content
  'display:html': HtmlContentPropsSchema,
  'display:markdown': MarkdownContentPropsSchema,
  'display:code': CodeBlockPropsSchema,
  
  // Media
  'display:image': ImagePropsSchema,
  'display:avatar': AvatarPropsSchema,
  'display:avatar_group': AvatarGroupPropsSchema,
  'display:icon': IconPropsSchema,
  'display:video': VideoEmbedPropsSchema,
  
  // Progress
  'display:progress_bar': ProgressBarPropsSchema,
  'display:progress_circle': ProgressCirclePropsSchema,
  'display:spinner': SpinnerPropsSchema,
  'display:skeleton': SkeletonPropsSchema,
  
  // Stats/Metrics
  'display:kpi_card': KpiCardPropsSchema,
  'display:stat_group': StatGroupPropsSchema,
  'display:trend': TrendIndicatorPropsSchema,
  'display:gauge': GaugePropsSchema,
  
  // Informational
  'display:description_list': DescriptionListPropsSchema,
  'display:timeline': TimelinePropsSchema,
  'display:divider': DividerPropsSchema,
} as const;

// ══════════════════════════════════════════════════════════════════════════════
// TYPE EXPORTS
// ══════════════════════════════════════════════════════════════════════════════

export type LabelProps = z.infer<typeof LabelPropsSchema>;
export type BadgeProps = z.infer<typeof BadgePropsSchema>;
export type TagProps = z.infer<typeof TagPropsSchema>;
export type PillProps = z.infer<typeof PillPropsSchema>;

export type HtmlContentProps = z.infer<typeof HtmlContentPropsSchema>;
export type MarkdownContentProps = z.infer<typeof MarkdownContentPropsSchema>;
export type CodeBlockProps = z.infer<typeof CodeBlockPropsSchema>;

export type ImageProps = z.infer<typeof ImagePropsSchema>;
export type AvatarProps = z.infer<typeof AvatarPropsSchema>;
export type AvatarGroupProps = z.infer<typeof AvatarGroupPropsSchema>;
export type IconProps = z.infer<typeof IconPropsSchema>;
export type VideoEmbedProps = z.infer<typeof VideoEmbedPropsSchema>;

export type ProgressBarProps = z.infer<typeof ProgressBarPropsSchema>;
export type ProgressCircleProps = z.infer<typeof ProgressCirclePropsSchema>;
export type SpinnerProps = z.infer<typeof SpinnerPropsSchema>;
export type SkeletonProps = z.infer<typeof SkeletonPropsSchema>;

export type KpiCardProps = z.infer<typeof KpiCardPropsSchema>;
export type StatGroupProps = z.infer<typeof StatGroupPropsSchema>;
export type TrendIndicatorProps = z.infer<typeof TrendIndicatorPropsSchema>;
export type GaugeProps = z.infer<typeof GaugePropsSchema>;

export type DescriptionListProps = z.infer<typeof DescriptionListPropsSchema>;
export type TimelineProps = z.infer<typeof TimelinePropsSchema>;
export type DividerProps = z.infer<typeof DividerPropsSchema>;
