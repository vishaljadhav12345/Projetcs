import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { 
  Brain, 
  Send, 
  Code, 
  BarChart3, 
  Table as TableIcon, 
  PieChart, 
  TrendingUp,
  Download,
  Copy,
  CheckCircle,
  AlertCircle,
  Loader2
} from "lucide-react";
import { LineChart, Line, BarChart, Bar, PieChart as RechartsPieChart, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { formatCurrency, formatNumber, downloadCSV, downloadJSON } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface AIQueryResult {
  id: number;
  question: string;
  sql?: string;
  data?: any[];
  chart?: {
    type: 'bar' | 'line' | 'pie' | 'table';
    config: any;
  };
  success: boolean;
  error?: string;
  executionTime: number;
}

interface AIQueryInterfaceProps {
  onQuery: (question: string) => void;
  isLoading: boolean;
  result: AIQueryResult | null;
}

const CHART_COLORS = [
  '#2563EB', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
  '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1'
];

export default function AIQueryInterface({ onQuery, isLoading, result }: AIQueryInterfaceProps) {
  const [question, setQuestion] = useState("");
  const [showSQL, setShowSQL] = useState(false);
  const [copiedSQL, setCopiedSQL] = useState(false);
  const { toast } = useToast();

  const quickQueries = [
    "Show me top 10 customers by revenue",
    "Monthly sales trend for last 6 months",
    "Best selling products this quarter",
    "Customer growth rate by month"
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || isLoading) return;
    
    onQuery(question.trim());
  };

  const handleQuickQuery = (query: string) => {
    setQuestion(query);
    onQuery(query);
  };

  const copySQL = async () => {
    if (!result?.sql) return;
    
    try {
      await navigator.clipboard.writeText(result.sql);
      setCopiedSQL(true);
      toast({
        title: "SQL copied",
        description: "SQL query copied to clipboard",
      });
      setTimeout(() => setCopiedSQL(false), 2000);
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Failed to copy SQL to clipboard",
        variant: "destructive",
      });
    }
  };

  const downloadResults = (format: 'csv' | 'json') => {
    if (!result?.data || result.data.length === 0) return;
    
    const filename = `query_results_${Date.now()}.${format}`;
    
    if (format === 'csv') {
      downloadCSV(result.data, filename);
    } else {
      downloadJSON(result.data, filename);
    }
    
    toast({
      title: "Download started",
      description: `Results downloaded as ${format.toUpperCase()}`,
    });
  };

  const renderChart = () => {
    if (!result?.chart || !result.data || result.data.length === 0) return null;

    const { type, config } = result.chart;
    const data = result.data;

    const commonProps = {
      width: "100%",
      height: 300,
    };

    switch (type) {
      case 'line':
        return (
          <ResponsiveContainer {...commonProps}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey={Object.keys(data[0])[0]} 
                tick={{ fontSize: 12 }}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip 
                formatter={(value: any, name: string) => [
                  typeof value === 'number' && name.toLowerCase().includes('revenue') || name.toLowerCase().includes('amount') 
                    ? formatCurrency(value) 
                    : formatNumber(value),
                  name
                ]}
              />
              <Line
                type="monotone"
                dataKey={Object.keys(data[0])[1]}
                stroke={CHART_COLORS[0]}
                strokeWidth={3}
                dot={{ fill: CHART_COLORS[0], strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        );

      case 'bar':
        return (
          <ResponsiveContainer {...commonProps}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey={Object.keys(data[0])[0]} 
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip 
                formatter={(value: any, name: string) => [
                  typeof value === 'number' && name.toLowerCase().includes('revenue') || name.toLowerCase().includes('amount')
                    ? formatCurrency(value) 
                    : formatNumber(value),
                  name
                ]}
              />
              <Bar 
                dataKey={Object.keys(data[0])[1]} 
                fill={CHART_COLORS[0]} 
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'pie':
        const pieData = data.map((item, index) => ({
          ...item,
          fill: CHART_COLORS[index % CHART_COLORS.length]
        }));
        
        return (
          <ResponsiveContainer {...commonProps}>
            <RechartsPieChart>
              <RechartsPieChart
                data={pieData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#8884d8"
                dataKey={Object.keys(data[0])[1]}
                label={(entry) => `${entry[Object.keys(data[0])[0]]}`}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </RechartsPieChart>
              <Tooltip 
                formatter={(value: any) => [
                  typeof value === 'number' ? formatNumber(value) : value
                ]}
              />
              <Legend />
            </RechartsPieChart>
          </ResponsiveContainer>
        );

      default:
        return null;
    }
  };

  const renderResults = () => {
    if (!result) return null;

    if (!result.success) {
      return (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Query failed:</strong> {result.error}
          </AlertDescription>
        </Alert>
      );
    }

    if (!result.data || result.data.length === 0) {
      return (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Query executed successfully but returned no results.
          </AlertDescription>
        </Alert>
      );
    }

    return (
      <div className="space-y-6">
        {/* Query Info */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="flex items-center gap-1">
              <CheckCircle className="w-3 h-3 text-green-600" />
              {result.data.length} records
            </Badge>
            <Badge variant="outline">
              {result.executionTime}ms
            </Badge>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => downloadResults('csv')}>
              <Download className="w-4 h-4 mr-1" />
              CSV
            </Button>
            <Button variant="outline" size="sm" onClick={() => downloadResults('json')}>
              <Download className="w-4 h-4 mr-1" />
              JSON
            </Button>
          </div>
        </div>

        {/* Chart */}
        {result.chart && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {result.chart.type === 'line' && <TrendingUp className="w-5 h-5" />}
                {result.chart.type === 'bar' && <BarChart3 className="w-5 h-5" />}
                {result.chart.type === 'pie' && <PieChart className="w-5 h-5" />}
                {result.chart.config?.title || "Query Results"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {renderChart()}
            </CardContent>
          </Card>
        )}

        {/* SQL Query */}
        {result.sql && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Code className="w-5 h-5" />
                  Generated SQL
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => setShowSQL(!showSQL)}>
                    {showSQL ? "Hide" : "Show"} SQL
                  </Button>
                  {showSQL && (
                    <Button variant="outline" size="sm" onClick={copySQL}>
                      {copiedSQL ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            {showSQL && (
              <CardContent>
                <pre className="text-xs text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto">
                  {result.sql}
                </pre>
              </CardContent>
            )}
          </Card>
        )}

        {/* Data Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TableIcon className="w-5 h-5" />
              Results ({result.data.length} rows)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto max-h-96">
              <Table>
                <TableHeader>
                  <TableRow>
                    {Object.keys(result.data[0]).map((key) => (
                      <TableHead key={key} className="font-semibold">
                        {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {result.data.slice(0, 100).map((row, index) => (
                    <TableRow key={index}>
                      {Object.entries(row).map(([key, value], cellIndex) => (
                        <TableCell key={cellIndex}>
                          {typeof value === 'number' && 
                           (key.toLowerCase().includes('revenue') || 
                            key.toLowerCase().includes('amount') || 
                            key.toLowerCase().includes('price') ||
                            key.toLowerCase().includes('total'))
                            ? formatCurrency(value)
                            : typeof value === 'number'
                            ? formatNumber(value)
                            : String(value)}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              {result.data.length > 100 && (
                <div className="text-center p-4 text-sm text-gray-500 dark:text-gray-400">
                  Showing first 100 rows of {result.data.length} total results.
                  Download full dataset using the export buttons above.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Query Input */}
      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Ask me anything about your sales data... e.g., 'Show me top customers by revenue this month'"
                className="min-h-[120px] pr-12 resize-none"
                disabled={isLoading}
              />
              <Button
                type="submit"
                size="sm"
                className="absolute bottom-3 right-3"
                disabled={!question.trim() || isLoading}
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Quick Query Suggestions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Suggestions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {quickQueries.map((query, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => handleQuickQuery(query)}
                disabled={isLoading}
                className="text-left justify-start"
              >
                {query}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {isLoading && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center space-x-2">
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
              <span className="text-gray-600 dark:text-gray-400">
                Processing your query...
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {result && !isLoading && (
        <div className="space-y-4">
          <Separator />
          {renderResults()}
        </div>
      )}

      {/* Ready State */}
      {!result && !isLoading && (
        <Card>
          <CardContent className="p-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Brain className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                Ready to Help
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Type your question above and I'll generate SQL queries, create charts, and provide insights.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
