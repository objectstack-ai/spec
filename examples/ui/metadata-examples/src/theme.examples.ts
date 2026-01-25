// @ts-nocheck
import { Theme } from '@objectstack/spec/ui';

/**
 * Theme Examples - Demonstrating ObjectStack Theme Protocol
 * 
 * Themes define the visual styling and branding of applications.
 * Inspired by Material Design, Tailwind, and Salesforce Lightning Design System.
 */

// ============================================================================
// LIGHT THEMES
// ============================================================================

/**
 * Example 1: Default Light Theme
 * Clean, professional light theme
 * Use Case: Default theme for most applications
 */
export const DefaultLightTheme: Theme = {
  name: 'default_light',
  label: 'Default Light',
  description: 'Clean and professional light theme',
  mode: 'light',
  
  colors: {
    // Brand Colors
    primary: '#4169E1',      // Royal Blue
    secondary: '#9370DB',    // Medium Purple
    accent: '#FFA500',       // Orange
    
    // Semantic Colors
    success: '#00AA00',      // Green
    warning: '#FFA500',      // Orange
    error: '#FF0000',        // Red
    info: '#4169E1',         // Blue
    
    // Neutral Colors
    background: '#FFFFFF',
    surface: '#F8F9FA',
    border: '#E5E7EB',
    text: '#1F2937',
    textSecondary: '#6B7280',
    textDisabled: '#9CA3AF',
    
    // Interactive States
    hover: '#F3F4F6',
    active: '#E5E7EB',
    focus: '#DBEAFE',
    disabled: '#F3F4F6',
  },
  
  typography: {
    fontFamily: {
      heading: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      body: '"Roboto", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      mono: '"Fira Code", "Courier New", monospace',
    },
    fontSize: {
      xs: '12px',
      sm: '14px',
      base: '16px',
      lg: '18px',
      xl: '20px',
      '2xl': '24px',
      '3xl': '30px',
      '4xl': '36px',
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    lineHeight: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75,
    },
  },
  
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    '2xl': '48px',
  },
  
  borderRadius: {
    none: '0',
    sm: '4px',
    md: '8px',
    lg: '12px',
    full: '9999px',
  },
  
  shadows: {
    none: 'none',
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
  },
  
  components: {
    button: {
      primary: {
        backgroundColor: '{colors.primary}',
        color: '#FFFFFF',
        borderRadius: '{borderRadius.md}',
        padding: '{spacing.sm} {spacing.md}',
      },
      secondary: {
        backgroundColor: 'transparent',
        color: '{colors.primary}',
        border: '1px solid {colors.primary}',
        borderRadius: '{borderRadius.md}',
        padding: '{spacing.sm} {spacing.md}',
      },
    },
    input: {
      borderColor: '{colors.border}',
      borderRadius: '{borderRadius.md}',
      padding: '{spacing.sm}',
      focusBorderColor: '{colors.primary}',
    },
    card: {
      backgroundColor: '{colors.surface}',
      borderRadius: '{borderRadius.lg}',
      padding: '{spacing.lg}',
      shadow: '{shadows.md}',
    },
  },
};

/**
 * Example 2: Professional Blue Theme
 * Corporate-friendly blue theme
 * Use Case: Enterprise applications, financial services
 */
export const ProfessionalBlueTheme: Theme = {
  name: 'professional_blue',
  label: 'Professional Blue',
  description: 'Corporate blue theme for enterprise applications',
  mode: 'light',
  
  colors: {
    primary: '#0066CC',
    secondary: '#003D7A',
    accent: '#00A3E0',
    success: '#008A00',
    warning: '#FF9900',
    error: '#CC0000',
    info: '#0066CC',
    background: '#FFFFFF',
    surface: '#F5F8FA',
    border: '#D1D5DB',
    text: '#1A1A1A',
    textSecondary: '#4A5568',
    textDisabled: '#A0AEC0',
    hover: '#EDF2F7',
    active: '#E2E8F0',
    focus: '#DBEAFE',
    disabled: '#F7FAFC',
  },
  
  typography: {
    fontFamily: {
      heading: '"Open Sans", sans-serif',
      body: '"Lato", sans-serif',
      mono: '"Source Code Pro", monospace',
    },
    fontSize: {
      xs: '11px',
      sm: '13px',
      base: '15px',
      lg: '17px',
      xl: '20px',
      '2xl': '24px',
      '3xl': '28px',
      '4xl': '32px',
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    lineHeight: {
      tight: 1.2,
      normal: 1.5,
      relaxed: 1.8,
    },
  },
  
  borderRadius: {
    none: '0',
    sm: '2px',
    md: '4px',
    lg: '6px',
    full: '9999px',
  },
  
  shadows: {
    sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
  },
};

// ============================================================================
// DARK THEMES
// ============================================================================

/**
 * Example 3: Dark Theme
 * Modern dark theme for reduced eye strain
 * Use Case: Late-night work, preference for dark UIs
 */
export const DarkTheme: Theme = {
  name: 'dark',
  label: 'Dark',
  description: 'Modern dark theme',
  mode: 'dark',
  
  colors: {
    primary: '#60A5FA',      // Light Blue
    secondary: '#A78BFA',    // Light Purple
    accent: '#FBBF24',       // Amber
    success: '#34D399',      // Green
    warning: '#FBBF24',      // Amber
    error: '#F87171',        // Red
    info: '#60A5FA',         // Light Blue
    background: '#111827',   // Dark Gray
    surface: '#1F2937',      // Lighter Dark Gray
    border: '#374151',       // Border Gray
    text: '#F9FAFB',         // Near White
    textSecondary: '#D1D5DB', // Light Gray
    textDisabled: '#6B7280', // Medium Gray
    hover: '#374151',
    active: '#4B5563',
    focus: '#1E3A5F',
    disabled: '#374151',
  },
  
  typography: {
    fontFamily: {
      heading: '"Inter", sans-serif',
      body: '"Roboto", sans-serif',
      mono: '"Fira Code", monospace',
    },
    fontSize: {
      xs: '12px',
      sm: '14px',
      base: '16px',
      lg: '18px',
      xl: '20px',
      '2xl': '24px',
      '3xl': '30px',
      '4xl': '36px',
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    lineHeight: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75,
    },
  },
  
  borderRadius: {
    none: '0',
    sm: '4px',
    md: '8px',
    lg: '12px',
    full: '9999px',
  },
  
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.3)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.4)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.5)',
  },
  
  components: {
    button: {
      primary: {
        backgroundColor: '{colors.primary}',
        color: '{colors.background}',
        borderRadius: '{borderRadius.md}',
      },
      secondary: {
        backgroundColor: 'transparent',
        color: '{colors.primary}',
        border: '1px solid {colors.primary}',
        borderRadius: '{borderRadius.md}',
      },
    },
    input: {
      backgroundColor: '{colors.surface}',
      borderColor: '{colors.border}',
      color: '{colors.text}',
      borderRadius: '{borderRadius.md}',
    },
    card: {
      backgroundColor: '{colors.surface}',
      borderRadius: '{borderRadius.lg}',
      border: '1px solid {colors.border}',
    },
  },
};

// ============================================================================
// COLORFUL THEMES
// ============================================================================

/**
 * Example 4: Vibrant Theme
 * Colorful, energetic theme
 * Use Case: Creative teams, marketing, design agencies
 */
export const VibrantTheme: Theme = {
  name: 'vibrant',
  label: 'Vibrant',
  description: 'Energetic and colorful theme',
  mode: 'light',
  
  colors: {
    primary: '#7C3AED',      // Vivid Purple
    secondary: '#EC4899',    // Pink
    accent: '#F59E0B',       // Amber
    success: '#10B981',      // Emerald
    warning: '#F59E0B',      // Amber
    error: '#EF4444',        // Red
    info: '#3B82F6',         // Blue
    background: '#FFFFFF',
    surface: '#FAFAFA',
    border: '#E5E7EB',
    text: '#1F2937',
    textSecondary: '#6B7280',
    textDisabled: '#9CA3AF',
    hover: '#F3F4F6',
    active: '#E5E7EB',
    focus: '#F3E8FF',
    disabled: '#F3F4F6',
  },
  
  typography: {
    fontFamily: {
      heading: '"Poppins", sans-serif',
      body: '"Nunito", sans-serif',
      mono: '"JetBrains Mono", monospace',
    },
    fontSize: {
      xs: '12px',
      sm: '14px',
      base: '16px',
      lg: '18px',
      xl: '20px',
      '2xl': '24px',
      '3xl': '30px',
      '4xl': '36px',
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    lineHeight: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75,
    },
  },
  
  borderRadius: {
    none: '0',
    sm: '6px',
    md: '12px',
    lg: '16px',
    full: '9999px',
  },
  
  shadows: {
    sm: '0 2px 4px 0 rgba(124, 58, 237, 0.1)',
    md: '0 4px 8px -1px rgba(124, 58, 237, 0.15)',
    lg: '0 12px 20px -3px rgba(124, 58, 237, 0.2)',
  },
};

/**
 * Example 5: Nature Green Theme
 * Calm, nature-inspired green theme
 * Use Case: Sustainability, environmental, health applications
 */
export const NatureGreenTheme: Theme = {
  name: 'nature_green',
  label: 'Nature Green',
  description: 'Calm nature-inspired theme',
  mode: 'light',
  
  colors: {
    primary: '#059669',      // Emerald
    secondary: '#10B981',    // Green
    accent: '#84CC16',       // Lime
    success: '#22C55E',      // Green
    warning: '#EAB308',      // Yellow
    error: '#DC2626',        // Red
    info: '#06B6D4',         // Cyan
    background: '#FFFFFF',
    surface: '#F0FDF4',      // Green tint
    border: '#D1FAE5',
    text: '#064E3B',         // Dark Green
    textSecondary: '#047857',
    textDisabled: '#6EE7B7',
    hover: '#ECFDF5',
    active: '#D1FAE5',
    focus: '#A7F3D0',
    disabled: '#F0FDF4',
  },
  
  typography: {
    fontFamily: {
      heading: '"Merriweather", serif',
      body: '"Lato", sans-serif',
      mono: '"Courier Prime", monospace',
    },
    fontSize: {
      xs: '12px',
      sm: '14px',
      base: '16px',
      lg: '18px',
      xl: '20px',
      '2xl': '24px',
      '3xl': '30px',
      '4xl': '36px',
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    lineHeight: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75,
    },
  },
  
  borderRadius: {
    none: '0',
    sm: '4px',
    md: '8px',
    lg: '12px',
    full: '9999px',
  },
  
  shadows: {
    sm: '0 1px 2px 0 rgba(5, 150, 105, 0.1)',
    md: '0 4px 6px -1px rgba(5, 150, 105, 0.15)',
    lg: '0 10px 15px -3px rgba(5, 150, 105, 0.2)',
  },
};

// ============================================================================
// MINIMAL THEMES
// ============================================================================

/**
 * Example 6: Minimal Monochrome Theme
 * Ultra-minimal black and white theme
 * Use Case: Focus on content, minimalist aesthetics
 */
export const MinimalMonochromeTheme: Theme = {
  name: 'minimal_monochrome',
  label: 'Minimal Monochrome',
  description: 'Ultra-minimal black and white theme',
  mode: 'light',
  
  colors: {
    primary: '#000000',
    secondary: '#404040',
    accent: '#666666',
    success: '#000000',
    warning: '#000000',
    error: '#000000',
    info: '#000000',
    background: '#FFFFFF',
    surface: '#FAFAFA',
    border: '#E0E0E0',
    text: '#000000',
    textSecondary: '#666666',
    textDisabled: '#CCCCCC',
    hover: '#F5F5F5',
    active: '#E0E0E0',
    focus: '#EEEEEE',
    disabled: '#FAFAFA',
  },
  
  typography: {
    fontFamily: {
      heading: '"Helvetica Neue", Helvetica, Arial, sans-serif',
      body: '"Helvetica Neue", Helvetica, Arial, sans-serif',
      mono: '"Monaco", "Courier New", monospace',
    },
    fontSize: {
      xs: '12px',
      sm: '14px',
      base: '16px',
      lg: '18px',
      xl: '20px',
      '2xl': '24px',
      '3xl': '30px',
      '4xl': '36px',
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    lineHeight: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75,
    },
  },
  
  borderRadius: {
    none: '0',
    sm: '0',
    md: '0',
    lg: '0',
    full: '0',
  },
  
  shadows: {
    sm: 'none',
    md: 'none',
    lg: 'none',
  },
  
  components: {
    button: {
      primary: {
        backgroundColor: '#000000',
        color: '#FFFFFF',
        borderRadius: '0',
        padding: '12px 24px',
        border: 'none',
      },
      secondary: {
        backgroundColor: 'transparent',
        color: '#000000',
        border: '2px solid #000000',
        borderRadius: '0',
        padding: '10px 22px',
      },
    },
    input: {
      borderColor: '#000000',
      borderRadius: '0',
      border: '2px solid #000000',
      padding: '10px',
    },
    card: {
      backgroundColor: '#FFFFFF',
      border: '1px solid #E0E0E0',
      borderRadius: '0',
      padding: '24px',
    },
  },
};

// ============================================================================
// HIGH CONTRAST THEMES (Accessibility)
// ============================================================================

/**
 * Example 7: High Contrast Theme
 * WCAG AAA compliant high contrast theme
 * Use Case: Accessibility, visual impairments
 */
export const HighContrastTheme: Theme = {
  name: 'high_contrast',
  label: 'High Contrast',
  description: 'WCAG AAA compliant high contrast theme',
  mode: 'light',
  
  colors: {
    primary: '#0000FF',      // Pure Blue
    secondary: '#000080',    // Navy
    accent: '#FF8C00',       // Dark Orange
    success: '#008000',      // Pure Green
    warning: '#FF8C00',      // Dark Orange
    error: '#FF0000',        // Pure Red
    info: '#0000FF',         // Pure Blue
    background: '#FFFFFF',
    surface: '#FFFFFF',
    border: '#000000',
    text: '#000000',
    textSecondary: '#000000',
    textDisabled: '#767676',
    hover: '#FFFFCC',        // Light Yellow
    active: '#FFFF00',       // Yellow
    focus: '#FFFF00',        // Yellow
    disabled: '#C0C0C0',     // Silver
  },
  
  typography: {
    fontFamily: {
      heading: '"Arial", sans-serif',
      body: '"Arial", sans-serif',
      mono: '"Courier New", monospace',
    },
    fontSize: {
      xs: '14px',  // Larger minimum for accessibility
      sm: '16px',
      base: '18px',
      lg: '20px',
      xl: '24px',
      '2xl': '28px',
      '3xl': '32px',
      '4xl': '40px',
    },
    fontWeight: {
      normal: 400,
      medium: 600,
      semibold: 700,
      bold: 900,
    },
    lineHeight: {
      tight: 1.4,
      normal: 1.6,
      relaxed: 1.8,
    },
  },
  
  borderRadius: {
    none: '0',
    sm: '0',
    md: '0',
    lg: '0',
    full: '0',
  },
  
  shadows: {
    sm: 'none',
    md: 'none',
    lg: 'none',
  },
  
  components: {
    button: {
      primary: {
        backgroundColor: '#0000FF',
        color: '#FFFFFF',
        border: '3px solid #000000',
        borderRadius: '0',
        padding: '12px 24px',
        fontWeight: 700,
      },
      secondary: {
        backgroundColor: '#FFFFFF',
        color: '#000000',
        border: '3px solid #000000',
        borderRadius: '0',
        padding: '12px 24px',
        fontWeight: 700,
      },
    },
    input: {
      backgroundColor: '#FFFFFF',
      borderColor: '#000000',
      border: '3px solid #000000',
      borderRadius: '0',
      color: '#000000',
      padding: '12px',
      fontSize: '18px',
    },
    card: {
      backgroundColor: '#FFFFFF',
      border: '3px solid #000000',
      borderRadius: '0',
      padding: '24px',
    },
  },
};

// ============================================================================
// EXPORT ALL EXAMPLES
// ============================================================================

export const ThemeExamples = {
  DefaultLightTheme,
  ProfessionalBlueTheme,
  DarkTheme,
  VibrantTheme,
  NatureGreenTheme,
  MinimalMonochromeTheme,
  HighContrastTheme,
};
