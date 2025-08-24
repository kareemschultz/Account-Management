# User Manual - ESM Platform

## Welcome to the ESM Platform

The Enterprise Service Management (ESM) Platform is your new centralized system for managing IT service access, user accounts, and security permissions. This manual will help you navigate and use the platform effectively.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Dashboard Overview](#dashboard-overview)
3. [User Management](#user-management)
4. [Service Access](#service-access)
5. [VPN Management](#vpn-management)
6. [Reports and Analytics](#reports-and-analytics)
7. [Import/Export](#import-export)
8. [Account Settings](#account-settings)
9. [Troubleshooting](#troubleshooting)
10. [Contact Support](#contact-support)

## Getting Started

### First Login

1. **Access the Platform**: Navigate to the ESM Platform URL provided by your IT administrator
2. **Login**: Use your assigned username and password
3. **Password Setup**: You may be prompted to change your initial password
4. **Two-Factor Authentication**: Enable 2FA if required by your organization

### Dashboard Navigation

The ESM Platform uses a clean, intuitive interface with:
- **Sidebar Navigation**: Main menu on the left
- **Header**: User profile and notifications at the top
- **Main Content**: Central working area
- **Breadcrumbs**: Navigation path for complex workflows

## Dashboard Overview

### Main Dashboard

When you first log in, you'll see the main dashboard with:

#### Key Metrics Cards
- **Total Users**: Current number of active employees
- **Active Services**: Number of operational IT services
- **Security Score**: Overall system security rating
- **System Health**: Current operational status

#### Interactive Charts
- **User Distribution**: Breakdown by department and employment type
- **Service Health**: Real-time status of all IT services
- **Service Performance**: Response times and availability
- **Recent Activity**: Latest system changes and user actions

#### Quick Actions
- View your service access
- Request new service access
- Update your profile
- View recent notifications

### Understanding Your Access

Your dashboard shows:
- **Services You Can Access**: Green indicators for approved services
- **Pending Requests**: Orange indicators for access under review
- **Restricted Services**: Red indicators for services requiring higher clearance

## User Management

### Your Profile

#### Viewing Your Profile
1. Click your name in the header
2. Select "Profile" from the dropdown
3. View your current information:
   - Personal details (name, email, employee ID)
   - Department and position
   - Security clearance level
   - Employment status
   - Service access summary

#### Updating Your Profile
**You can update**:
- Contact information
- Emergency contacts
- Notification preferences
- Password

**You cannot update** (contact HR/IT):
- Name or employee ID
- Department assignment
- Security clearance level
- Employment status

### Viewing Other Users (if authorized)

#### User Directory
1. Navigate to **Users** in the sidebar
2. Browse or search for colleagues
3. View public profile information:
   - Name and position
   - Department
   - Contact information (if authorized)

#### Advanced Search
Use filters to find users by:
- Department
- Employment status
- Security clearance level
- Service access patterns

## Service Access

### Understanding Services

The platform manages access to 16 key IT services:

#### Network Services
- **IPAM**: IP Address Management
- **RADIUS**: Network Authentication
- **Unifi Network**: Network Management

#### Monitoring Services
- **Grafana**: General monitoring dashboards
- **LTE Grafana**: LTE network monitoring
- **Generator Grafana**: Power infrastructure monitoring
- **Zabbix**: System monitoring
- **Kibana**: Log analysis
- **NetEco/IVS NetEco**: Network monitoring platforms

#### Security Services
- **Teleport**: Secure access platform
- **NCE-FAN ATP**: Network security

#### Management Services
- **ITop**: IT Service Management
- **eSight-SRV-2**: Network management
- **Eight Sight**: Analytics platform
- **NOC Services**: Network Operations Center

### Your Service Access

#### Viewing Current Access
1. Go to **Services** in the sidebar
2. See your access status for each service:
   - ✅ **Active**: You have full access
   - ⏳ **Pending**: Request under review
   - ❌ **No Access**: Not currently authorized
   - ⚠️ **Expired**: Access needs renewal

#### Service Details
Click on any service to see:
- Service description and purpose
- Your access level (Admin, User, Viewer)
- Account type (Local, LDAP, Active Directory)
- Group memberships
- Last access date
- Expiration date (if applicable)

### Requesting Service Access

#### New Access Request
1. Navigate to **Services**
2. Find the service you need
3. Click **Request Access**
4. Fill out the request form:
   - Business justification
   - Required access level
   - Duration needed
   - Manager approval contact

#### Request Status
Track your requests in the **My Requests** section:
- **Submitted**: Request received
- **Under Review**: Being evaluated by service owner
- **Approved**: Access will be granted shortly
- **Denied**: Request rejected with reason
- **Expired**: Request timed out

## VPN Management

### VPN Access Overview

The platform manages two VPN systems:
- **Mikrotik VPN**: Internal network access
- **FortiGate VPN**: Remote access and external connections

### Your VPN Status

#### Checking VPN Access
1. Go to **VPN** in the sidebar
2. View your current VPN permissions:
   - Connection status
   - Assigned IP pools
   - Group memberships
   - Data usage limits
   - Session limits

#### VPN Groups
Common VPN groups include:
- **GM**: General Management access
- **IT-Admin**: IT administrative access
- **IT-Staff**: IT team access
- **Operations**: Operational team access

### Using VPN Services

#### Connection Instructions
1. Download VPN client software (links provided)
2. Use your assigned credentials
3. Connect to the appropriate server
4. Verify connection in the platform

#### Troubleshooting VPN
- Check your access status in the platform
- Verify credentials haven't expired
- Contact IT if connection fails
- Monitor data usage limits

## Reports and Analytics

### Personal Reports

#### Access Summary Report
Generate reports showing:
- Your current service access
- Access history and changes
- VPN usage statistics
- Security compliance status

#### Activity Reports
View your platform activity:
- Login history
- Service access attempts
- Profile changes
- Password changes

### Departmental Reports (if authorized)

#### Team Access Overview
- Department service usage
- Access request patterns
- Compliance status
- Training requirements

## Import/Export

### Personal Data Export

#### Exporting Your Data
1. Go to **Settings** > **Data Export**
2. Select data types to export:
   - Profile information
   - Service access history
   - VPN usage logs
   - Activity logs
3. Choose export format (PDF, CSV, JSON)
4. Download the generated file

### Data Requests

#### Requesting Historical Data
For data older than 2 years:
1. Submit a data request ticket
2. Specify the information needed
3. Provide business justification
4. Wait for approval and processing

## Account Settings

### Security Settings

#### Password Management
1. Go to **Settings** > **Security**
2. Change password regularly
3. Use strong passwords (minimum 8 characters)
4. Enable password expiration notifications

#### Two-Factor Authentication
1. Navigate to **Settings** > **Security**
2. Click **Enable 2FA**
3. Scan QR code with authenticator app
4. Enter verification code
5. Save backup codes securely

#### Session Management
- View active sessions
- Log out remote sessions
- Set session timeout preferences

### Notification Preferences

#### Email Notifications
Configure notifications for:
- Service access changes
- Password expiration warnings
- Account security alerts
- System maintenance notices

#### In-Platform Notifications
Manage alerts for:
- Approval requests
- System updates
- New service availability
- Policy changes

### Privacy Settings

#### Data Sharing
Control who can see:
- Your contact information
- Department details
- Service access levels
- Activity status

## Troubleshooting

### Common Issues

#### Cannot Login
**Problem**: Username/password not working
**Solution**:
1. Verify username is correct
2. Check caps lock is off
3. Try password reset
4. Contact IT if still failing

#### Service Access Denied
**Problem**: Cannot access a needed service
**Solution**:
1. Check if you have current access in platform
2. Verify your security clearance level
3. Submit access request if needed
4. Contact service owner for urgent needs

#### VPN Connection Fails
**Problem**: Cannot connect to VPN
**Solution**:
1. Check VPN access status in platform
2. Verify client software is updated
3. Try different server location
4. Check firewall settings

#### Page Loading Slowly
**Problem**: Platform responds slowly
**Solution**:
1. Check internet connection
2. Clear browser cache
3. Disable browser extensions
4. Try different browser

### Getting Help

#### Self-Service Options
1. **Help Center**: Built-in documentation and FAQs
2. **Video Tutorials**: Step-by-step guides
3. **Community Forum**: User discussions and tips

#### Contacting Support
1. **Help Desk**: For technical issues
2. **Service Owners**: For service-specific problems
3. **Security Team**: For security-related concerns
4. **HR**: For employment-related issues

## Best Practices

### Security Best Practices
- Never share your login credentials
- Log out when finished using the system
- Report suspicious activity immediately
- Keep contact information updated
- Review service access regularly

### Efficiency Tips
- Use bookmarks for frequently accessed services
- Set up notification preferences to stay informed
- Use the search function to find information quickly
- Export reports regularly for your records

### Compliance Guidelines
- Only request access you actually need
- Provide accurate business justification
- Report access no longer needed
- Participate in periodic access reviews

## Frequently Asked Questions

### General Questions

**Q: How often should I review my service access?**
A: Review your access quarterly or when your role changes.

**Q: Can I delegate my access to someone else?**
A: No, access is personal and non-transferable. Submit separate requests for team members.

**Q: How long do access requests take to process?**
A: Most requests are processed within 3-5 business days.

### Technical Questions

**Q: What browsers are supported?**
A: Chrome, Firefox, Safari, and Edge (latest versions).

**Q: Can I access the platform from mobile devices?**
A: Yes, the platform is mobile-friendly and responsive.

**Q: Is my data backed up?**
A: Yes, all data is backed up daily with point-in-time recovery.

### Service-Specific Questions

**Q: Why can't I access a service I had before?**
A: Access may have expired or your role may have changed. Check expiration dates and submit renewal requests.

**Q: How do I know which services I should have access to?**
A: Consult with your manager or the service owner to determine appropriate access levels.

## Contact Support

### IT Help Desk
- **Email**: helpdesk@yourorganization.com
- **Phone**: (xxx) xxx-xxxx
- **Hours**: Monday-Friday, 8 AM - 6 PM

### Security Team
- **Email**: security@yourorganization.com
- **Emergency**: (xxx) xxx-xxxx
- **Available**: 24/7 for security incidents

### Service Owners
Each service has a designated owner responsible for access decisions:
- Contact information available in service details
- Response time: 2-3 business days
- Escalation: Through IT Help Desk

---

**Document Version**: 1.0  
**Last Updated**: 2025-08-20  
**Next Review**: After user feedback collection

For the most current version of this manual, visit the ESM Platform Help Center.