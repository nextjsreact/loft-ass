"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, ClipboardList, DollarSign, Users } from "lucide-react"

interface StatsCardsProps {
  stats: {
    totalLofts: number
    occupiedLofts: number
    activeTasks: number
    monthlyRevenue: number
    totalTeams: number
  }
}

export function StatsCards({ stats }: StatsCardsProps) {
  const cards = [
    {
      title: "Total Lofts",
      value: stats.totalLofts,
      icon: Building2,
      description: `${stats.occupiedLofts} occupied`,
    },
    {
      title: "Active Tasks",
      value: stats.activeTasks,
      icon: ClipboardList,
      description: "In progress",
    },
    {
      title: "Monthly Revenue",
      value: `$${stats.monthlyRevenue.toLocaleString()}`,
      icon: DollarSign,
      description: "This month",
    },
    {
      title: "Teams",
      value: stats.totalTeams,
      icon: Users,
      description: "Active teams",
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
            <card.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
            <p className="text-xs text-muted-foreground">{card.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
