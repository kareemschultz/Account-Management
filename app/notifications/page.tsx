"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Bell, Mail, MessageSquare, Smartphone, Settings, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface NotificationRule {
  id: string
  name: string
  description: string
  trigger: string
  channels: string[]
  template: string
  enabled: boolean
  frequency: string
  recipients: string[]
}

interface NotificationTemplate {
  id: string
  name: string
  subject: string
  body: string
  variables: string[]
}

const mockRules: NotificationRule[] = [
  {
    id: "1",
    name: "Account Expiry Warning",
    description: "Notify users 30 days before account expiry",
    trigger: "account_expiry",
    channels: ["email", "slack"],
    template: "expiry_warning",
    enabled: true,
    frequency: "daily",
    recipients: ["user", "manager"],
  },
  {
    id: "2",
    name: "Failed Login Attempts",
    description: "Alert on multiple failed login attempts",
    trigger: "failed_login",
    channels: ["email", "sms"],
    template: "security_alert",
    enabled: true,
    frequency: "immediate",
    recipients: ["security_team"],
  },
]

const mockTemplates: NotificationTemplate[] = [
  {
    id: "expiry_warning",
    name: "Account Expiry Warning",
    subject: "Your account expires in {{days}} days",
    body: "Hello {{user_name}},\n\nYour account for {{service_name}} will expire on {{expiry_date}}. Please contact your administrator to extend access.\n\nBest regards,\nESM Platform",
    variables: ["user_name", "service_name", "expiry_date", "days"],
  },
  {
    id: "security_alert",
    name: "Security Alert",
    subject: "Security Alert: Multiple Failed Login Attempts",
    body: "Security Alert!\n\nMultiple failed login attempts detected for user {{user_name}} from IP {{ip_address}} at {{timestamp}}.\n\nPlease investigate immediately.\n\nESM Security Team",
    variables: ["user_name", "ip_address", "timestamp"],
  },
]

export default function NotificationsPage() {
  const [rules, setRules] = useState<NotificationRule[]>(mockRules)
  const [templates, setTemplates] = useState<NotificationTemplate[]>(mockTemplates)
  const [showAddRule, setShowAddRule] = useState(false)
  const [showAddTemplate, setShowAddTemplate] = useState(false)
  const { toast } = useToast()

  const [newRule, setNewRule] = useState({
    name: "",
    description: "",
    trigger: "",
    channels: [] as string[],
    template: "",
    enabled: true,
    frequency: "",
    recipients: [] as string[],
  })

  const [newTemplate, setNewTemplate] = useState({
    name: "",
    subject: "",
    body: "",
    variables: [] as string[],
  })

  const handleAddRule = () => {
    if (!newRule.name || !newRule.trigger) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    const rule: NotificationRule = {
      id: Date.now().toString(),
      ...newRule,
    }

    setRules([...rules, rule])
    setNewRule({
      name: "",
      description: "",
      trigger: "",
      channels: [],
      template: "",
      enabled: true,
      frequency: "",
      recipients: [],
    })
    setShowAddRule(false)

    toast({
      title: "Success",
      description: "Notification rule added successfully",
    })
  }

  const handleToggleRule = (ruleId: string) => {
    setRules(rules.map((rule) => (rule.id === ruleId ? { ...rule, enabled: !rule.enabled } : rule)))

    toast({
      title: "Rule Updated",
      description: "Notification rule has been updated",
    })
  }

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case "email":
        return <Mail className="h-4 w-4" />
      case "slack":
        return <MessageSquare className="h-4 w-4" />
      case "sms":
        return <Smartphone className="h-4 w-4" />
      default:
        return <Bell className="h-4 w-4" />
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Notification Management</h1>
          <p className="text-muted-foreground">Configure automated notifications and alerts</p>
        </div>
      </div>

      <Tabs defaultValue="rules" className="space-y-4">
        <TabsList>
          <TabsTrigger value="rules">Notification Rules</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="rules" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Notification Rules</h2>
            <Button onClick={() => setShowAddRule(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Rule
            </Button>
          </div>

          {showAddRule && (
            <Card>
              <CardHeader>
                <CardTitle>Add Notification Rule</CardTitle>
                <CardDescription>Configure a new notification rule</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="ruleName">Rule Name *</Label>
                    <Input
                      id="ruleName"
                      value={newRule.name}
                      onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
                      placeholder="e.g., Account Expiry Warning"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="trigger">Trigger Event *</Label>
                    <Select
                      value={newRule.trigger}
                      onValueChange={(value) => setNewRule({ ...newRule, trigger: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select trigger" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="account_expiry">Account Expiry</SelectItem>
                        <SelectItem value="failed_login">Failed Login</SelectItem>
                        <SelectItem value="new_user">New User Created</SelectItem>
                        <SelectItem value="permission_change">Permission Change</SelectItem>
                        <SelectItem value="bulk_operation">Bulk Operation</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newRule.description}
                    onChange={(e) => setNewRule({ ...newRule, description: e.target.value })}
                    placeholder="Brief description of when this rule triggers"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="frequency">Frequency</Label>
                    <Select
                      value={newRule.frequency}
                      onValueChange={(value) => setNewRule({ ...newRule, frequency: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="immediate">Immediate</SelectItem>
                        <SelectItem value="daily">Daily Digest</SelectItem>
                        <SelectItem value="weekly">Weekly Summary</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="template">Template</Label>
                    <Select
                      value={newRule.template}
                      onValueChange={(value) => setNewRule({ ...newRule, template: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select template" />
                      </SelectTrigger>
                      <SelectContent>
                        {templates.map((template) => (
                          <SelectItem key={template.id} value={template.id}>
                            {template.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="enabled"
                    checked={newRule.enabled}
                    onCheckedChange={(checked) => setNewRule({ ...newRule, enabled: checked })}
                  />
                  <Label htmlFor="enabled">Enable this rule</Label>
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleAddRule}>Add Rule</Button>
                  <Button variant="outline" onClick={() => setShowAddRule(false)}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid gap-4">
            {rules.map((rule) => (
              <Card key={rule.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold">{rule.name}</h3>
                        <Badge variant={rule.enabled ? "default" : "secondary"}>
                          {rule.enabled ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{rule.description}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>Trigger: {rule.trigger}</span>
                        <span>Frequency: {rule.frequency}</span>
                        <div className="flex items-center gap-1">
                          <span>Channels:</span>
                          {rule.channels.map((channel) => (
                            <div key={channel} className="flex items-center gap-1">
                              {getChannelIcon(channel)}
                              <span>{channel}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch checked={rule.enabled} onCheckedChange={() => handleToggleRule(rule.id)} />
                      <Button variant="outline" size="sm">
                        <Settings className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Notification Templates</h2>
            <Button onClick={() => setShowAddTemplate(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Template
            </Button>
          </div>

          <div className="grid gap-4">
            {templates.map((template) => (
              <Card key={template.id}>
                <CardHeader>
                  <CardTitle>{template.name}</CardTitle>
                  <CardDescription>Subject: {template.subject}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label>Message Body</Label>
                      <div className="mt-1 p-3 bg-muted rounded-md text-sm">{template.body}</div>
                    </div>
                    <div>
                      <Label>Available Variables</Label>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {template.variables.map((variable) => (
                          <Badge key={variable} variant="outline">
                            {`{{${variable}}}`}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification History</CardTitle>
              <CardDescription>Recent notification deliveries and status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No notification history available</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>Configure global notification preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">Enable email notifications</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Slack Integration</Label>
                  <p className="text-sm text-muted-foreground">Enable Slack notifications</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>SMS Notifications</Label>
                  <p className="text-sm text-muted-foreground">Enable SMS notifications</p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
