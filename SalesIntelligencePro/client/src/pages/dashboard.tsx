import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import MetricsCards from "@/components/dashboard/MetricsCards";
import SalesTrendChart from "@/components/dashboard/SalesTrendChart";
import TopProducts from "@/components/dashboard/TopProducts";
import RecentOrders from "@/components/dashboard/RecentOrders";
import FileUploadZone from "@/components/upload/FileUploadZone";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Database, Upload, Clock } from "lucide-react";

export default function Dashboard() {
  const { data: schema } = useQuery({
    queryKey: ["/api/database/schema"],
  });

  const { data: recentUploads } = useQuery({
    queryKey: ["/api/uploads"],
  });

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      
      <main className="flex-1 flex flex-col overflow-hidden">
        <Header />
        
        <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
          {/* Quick Stats */}
          <MetricsCards />
          
          {/* Data Upload Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-2">
              <Card className="sales-card">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Upload className="w-5 h-5" />
                      Data Upload
                    </CardTitle>
                    <span className="text-sm text-muted-foreground">
                      CSV, Excel files supported
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <FileUploadZone />
                </CardContent>
              </Card>
            </div>
            
            {/* Recent Uploads */}
            <Card className="sales-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Recent Uploads
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentUploads?.map((upload) => (
                    <div
                      key={upload.id}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          upload.status === 'completed' 
                            ? 'bg-green-100 dark:bg-green-900/20' 
                            : upload.status === 'failed'
                            ? 'bg-red-100 dark:bg-red-900/20'
                            : 'bg-yellow-100 dark:bg-yellow-900/20'
                        }`}>
                          {upload.status === 'completed' ? (
                            <i className="fas fa-check text-green-600 dark:text-green-400 text-sm" />
                          ) : upload.status === 'failed' ? (
                            <i className="fas fa-times text-red-600 dark:text-red-400 text-sm" />
                          ) : (
                            <i className="fas fa-clock text-yellow-600 dark:text-yellow-400 text-sm" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {upload.originalName}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(upload.uploadedAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {(!recentUploads || recentUploads.length === 0) && (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      <Upload className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No files uploaded yet</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Charts and Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <SalesTrendChart />
            <TopProducts />
          </div>
          
          {/* Database Schema and Data Table */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Database Schema */}
            <Card className="sales-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5" />
                  Database Schema
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {schema?.tables?.map((table) => (
                    <div
                      key={table.name}
                      className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-sm transition-shadow"
                    >
                      <div className="flex items-center space-x-2 mb-3">
                        <i className="fas fa-table text-primary" />
                        <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                          {table.name}
                        </h4>
                        <span className="text-xs bg-blue-100 dark:bg-blue-900/20 text-primary px-2 py-1 rounded">
                          {table.rowCount} rows
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 dark:text-gray-400">
                        {table.columns.slice(0, 4).map((column) => (
                          <span key={column}>• {column}</span>
                        ))}
                        {table.columns.length > 4 && (
                          <span className="text-gray-400">
                            +{table.columns.length - 4} more...
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {(!schema?.tables || schema.tables.length === 0) && (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      <Database className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Schema information loading...</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            {/* AI Query Preview */}
            <Card className="sales-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <i className="fas fa-brain text-purple-600" />
                  AI Query Assistant
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="fas fa-brain text-purple-600 dark:text-purple-400 text-2xl" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                    Ask AI About Your Data
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-4">
                    Use natural language to query your sales database and generate insights.
                  </p>
                  <button className="sales-button-gradient flex items-center gap-2 mx-auto">
                    <i className="fas fa-magic" />
                    Open AI Query
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Recent Orders Table */}
          <RecentOrders />
        </div>
      </main>
    </div>
  );
}
