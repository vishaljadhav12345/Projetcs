import { 
  customers, 
  products, 
  orders, 
  orderItems, 
  uploadedFiles, 
  aiQueries,
  masterSkus,
  skuVariants,
  warehouseLocations,
  inventory,
  returns,
  returnItems,
  skuMappingLogs,
  type Customer, 
  type InsertCustomer,
  type Product,
  type InsertProduct,
  type Order,
  type InsertOrder,
  type OrderItem,
  type InsertOrderItem,
  type UploadedFile,
  type InsertUploadedFile,
  type AiQuery,
  type InsertAiQuery,
  type MasterSku,
  type InsertMasterSku,
  type SkuVariant,
  type InsertSkuVariant,
  type WarehouseLocation,
  type InsertWarehouseLocation,
  type Inventory,
  type InsertInventory,
  type Return,
  type InsertReturn,
  type ReturnItem,
  type InsertReturnItem,
  type SkuMappingLog,
  type InsertSkuMappingLog,
  type OrderWithCustomerAndItems,
  type MasterSkuWithVariants,
  type InventoryWithDetails,
  type ReturnWithDetails,
  type DashboardMetrics,
  type SalesData,
  type TopProduct
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, asc, sql, and, gte, lt } from "drizzle-orm";

export interface IStorage {
  // Customer operations
  getCustomer(id: number): Promise<Customer | undefined>;
  getCustomerByEmail(email: string): Promise<Customer | undefined>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  getAllCustomers(): Promise<Customer[]>;

  // Product operations
  getProduct(id: number): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  getAllProducts(): Promise<Product[]>;
  updateProduct(id: number, updates: Partial<InsertProduct>): Promise<Product | undefined>;

  // Master SKU operations
  getMasterSku(id: number): Promise<MasterSku | undefined>;
  getMasterSkuByCode(msku: string): Promise<MasterSku | undefined>;
  createMasterSku(masterSku: InsertMasterSku): Promise<MasterSku>;
  getAllMasterSkus(): Promise<MasterSku[]>;
  updateMasterSku(id: number, updates: Partial<InsertMasterSku>): Promise<MasterSku | undefined>;

  // SKU Variant operations
  getSkuVariant(id: number): Promise<SkuVariant | undefined>;
  getSkuVariantBySku(sku: string, marketplace: string): Promise<SkuVariant | undefined>;
  createSkuVariant(variant: InsertSkuVariant): Promise<SkuVariant>;
  getAllSkuVariants(): Promise<SkuVariant[]>;
  updateSkuVariant(id: number, updates: Partial<InsertSkuVariant>): Promise<SkuVariant | undefined>;

  // Warehouse Location operations
  getWarehouseLocation(id: number): Promise<WarehouseLocation | undefined>;
  createWarehouseLocation(location: InsertWarehouseLocation): Promise<WarehouseLocation>;
  getAllWarehouseLocations(): Promise<WarehouseLocation[]>;

  // Inventory operations
  getInventory(mskuId: number, warehouseId: number): Promise<Inventory | undefined>;
  createInventory(inventory: InsertInventory): Promise<Inventory>;
  updateInventory(id: number, updates: Partial<InsertInventory>): Promise<Inventory | undefined>;
  getInventoryByMsku(mskuId: number): Promise<InventoryWithDetails[]>;

  // Order operations
  getOrder(id: number): Promise<OrderWithCustomerAndItems | undefined>;
  createOrder(order: InsertOrder, items: InsertOrderItem[]): Promise<Order>;
  getAllOrders(limit?: number, offset?: number): Promise<OrderWithCustomerAndItems[]>;
  updateOrderStatus(id: number, status: string): Promise<Order | undefined>;

  // Return operations
  getReturn(id: number): Promise<ReturnWithDetails | undefined>;
  createReturn(returnData: InsertReturn): Promise<Return>;
  getAllReturns(limit?: number): Promise<ReturnWithDetails[]>;
  createReturnItem(returnItem: InsertReturnItem): Promise<ReturnItem>;

  // SKU Mapping Log operations
  createSkuMappingLog(log: InsertSkuMappingLog): Promise<SkuMappingLog>;
  getSkuMappingLogs(limit?: number): Promise<SkuMappingLog[]>;

  // File upload operations
  createUploadedFile(file: InsertUploadedFile): Promise<UploadedFile>;
  updateFileStatus(id: number, status: string, errorMessage?: string, recordsImported?: number): Promise<UploadedFile | undefined>;
  getRecentUploads(limit?: number): Promise<UploadedFile[]>;

  // AI Query operations
  createAiQuery(query: InsertAiQuery): Promise<AiQuery>;
  getRecentAiQueries(limit?: number): Promise<AiQuery[]>;

  // Analytics operations
  getDashboardMetrics(): Promise<DashboardMetrics>;
  getSalesData(days: number): Promise<SalesData[]>;
  getTopProducts(limit?: number): Promise<TopProduct[]>;

  // Raw SQL execution for AI queries
  executeRawQuery(sql: string): Promise<any[]>;
}

export class DatabaseStorage implements IStorage {
  async getCustomer(id: number): Promise<Customer | undefined> {
    const [customer] = await db.select().from(customers).where(eq(customers.id, id));
    return customer || undefined;
  }

  async getCustomerByEmail(email: string): Promise<Customer | undefined> {
    const [customer] = await db.select().from(customers).where(eq(customers.email, email));
    return customer || undefined;
  }

  async createCustomer(customer: InsertCustomer): Promise<Customer> {
    const [newCustomer] = await db.insert(customers).values(customer).returning();
    return newCustomer;
  }

  async getAllCustomers(): Promise<Customer[]> {
    return await db.select().from(customers).orderBy(desc(customers.createdAt));
  }

  async getProduct(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product || undefined;
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const [newProduct] = await db.insert(products).values(product).returning();
    return newProduct;
  }

  async getAllProducts(): Promise<Product[]> {
    return await db.select().from(products).orderBy(asc(products.name));
  }

  async updateProduct(id: number, updates: Partial<InsertProduct>): Promise<Product | undefined> {
    const [updatedProduct] = await db
      .update(products)
      .set(updates)
      .where(eq(products.id, id))
      .returning();
    return updatedProduct || undefined;
  }

  // Master SKU operations
  async getMasterSku(id: number): Promise<MasterSku | undefined> {
    const [masterSku] = await db.select().from(masterSkus).where(eq(masterSkus.id, id));
    return masterSku || undefined;
  }

  async getMasterSkuByCode(msku: string): Promise<MasterSku | undefined> {
    const [masterSku] = await db.select().from(masterSkus).where(eq(masterSkus.msku, msku));
    return masterSku || undefined;
  }

  async createMasterSku(masterSku: InsertMasterSku): Promise<MasterSku> {
    const [created] = await db.insert(masterSkus).values(masterSku).returning();
    return created;
  }

  async getAllMasterSkus(): Promise<MasterSku[]> {
    return await db.select().from(masterSkus).orderBy(asc(masterSkus.productName));
  }

  async updateMasterSku(id: number, updates: Partial<InsertMasterSku>): Promise<MasterSku | undefined> {
    const [updated] = await db.update(masterSkus).set(updates).where(eq(masterSkus.id, id)).returning();
    return updated || undefined;
  }

  // SKU Variant operations
  async getSkuVariant(id: number): Promise<SkuVariant | undefined> {
    const [variant] = await db.select().from(skuVariants).where(eq(skuVariants.id, id));
    return variant || undefined;
  }

  async getSkuVariantBySku(sku: string, marketplace: string): Promise<SkuVariant | undefined> {
    const [variant] = await db.select().from(skuVariants)
      .where(and(eq(skuVariants.sku, sku), eq(skuVariants.marketplace, marketplace)));
    return variant || undefined;
  }

  async createSkuVariant(variant: InsertSkuVariant): Promise<SkuVariant> {
    const [created] = await db.insert(skuVariants).values(variant).returning();
    return created;
  }

  async getAllSkuVariants(): Promise<SkuVariant[]> {
    return await db.select().from(skuVariants).orderBy(asc(skuVariants.sku));
  }

  async updateSkuVariant(id: number, updates: Partial<InsertSkuVariant>): Promise<SkuVariant | undefined> {
    const [updated] = await db.update(skuVariants).set(updates).where(eq(skuVariants.id, id)).returning();
    return updated || undefined;
  }

  // Warehouse Location operations
  async getWarehouseLocation(id: number): Promise<WarehouseLocation | undefined> {
    const [location] = await db.select().from(warehouseLocations).where(eq(warehouseLocations.id, id));
    return location || undefined;
  }

  async createWarehouseLocation(location: InsertWarehouseLocation): Promise<WarehouseLocation> {
    const [created] = await db.insert(warehouseLocations).values(location).returning();
    return created;
  }

  async getAllWarehouseLocations(): Promise<WarehouseLocation[]> {
    return await db.select().from(warehouseLocations).orderBy(asc(warehouseLocations.warehouseName));
  }

  // Inventory operations
  async getInventory(mskuId: number, warehouseId: number): Promise<Inventory | undefined> {
    const [inventoryItem] = await db.select().from(inventory)
      .where(and(eq(inventory.mskuId, mskuId), eq(inventory.warehouseLocationId, warehouseId)));
    return inventoryItem || undefined;
  }

  async createInventory(inventoryData: InsertInventory): Promise<Inventory> {
    const [created] = await db.insert(inventory).values(inventoryData).returning();
    return created;
  }

  async updateInventory(id: number, updates: Partial<InsertInventory>): Promise<Inventory | undefined> {
    const [updated] = await db.update(inventory).set(updates).where(eq(inventory.id, id)).returning();
    return updated || undefined;
  }

  async getInventoryByMsku(mskuId: number): Promise<InventoryWithDetails[]> {
    const results = await db.select({
      id: inventory.id,
      mskuId: inventory.mskuId,
      warehouseLocationId: inventory.warehouseLocationId,
      quantityOnHand: inventory.quantityOnHand,
      quantityReserved: inventory.quantityReserved,
      quantityAvailable: inventory.quantityAvailable,
      reorderPoint: inventory.reorderPoint,
      maxStock: inventory.maxStock,
      lastUpdated: inventory.lastUpdated,
      masterSku: masterSkus,
      warehouseLocation: warehouseLocations
    })
      .from(inventory)
      .innerJoin(masterSkus, eq(inventory.mskuId, masterSkus.id))
      .innerJoin(warehouseLocations, eq(inventory.warehouseLocationId, warehouseLocations.id))
      .where(eq(inventory.mskuId, mskuId));
    
    return results as InventoryWithDetails[];
  }

  // Return operations
  async getReturn(id: number): Promise<ReturnWithDetails | undefined> {
    const results = await db.select({
      id: returns.id,
      orderId: returns.orderId,
      customerId: returns.customerId,
      returnDate: returns.returnDate,
      reason: returns.reason,
      status: returns.status,
      refundAmount: returns.refundAmount,
      restockingFee: returns.restockingFee,
      notes: returns.notes,
      processedAt: returns.processedAt,
      customer: customers,
      order: orders
    })
      .from(returns)
      .innerJoin(customers, eq(returns.customerId, customers.id))
      .innerJoin(orders, eq(returns.orderId, orders.id))
      .where(eq(returns.id, id));
    
    if (results.length === 0) return undefined;
    
    const returnData = results[0];
    const returnItemsData = await db.select({
      id: returnItems.id,
      returnId: returnItems.returnId,
      orderItemId: returnItems.orderItemId,
      mskuId: returnItems.mskuId,
      quantity: returnItems.quantity,
      condition: returnItems.condition,
      restockable: returnItems.restockable,
      masterSku: masterSkus,
      orderItem: orderItems
    })
      .from(returnItems)
      .innerJoin(masterSkus, eq(returnItems.mskuId, masterSkus.id))
      .innerJoin(orderItems, eq(returnItems.orderItemId, orderItems.id))
      .where(eq(returnItems.returnId, id));
    
    return {
      ...returnData,
      returnItems: returnItemsData
    } as ReturnWithDetails;
  }

  async createReturn(returnData: InsertReturn): Promise<Return> {
    const [created] = await db.insert(returns).values(returnData).returning();
    return created;
  }

  async getAllReturns(limit = 50): Promise<ReturnWithDetails[]> {
    const results = await db.select({
      id: returns.id,
      orderId: returns.orderId,
      customerId: returns.customerId,
      returnDate: returns.returnDate,
      reason: returns.reason,
      status: returns.status,
      refundAmount: returns.refundAmount,
      restockingFee: returns.restockingFee,
      notes: returns.notes,
      processedAt: returns.processedAt,
      customer: customers,
      order: orders
    })
      .from(returns)
      .innerJoin(customers, eq(returns.customerId, customers.id))
      .innerJoin(orders, eq(returns.orderId, orders.id))
      .orderBy(desc(returns.returnDate))
      .limit(limit);
    
    // For simplicity, we'll return without return items for the list view
    return results.map(result => ({
      ...result,
      returnItems: []
    })) as ReturnWithDetails[];
  }

  async createReturnItem(returnItem: InsertReturnItem): Promise<ReturnItem> {
    const [created] = await db.insert(returnItems).values(returnItem).returning();
    return created;
  }

  // SKU Mapping Log operations
  async createSkuMappingLog(log: InsertSkuMappingLog): Promise<SkuMappingLog> {
    const [created] = await db.insert(skuMappingLogs).values(log).returning();
    return created;
  }

  async getSkuMappingLogs(limit = 100): Promise<SkuMappingLog[]> {
    return await db.select().from(skuMappingLogs)
      .orderBy(desc(skuMappingLogs.createdAt))
      .limit(limit);
  }

  async getOrder(id: number): Promise<OrderWithCustomerAndItems | undefined> {
    const orderData = await db.query.orders.findFirst({
      where: eq(orders.id, id),
      with: {
        customer: true,
        orderItems: {
          with: {
            masterSku: true,
          },
        },
        warehouseLocation: true,
      },
    });
    return orderData || undefined;
  }

  async createOrder(order: InsertOrder, items: InsertOrderItem[]): Promise<Order> {
    const [newOrder] = await db.insert(orders).values(order).returning();
    
    const orderItemsWithOrderId = items.map(item => ({
      ...item,
      orderId: newOrder.id,
    }));
    
    await db.insert(orderItems).values(orderItemsWithOrderId);
    return newOrder;
  }

  async getAllOrders(limit = 50, offset = 0): Promise<OrderWithCustomerAndItems[]> {
    const ordersData = await db.query.orders.findMany({
      limit,
      offset,
      orderBy: desc(orders.orderDate),
      with: {
        customer: true,
        orderItems: {
          with: {
            product: true,
          },
        },
      },
    });
    return ordersData;
  }

  async updateOrderStatus(id: number, status: string): Promise<Order | undefined> {
    const [updatedOrder] = await db
      .update(orders)
      .set({ status })
      .where(eq(orders.id, id))
      .returning();
    return updatedOrder || undefined;
  }

  async createUploadedFile(file: InsertUploadedFile): Promise<UploadedFile> {
    const [newFile] = await db.insert(uploadedFiles).values(file).returning();
    return newFile;
  }

  async updateFileStatus(
    id: number, 
    status: string, 
    errorMessage?: string, 
    recordsImported?: number
  ): Promise<UploadedFile | undefined> {
    const updateData: any = { status };
    if (errorMessage !== undefined) updateData.errorMessage = errorMessage;
    if (recordsImported !== undefined) updateData.recordsImported = recordsImported;
    if (status === "completed" || status === "failed") updateData.processedAt = new Date();

    const [updatedFile] = await db
      .update(uploadedFiles)
      .set(updateData)
      .where(eq(uploadedFiles.id, id))
      .returning();
    return updatedFile || undefined;
  }

  async getRecentUploads(limit = 10): Promise<UploadedFile[]> {
    return await db
      .select()
      .from(uploadedFiles)
      .orderBy(desc(uploadedFiles.uploadedAt))
      .limit(limit);
  }

  async createAiQuery(query: InsertAiQuery): Promise<AiQuery> {
    const [newQuery] = await db.insert(aiQueries).values(query).returning();
    return newQuery;
  }

  async getRecentAiQueries(limit = 10): Promise<AiQuery[]> {
    return await db
      .select()
      .from(aiQueries)
      .orderBy(desc(aiQueries.createdAt))
      .limit(limit);
  }

  async getDashboardMetrics(): Promise<DashboardMetrics> {
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    const twoMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, now.getDate());

    // Current month metrics
    const [currentMetrics] = await db
      .select({
        totalRevenue: sql<string>`COALESCE(SUM(${orders.totalAmount}), 0)`,
        totalOrders: sql<number>`COUNT(*)`,
        activeCustomers: sql<number>`COUNT(DISTINCT ${orders.customerId})`,
        avgOrderValue: sql<string>`COALESCE(AVG(${orders.totalAmount}), 0)`,
      })
      .from(orders)
      .where(gte(orders.orderDate, lastMonth));

    // Previous month metrics for comparison
    const [previousMetrics] = await db
      .select({
        totalRevenue: sql<string>`COALESCE(SUM(${orders.totalAmount}), 0)`,
        totalOrders: sql<number>`COUNT(*)`,
        activeCustomers: sql<number>`COUNT(DISTINCT ${orders.customerId})`,
        avgOrderValue: sql<string>`COALESCE(AVG(${orders.totalAmount}), 0)`,
      })
      .from(orders)
      .where(and(gte(orders.orderDate, twoMonthsAgo), lt(orders.orderDate, lastMonth)));

    // Calculate percentage changes
    const revenueChange = this.calculatePercentageChange(
      parseFloat(currentMetrics.totalRevenue),
      parseFloat(previousMetrics.totalRevenue)
    );
    const ordersChange = this.calculatePercentageChange(
      currentMetrics.totalOrders,
      previousMetrics.totalOrders
    );
    const customersChange = this.calculatePercentageChange(
      currentMetrics.activeCustomers,
      previousMetrics.activeCustomers
    );
    const avgOrderValueChange = this.calculatePercentageChange(
      parseFloat(currentMetrics.avgOrderValue),
      parseFloat(previousMetrics.avgOrderValue)
    );

    return {
      totalRevenue: parseFloat(currentMetrics.totalRevenue).toFixed(2),
      totalOrders: currentMetrics.totalOrders,
      activeCustomers: currentMetrics.activeCustomers,
      avgOrderValue: parseFloat(currentMetrics.avgOrderValue).toFixed(2),
      revenueChange,
      ordersChange,
      customersChange,
      avgOrderValueChange,
    };
  }

  async getSalesData(days: number): Promise<SalesData[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const salesData = await db
      .select({
        date: sql<string>`DATE(${orders.orderDate})`,
        revenue: sql<number>`SUM(${orders.totalAmount})`,
        orders: sql<number>`COUNT(*)`,
      })
      .from(orders)
      .where(gte(orders.orderDate, startDate))
      .groupBy(sql`DATE(${orders.orderDate})`)
      .orderBy(sql`DATE(${orders.orderDate})`);

    return salesData.map(item => ({
      date: item.date,
      revenue: Number(item.revenue),
      orders: item.orders,
    }));
  }

  async getTopProducts(limit = 5): Promise<TopProduct[]> {
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    const twoMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, now.getDate());

    // Current period data
    const currentData = await db
      .select({
        id: products.id,
        name: products.name,
        totalSales: sql<string>`SUM(${orderItems.totalPrice})`,
        unitsSold: sql<number>`SUM(${orderItems.quantity})`,
      })
      .from(orderItems)
      .innerJoin(products, eq(orderItems.productId, products.id))
      .innerJoin(orders, eq(orderItems.orderId, orders.id))
      .where(gte(orders.orderDate, lastMonth))
      .groupBy(products.id, products.name)
      .orderBy(desc(sql`SUM(${orderItems.totalPrice})`))
      .limit(limit);

    // Previous period data for growth calculation
    const previousData = await db
      .select({
        id: products.id,
        totalSales: sql<string>`SUM(${orderItems.totalPrice})`,
      })
      .from(orderItems)
      .innerJoin(products, eq(orderItems.productId, products.id))
      .innerJoin(orders, eq(orderItems.orderId, orders.id))
      .where(and(gte(orders.orderDate, twoMonthsAgo), lt(orders.orderDate, lastMonth)))
      .groupBy(products.id);

    const previousMap = new Map(previousData.map(item => [item.id, parseFloat(item.totalSales)]));

    return currentData.map(item => {
      const previousSales = previousMap.get(item.id) || 0;
      const growth = this.calculatePercentageChange(parseFloat(item.totalSales), previousSales);
      
      return {
        id: item.id,
        name: item.name,
        totalSales: parseFloat(item.totalSales).toFixed(2),
        unitsSold: item.unitsSold,
        growth,
      };
    });
  }

  async executeRawQuery(sqlQuery: string): Promise<any[]> {
    try {
      const result = await db.execute(sql.raw(sqlQuery));
      return result.rows || [];
    } catch (error) {
      throw new Error(`SQL execution error: ${error.message}`);
    }
  }

  private calculatePercentageChange(current: number, previous: number): string {
    if (previous === 0) return current > 0 ? "+100%" : "0%";
    const change = ((current - previous) / previous) * 100;
    return `${change >= 0 ? '+' : ''}${change.toFixed(1)}%`;
  }
}

export const storage = new DatabaseStorage();
