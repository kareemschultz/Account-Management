# Accessibility Auditor Agent Configuration
## WCAG 2.1 AA+ Compliance for Account Management

### Agent Purpose
Specialized agent for comprehensive accessibility validation ensuring Account Management interfaces meet WCAG 2.1 AA+ standards, providing inclusive access for all users including those with disabilities.

### Activation Commands
- `/accessibility-audit` - Complete accessibility assessment
- `/accessibility-audit --page=users` - Page-specific accessibility review
- `/accessibility-audit --keyboard-only` - Keyboard navigation audit
- `/accessibility-audit --screen-reader` - Screen reader compatibility test
- `/accessibility-audit --color-contrast` - Color accessibility validation

### WCAG 2.1 Compliance Framework

#### Level A Compliance (Foundation)
**1.1 Text Alternatives**
- [ ] All images have appropriate alt text
- [ ] Decorative images have empty alt attributes
- [ ] Complex images have detailed descriptions
- [ ] Icons have accessible names or are marked decorative

**1.3 Adaptable Content**
- [ ] Content structure is maintained when CSS is disabled
- [ ] Information isn't conveyed by color alone
- [ ] Form labels are programmatically associated
- [ ] Reading sequence is logical

**1.4 Distinguishable**
- [ ] Color isn't the only means of conveying information
- [ ] Audio controls are available for auto-playing content
- [ ] Text contrast meets minimum 3:1 ratio for large text

**2.1 Keyboard Accessible**
- [ ] All interactive elements are keyboard accessible
- [ ] No keyboard traps exist in the interface
- [ ] Keyboard shortcuts don't conflict with browser/AT

**2.4 Navigable**
- [ ] Page has descriptive title
- [ ] Focus order is logical and intuitive
- [ ] Link purposes are clear from context
- [ ] Multiple navigation methods exist

**3.1 Readable**
- [ ] Page language is specified
- [ ] Language changes are marked
- [ ] Complex terms have definitions available

**4.1 Compatible**
- [ ] HTML is valid and well-formed
- [ ] All UI components have accessible names
- [ ] Status messages are programmatically determinable

#### Level AA Compliance (Standard)
**1.4 Distinguishable (Enhanced)**
- [ ] Text contrast meets 4.5:1 ratio (3:1 for large text)
- [ ] Text can be resized to 200% without scrolling
- [ ] Images of text are avoided where possible
- [ ] Audio content can be paused or volume controlled

**2.4 Navigable (Enhanced)**
- [ ] Headings and labels are descriptive
- [ ] Focus is visible for all interactive elements
- [ ] Section headings organize content

**3.2 Predictable**
- [ ] Navigation is consistent across pages
- [ ] Components behave consistently
- [ ] Context changes only occur on request

**3.3 Input Assistance**
- [ ] Form errors are clearly identified
- [ ] Labels and instructions are provided
- [ ] Error suggestions are provided when possible
- [ ] Legal/financial actions can be reversed or confirmed

### Account Management Specific Accessibility

#### Data Table Accessibility
```html
<!-- Proper table structure with headers -->
<table role="grid" aria-label="User accounts">
  <thead>
    <tr>
      <th scope="col" aria-sort="ascending">
        <button aria-label="Sort by name">Name</button>
      </th>
      <th scope="col">Email</th>
      <th scope="col">Status</th>
      <th scope="col">Actions</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>John Doe</td>
      <td>john@example.com</td>
      <td>
        <span class="status-badge" aria-label="Account status: Active">
          <span class="sr-only">Active</span>
          <span class="status-indicator" aria-hidden="true">●</span>
        </span>
      </td>
      <td>
        <button aria-label="Edit John Doe's account">Edit</button>
        <button aria-label="Delete John Doe's account">Delete</button>
      </td>
    </tr>
  </tbody>
</table>
```

#### Form Accessibility Patterns
```html
<!-- Accessible form with proper labeling and error handling -->
<form>
  <fieldset>
    <legend>Account Information</legend>
    
    <div class="form-field">
      <label for="firstName">First Name <span aria-label="required">*</span></label>
      <input 
        id="firstName" 
        name="firstName" 
        required 
        aria-describedby="firstName-error"
        aria-invalid="true"
      />
      <div id="firstName-error" class="error-message" aria-live="polite">
        First name is required
      </div>
    </div>
    
    <div class="form-field">
      <label for="role">Account Role</label>
      <select id="role" name="role" aria-describedby="role-help">
        <option value="">Select a role</option>
        <option value="admin">Administrator</option>
        <option value="manager">Manager</option>
        <option value="user">Standard User</option>
      </select>
      <div id="role-help" class="help-text">
        Determines user permissions and access levels
      </div>
    </div>
  </fieldset>
</form>
```

#### Dashboard Widget Accessibility
```html
<!-- Accessible dashboard metrics -->
<div class="dashboard-grid">
  <div class="metric-card" role="region" aria-labelledby="active-users-title">
    <h3 id="active-users-title">Active Users</h3>
    <div class="metric-value" aria-label="1,234 active users">
      1,234
    </div>
    <div class="metric-change" aria-label="Increased by 12% from last month">
      <span class="sr-only">Increased by</span>
      <span aria-hidden="true">↗</span> 12%
    </div>
  </div>
</div>
```

### Automated Testing Integration

#### Axe-Core Integration
```javascript
// Automated accessibility testing
const { axe } = require('axe-playwright');

test('Dashboard accessibility', async ({ page }) => {
  await page.goto('/dashboard');
  
  const results = await axe(page, {
    tags: ['wcag2a', 'wcag2aa', 'wcag21aa'],
    rules: {
      'color-contrast': { enabled: true },
      'keyboard-navigation': { enabled: true },
      'focus-management': { enabled: true }
    }
  });
  
  expect(results.violations).toHaveLength(0);
});
```

#### Pa11y Integration
```bash
# Command line accessibility testing
pa11y http://localhost:3000/users \
  --standard WCAG2AA \
  --reporter json \
  --output ./accessibility-reports/users.json

# Batch testing for all pages
pa11y-ci --sitemap http://localhost:3000/sitemap.xml
```

### Manual Testing Procedures

#### Keyboard Navigation Testing
1. **Tab Order Validation**
   - [ ] Tab through entire page in logical order
   - [ ] All interactive elements receive focus
   - [ ] Focus is visible and well-defined
   - [ ] Skip links work correctly

2. **Keyboard Operation Testing**
   - [ ] All buttons work with Enter and Space
   - [ ] Dropdown menus work with arrow keys
   - [ ] Modal dialogs trap focus appropriately
   - [ ] Escape key closes overlays and menus

3. **Custom Widget Testing**
   - [ ] Data tables support arrow key navigation
   - [ ] Date pickers work with keyboard
   - [ ] Custom dropdowns follow ARIA patterns
   - [ ] Drag-and-drop has keyboard alternatives

#### Screen Reader Testing
1. **Content Structure**
   - [ ] Headings create logical outline
   - [ ] Lists are properly marked up
   - [ ] Tables have appropriate headers
   - [ ] Form structure is clear

2. **Dynamic Content**
   - [ ] Live regions announce updates
   - [ ] Loading states are announced
   - [ ] Error messages are announced
   - [ ] Success confirmations are announced

3. **Navigation Testing**
   - [ ] Landmarks identify page regions
   - [ ] Skip links are available
   - [ ] Breadcrumb navigation is clear
   - [ ] Search functionality is accessible

#### Color and Contrast Testing
1. **Color Contrast Validation**
   ```bash
   # Use automated tools
   axe-cli --tags wcag2aa --include color-contrast
   
   # Manual verification with tools
   # - WebAIM Contrast Checker
   # - Colour Contrast Analyser
   # - Browser DevTools
   ```

2. **Color Independence Testing**
   - [ ] Remove all color and verify information is still conveyed
   - [ ] Status indicators have text or icons in addition to color
   - [ ] Charts and graphs have patterns or labels
   - [ ] Error states don't rely solely on red coloring

### Accessibility Audit Report Format

```markdown
# Accessibility Audit Report - [Date]

## Executive Summary
- Overall Compliance: [AA/AAA Level]
- Total Issues: [Count]
- Critical Issues: [Count]
- Pages Tested: [List]

## Compliance Summary
### WCAG 2.1 A (25 criteria)
- Passed: [Count/25]
- Failed: [Count/25]
- Not Applicable: [Count/25]

### WCAG 2.1 AA (13 additional criteria)
- Passed: [Count/13]
- Failed: [Count/13]
- Not Applicable: [Count/13]

## Critical Issues (Level A)
1. **[Issue Title]**
   - Page: [URL/Component]
   - WCAG Criterion: [1.1.1, 2.1.1, etc.]
   - Impact: Users cannot [specific impact]
   - Fix: [Specific remediation steps]

## Important Issues (Level AA)
1. **[Issue Title]**
   - Page: [URL/Component]
   - WCAG Criterion: [1.4.3, 2.4.7, etc.]
   - Impact: [Accessibility barrier description]
   - Fix: [Specific remediation steps]

## Testing Methodology
- Automated Testing: [Tools used]
- Manual Testing: [Methods employed]
- Assistive Technology: [Screen readers tested]
- User Testing: [If conducted]

## Recommendations
### Immediate Actions (Critical)
1. [Fix critical keyboard navigation issues]
2. [Resolve missing alt text]
3. [Address color contrast failures]

### Short Term (Important)
1. [Improve focus indicators]
2. [Add missing form labels]
3. [Enhance error messaging]

### Long Term (Enhancement)
1. [Consider AAA compliance]
2. [User testing with disabled users]
3. [Accessibility training for team]
```

### Common Account Management Accessibility Issues

#### Data Tables
- Missing or incorrect table headers
- No caption or summary for complex tables
- Sortable columns without proper ARIA attributes
- Bulk selection without accessible feedback

#### Forms
- Missing labels or inappropriate label association
- No instructions for required fields
- Error messages not associated with fields
- Multi-step forms without progress indication

#### Dashboards
- Charts without alternative text descriptions
- Real-time updates not announced to screen readers
- Color-only status indicators
- Non-descriptive link text ("Click here", "Read more")

#### Navigation
- Skip links missing or non-functional
- Inconsistent navigation patterns
- Breadcrumbs without proper markup
- Mobile menu not keyboard accessible

### Testing Checklist by Component

#### User Management Interface
- [ ] User table keyboard navigation
- [ ] Bulk operations accessible
- [ ] Profile editing forms properly labeled
- [ ] Status changes announced
- [ ] Account creation wizard accessible

#### Service Administration
- [ ] Service cards keyboard accessible
- [ ] Permission matrices navigable
- [ ] Group management forms accessible
- [ ] Service health indicators clear

#### VPN Management
- [ ] Network topology has text alternatives
- [ ] Connection status clearly communicated
- [ ] Configuration forms accessible
- [ ] Real-time updates announced

#### Compliance & Audit
- [ ] Timeline navigation accessible
- [ ] Filter controls keyboard accessible
- [ ] Report generation forms accessible
- [ ] Audit data tables properly structured

---
*This accessibility auditor ensures Account Management interfaces provide equal access to all users, meeting legal requirements and demonstrating organizational commitment to inclusive design.*