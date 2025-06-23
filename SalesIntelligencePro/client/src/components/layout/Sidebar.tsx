import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Upload, 
  Database, 
  Brain, 
  BarChart3, 
  Settings,
  User
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Data Upload", href: "/upload", icon: Upload },
  { name: "AI Query", href: "/ai-query", icon: Brain },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Database", href: "/database", icon: Database },
  { name: "Settings", href: "/settings", icon: Settings },
];

export default function Sidebar() {
  const [location] = useLocation();

  return (
    <aside className="w-64 bg-white dark:bg-gray-800 shadow-lg border-r border-gray-200 dark:border-gray-700 flex flex-col">
      {/* Logo and Brand */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <BarChart3 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              SalesFlow
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Analytics Platform
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navigation.map((item) => {
          const isActive = location === item.href;
          return (
            <Link key={item.name} href={item.href}>
              <div
                className={cn(
                  "flex items-center px-3 py-2 rounded-lg font-medium transition-colors cursor-pointer",
                  isActive
                    ? "text-primary bg-blue-50 dark:bg-blue-900/20"
                    : "text-gray-600 dark:text-gray-300 hover:text-primary hover:bg-gray-50 dark:hover:bg-gray-700"
                )}
              >
                <item.icon className="w-5 h-5 mr-3" />
                {item.name}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
              Sales Analyst
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Data Team
            </p>
          </div>
          <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <i className="fas fa-ellipsis-v" />
          </button>
        </div>
      </div>
    </aside>
  );
}
