"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useCallback } from "react"

export function useNavigation() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const navigateToUsers = useCallback(
    (filters?: { department?: string; status?: string; clearance?: string }) => {
      const params = new URLSearchParams()
      if (filters?.department) params.set("department", filters.department)
      if (filters?.status) params.set("status", filters.status)
      if (filters?.clearance) params.set("clearance", filters.clearance)

      const queryString = params.toString()
      router.push(`/users${queryString ? `?${queryString}` : ""}`)
    },
    [router],
  )

  const navigateToServices = useCallback(
    (filters?: { category?: string; health?: string; service?: string }) => {
      const params = new URLSearchParams()
      if (filters?.category) params.set("category", filters.category)
      if (filters?.health) params.set("health", filters.health)
      if (filters?.service) params.set("service", filters.service)

      const queryString = params.toString()
      router.push(`/services${queryString ? `?${queryString}` : ""}`)
    },
    [router],
  )

  const navigateToReports = useCallback(
    (filters?: { type?: string; department?: string; dateRange?: string }) => {
      const params = new URLSearchParams()
      if (filters?.type) params.set("type", filters.type)
      if (filters?.department) params.set("department", filters.department)
      if (filters?.dateRange) params.set("dateRange", filters.dateRange)

      const queryString = params.toString()
      router.push(`/reports${queryString ? `?${queryString}` : ""}`)
    },
    [router],
  )

  const navigateToAuditTrail = useCallback(
    (filters?: { user?: string; actionType?: string; dateRange?: string }) => {
      const params = new URLSearchParams()
      if (filters?.user) params.set("user", filters.user)
      if (filters?.actionType) params.set("actionType", filters.actionType)
      if (filters?.dateRange) params.set("dateRange", filters.dateRange)

      const queryString = params.toString()
      router.push(`/audit-trail${queryString ? `?${queryString}` : ""}`)
    },
    [router],
  )

  const navigateToVPN = useCallback(
    (filters?: { type?: string; group?: string; status?: string }) => {
      const params = new URLSearchParams()
      if (filters?.type) params.set("type", filters.type)
      if (filters?.group) params.set("group", filters.group)
      if (filters?.status) params.set("status", filters.status)

      const queryString = params.toString()
      router.push(`/vpn${queryString ? `?${queryString}` : ""}`)
    },
    [router],
  )

  const navigateToAccessMatrix = useCallback(
    (filters?: { user?: string; service?: string; accessLevel?: string }) => {
      const params = new URLSearchParams()
      if (filters?.user) params.set("user", filters.user)
      if (filters?.service) params.set("service", filters.service)
      if (filters?.accessLevel) params.set("accessLevel", filters.accessLevel)

      const queryString = params.toString()
      router.push(`/access-matrix${queryString ? `?${queryString}` : ""}`)
    },
    [router],
  )

  return {
    navigateToUsers,
    navigateToServices,
    navigateToReports,
    navigateToAuditTrail,
    navigateToVPN,
    navigateToAccessMatrix,
  }
}
