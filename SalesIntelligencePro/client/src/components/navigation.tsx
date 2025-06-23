import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { BarChart3, Upload, Brain, Package, Home } from "lucide-react";

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'SKU Mapping', href: '/sku-mapping', icon: Package },
  { name: 'Data Upload', href: '/upload', icon: Upload },
  { name: 'AI Query', href: '/ai-query', icon: Brain },
];

export function Navigation() {
  const [location] = useLocation();

  return (
    <nav className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-2">
              <Package className="h-8 w-8 text-blue-600" />
              <h1 className="text-xl font-bold text-gray-900">WMS Platform</h1>
            </div>
            
            <div className="flex space-x-6">
              {navigation.map((item) => {
                const isActive = location === item.href || 
                  (item.href !== '/' && location.startsWith(item.href));
                
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                      isActive
                        ? "bg-blue-100 text-blue-700"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-500">Warehouse Management System</span>
          </div>
        </div>
      </div>
    </nav>
  );
}