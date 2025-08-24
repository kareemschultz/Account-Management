# Design Review Agent Configuration
## Comprehensive UI/UX Validation for Account Management

### Agent Purpose
Specialized agent for comprehensive design validation across Account Management interfaces, ensuring consistency, usability, and professional appearance of business-critical applications.

### Activation Commands
- `/design-review` - Full design validation across all components
- `/design-review --page=users` - Page-specific design review
- `/design-review --mobile` - Mobile-focused design validation
- `/design-review --accessibility` - Design accessibility review

### Review Scope & Criteria

#### 1. Visual Consistency Validation
**Component Library Adherence**
- [ ] All components follow established design tokens from `/context/style-guide.md`
- [ ] Color usage matches defined palette (primary, status, neutral colors)
- [ ] Typography hierarchy follows established scale and weights
- [ ] Spacing uses consistent scale (4px, 8px, 16px, 24px, 32px)
- [ ] Border radius and shadows follow design system standards

**Brand & Professional Appearance**
- [ ] Interface maintains professional SaaS aesthetic
- [ ] Color combinations reinforce trust and reliability
- [ ] Visual hierarchy guides user attention effectively
- [ ] No visual inconsistencies across similar components

#### 2. Account Management Specific Patterns
**Data Table Design**
- [ ] User tables maintain consistent column widths and alignment
- [ ] Status indicators use appropriate colors and iconography
- [ ] Sortable columns have clear visual indicators
- [ ] Bulk operations UI is intuitive and accessible
- [ ] Row hover states are consistent and subtle

**Form Design Validation**
- [ ] Account creation forms follow multi-step patterns
- [ ] Field grouping is logical and visually clear
- [ ] Validation messages are positioned consistently
- [ ] Required field indicators are visible and consistent
- [ ] Form actions (Save, Cancel, Delete) follow established patterns

**Dashboard & Metrics**
- [ ] Card layouts maintain consistent proportions
- [ ] Chart colors follow established data visualization palette
- [ ] Real-time updates don't cause jarring layout shifts
- [ ] Widget spacing follows grid system
- [ ] Loading states are consistent across all metrics

#### 3. Security & Trust Visual Cues
**Permission Indicators**
- [ ] Access levels use consistent color coding
- [ ] Permission changes have clear visual feedback
- [ ] Security status is immediately recognizable
- [ ] Audit trail timestamps are consistently formatted

**Destructive Actions**
- [ ] Delete/suspend actions have appropriate warning colors
- [ ] Confirmation dialogs follow established patterns
- [ ] Irreversible actions are clearly distinguished
- [ ] Bulk operations show clear impact summary

#### 4. Navigation & Information Architecture
**Layout Structure**
- [ ] Sidebar navigation maintains consistent hierarchy
- [ ] Breadcrumb navigation reflects actual page structure
- [ ] Page titles and section headers follow typography scale
- [ ] Content areas have appropriate max-widths for readability

**User Flow Validation**
- [ ] Account creation flow is intuitive and logical
- [ ] Service management workflows are efficient
- [ ] Navigation between related sections is seamless
- [ ] Error states provide clear recovery paths

#### 5. Responsive Design Validation
**Breakpoint Behavior**
- [ ] Layout gracefully adapts at 640px, 768px, 1024px, 1280px
- [ ] Navigation transforms appropriately on mobile
- [ ] Data tables handle horizontal scrolling properly
- [ ] Form layouts stack appropriately on smaller screens

**Touch Interface Optimization**
- [ ] Touch targets meet minimum 44px size requirement
- [ ] Tap areas don't overlap or interfere
- [ ] Swipe gestures work intuitively where implemented
- [ ] Mobile navigation is thumb-friendly

#### 6. Performance Impact Assessment
**Visual Performance**
- [ ] No layout thrashing during page load
- [ ] Smooth transitions and animations
- [ ] Large data sets load with appropriate pagination
- [ ] Images and icons load efficiently

**Perceived Performance**
- [ ] Loading states prevent content jumping
- [ ] Critical content appears within 1.5 seconds
- [ ] Progressive enhancement doesn't block basic functionality
- [ ] Error states don't break page layout

### Review Process Workflow

#### Phase 1: Automated Checks
```bash
# Screenshot all major pages
playwright-screenshot --pages=dashboard,users,services,compliance,analytics

# Check visual consistency
compare-screenshots --baseline=./screenshots/baseline/ --current=./screenshots/current/

# Validate color contrast
accessibility-audit --focus=color-contrast

# Check responsive breakpoints
responsive-test --breakpoints=mobile,tablet,desktop
```

#### Phase 2: Manual Design Review
1. **Visual Hierarchy Assessment**
   - Review information density and organization
   - Validate that most important actions are prominent
   - Check that secondary information doesn't compete with primary

2. **Interaction Pattern Review**
   - Test all interactive elements for consistency
   - Validate hover states and focus indicators
   - Ensure form validation feedback is clear

3. **Content & Messaging**
   - Review all user-facing text for clarity
   - Validate error messages are helpful
   - Ensure success states provide appropriate feedback

#### Phase 3: Cross-Component Validation
1. **Pattern Consistency**
   - Compare similar components across different pages
   - Validate that data display patterns are consistent
   - Check that action patterns (edit, delete, view) are uniform

2. **State Management**
   - Review loading states across all components
   - Validate error handling consistency
   - Check empty state designs

### Review Deliverables

#### Design Review Report Format
```markdown
# Design Review Report - [Date]

## Summary
- Overall Score: [1-10]
- Critical Issues: [Count]
- Recommendations: [Count]

## Critical Issues
1. **[Issue Title]**
   - Location: [Page/Component]
   - Impact: [High/Medium/Low]
   - Description: [Detailed description]
   - Recommendation: [Specific fix]

## Accessibility Findings
- Color Contrast Issues: [Count]
- Keyboard Navigation Issues: [Count]
- Screen Reader Issues: [Count]

## Responsive Design Issues
- Mobile Layout Issues: [Count]
- Tablet Layout Issues: [Count]
- Desktop Optimization Opportunities: [Count]

## Recommendations
1. **Priority 1 (Critical)**
   - [List critical fixes]

2. **Priority 2 (Important)**
   - [List important improvements]

3. **Priority 3 (Enhancement)**
   - [List nice-to-have improvements]

## Screenshots
- [Annotated screenshots showing issues]
- [Before/after comparisons where applicable]
```

### Integration with Development Workflow

#### Pre-Commit Hooks
```bash
# Add to package.json scripts
"design-review": "playwright test --config=design-review.config.js",
"visual-diff": "percy exec -- playwright test",
"accessibility-check": "axe-playwright --config=.axerc.json"
```

#### CI/CD Integration
- Automated visual regression testing on pull requests
- Design review checklist in PR templates
- Screenshot comparison with baseline images
- Accessibility audit results in PR comments

### Common Design Issues Checklist

#### Typography Issues
- [ ] Inconsistent font sizes across similar elements
- [ ] Poor contrast ratios (below 4.5:1 for normal text)
- [ ] Line heights too tight for readability
- [ ] Mixed font weights without clear hierarchy

#### Color Usage Issues
- [ ] Status colors used inconsistently
- [ ] Too many accent colors creating visual noise
- [ ] Insufficient contrast in dark mode
- [ ] Color-only communication without text/icons

#### Layout & Spacing Issues
- [ ] Inconsistent padding/margins across components
- [ ] Components too cramped or too spread out
- [ ] Poor alignment of related elements
- [ ] Inconsistent grid usage

#### Interaction Issues
- [ ] Hover states missing or inconsistent
- [ ] Focus indicators not visible or consistent
- [ ] Loading states missing or poorly designed
- [ ] Error states break layout or are unclear

### Agent-Specific Review Commands

```bash
# Component-specific reviews
/design-review --component=UserTable
/design-review --component=ServiceCard
/design-review --component=AccessMatrix

# Feature-specific reviews
/design-review --feature=user-management
/design-review --feature=bulk-operations
/design-review --feature=reporting

# Cross-browser validation
/design-review --browsers=chrome,firefox,safari
```

### Success Metrics

#### Quantitative Measures
- Visual regression test pass rate: >95%
- Accessibility compliance score: WCAG AA (100%)
- Performance budget adherence: 100%
- Cross-browser consistency: >98%

#### Qualitative Measures
- User feedback on interface clarity
- Developer ease of implementing consistent designs
- Stakeholder confidence in professional appearance
- Maintenance effort for design consistency

---
*This design review agent ensures that Account Management interfaces maintain the highest standards of visual design, user experience, and professional appearance while supporting complex business operations efficiently.*