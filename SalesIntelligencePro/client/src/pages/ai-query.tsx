import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import AIQueryInterface from "@/components/ai/AIQueryInterface";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Brain, History, Database, TrendingUp, Users, ShoppingCart } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { formatDateTime } from "@/lib/utils";

interface AIQueryResult {
  id: number;
  question: string;
  sql?: string;
  data?: any[];
  chart?: {
    type: string;
    config: any;
  };
  success: boolean;
  error?: string;
  executionTime: number;
}

export default function AIQueryPage() {
  const [currentResult, setCurrentResult] = useState<AIQueryResult | null>(null);
  const { toast } = useToast();

  const { data: recentQueries, isLoading: queriesLoading } = useQuery({
    queryKey: ["/api/ai/queries"],
  });

  const aiQueryMutation = useMutation({
    mutationFn: async (question: string) => {
      const response = await apiRequest("POST", "/api/ai/query", { question });
      return response.json();
    },
    onSuccess: (result) => {
      setCurrentResult(result);
      queryClient.invalidateQueries({ queryKey: ["/api/ai/queries"] });
      
      if (result.success) {
        toast({
          title: "Query executed successfully",
          description: `Found ${result.data?.length || 0} records in ${result.executionTime}ms`,
        });
      } else {
        toast({
          title: "Query failed",
          description: result.error,
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to process AI query",
        variant: "destructive",
      });
    },
  });

  const quickQueries = [
    {
      icon: TrendingUp,
      title: "Revenue by Month",
      description: "Show monthly revenue for the last 12 months as a line chart",
      query: "Show me monthly revenue for the last 12 months as a line chart"
    },
    {
      icon: Users,
      title: "Top Customers",
      description: "List the top 10 customers by total revenue",
      query: "Who are the top 10 customers by total revenue?"
    },
    {
      icon: ShoppingCart,
      title: "Product Performance",
      description: "Compare product sales performance with previous period",
      query: "Show me product sales performance compared to the previous quarter"
    },
    {
      icon: Database,
      title: "Customer Segmentation",
      description: "Group customers by total spending and show as pie chart",
      query: "Group customers by their total spending levels and show as a pie chart"
    }
  ];

  const handleQuickQuery = (query: string) => {
    aiQueryMutation.mutate(query);
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      
      <main className="flex-1 flex flex-col overflow-hidden">
        <Header />
        
        <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
          {/* AI Query Interface */}
          <div className="mb-8">
            <Card className="sales-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-purple-600" />
                  AI Query Assistant
                </CardTitle>
                <p className="text-muted-foreground">
                  Ask questions about your sales data in natural language. I'll convert them to SQL and provide visualizations.
                </p>
              </CardHeader>
              <CardContent>
                <AIQueryInterface 
                  onQuery={aiQueryMutation.mutate}
                  isLoading={aiQueryMutation.isPending}
                  result={currentResult}
                />
              </CardContent>
            </Card>
          </div>

          {/* Quick Query Templates */}
          <div className="mb-8">
            <Card className="sales-card">
              <CardHeader>
                <CardTitle>Quick Query Templates</CardTitle>
                <p className="text-muted-foreground">
                  Try these pre-built queries to get started
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {quickQueries.map((template, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="h-auto p-4 text-left justify-start"
                      onClick={() => handleQuickQuery(template.query)}
                      disabled={aiQueryMutation.isPending}
                    >
                      <div className="flex items-start gap-3 w-full">
                        <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                          <template.icon className="w-4 h-4 text-primary" />
                        </div>
                        <div className="text-left">
                          <h4 className="font-medium text-gray-900 dark:text-gray-100">
                            {template.title}
                          </h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            {template.description}
                          </p>
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Query History */}
          <Card className="sales-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="w-5 h-5" />
                Query History
              </CardTitle>
            </CardHeader>
            <CardContent>
              {queriesLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded-lg" />
                    </div>
                  ))}
                </div>
              ) : recentQueries && recentQueries.length > 0 ? (
                <div className="space-y-4">
                  {recentQueries.map((query) => (
                    <div
                      key={query.id}
                      className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-sm transition-shadow cursor-pointer"
                      onClick={() => {
                        if (query.success && query.results) {
                          setCurrentResult({
                            id: query.id,
                            question: query.question,
                            sql: query.generatedSql,
                            data: JSON.parse(query.results),
                            success: true,
                            executionTime: query.executionTime,
                          });
                        }
                      }}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-gray-900 dark:text-gray-100 pr-4">
                          {query.question}
                        </h4>
                        <Badge variant={query.success ? "default" : "destructive"}>
                          {query.success ? "Success" : "Failed"}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{formatDateTime(query.createdAt)}</span>
                        <span>•</span>
                        <span>{query.executionTime}ms</span>
                        {query.success && query.results && (
                          <>
                            <span>•</span>
                            <span>{JSON.parse(query.results).length} records</span>
                          </>
                        )}
                      </div>
                      
                      {query.errorMessage && (
                        <p className="text-sm text-red-600 dark:text-red-400 mt-2">
                          {query.errorMessage}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Brain className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                    No queries yet
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    Try asking a question about your sales data to get started.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
