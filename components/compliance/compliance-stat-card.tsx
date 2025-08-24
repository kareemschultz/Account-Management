import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import type { LucideIcon } from "lucide-react"

interface ComplianceStatCardProps {
  title: string
  value: number
  total: number
  icon: LucideIcon
  description: string
}

export function ComplianceStatCard({ title, value, total, icon: Icon, description }: ComplianceStatCardProps) {
  const percentage = total > 0 ? (value / total) * 100 : 0
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-primary">
          {value} / {total}
        </div>
        <p className="text-xs text-muted-foreground mb-2">{description}</p>
        <Progress value={percentage} aria-label={`${percentage}% compliant`} />
      </CardContent>
    </Card>
  )
}
