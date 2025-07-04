"use server"

import { users, services } from "@/lib/data"
import type { User } from "@/lib/types"

export async function importUsers(formData: FormData) {
  const file = formData.get("file") as File
  if (!file) {
    return { success: false, message: "No file provided" }
  }

  try {
    const text = await file.text()
    const lines = text.split("\n").filter((line) => line.trim())
    const headers = lines[0].split(",").map((h) => h.trim())

    let processedCount = 0
    const errors: string[] = []

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(",").map((v) => v.trim())
      if (values.length !== headers.length) continue

      try {
        const userData: Partial<User> = {}
        headers.forEach((header, index) => {
          const value = values[index]
          switch (header.toLowerCase()) {
            case "name":
              userData.name = value
              break
            case "email":
              userData.email = value
              break
            case "employeeid":
              userData.employeeId = value
              break
            case "position":
              userData.position = value
              break
            case "department":
              userData.department = value
              break
            case "securityclearance":
              userData.securityClearance = value as User["securityClearance"]
              break
            case "employmenttype":
              userData.employmentType = value as User["employmentType"]
              break
          }
        })

        // Validate required fields
        if (!userData.name || !userData.email || !userData.employeeId) {
          errors.push(`Row ${i + 1}: Missing required fields`)
          continue
        }

        // Add to users array (in real app, this would be database operation)
        processedCount++
      } catch (error) {
        errors.push(`Row ${i + 1}: ${error}`)
      }
    }

    return {
      success: true,
      message: `Successfully processed ${processedCount} users`,
      errors: errors.length > 0 ? errors : undefined,
    }
  } catch (error) {
    return { success: false, message: "Failed to process file" }
  }
}

export async function exportUsers(department?: string, format: "csv" | "json" = "csv") {
  await new Promise((resolve) => setTimeout(resolve, 1000)) // Simulate processing

  let filteredUsers = users
  if (department && department !== "all") {
    filteredUsers = users.filter((user) => user.department === department)
  }

  if (format === "csv") {
    const headers = ["Name", "Email", "Employee ID", "Position", "Department", "Security Clearance", "Status"]
    const csvContent = [
      headers.join(","),
      ...filteredUsers.map((user) =>
        [
          user.name,
          user.email,
          user.employeeId,
          user.position,
          user.department,
          user.securityClearance,
          user.status,
        ].join(","),
      ),
    ].join("\n")

    return {
      success: true,
      data: csvContent,
      filename: `users_export_${new Date().toISOString().split("T")[0]}.csv`,
      recordsProcessed: filteredUsers.length,
    }
  } else {
    return {
      success: true,
      data: JSON.stringify(filteredUsers, null, 2),
      filename: `users_export_${new Date().toISOString().split("T")[0]}.json`,
      recordsProcessed: filteredUsers.length,
    }
  }
}

export async function exportServices(format: "csv" | "json" = "csv") {
  await new Promise((resolve) => setTimeout(resolve, 1000)) // Simulate processing

  if (format === "csv") {
    const headers = ["Name", "Description", "Category", "Active Users", "Health", "Roles"]
    const csvContent = [
      headers.join(","),
      ...services.map((service) =>
        [
          service.name,
          service.description,
          service.category,
          service.activeUsers.toString(),
          service.health,
          service.roles.join(";"),
        ].join(","),
      ),
    ].join("\n")

    return {
      success: true,
      data: csvContent,
      filename: `services_export_${new Date().toISOString().split("T")[0]}.csv`,
      recordsProcessed: services.length,
    }
  } else {
    const exportData = services.map((service) => ({
      name: service.name,
      description: service.description,
      category: service.category,
      activeUsers: service.activeUsers,
      health: service.health,
      roles: service.roles,
    }))

    return {
      success: true,
      data: JSON.stringify(exportData, null, 2),
      filename: `services_export_${new Date().toISOString().split("T")[0]}.json`,
      recordsProcessed: services.length,
    }
  }
}
