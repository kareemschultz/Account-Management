# Account Management Component Library
## Comprehensive Component Documentation & Patterns

### Component Architecture Overview

```
Base Components (Shadcn/UI)
├── Core UI Elements (/components/ui/)
└── Account Management Components
    ├── Dashboard Components (/components/dashboard/)
    ├── User Management (/components/users/)
    ├── Service Management (/components/services/)
    ├── Access Control (/components/access-matrix/)
    ├── VPN Management (/components/vpn/)
    ├── Compliance & Audit (/components/audit/, /components/compliance/)
    ├── Import/Export (/components/import-export/)
    └── Reporting (/components/reports/)
```

## Base UI Components (/components/ui/)

### Essential Form Components
```typescript
// Button variants for account management
<Button variant="primary">Create Account</Button>
<Button variant="secondary">Edit Profile</Button>
<Button variant="destructive">Suspend Account</Button>

// Input components with validation
<Input type="email" placeholder="user@company.com" />
<Select>
  <SelectTrigger>Account Type</SelectTrigger>
  <SelectContent>
    <SelectItem value="admin">Administrator</SelectItem>
    <SelectItem value="manager">Manager</SelectItem>
    <SelectItem value="user">Standard User</SelectItem>
  </SelectContent>
</Select>

// Tables for data display
<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Name</TableHead>
      <TableHead>Email</TableHead>
      <TableHead>Status</TableHead>
      <TableHead>Actions</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>...</TableBody>
</Table>
```

### Layout & Navigation
```typescript
// Card layouts for information grouping
<Card>
  <CardHeader>
    <CardTitle>Account Details</CardTitle>
    <CardDescription>Manage user account information</CardDescription>
  </CardHeader>
  <CardContent>...</CardContent>
  <CardFooter>...</CardFooter>
</Card>

// Sheets for side panels
<Sheet>
  <SheetTrigger>Edit User</SheetTrigger>
  <SheetContent>
    <SheetHeader>
      <SheetTitle>User Profile</SheetTitle>
    </SheetHeader>
    <SheetDescription>Update user information</SheetDescription>
  </SheetContent>
</Sheet>
```

## Dashboard Components (/components/dashboard/)

### Metrics & Analytics
```typescript
// StatCard - Key performance indicators
interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  trend?: 'up' | 'down' | 'neutral';
  icon?: React.ReactNode;
}

// Usage: components/dashboard/stat-card.tsx
<StatCard
  title="Active Users"
  value={1234}
  change={+12}
  trend="up"
  icon={<Users />}
/>

// Advanced Metrics Grid - Complex dashboard layout
// File: components/dashboard/advanced-metrics-grid.tsx
<AdvancedMetricsGrid>
  <MetricCard type="users" />
  <MetricCard type="services" />
  <MetricCard type="security" />
</AdvancedMetricsGrid>
```

### Real-time Components
```typescript
// Real-time Alerts - Live system notifications
// File: components/dashboard/real-time-alerts.tsx
<RealTimeAlerts>
  <Alert variant="warning">
    <AlertTriangle className="h-4 w-4" />
    <AlertTitle>Security Alert</AlertTitle>
    <AlertDescription>
      Multiple failed login attempts detected
    </AlertDescription>
  </Alert>
</RealTimeAlerts>

// User Activity Heatmap - Visual activity representation
// File: components/dashboard/user-activity-heatmap.tsx
<UserActivityHeatmap
  data={activityData}
  timeRange="24h"
  colorScheme="blue"
/>
```

## User Management (/components/users/)

### User Table Components
```typescript
// User Table - Main user listing interface
// File: components/users/user-table.tsx
interface UserTableProps {
  users: User[];
  onEdit: (user: User) => void;
  onDelete: (userId: string) => void;
  onBulkAction: (action: string, userIds: string[]) => void;
}

<UserTable
  users={users}
  onEdit={handleEdit}
  onDelete={handleDelete}
  onBulkAction={handleBulkAction}
/>

// Column Definitions - Sortable, filterable columns
// File: components/users/columns.tsx
export const userColumns: ColumnDef<User>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting()}
      >
        Name <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => (
      <div className="font-mono text-sm">{row.getValue("email")}</div>
    ),
  },
  // Status badge with color coding
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      return (
        <Badge variant={getStatusVariant(status)}>
          {status}
        </Badge>
      );
    },
  },
];
```

### User Profile Components
```typescript
// User Profile Form - Comprehensive user editing
interface UserProfileFormProps {
  user?: User;
  onSave: (data: UserFormData) => void;
  onCancel: () => void;
}

// Form sections with validation
<UserProfileForm>
  <FormSection title="Personal Information">
    <FormField name="firstName" label="First Name" required />
    <FormField name="lastName" label="Last Name" required />
    <FormField name="email" label="Email" type="email" required />
  </FormSection>
  
  <FormSection title="Account Settings">
    <FormField name="role" label="Role" type="select" options={roleOptions} />
    <FormField name="department" label="Department" type="select" />
    <FormField name="status" label="Account Status" type="radio" />
  </FormSection>
</UserProfileForm>
```

## Service Management (/components/services/)

### Service Cards & Lists
```typescript
// Service Card - Individual service representation
// File: components/services/service-card.tsx
interface ServiceCardProps {
  service: Service;
  memberCount: number;
  status: 'active' | 'inactive' | 'maintenance';
  onManage: () => void;
  onViewMembers: () => void;
}

<ServiceCard
  service={service}
  memberCount={45}
  status="active"
  onManage={() => navigate(`/services/${service.id}/manage`)}
  onViewMembers={() => navigate(`/services/${service.id}/members`)}
/>

// Bulk Operations - Mass service management
// File: components/services/bulk-group-operations.tsx
<BulkGroupOperations
  selectedServices={selectedServices}
  availableOperations={['add_users', 'remove_users', 'change_permissions']}
  onExecute={handleBulkOperation}
/>
```

### Service Configuration
```typescript
// Service Permission Matrix - Visual permission management
<ServicePermissionMatrix
  service={service}
  permissions={permissions}
  roles={roles}
  onChange={handlePermissionChange}
/>

// Service Health Monitoring
// File: components/dashboard/service-health.tsx
<ServiceHealth
  services={services}
  healthStatus={healthData}
  refreshInterval={30000}
/>
```

## Access Control (/components/access-matrix/)

### Permission Management
```typescript
// Access Matrix - Visual permission grid
// File: components/access-matrix/matrix-cell.tsx
interface MatrixCellProps {
  userId: string;
  serviceId: string;
  permission: 'read' | 'write' | 'admin' | 'none';
  onChange: (permission: Permission) => void;
  disabled?: boolean;
}

<AccessMatrix>
  {users.map(user => 
    services.map(service => (
      <MatrixCell
        key={`${user.id}-${service.id}`}
        userId={user.id}
        serviceId={service.id}
        permission={getPermission(user.id, service.id)}
        onChange={handlePermissionChange}
      />
    ))
  )}
</AccessMatrix>
```

## VPN Management (/components/vpn/)

### Network Components
```typescript
// Active Connections Table - Real-time connection monitoring
// File: components/vpn/active-connections-table.tsx
<ActiveConnectionsTable
  connections={activeConnections}
  onDisconnect={handleDisconnect}
  onViewDetails={handleViewDetails}
  refreshInterval={5000}
/>

// Network Topology - Visual network representation
// File: components/vpn/network-topology.tsx
<NetworkTopology
  nodes={networkNodes}
  connections={networkConnections}
  onNodeClick={handleNodeClick}
  layout="hierarchical"
/>

// VPN Configuration - Settings management
// File: components/vpn/vpn-configuration.tsx
<VPNConfiguration
  config={vpnConfig}
  onChange={handleConfigChange}
  onSave={handleSave}
  onTest={handleTestConnection}
/>
```

## Compliance & Audit (/components/audit/, /components/compliance/)

### Audit Trail Components
```typescript
// Audit Timeline - Chronological activity display
// File: components/audit/audit-timeline.tsx
<AuditTimeline
  events={auditEvents}
  dateRange={dateRange}
  filters={activeFilters}
  onFilterChange={handleFilterChange}
/>

// Audit Filters - Advanced filtering interface
// File: components/audit/audit-filters.tsx
<AuditFilters
  onDateRangeChange={handleDateRange}
  onUserFilter={handleUserFilter}
  onActionFilter={handleActionFilter}
  onClearFilters={handleClearFilters}
/>
```

### Compliance Components
```typescript
// Compliance Controls Table - Regulatory compliance management
// File: components/compliance/compliance-controls-table.tsx
<ComplianceControlsTable
  controls={complianceControls}
  status={complianceStatus}
  onUpdateControl={handleUpdateControl}
  onGenerateReport={handleGenerateReport}
/>

// Compliance Stat Card - Compliance metrics
// File: components/compliance/compliance-stat-card.tsx
<ComplianceStatCard
  title="GDPR Compliance"
  percentage={98}
  status="compliant"
  lastUpdated={new Date()}
/>
```

## Import/Export (/components/import-export/)

### Data Transfer Components
```typescript
// Import Card - File upload and processing
// File: components/import-export/import-card.tsx
<ImportCard
  acceptedFormats={['csv', 'xlsx', 'json']}
  maxFileSize="10MB"
  onImport={handleImport}
  validationRules={importValidationRules}
/>

// Export Card - Data export interface
// File: components/import-export/export-card.tsx
<ExportCard
  dataType="users"
  formats={['csv', 'xlsx', 'pdf']}
  filters={activeFilters}
  onExport={handleExport}
/>

// History Table - Import/export operation history
// File: components/import-export/history-table.tsx
<HistoryTable
  operations={importExportHistory}
  onViewDetails={handleViewDetails}
  onDownload={handleDownload}
/>
```

## Reporting (/components/reports/)

### Analytics Components
```typescript
// Access Heatmap - Visual access pattern analysis
// File: components/reports/access-heatmap.tsx
<AccessHeatmap
  data={accessData}
  timeRange="30d"
  granularity="daily"
  colorScheme="blues"
/>

// Service Adoption Chart - Usage statistics
// File: components/reports/service-adoption-chart.tsx
<ServiceAdoptionChart
  services={services}
  adoptionData={adoptionData}
  chartType="line"
  showTrend={true}
/>

// Security Clearance Pie Chart - Security distribution
// File: components/reports/security-clearance-pie.tsx
<SecurityClearancePie
  data={securityData}
  showPercentages={true}
  interactive={true}
/>
```

## Component Patterns & Best Practices

### State Management Patterns
```typescript
// Hook-based state management for complex components
const useUserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.users.getAll();
      setUsers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);
  
  return { users, loading, error, fetchUsers };
};
```

### Error Handling Patterns
```typescript
// Consistent error boundary implementation
<ErrorBoundary fallback={<ErrorFallback />}>
  <UserTable users={users} />
</ErrorBoundary>

// Loading states for async operations
{loading ? (
  <TableSkeleton rows={10} />
) : (
  <UserTable users={users} />
)}
```

### Accessibility Patterns
```typescript
// ARIA labels and roles for complex interactions
<Table role="grid" aria-label="User accounts table">
  <TableHeader>
    <TableRow role="row">
      <TableHead role="columnheader" aria-sort="ascending">
        Name
      </TableHead>
    </TableRow>
  </TableHeader>
</Table>

// Keyboard navigation support
const handleKeyDown = (event: KeyboardEvent) => {
  switch (event.key) {
    case 'Enter':
    case ' ':
      handleSelect();
      break;
    case 'Escape':
      handleCancel();
      break;
  }
};
```

## Component Testing Patterns

### Unit Testing
```typescript
// Component testing with React Testing Library
describe('UserTable', () => {
  it('displays user data correctly', () => {
    render(<UserTable users={mockUsers} />);
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
  });
  
  it('handles bulk operations', async () => {
    const onBulkAction = jest.fn();
    render(<UserTable users={mockUsers} onBulkAction={onBulkAction} />);
    
    // Select multiple users
    fireEvent.click(screen.getByRole('checkbox', { name: /select all/i }));
    fireEvent.click(screen.getByText('Bulk Actions'));
    fireEvent.click(screen.getByText('Suspend Selected'));
    
    expect(onBulkAction).toHaveBeenCalledWith('suspend', ['1', '2', '3']);
  });
});
```

### Visual Testing Integration
```typescript
// Playwright visual testing for components
test('UserTable visual regression', async ({ page }) => {
  await page.goto('/users');
  await page.waitForSelector('[data-testid="user-table"]');
  await expect(page.locator('[data-testid="user-table"]')).toHaveScreenshot('user-table.png');
});
```

## Component Documentation Standards

### Props Interface Documentation
```typescript
/**
 * UserTable component for displaying and managing user accounts
 * 
 * @param users - Array of user objects to display
 * @param onEdit - Callback function when edit button is clicked
 * @param onDelete - Callback function when delete button is clicked
 * @param onBulkAction - Callback function for bulk operations
 * @param loading - Loading state indicator
 * @param error - Error message to display
 */
interface UserTableProps {
  users: User[];
  onEdit?: (user: User) => void;
  onDelete?: (userId: string) => void;
  onBulkAction?: (action: string, userIds: string[]) => void;
  loading?: boolean;
  error?: string | null;
}
```

---
*This component library provides a comprehensive foundation for building consistent, accessible, and maintainable account management interfaces. Each component follows established design patterns and includes proper error handling, loading states, and accessibility features.*