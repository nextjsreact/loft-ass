"use client"

import dynamic from 'next/dynamic'

const ReportCharts = dynamic(() => import('@/components/reports/report-charts'), { ssr: false })

export default function ReportChartsWrapper({ loftRevenue, monthlyRevenue }: { loftRevenue: any[], monthlyRevenue: any[] }) {
  return <ReportCharts loftRevenue={loftRevenue} monthlyRevenue={monthlyRevenue} />
}
