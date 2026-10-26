import * as React from "react"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card"

interface ChartProps {
  title?: string
  data: any[]
  type?: "line" | "bar"
  xAxisDataKey: string
  series: { dataKey: string; color: string; name?: string }[]
  height?: number
}

export function Chart({
  title,
  data,
  type = "line",
  xAxisDataKey,
  series,
  height = 300,
}: ChartProps) {
  const ChartComponent = type === "line" ? LineChart : BarChart

  return (
    <Card>
      {title && (
        <CardHeader>
          <CardTitle className="text-base font-semibold">{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent>
        <div style={{ height }} className="w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <ChartComponent data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
              <XAxis 
                dataKey={xAxisDataKey} 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} 
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                dx={-10}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: "hsl(var(--popover))", 
                  borderColor: "hsl(var(--border))",
                  borderRadius: "8px",
                  boxShadow: "var(--shadow-card)",
                  color: "hsl(var(--popover-foreground))"
                }} 
              />
              <Legend wrapperStyle={{ paddingTop: "20px" }} />
              {series.map((s) =>
                type === "line" ? (
                  <Line
                    key={s.dataKey}
                    type="monotone"
                    dataKey={s.dataKey}
                    name={s.name || s.dataKey}
                    stroke={s.color}
                    strokeWidth={2}
                    dot={{ r: 4, strokeWidth: 2 }}
                    activeDot={{ r: 6 }}
                  />
                ) : (
                  <Bar
                    key={s.dataKey}
                    dataKey={s.dataKey}
                    name={s.name || s.dataKey}
                    fill={s.color}
                    radius={[4, 4, 0, 0]}
                  />
                )
              )}
            </ChartComponent>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
