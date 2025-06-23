import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { validateFileType, validateFileSize, formatNumber } from "@/lib/utils";
import { Upload, File, X, CheckCircle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface UploadProgress {
  fileName: string;
  progress: number;
  status: 'uploading' | 'processing' | 'completed' | 'error';
  error?: string;
}

export default function FileUploadZone() {
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
  const { toast } = useToast();

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);

      setUploadProgress({
        fileName: file.name,
        progress: 0,
        status: 'uploading'
      });

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (!prev || prev.progress >= 90) return prev;
          return { ...prev, progress: prev.progress + 10 };
        });
      }, 200);

      try {
        const response = await apiRequest("POST", "/api/upload", formData);
        clearInterval(progressInterval);
        
        setUploadProgress(prev => prev ? { 
          ...prev, 
          progress: 100, 
          status: 'processing' 
        } : null);

        const result = await response.json();
        
        // Poll for completion
        await pollUploadStatus(result.id);
        
        return result;
      } catch (error) {
        clearInterval(progressInterval);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/uploads"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/metrics"] });
      
      toast({
        title: "File uploaded successfully",
        description: "Your data has been processed and imported.",
      });
      
      setTimeout(() => {
        setUploadProgress(null);
      }, 3000);
    },
    onError: (error: any) => {
      setUploadProgress(prev => prev ? {
        ...prev,
        status: 'error',
        error: error.message || 'Upload failed'
      } : null);
      
      toast({
        title: "Upload failed",
        description: error.message || "There was an error uploading your file.",
        variant: "destructive",
      });
    },
  });

  const pollUploadStatus = async (fileId: number) => {
    const maxAttempts = 30;
    let attempts = 0;
    
    while (attempts < maxAttempts) {
      try {
        const response = await fetch(`/api/uploads`);
        const uploads = await response.json();
        const upload = uploads.find((u: any) => u.id === fileId);
        
        if (upload) {
          if (upload.status === 'completed') {
            setUploadProgress(prev => prev ? {
              ...prev,
              status: 'completed'
            } : null);
            break;
          } else if (upload.status === 'failed') {
            setUploadProgress(prev => prev ? {
              ...prev,
              status: 'error',
              error: upload.errorMessage || 'Processing failed'
            } : null);
            break;
          }
        }
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        attempts++;
      } catch (error) {
        console.error('Error polling upload status:', error);
        attempts++;
      }
    }
  };

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    if (rejectedFiles.length > 0) {
      const rejection = rejectedFiles[0];
      let errorMessage = "File upload failed";
      
      if (rejection.errors.some((e: any) => e.code === 'file-too-large')) {
        errorMessage = "File is too large. Maximum size is 10MB.";
      } else if (rejection.errors.some((e: any) => e.code === 'file-invalid-type')) {
        errorMessage = "Invalid file type. Please upload CSV or Excel files only.";
      }
      
      toast({
        title: "Upload Error",
        description: errorMessage,
        variant: "destructive",
      });
      return;
    }

    const file = acceptedFiles[0];
    if (!file) return;

    // Additional validation
    if (!validateFileType(file)) {
      toast({
        title: "Invalid file type",
        description: "Please upload CSV or Excel files only.",
        variant: "destructive",
      });
      return;
    }

    if (!validateFileSize(file, 10)) {
      toast({
        title: "File too large",
        description: "Please upload files smaller than 10MB.",
        variant: "destructive",
      });
      return;
    }

    uploadMutation.mutate(file);
  }, [uploadMutation, toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: false,
  });

  const resetUpload = () => {
    setUploadProgress(null);
  };

  if (uploadProgress) {
    return (
      <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                {uploadProgress.status === 'completed' ? (
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                ) : uploadProgress.status === 'error' ? (
                  <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                ) : (
                  <File className="w-5 h-5 text-primary" />
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {uploadProgress.fileName}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {uploadProgress.status === 'uploading' && 'Uploading...'}
                  {uploadProgress.status === 'processing' && 'Processing...'}
                  {uploadProgress.status === 'completed' && 'Upload completed'}
                  {uploadProgress.status === 'error' && 'Upload failed'}
                </p>
              </div>
            </div>
            
            <Button variant="ghost" size="sm" onClick={resetUpload}>
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          {uploadProgress.status !== 'error' && (
            <Progress 
              value={uploadProgress.progress} 
              className="w-full h-2"
            />
          )}
          
          {uploadProgress.error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {uploadProgress.error}
              </AlertDescription>
            </Alert>
          )}
          
          {uploadProgress.status === 'completed' && (
            <div className="text-center">
              <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                File processed successfully!
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      {...getRootProps()}
      className={cn(
        "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors",
        isDragActive 
          ? "border-primary bg-blue-50 dark:bg-blue-950/20" 
          : "border-gray-300 dark:border-gray-600 hover:border-primary hover:bg-gray-50 dark:hover:bg-gray-800"
      )}
    >
      <input {...getInputProps()} />
      
      <div className="space-y-4">
        <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto">
          <Upload className="w-8 h-8 text-primary" />
        </div>
        
        <div>
          <p className="text-lg font-medium text-gray-900 dark:text-gray-100">
            {isDragActive ? "Drop your file here" : "Drop your sales data here"}
          </p>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            or click to browse files
          </p>
        </div>
        
        <div className="flex items-center justify-center space-x-4 text-sm text-gray-400 dark:text-gray-500">
          <div className="flex items-center space-x-1">
            <i className="fas fa-file-csv text-green-600" />
            <span>CSV</span>
          </div>
          <span>•</span>
          <div className="flex items-center space-x-1">
            <i className="fas fa-file-excel text-green-600" />
            <span>Excel</span>
          </div>
          <span>•</span>
          <span>Max 10MB</span>
        </div>
      </div>
    </div>
  );
}
