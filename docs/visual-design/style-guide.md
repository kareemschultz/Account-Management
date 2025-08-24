# Account Management Style Guide
## Design System & Visual Identity

### Color Palette

#### Primary Colors
```css
/* Primary Brand Colors - Professional & Trustworthy */
--primary-50: #EFF6FF;   /* Very light blue background */
--primary-100: #DBEAFE;  /* Light blue accent */
--primary-200: #BFDBFE;  /* Medium light blue */
--primary-300: #93C5FD;  /* Medium blue */
--primary-400: #60A5FA;  /* Active blue */
--primary-500: #3B82F6;  /* Primary brand blue */
--primary-600: #2563EB;  /* Primary interactive blue */
--primary-700: #1D4ED8;  /* Dark blue */
--primary-800: #1E40AF;  /* Darker blue */
--primary-900: #1E3A8A;  /* Darkest blue */
```

#### Status Colors
```css
/* Success - Positive actions, active accounts, successful operations */
--success-50: #ECFDF5;
--success-100: #D1FAE5;
--success-200: #A7F3D0;
--success-300: #6EE7B7;
--success-400: #34D399;
--success-500: #10B981;
--success-600: #059669;   /* Primary success color */
--success-700: #047857;
--success-800: #065F46;
--success-900: #064E3B;

/* Warning - Pending actions, attention required, limited access */
--warning-50: #FFFBEB;
--warning-100: #FEF3C7;
--warning-200: #FDE68A;
--warning-300: #FCD34D;
--warning-400: #FBBF24;
--warning-500: #F59E0B;
--warning-600: #D97706;   /* Primary warning color */
--warning-700: #B45309;
--warning-800: #92400E;
--warning-900: #78350F;

/* Error - Failed operations, blocked access, critical issues */
--error-50: #FEF2F2;
--error-100: #FEE2E2;
--error-200: #FECACA;
--error-300: #FCA5A5;
--error-400: #F87171;
--error-500: #EF4444;
--error-600: #DC2626;     /* Primary error color */
--error-700: #B91C1C;
--error-800: #991B1B;
--error-900: #7F1D1D;

/* Info - System messages, help text, informational states */
--info-50: #F0F9FF;
--info-100: #E0F2FE;
--info-200: #BAE6FD;
--info-300: #7DD3FC;
--info-400: #38BDF8;
--info-500: #0EA5E9;
--info-600: #0284C7;     /* Primary info color */
--info-700: #0369A1;
--info-800: #075985;
--info-900: #0C4A6E;
```

#### Neutral Colors
```css
/* Grayscale - Text, backgrounds, borders */
--neutral-50: #F9FAFB;   /* Lightest background */
--neutral-100: #F3F4F6;  /* Light background */
--neutral-200: #E5E7EB;  /* Border light */
--neutral-300: #D1D5DB;  /* Border medium */
--neutral-400: #9CA3AF;  /* Text disabled */
--neutral-500: #6B7280;  /* Text muted */
--neutral-600: #4B5563;  /* Text secondary */
--neutral-700: #374151;  /* Text primary */
--neutral-800: #1F2937;  /* Text heading */
--neutral-900: #111827;  /* Text darkest */
```

#### Account Management Specific Colors
```css
/* Permission Levels */
--permission-admin: #7C3AED;     /* Purple - Admin access */
--permission-manager: #2563EB;   /* Blue - Manager access */
--permission-user: #059669;      /* Green - Standard user */
--permission-guest: #6B7280;     /* Gray - Guest/limited */
--permission-blocked: #DC2626;   /* Red - Blocked access */

/* Account Status */
--status-active: #059669;        /* Green - Active account */
--status-inactive: #6B7280;      /* Gray - Inactive */
--status-suspended: #D97706;     /* Orange - Suspended */
--status-pending: #7C3AED;       /* Purple - Pending approval */
--status-expired: #DC2626;       /* Red - Expired account */

/* Service Categories */
--service-essential: #059669;    /* Green - Core services */
--service-productivity: #2563EB; /* Blue - Productivity tools */
--service-communication: #7C3AED;/* Purple - Communication */
--service-security: #DC2626;     /* Red - Security services */
--service-analytics: #D97706;    /* Orange - Analytics tools */
```

### Typography System

#### Font Families
```css
/* Primary Font Stack - Optimized for data scanning */
--font-primary: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;

/* Monospace - For codes, IDs, technical data */
--font-mono: 'JetBrains Mono', 'Fira Code', Consolas, 'Liberation Mono', Menlo, monospace;

/* Numbers - Tabular figures for data alignment */
--font-tabular: 'Inter', system-ui, sans-serif;
font-variant-numeric: tabular-nums;
```

#### Font Sizes & Line Heights
```css
/* Display Sizes - For headers and emphasis */
--text-xs: 0.75rem;      /* 12px - Metadata, timestamps */
--text-sm: 0.875rem;     /* 14px - Body text, table data */
--text-base: 1rem;       /* 16px - Default body */
--text-lg: 1.125rem;     /* 18px - Large body text */
--text-xl: 1.25rem;      /* 20px - Small headings */
--text-2xl: 1.5rem;      /* 24px - Medium headings */
--text-3xl: 1.875rem;    /* 30px - Large headings */
--text-4xl: 2.25rem;     /* 36px - Page titles */

/* Line Heights */
--leading-tight: 1.25;   /* For headings */
--leading-normal: 1.5;   /* For body text */
--leading-relaxed: 1.625;/* For longer content */
```

#### Font Weights
```css
--font-light: 300;       /* Light emphasis */
--font-normal: 400;      /* Body text */
--font-medium: 500;      /* Emphasis, labels */
--font-semibold: 600;    /* Headings, important text */
--font-bold: 700;        /* Strong emphasis */
```

### Spacing System

#### Base Spacing Scale
```css
--space-1: 0.25rem;      /* 4px - Fine adjustments */
--space-2: 0.5rem;       /* 8px - Small gaps */
--space-3: 0.75rem;      /* 12px - Medium small gaps */
--space-4: 1rem;         /* 16px - Standard gap */
--space-5: 1.25rem;      /* 20px - Medium gap */
--space-6: 1.5rem;       /* 24px - Large gap */
--space-8: 2rem;         /* 32px - Section spacing */
--space-10: 2.5rem;      /* 40px - Large section spacing */
--space-12: 3rem;        /* 48px - Major section spacing */
--space-16: 4rem;        /* 64px - Page section spacing */
--space-20: 5rem;        /* 80px - Large page spacing */
```

#### Component Specific Spacing
```css
/* Cards & Containers */
--card-padding: var(--space-6);          /* 24px internal padding */
--card-gap: var(--space-4);              /* 16px between cards */

/* Tables */
--table-cell-padding-x: var(--space-3);  /* 12px horizontal */
--table-cell-padding-y: var(--space-4);  /* 16px vertical */
--table-row-gap: var(--space-2);         /* 8px between rows */

/* Forms */
--form-field-gap: var(--space-4);        /* 16px between fields */
--form-section-gap: var(--space-8);      /* 32px between sections */
--form-input-padding: var(--space-3);    /* 12px input padding */

/* Navigation */
--nav-item-padding: var(--space-3);      /* 12px nav item padding */
--nav-section-gap: var(--space-6);       /* 24px between nav sections */
```

### Layout & Grid System

#### Container Sizes
```css
--container-sm: 640px;    /* Small screens */
--container-md: 768px;    /* Medium screens */
--container-lg: 1024px;   /* Large screens */
--container-xl: 1280px;   /* Extra large screens */
--container-2xl: 1536px;  /* Maximum width */

--container-padding: var(--space-4); /* 16px mobile padding */
--container-padding-lg: var(--space-6); /* 24px desktop padding */
```

#### Grid Specifications
```css
/* 12-column responsive grid */
--grid-columns: 12;
--grid-gap: var(--space-6);          /* 24px gap between columns */
--grid-gap-sm: var(--space-4);       /* 16px gap on mobile */

/* Dashboard grid modules */
--module-1x1: 1fr;                   /* Single module */
--module-2x1: 2fr;                   /* Double width */
--module-1x2: 1fr / span 2;          /* Double height */
--module-full: 1fr / span 12;        /* Full width */
```

### Component Specifications

#### Buttons
```css
/* Button Sizes */
.btn-sm {
  padding: 0.5rem 1rem;     /* 8px 16px */
  font-size: 0.875rem;      /* 14px */
  min-height: 2rem;         /* 32px */
}

.btn-md {
  padding: 0.75rem 1.5rem;  /* 12px 24px */
  font-size: 0.875rem;      /* 14px */
  min-height: 2.5rem;       /* 40px */
}

.btn-lg {
  padding: 1rem 2rem;       /* 16px 32px */
  font-size: 1rem;          /* 16px */
  min-height: 3rem;         /* 48px */
}

/* Button Variants */
.btn-primary {
  background: var(--primary-600);
  color: white;
  border: 1px solid var(--primary-600);
}

.btn-secondary {
  background: white;
  color: var(--neutral-700);
  border: 1px solid var(--neutral-300);
}

.btn-danger {
  background: var(--error-600);
  color: white;
  border: 1px solid var(--error-600);
}
```

#### Cards
```css
.card {
  background: white;
  border: 1px solid var(--neutral-200);
  border-radius: 0.5rem;    /* 8px */
  padding: var(--space-6);  /* 24px */
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.card-header {
  padding-bottom: var(--space-4);
  border-bottom: 1px solid var(--neutral-200);
  margin-bottom: var(--space-4);
}
```

#### Tables
```css
.table {
  width: 100%;
  border-collapse: collapse;
  font-variant-numeric: tabular-nums;
}

.table th {
  background: var(--neutral-50);
  padding: var(--space-3) var(--space-4);
  text-align: left;
  font-weight: var(--font-medium);
  color: var(--neutral-700);
  border-bottom: 1px solid var(--neutral-300);
}

.table td {
  padding: var(--space-4);
  border-bottom: 1px solid var(--neutral-200);
  color: var(--neutral-700);
}

.table tr:hover {
  background: var(--neutral-50);
}
```

#### Form Elements
```css
.form-input {
  padding: var(--space-3);
  border: 1px solid var(--neutral-300);
  border-radius: 0.375rem;  /* 6px */
  font-size: var(--text-sm);
  color: var(--neutral-700);
  background: white;
}

.form-input:focus {
  outline: none;
  border-color: var(--primary-500);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-label {
  font-weight: var(--font-medium);
  color: var(--neutral-700);
  margin-bottom: var(--space-2);
}
```

### Shadows & Elevation

```css
/* Shadow System */
--shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
--shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1);

/* Elevation Usage */
.elevation-1 { box-shadow: var(--shadow-sm); }  /* Cards */
.elevation-2 { box-shadow: var(--shadow-md); }  /* Dropdowns */
.elevation-3 { box-shadow: var(--shadow-lg); }  /* Modals */
.elevation-4 { box-shadow: var(--shadow-xl); }  /* Overlays */
```

### Border Radius

```css
--radius-sm: 0.25rem;     /* 4px - Small elements */
--radius-md: 0.375rem;    /* 6px - Form inputs */
--radius-lg: 0.5rem;      /* 8px - Cards, buttons */
--radius-xl: 0.75rem;     /* 12px - Large cards */
--radius-2xl: 1rem;       /* 16px - Modal overlays */
--radius-full: 9999px;    /* Full rounded - Pills, avatars */
```

### Dark Mode Support

```css
/* Dark mode color overrides */
@media (prefers-color-scheme: dark) {
  :root {
    --neutral-50: #1F2937;
    --neutral-100: #374151;
    --neutral-200: #4B5563;
    --neutral-300: #6B7280;
    --neutral-400: #9CA3AF;
    --neutral-500: #D1D5DB;
    --neutral-600: #E5E7EB;
    --neutral-700: #F3F4F6;
    --neutral-800: #F9FAFB;
    --neutral-900: #FFFFFF;
  }
}
```

### Animation & Transitions

```css
/* Transition Timing */
--transition-fast: 150ms ease;
--transition-normal: 250ms ease;
--transition-slow: 350ms ease;

/* Common Transitions */
.transition-colors {
  transition: color var(--transition-fast),
              background-color var(--transition-fast),
              border-color var(--transition-fast);
}

.transition-transform {
  transition: transform var(--transition-normal);
}

.transition-opacity {
  transition: opacity var(--transition-normal);
}
```

### Usage Guidelines

#### Color Application
- **Primary Colors**: Main actions, links, navigation highlights
- **Status Colors**: System feedback, account states, operation results
- **Neutral Colors**: Text hierarchy, backgrounds, borders
- **Permission Colors**: Access level indicators, role badges

#### Typography Hierarchy
- **Page Titles**: text-4xl, font-bold
- **Section Headers**: text-2xl, font-semibold  
- **Card Titles**: text-xl, font-medium
- **Table Headers**: text-sm, font-medium
- **Body Text**: text-sm, font-normal
- **Helper Text**: text-xs, font-normal

#### Spacing Consistency
- **Page Layout**: Use space-8 and space-12 for major sections
- **Component Layout**: Use space-4 and space-6 for internal spacing
- **Fine Details**: Use space-1 and space-2 for micro-adjustments

---
*This style guide ensures visual consistency across the Account Management application while maintaining professional appearance and optimal usability for business users.*