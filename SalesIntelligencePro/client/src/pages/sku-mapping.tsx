import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Package, Plus, Search, CheckCircle, AlertCircle, Upload } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface SkuMappingResult {
  sku: string;
  mappedMsku?: string;
  confidence: number;
  method: 'exact_match' | 'fuzzy_match' | 'ai_assisted' | 'manual';
  needsValidation: boolean;
  suggestions?: string[];
}

interface MasterSku {
  id: number;
  msku: string;
  productName: string;
  category: string;
  brand?: string;
  isComboProduct: boolean;
}

interface SkuVariant {
  id: number;
  sku: string;
  mskuId: number;
  marketplace: string;
  price: string;
  isActive: boolean;
}

export default function SkuMappingPage() {
  const [newSku, setNewSku] = useState("");
  const [marketplace, setMarketplace] = useState("");
  const [productName, setProductName] = useState("");
  const [mappingResults, setMappingResults] = useState<SkuMappingResult[]>([]);
  const [showCreateMaster, setShowCreateMaster] = useState(false);
  const [newMasterSku, setNewMasterSku] = useState({
    productName: "",
    category: "",
    brand: "",
    description: ""
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch master SKUs
  const { data: masterSkus, isLoading: loadingMasterSkus } = useQuery({
    queryKey: ['/api/master-skus'],
    queryFn: () => apiRequest('/api/master-skus'),
  });

  // Fetch SKU variants
  const { data: skuVariants, isLoading: loadingVariants } = useQuery({
    queryKey: ['/api/sku-variants'],
    queryFn: () => apiRequest('/api/sku-variants'),
  });

  // Fetch mapping logs
  const { data: mappingLogs } = useQuery({
    queryKey: ['/api/sku-mapping-logs'],
    queryFn: () => apiRequest('/api/sku-mapping-logs'),
  });

  // Map single SKU mutation
  const mapSkuMutation = useMutation({
    mutationFn: async (data: { sku: string; marketplace: string; productName?: string }) => {
      return apiRequest('/api/sku-mapper/map', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' }
      });
    },
    onSuccess: (result) => {
      setMappingResults(prev => [...prev, result]);
      toast({
        title: "SKU Mapping Complete",
        description: `Mapped ${result.sku} with ${(result.confidence * 100).toFixed(0)}% confidence`,
      });
    },
    onError: () => {
      toast({
        title: "Mapping Failed",
        description: "Failed to map SKU. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Create master SKU mutation
  const createMasterSkuMutation = useMutation({
    mutationFn: async (data: typeof newMasterSku) => {
      return apiRequest('/api/master-skus', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/master-skus'] });
      setShowCreateMaster(false);
      setNewMasterSku({ productName: "", category: "", brand: "", description: "" });
      toast({
        title: "Master SKU Created",
        description: "New master SKU created successfully",
      });
    }
  });

  // Create SKU variant mutation
  const createVariantMutation = useMutation({
    mutationFn: async (data: { sku: string; msku: string; marketplace: string; price: number }) => {
      return apiRequest('/api/sku-variants', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/sku-variants'] });
      toast({
        title: "SKU Variant Created",
        description: "SKU variant mapping created successfully",
      });
    }
  });

  const handleMapSku = () => {
    if (!newSku || !marketplace) {
      toast({
        title: "Missing Information",
        description: "Please provide SKU and marketplace",
        variant: "destructive",
      });
      return;
    }

    mapSkuMutation.mutate({
      sku: newSku,
      marketplace,
      productName: productName || undefined
    });
  };

  const handleCreateMasterSku = () => {
    if (!newMasterSku.productName || !newMasterSku.category) {
      toast({
        title: "Missing Information",
        description: "Product name and category are required",
        variant: "destructive",
      });
      return;
    }

    createMasterSkuMutation.mutate(newMasterSku);
  };

  const handleCreateVariant = (result: SkuMappingResult, msku: string, price: number) => {
    createVariantMutation.mutate({
      sku: result.sku,
      msku,
      marketplace,
      price
    });
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return "bg-green-100 text-green-800";
    if (confidence >= 0.7) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'exact_match': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'fuzzy_match': return <Search className="h-4 w-4 text-yellow-600" />;
      case 'ai_assisted': return <AlertCircle className="h-4 w-4 text-blue-600" />;
      default: return <Package className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">SKU Mapping & Data Management</h1>
        <p className="text-muted-foreground">
          Map marketplace SKUs to Master SKUs for centralized inventory management
        </p>
      </div>

      {/* SKU Mapping Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Map New SKU
          </CardTitle>
          <CardDescription>
            Enter a marketplace SKU to find or create its Master SKU mapping
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sku">SKU</Label>
              <Input
                id="sku"
                placeholder="Enter marketplace SKU"
                value={newSku}
                onChange={(e) => setNewSku(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="marketplace">Marketplace</Label>
              <Select value={marketplace} onValueChange={setMarketplace}>
                <SelectTrigger>
                  <SelectValue placeholder="Select marketplace" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="amazon">Amazon</SelectItem>
                  <SelectItem value="ebay">eBay</SelectItem>
                  <SelectItem value="shopify">Shopify</SelectItem>
                  <SelectItem value="direct">Direct</SelectItem>
                  <SelectItem value="walmart">Walmart</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="productName">Product Name (Optional)</Label>
              <Input
                id="productName"
                placeholder="Product description"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
              />
            </div>
          </div>
          <Button 
            onClick={handleMapSku} 
            disabled={mapSkuMutation.isPending}
            className="w-full md:w-auto"
          >
            {mapSkuMutation.isPending ? "Mapping..." : "Map SKU"}
          </Button>
        </CardContent>
      </Card>

      {/* Mapping Results */}
      {mappingResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Mapping Results</CardTitle>
            <CardDescription>Review and validate SKU mappings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mappingResults.map((result, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getMethodIcon(result.method)}
                      <div>
                        <h4 className="font-medium">{result.sku}</h4>
                        <p className="text-sm text-muted-foreground">
                          {result.mappedMsku || "No mapping found"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getConfidenceColor(result.confidence)}>
                        {(result.confidence * 100).toFixed(0)}% confidence
                      </Badge>
                      <Badge variant="outline">
                        {result.method.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>

                  {result.needsValidation && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                      <p className="text-sm text-yellow-800 mb-2">
                        This mapping needs validation. Would you like to:
                      </p>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => setShowCreateMaster(true)}
                        >
                          Create New Master SKU
                        </Button>
                        {result.suggestions && result.suggestions.length > 0 && (
                          <Select onValueChange={(msku) => handleCreateVariant(result, msku, 0)}>
                            <SelectTrigger className="w-48">
                              <SelectValue placeholder="Map to existing" />
                            </SelectTrigger>
                            <SelectContent>
                              {result.suggestions.map((suggestion) => (
                                <SelectItem key={suggestion} value={suggestion}>
                                  {suggestion}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create Master SKU Modal */}
      {showCreateMaster && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Master SKU</CardTitle>
            <CardDescription>
              Define a new master product for centralized inventory management
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="masterProductName">Product Name</Label>
                <Input
                  id="masterProductName"
                  placeholder="Enter product name"
                  value={newMasterSku.productName}
                  onChange={(e) => setNewMasterSku(prev => ({ ...prev, productName: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  placeholder="Product category"
                  value={newMasterSku.category}
                  onChange={(e) => setNewMasterSku(prev => ({ ...prev, category: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="brand">Brand (Optional)</Label>
                <Input
                  id="brand"
                  placeholder="Brand name"
                  value={newMasterSku.brand}
                  onChange={(e) => setNewMasterSku(prev => ({ ...prev, brand: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Input
                  id="description"
                  placeholder="Product description"
                  value={newMasterSku.description}
                  onChange={(e) => setNewMasterSku(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleCreateMasterSku} disabled={createMasterSkuMutation.isPending}>
                {createMasterSkuMutation.isPending ? "Creating..." : "Create Master SKU"}
              </Button>
              <Button variant="outline" onClick={() => setShowCreateMaster(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Master SKUs</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loadingMasterSkus ? "..." : masterSkus?.length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Centralized product catalog
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">SKU Variants</CardTitle>
            <Search className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loadingVariants ? "..." : skuVariants?.length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Marketplace mappings
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mapping Logs</CardTitle>
            <Upload className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mappingLogs?.length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Mapping activities
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Master SKUs */}
      {masterSkus && masterSkus.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Master SKUs</CardTitle>
            <CardDescription>Centralized product catalog</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {masterSkus.slice(0, 10).map((msku: MasterSku) => (
                <div key={msku.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                  <div>
                    <p className="font-medium">{msku.msku}</p>
                    <p className="text-sm text-muted-foreground">{msku.productName}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{msku.category}</Badge>
                    {msku.isComboProduct && (
                      <Badge variant="outline">Combo</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}