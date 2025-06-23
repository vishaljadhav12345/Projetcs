import OpenAI from "openai";
import { storage } from "../storage";
import { InsertSkuMappingLog, InsertSkuVariant, InsertMasterSku } from "@shared/schema";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_KEY || "default_key"
});

export interface SkuMappingResult {
  sku: string;
  mappedMsku?: string;
  confidence: number;
  method: 'exact_match' | 'fuzzy_match' | 'ai_assisted' | 'manual';
  needsValidation: boolean;
  suggestions?: string[];
}

export class SkuMapper {
  private mappingCache: Map<string, string> = new Map();
  private masterSkuCache: Map<string, any> = new Map();

  constructor() {
    this.initializeCache();
  }

  private async initializeCache() {
    try {
      // Load existing mappings into cache
      const variants = await storage.getAllSkuVariants();
      variants.forEach(variant => {
        this.mappingCache.set(`${variant.sku}:${variant.marketplace}`, variant.mskuId.toString());
      });

      // Load master SKUs into cache
      const masterSkus = await storage.getAllMasterSkus();
      masterSkus.forEach(msku => {
        this.masterSkuCache.set(msku.msku, msku);
      });
    } catch (error) {
      console.error('Failed to initialize SKU mapping cache:', error);
    }
  }

  /**
   * Map a single SKU to its Master SKU
   */
  async mapSku(sku: string, marketplace: string, productName?: string): Promise<SkuMappingResult> {
    const cacheKey = `${sku}:${marketplace}`;
    
    // Check exact cache match first
    if (this.mappingCache.has(cacheKey)) {
      const mskuId = this.mappingCache.get(cacheKey)!;
      const masterSku = await storage.getMasterSku(parseInt(mskuId));
      
      return {
        sku,
        mappedMsku: masterSku?.msku,
        confidence: 1.0,
        method: 'exact_match',
        needsValidation: false
      };
    }

    // Try fuzzy matching with existing SKUs
    const fuzzyResult = await this.fuzzyMatchSku(sku, marketplace, productName);
    if (fuzzyResult.confidence > 0.8) {
      return fuzzyResult;
    }

    // Use AI assistance for complex mappings
    const aiResult = await this.aiAssistedMapping(sku, marketplace, productName);
    if (aiResult.confidence > 0.6) {
      return aiResult;
    }

    // Return unmapped result
    return {
      sku,
      confidence: 0,
      method: 'manual',
      needsValidation: true,
      suggestions: await this.getSuggestions(sku, productName)
    };
  }

  /**
   * Batch map multiple SKUs
   */
  async mapSkuBatch(skuData: Array<{
    sku: string;
    marketplace: string;
    productName?: string;
    category?: string;
  }>): Promise<SkuMappingResult[]> {
    const results: SkuMappingResult[] = [];
    
    for (const item of skuData) {
      const result = await this.mapSku(item.sku, item.marketplace, item.productName);
      results.push(result);
      
      // Log the mapping attempt
      await this.logMapping({
        originalSku: item.sku,
        mappedMsku: result.mappedMsku,
        marketplace: item.marketplace,
        mappingMethod: result.method,
        confidence: result.confidence.toString(),
        validated: !result.needsValidation
      });
    }
    
    return results;
  }

  /**
   * Fuzzy match SKU using string similarity
   */
  private async fuzzyMatchSku(sku: string, marketplace: string, productName?: string): Promise<SkuMappingResult> {
    const normalizedSku = this.normalizeSku(sku);
    const allVariants = await storage.getAllSkuVariants();
    
    let bestMatch: any = null;
    let bestScore = 0;

    for (const variant of allVariants) {
      const normalizedVariant = this.normalizeSku(variant.sku);
      const score = this.calculateSimilarity(normalizedSku, normalizedVariant);
      
      // Boost score if marketplace matches
      const marketplaceBoost = variant.marketplace === marketplace ? 0.2 : 0;
      const finalScore = Math.min(score + marketplaceBoost, 1.0);
      
      if (finalScore > bestScore && finalScore > 0.7) {
        bestScore = finalScore;
        bestMatch = variant;
      }
    }

    if (bestMatch) {
      const masterSku = await storage.getMasterSku(bestMatch.mskuId);
      return {
        sku,
        mappedMsku: masterSku?.msku,
        confidence: bestScore,
        method: 'fuzzy_match',
        needsValidation: bestScore < 0.9
      };
    }

    return {
      sku,
      confidence: 0,
      method: 'fuzzy_match',
      needsValidation: true
    };
  }

  /**
   * AI-assisted SKU mapping using OpenAI
   */
  private async aiAssistedMapping(sku: string, marketplace: string, productName?: string): Promise<SkuMappingResult> {
    try {
      const existingMasterSkus = await storage.getAllMasterSkus();
      const skuContext = existingMasterSkus.slice(0, 20).map(m => 
        `${m.msku}: ${m.productName} (${m.category})`
      ).join('\n');

      const prompt = `
You are a SKU mapping expert. Given a SKU from a marketplace, determine if it matches any existing Master SKU.

SKU to map: "${sku}"
Marketplace: "${marketplace}"
Product Name: "${productName || 'Not provided'}"

Existing Master SKUs:
${skuContext}

Instructions:
1. Analyze the SKU pattern and product name
2. Look for exact or close matches with existing Master SKUs
3. Consider common SKU naming conventions (abbreviations, codes, etc.)
4. Provide confidence score (0.0 to 1.0)

Respond in JSON format:
{
  "mappedMsku": "MSKU-CODE or null if no match",
  "confidence": 0.85,
  "reasoning": "Brief explanation of the mapping decision"
}`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        temperature: 0.1,
      });

      const result = JSON.parse(response.choices[0].message.content);
      
      return {
        sku,
        mappedMsku: result.mappedMsku,
        confidence: result.confidence || 0,
        method: 'ai_assisted',
        needsValidation: result.confidence < 0.8
      };

    } catch (error) {
      console.error('AI-assisted mapping failed:', error);
      return {
        sku,
        confidence: 0,
        method: 'ai_assisted',
        needsValidation: true
      };
    }
  }

  /**
   * Create a new Master SKU for unmapped products
   */
  async createMasterSku(data: {
    productName: string;
    category: string;
    brand?: string;
    description?: string;
    isComboProduct?: boolean;
    comboItems?: string[];
  }): Promise<string> {
    const msku = await this.generateMsku(data.productName, data.category);
    
    const masterSkuData: InsertMasterSku = {
      msku,
      productName: data.productName,
      description: data.description,
      category: data.category,
      brand: data.brand,
      isComboProduct: data.isComboProduct || false,
      comboItems: data.comboItems ? JSON.stringify(data.comboItems) : null
    };

    const created = await storage.createMasterSku(masterSkuData);
    this.masterSkuCache.set(created.msku, created);
    
    return created.msku;
  }

  /**
   * Create SKU variant mapping
   */
  async createSkuVariant(data: {
    sku: string;
    msku: string;
    marketplace: string;
    marketplaceSku?: string;
    price: number;
  }): Promise<void> {
    const masterSku = await storage.getMasterSkuByCode(data.msku);
    if (!masterSku) {
      throw new Error(`Master SKU ${data.msku} not found`);
    }

    const variantData: InsertSkuVariant = {
      sku: data.sku,
      mskuId: masterSku.id,
      marketplace: data.marketplace,
      marketplaceSku: data.marketplaceSku,
      price: data.price.toString(),
      isActive: true
    };

    await storage.createSkuVariant(variantData);
    this.mappingCache.set(`${data.sku}:${data.marketplace}`, masterSku.id.toString());
  }

  /**
   * Validate SKU format
   */
  validateSkuFormat(sku: string, marketplace: string): boolean {
    const formatRules = {
      'amazon': /^[A-Z0-9\-]{8,15}$/i,
      'ebay': /^[A-Z0-9\-_]{3,80}$/i,
      'shopify': /^[A-Z0-9\-_\.]{1,100}$/i,
      'default': /^[A-Z0-9\-_\.]{1,50}$/i
    };

    const pattern = formatRules[marketplace.toLowerCase()] || formatRules.default;
    return pattern.test(sku);
  }

  /**
   * Handle combo products
   */
  async processComboProduct(mainSku: string, componentSkus: string[], marketplace: string): Promise<SkuMappingResult> {
    const componentMappings = await Promise.all(
      componentSkus.map(sku => this.mapSku(sku, marketplace))
    );

    const allMapped = componentMappings.every(mapping => mapping.mappedMsku);
    
    if (allMapped) {
      // Create combo master SKU
      const comboMsku = await this.createMasterSku({
        productName: `Combo: ${mainSku}`,
        category: 'Combo',
        isComboProduct: true,
        comboItems: componentMappings.map(m => m.mappedMsku!)
      });

      return {
        sku: mainSku,
        mappedMsku: comboMsku,
        confidence: 0.95,
        method: 'manual',
        needsValidation: false
      };
    }

    return {
      sku: mainSku,
      confidence: 0,
      method: 'manual',
      needsValidation: true
    };
  }

  // Utility methods
  private normalizeSku(sku: string): string {
    return sku.toUpperCase().replace(/[\s\-_\.]/g, '');
  }

  private calculateSimilarity(str1: string, str2: string): number {
    const len1 = str1.length;
    const len2 = str2.length;
    const matrix = Array(len2 + 1).fill(null).map(() => Array(len1 + 1).fill(null));

    for (let i = 0; i <= len1; i++) matrix[0][i] = i;
    for (let j = 0; j <= len2; j++) matrix[j][0] = j;

    for (let j = 1; j <= len2; j++) {
      for (let i = 1; i <= len1; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,
          matrix[j - 1][i] + 1,
          matrix[j - 1][i - 1] + indicator
        );
      }
    }

    const distance = matrix[len2][len1];
    return 1 - (distance / Math.max(len1, len2));
  }

  private async generateMsku(productName: string, category: string): Promise<string> {
    const prefix = category.substring(0, 3).toUpperCase();
    const nameCode = productName.replace(/[^A-Z0-9]/gi, '').substring(0, 4).toUpperCase();
    const timestamp = Date.now().toString().slice(-4);
    
    return `${prefix}-${nameCode}-${timestamp}`;
  }

  private async getSuggestions(sku: string, productName?: string): Promise<string[]> {
    const masterSkus = await storage.getAllMasterSkus();
    const suggestions: string[] = [];
    
    if (productName) {
      const normalizedName = productName.toLowerCase();
      masterSkus.forEach(msku => {
        if (msku.productName.toLowerCase().includes(normalizedName) || 
            normalizedName.includes(msku.productName.toLowerCase())) {
          suggestions.push(msku.msku);
        }
      });
    }
    
    return suggestions.slice(0, 5);
  }

  private async logMapping(data: InsertSkuMappingLog): Promise<void> {
    try {
      await storage.createSkuMappingLog(data);
    } catch (error) {
      console.error('Failed to log SKU mapping:', error);
    }
  }
}

export const skuMapper = new SkuMapper();