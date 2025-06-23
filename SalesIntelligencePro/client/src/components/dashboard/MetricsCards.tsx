import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { DollarSign, ShoppingCart, Users, TrendingUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function MetricsCards() {
  const { data: metrics, isLoading } = useQuery({
    queryKey: ["/api/dashboard/metrics"],
  });

  const metricCards = [
    {
      title: "Total Revenue",
      value: metrics ? formatCurrency(metrics.totalRevenue) : "$0",
      change: metrics?.revenueChange || "+0%",
      icon: DollarSign,
      iconBg: "bg-blue-100 dark:bg-blue-900/20",
      iconColor: "text-primary",
    },
    {
      title: "Total Orders",
      value: metrics ? formatNumber(metrics.totalOrders) : "0",
      change: metrics?.ordersChange || "+0%",
      icon: ShoppingCart,
      iconBg: "bg-green-100 dark:bg-green-900/20",
      iconColor: "text-green-600 dark:text-green-400",
    },
    {
      title: "Active Customers",
      value: metrics ? formatNumber(metrics.activeCustomers) : "0",
      change: metrics?.customersChange || "+0%",
      icon: Users,
      iconBg: "bg-purple-100 dark:bg-purple-900/20",
      iconColor: "text-purple-600 dark:text-purple-400",
    },
    {
      title: "Avg Order Value",
      value: metrics ? formatCurrency(metrics.avgOrderValue) : "$0",
      change: metrics?.avgOrderValueChange || "+0%",
      icon: TrendingUp,
      iconBg: "bg-orange-100 dark:bg-orange-900/20",
      iconColor: "text-orange-600 dark:text-orange-400",
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="sales-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-20" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <Skeleton className="h-12 w-12 rounded-lg" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {metricCards.map((metric, index) => {
        const isPositive = metric.change.startsWith('+');
        return (
          <Card key={index} className="metric-card animate-fade-in">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {metric.title}
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-2">
                    {metric.value}
                  </p>
                  <div className="flex items-center mt-2">
                    <span
                      className={`text-sm font-medium ${
                        isPositive
                          ? "text-green-600 dark:text-green-400"
                          : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      {metric.change}
                    </span>
                    <span className="text-gray-500 dark:text-gray-400 text-sm ml-1">
                      vs last month
                    </span>
                  </div>
                </div>
                <div
                  className={`w-12 h-12 ${metric.iconBg} rounded-lg flex items-center justify-center`}
                >
                  <metric.icon className={`w-6 h-6 ${metric.iconColor}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
