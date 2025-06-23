import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { Package, ExternalLink } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function TopProducts() {
  const { data: topProducts, isLoading } = useQuery({
    queryKey: ["/api/dashboard/top-products"],
  });

  if (isLoading) {
    return (
      <Card className="sales-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Top Products
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Skeleton className="w-10 h-10 rounded-lg" />
                  <div>
                    <Skeleton className="h-4 w-32 mb-1" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
                <div className="text-right">
                  <Skeleton className="h-4 w-16 mb-1" />
                  <Skeleton className="h-3 w-12" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="sales-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Top Products
          </CardTitle>
          <Button variant="ghost" size="sm">
            <ExternalLink className="w-4 h-4 mr-2" />
            View All
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {topProducts && topProducts.length > 0 ? (
            topProducts.map((product, index) => {
              const isPositiveGrowth = product.growth.startsWith('+');
              return (
                <div key={product.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                      <Package className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {product.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {formatNumber(product.unitsSold)} units sold
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {formatCurrency(product.totalSales)}
                    </p>
                    <p className={`text-xs ${
                      isPositiveGrowth 
                        ? "text-green-600 dark:text-green-400" 
                        : "text-red-600 dark:text-red-400"
                    }`}>
                      {product.growth}
                    </p>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-8">
              <Package className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No product data available
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
