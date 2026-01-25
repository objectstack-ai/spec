import React from 'react';
import type { Theme } from '@objectstack/spec/ui';

/**
 * Base props that all ObjectStack UI components receive
 */
export interface ComponentProps {
  /** Component configuration from metadata */
  properties: Record<string, any>;
  
  /** Current data context */
  data?: any;
  
  /** Callback for value changes */
  onChange?: (value: any) => void;
  
  /** Callback for actions */
  onAction?: (action: string, params?: any) => void;
  
  /** Theme configuration */
  theme?: Theme;
  
  /** Additional className for styling */
  className?: string;
}

/**
 * Custom Button Component
 * 
 * A flexible button component with multiple variants and states.
 * 
 * @example
 * ```tsx
 * <CustomButton
 *   properties={{
 *     label: 'Save',
 *     variant: 'primary',
 *     icon: 'save',
 *     disabled: false
 *   }}
 *   onAction={(action) => console.log('Button clicked:', action)}
 * />
 * ```
 */
export const CustomButton: React.FC<ComponentProps> = ({
  properties,
  onAction,
  theme,
  className = '',
}) => {
  const {
    label,
    variant = 'primary',
    icon,
    disabled = false,
    loading = false,
    size = 'medium',
  } = properties;

  const handleClick = () => {
    if (!disabled && !loading && onAction) {
      onAction('click', { label });
    }
  };

  // Build dynamic styles from theme
  const variantStyles: Record<string, React.CSSProperties> = {
    primary: {
      backgroundColor: theme?.colors?.primary || '#4169E1',
      color: '#FFFFFF',
      border: 'none',
    },
    secondary: {
      backgroundColor: 'transparent',
      color: theme?.colors?.primary || '#4169E1',
      border: `2px solid ${theme?.colors?.primary || '#4169E1'}`,
    },
    success: {
      backgroundColor: theme?.colors?.success || '#00AA00',
      color: '#FFFFFF',
      border: 'none',
    },
    danger: {
      backgroundColor: theme?.colors?.error || '#FF0000',
      color: '#FFFFFF',
      border: 'none',
    },
  };

  const sizeStyles: Record<string, React.CSSProperties> = {
    small: { padding: '6px 12px', fontSize: '14px' },
    medium: { padding: '10px 20px', fontSize: '16px' },
    large: { padding: '14px 28px', fontSize: '18px' },
  };

  const buttonStyle: React.CSSProperties = {
    ...variantStyles[variant],
    ...sizeStyles[size],
    borderRadius: theme?.borderRadius?.md || '8px',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.6 : 1,
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    fontWeight: 600,
    transition: 'all 0.2s ease',
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled || loading}
      style={buttonStyle}
      className={className}
      aria-label={label}
      aria-disabled={disabled}
    >
      {loading && <span className="spinner">⏳</span>}
      {icon && !loading && <span className="icon">{icon}</span>}
      {label}
    </button>
  );
};

CustomButton.displayName = 'CustomButton';
