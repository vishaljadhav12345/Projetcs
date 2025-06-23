import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Navigation } from "@/components/navigation";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Upload from "@/pages/upload";
import AIQuery from "@/pages/ai-query";
import SkuMapping from "@/pages/sku-mapping";

function Router() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <Switch>
          <Route path="/" component={Dashboard} />
          <Route path="/upload" component={Upload} />
          <Route path="/ai-query" component={AIQuery} />
          <Route path="/sku-mapping" component={SkuMapping} />
          <Route component={NotFound} />
        </Switch>
      </main>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
