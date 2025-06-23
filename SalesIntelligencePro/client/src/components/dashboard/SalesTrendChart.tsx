import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useState } from "react";
import { formatCurrency } from "@/lib/utils";
import { TrendingUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function SalesTrendChart() {
  const [period, setPeriod] = useState("30");
  
  const { data: salesData, isLoading } = useQuery({
    queryKey: ["/api/dashboard/sales-data", { days: period }],
  });

  const formatData = (data: any[]) => {
    return data?.map(item => ({
      ...item,
      date: new Date(item.date).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      }),
      revenue: Number(item.revenue),
    })) || [];
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {label}
          </p>
          <p className="text-sm text-primary">
            Revenue: {formatCurrency(payload[0].value)}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Orders: {payload[0].payload.orders}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="sales-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Sales Trend
          </CardTitle>
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-64 space-y-3">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-48 w-full" />
          </div>
        ) : (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={formatData(salesData)}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                  className="text-gray-600 dark:text-gray-400"
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => formatCurrency(value)}
                  className="text-gray-600 dark:text-gray-400"
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="hsl(var(--primary))"
                  strokeWidth={3}
                  dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: "hsl(var(--primary))", strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
