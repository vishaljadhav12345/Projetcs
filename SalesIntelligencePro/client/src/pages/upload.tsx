import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import FileUploadZone from "@/components/upload/FileUploadZone";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Upload, FileText, CheckCircle, XCircle, Clock, Eye } from "lucide-react";
import { formatDate, formatNumber } from "@/lib/utils";

export default function UploadPage() {
  const { data: uploads, isLoading } = useQuery({
    queryKey: ["/api/uploads"],
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'processing':
        return <Clock className="w-4 h-4 text-yellow-600 animate-spin" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      
      <main className="flex-1 flex flex-col overflow-hidden">
        <Header />
        
        <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
          {/* Upload Section */}
          <div className="mb-8">
            <Card className="sales-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="w-5 h-5" />
                  Upload Sales Data
                </CardTitle>
                <p className="text-muted-foreground">
                  Upload CSV or Excel files containing your sales data. The system will automatically detect the data type and import it.
                </p>
              </CardHeader>
              <CardContent>
                <FileUploadZone />
                
                {/* Upload Guidelines */}
                <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                    Supported File Formats:
                  </h4>
                  <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                    <li>• CSV files (.csv)</li>
                    <li>• Excel files (.xlsx, .xls)</li>
                    <li>• Maximum file size: 10MB</li>
                  </ul>
                  
                  <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2 mt-4">
                    Supported Data Types:
                  </h4>
                  <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                    <li>• <strong>Customers:</strong> first_name, last_name, email, phone</li>
                    <li>• <strong>Products:</strong> name, description, price, category, sku</li>
                    <li>• <strong>Orders:</strong> customer_id, total_amount, status, order_date</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Upload History */}
          <Card className="sales-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Upload History
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded-lg" />
                    </div>
                  ))}
                </div>
              ) : uploads && uploads.length > 0 ? (
                <div className="space-y-4">
                  {uploads.map((upload) => (
                    <div
                      key={upload.id}
                      className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-sm transition-shadow"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center justify-center w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-lg">
                          <FileText className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                        </div>
                        
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-gray-900 dark:text-gray-100">
                              {upload.originalName}
                            </h4>
                            <Badge className={getStatusColor(upload.status)}>
                              <div className="flex items-center gap-1">
                                {getStatusIcon(upload.status)}
                                {upload.status}
                              </div>
                            </Badge>
                          </div>
                          
                          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                            <span>{formatNumber(upload.fileSize)} bytes</span>
                            <span>•</span>
                            <span>Uploaded {formatDate(upload.uploadedAt)}</span>
                            {upload.recordsImported > 0 && (
                              <>
                                <span>•</span>
                                <span className="text-green-600 dark:text-green-400">
                                  {formatNumber(upload.recordsImported)} records imported
                                </span>
                              </>
                            )}
                          </div>
                          
                          {upload.errorMessage && (
                            <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                              Error: {upload.errorMessage}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {upload.processedAt && (
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            Processed {formatDate(upload.processedAt)}
                          </span>
                        )}
                        
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                    No uploads yet
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    Upload your first file to get started with sales data analysis.
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
