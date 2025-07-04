import { users, services, accessMatrixData } from "@/lib/data"
import { notFound } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import {
  Edit,
  Mail,
  MapPin,
  Calendar,
  Shield,
  Wifi,
  WifiOff,
  Fingerprint,
  Clock,
  Package,
  Activity,
} from "lucide-react"

interface UserProfilePageProps {
  params: {
    id: string
  }
}

export default function UserProfilePage({ params }: UserProfilePageProps) {
  const user = users.find((u) => u.id === params.id)

  if (!user) {
    notFound()
  }

  const userAccess = accessMatrixData.filter((entry) => entry.userId === user.id)
  const userServices = userAccess
    .map((access) => {
      const service = services.find((s) => s.name === access.serviceName)
      return { ...access, service }
    })
    .filter((item) => item.service)

  const getClearanceVariant = (clearance: string) => {
    switch (clearance) {
      case "Top Secret":
        return "destructive"
      case "Restricted":
        return "default"
      case "Confidential":
        return "secondary"
      default:
        return "outline"
    }
  }

  const getAccessLevelColor = (level: string) => {
    switch (level) {
      case "Full":
        return "text-success"
      case "Limited":
        return "text-primary"
      case "Pending":
        return "text-warning"
      case "Denied":
        return "text-destructive"
      default:
        return "text-muted-foreground"
    }
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={user.avatar || "/placeholder.svg"} />
            <AvatarFallback className="text-lg">{user.name.substring(0, 2)}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-3xl font-bold">{user.name}</h1>
            <p className="text-muted-foreground">{user.position}</p>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={user.status === "active" ? "success" : "secondary"}>{user.status}</Badge>
              <Badge variant={getClearanceVariant(user.securityClearance)}>{user.securityClearance}</Badge>
            </div>
          </div>
        </div>
        <Button>
          <Edit className="mr-2 h-4 w-4" />
          Edit Profile
        </Button>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{user.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  <span>Employee ID: {user.employeeId}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{user.department}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Last Login: {new Date(user.lastLogin).toLocaleString()}</span>
                </div>
                {user.expiresOn && (
                  <div className="flex items-center gap-2 text-amber-600">
                    <Clock className="h-4 w-4" />
                    <span>Account Expires: {new Date(user.expiresOn).toLocaleDateString()}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Access & Permissions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {user.vpnAccess ? (
                      <Wifi className="h-4 w-4 text-primary" />
                    ) : (
                      <WifiOff className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span>VPN Access</span>
                  </div>
                  <Badge variant={user.vpnAccess ? "success" : "secondary"}>
                    {user.vpnAccess ? "Enabled" : "Disabled"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Fingerprint className="h-4 w-4 text-muted-foreground" />
                    <span>Biometric Access</span>
                  </div>
                  <Badge variant={user.biometricAccess ? "success" : "secondary"}>
                    {user.biometricAccess ? "Enabled" : "Disabled"}
                  </Badge>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="font-medium">Security Clearance</span>
                  <Badge variant={getClearanceVariant(user.securityClearance)}>{user.securityClearance}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">Employment Type</span>
                  <Badge variant="outline">{user.employmentType}</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="services" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Service Access</CardTitle>
              <CardDescription>Services this user has access to and their assigned roles.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {userServices.length > 0 ? (
                  userServices.map((item) => (
                    <div key={item.serviceName} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {item.service && <item.service.icon className="h-6 w-6 text-primary" />}
                        <div>
                          <p className="font-medium">{item.serviceName}</p>
                          <p className="text-sm text-muted-foreground">Role: {item.role}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getAccessLevelColor(item.accessLevel)}>{item.accessLevel}</Badge>
                        {item.expiresOn && (
                          <Badge variant="outline">
                            <Clock className="mr-1 h-3 w-3" />
                            Expires {new Date(item.expiresOn).toLocaleDateString()}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Package className="mx-auto h-12 w-12 mb-4" />
                    <p>No service access configured</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>User's recent actions and system events.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Activity className="mx-auto h-12 w-12 mb-4" />
                <p>Activity tracking will be implemented in the next phase</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Manage security-related configurations for this user.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Shield className="mx-auto h-12 w-12 mb-4" />
                <p>Advanced security settings will be implemented in the next phase</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
