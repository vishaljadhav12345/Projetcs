import { pgTable, text, serial, integer, decimal, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone"),
  address: text("address"),
  city: text("city"),
  state: text("state"),
  zipCode: text("zip_code"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Master SKU table for centralized product management
export const masterSkus = pgTable("master_skus", {
  id: serial("id").primaryKey(),
  msku: text("msku").notNull().unique(),
  productName: text("product_name").notNull(),
  description: text("description"),
  category: text("category").notNull(),
  brand: text("brand"),
  weight: decimal("weight", { precision: 8, scale: 2 }),
  dimensions: jsonb("dimensions"), // {length, width, height}
  isComboProduct: boolean("is_combo_product").default(false),
  comboItems: jsonb("combo_items"), // Array of MSKUs for combo products
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// SKU variants table for marketplace-specific identifiers
export const skuVariants = pgTable("sku_variants", {
  id: serial("id").primaryKey(),
  sku: text("sku").notNull().unique(),
  mskuId: integer("msku_id").references(() => masterSkus.id).notNull(),
  marketplace: text("marketplace").notNull(), // Amazon, eBay, Shopify, etc.
  marketplaceSku: text("marketplace_sku"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  isActive: boolean("is_active").default(true),
  lastMapped: timestamp("last_mapped").defaultNow(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Warehouse locations
export const warehouseLocations = pgTable("warehouse_locations", {
  id: serial("id").primaryKey(),
  locationCode: text("location_code").notNull().unique(),
  warehouseName: text("warehouse_name").notNull(),
  address: text("address").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  zipCode: text("zip_code").notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Inventory tracking
export const inventory = pgTable("inventory", {
  id: serial("id").primaryKey(),
  mskuId: integer("msku_id").references(() => masterSkus.id).notNull(),
  warehouseLocationId: integer("warehouse_location_id").references(() => warehouseLocations.id).notNull(),
  quantityOnHand: integer("quantity_on_hand").default(0).notNull(),
  quantityReserved: integer("quantity_reserved").default(0).notNull(),
  quantityAvailable: integer("quantity_available").default(0).notNull(),
  reorderPoint: integer("reorder_point").default(0),
  maxStock: integer("max_stock"),
  lastUpdated: timestamp("last_updated").defaultNow().notNull(),
});

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  category: text("category").notNull(),
  sku: text("sku").unique(),
  stockQuantity: integer("stock_quantity").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").references(() => customers.id).notNull(),
  orderDate: timestamp("order_date").defaultNow().notNull(),
  status: text("status").notNull().default("pending"), // pending, processing, shipped, delivered, cancelled, returned
  marketplace: text("marketplace").notNull(), // Amazon, eBay, Shopify, Direct, etc.
  marketplaceOrderId: text("marketplace_order_id"),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  shippingAddress: text("shipping_address"),
  warehouseLocationId: integer("warehouse_location_id").references(() => warehouseLocations.id),
  trackingNumber: text("tracking_number"),
  shippingMethod: text("shipping_method"),
  notes: text("notes"),
  fulfillmentStatus: text("fulfillment_status").default("pending"),
});

export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").references(() => orders.id).notNull(),
  mskuId: integer("msku_id").references(() => masterSkus.id).notNull(),
  sku: text("sku").notNull(), // Original marketplace SKU
  quantity: integer("quantity").notNull(),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  totalPrice: decimal("total_price", { precision: 10, scale: 2 }).notNull(),
  warehouseLocationId: integer("warehouse_location_id").references(() => warehouseLocations.id),
  fulfillmentStatus: text("fulfillment_status").default("pending"),
});

// Returns management
export const returns = pgTable("returns", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").references(() => orders.id).notNull(),
  customerId: integer("customer_id").references(() => customers.id).notNull(),
  returnDate: timestamp("return_date").defaultNow().notNull(),
  reason: text("reason").notNull(),
  status: text("status").notNull().default("pending"), // pending, approved, rejected, processed
  refundAmount: decimal("refund_amount", { precision: 10, scale: 2 }),
  restockingFee: decimal("restocking_fee", { precision: 10, scale: 2 }).default("0.00"),
  notes: text("notes"),
  processedAt: timestamp("processed_at"),
});

export const returnItems = pgTable("return_items", {
  id: serial("id").primaryKey(),
  returnId: integer("return_id").references(() => returns.id).notNull(),
  orderItemId: integer("order_item_id").references(() => orderItems.id).notNull(),
  mskuId: integer("msku_id").references(() => masterSkus.id).notNull(),
  quantity: integer("quantity").notNull(),
  condition: text("condition").notNull(), // new, used, damaged, defective
  restockable: boolean("restockable").default(true),
});

// SKU mapping logs for tracking automatic mappings
export const skuMappingLogs = pgTable("sku_mapping_logs", {
  id: serial("id").primaryKey(),
  originalSku: text("original_sku").notNull(),
  mappedMsku: text("mapped_msku"),
  marketplace: text("marketplace").notNull(),
  mappingMethod: text("mapping_method").notNull(), // manual, automatic, ai_assisted
  confidence: decimal("confidence", { precision: 3, scale: 2 }), // 0.00 to 1.00
  validated: boolean("validated").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  validatedBy: text("validated_by"),
  validatedAt: timestamp("validated_at"),
});

export const uploadedFiles = pgTable("uploaded_files", {
  id: serial("id").primaryKey(),
  filename: text("filename").notNull(),
  originalName: text("original_name").notNull(),
  fileSize: integer("file_size").notNull(),
  mimeType: text("mime_type").notNull(),
  uploadedAt: timestamp("uploaded_at").defaultNow().notNull(),
  processedAt: timestamp("processed_at"),
  status: text("status").notNull().default("pending"), // pending, processing, completed, failed
  errorMessage: text("error_message"),
  recordsImported: integer("records_imported").default(0),
});

export const aiQueries = pgTable("ai_queries", {
  id: serial("id").primaryKey(),
  question: text("question").notNull(),
  generatedSql: text("generated_sql"),
  results: text("results"), // JSON string
  createdAt: timestamp("created_at").defaultNow().notNull(),
  executionTime: integer("execution_time"), // milliseconds
  success: boolean("success").default(false),
  errorMessage: text("error_message"),
});

// Relations
export const customersRelations = relations(customers, ({ many }) => ({
  orders: many(orders),
  returns: many(returns),
}));

export const masterSkusRelations = relations(masterSkus, ({ many }) => ({
  skuVariants: many(skuVariants),
  orderItems: many(orderItems),
  inventory: many(inventory),
  returnItems: many(returnItems),
}));

export const skuVariantsRelations = relations(skuVariants, ({ one }) => ({
  masterSku: one(masterSkus, {
    fields: [skuVariants.mskuId],
    references: [masterSkus.id],
  }),
}));

export const warehouseLocationsRelations = relations(warehouseLocations, ({ many }) => ({
  inventory: many(inventory),
  orders: many(orders),
  orderItems: many(orderItems),
}));

export const inventoryRelations = relations(inventory, ({ one }) => ({
  masterSku: one(masterSkus, {
    fields: [inventory.mskuId],
    references: [masterSkus.id],
  }),
  warehouseLocation: one(warehouseLocations, {
    fields: [inventory.warehouseLocationId],
    references: [warehouseLocations.id],
  }),
}));

export const productsRelations = relations(products, ({ many }) => ({
  orderItems: many(orderItems),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  customer: one(customers, {
    fields: [orders.customerId],
    references: [customers.id],
  }),
  warehouseLocation: one(warehouseLocations, {
    fields: [orders.warehouseLocationId],
    references: [warehouseLocations.id],
  }),
  orderItems: many(orderItems),
  returns: many(returns),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  masterSku: one(masterSkus, {
    fields: [orderItems.mskuId],
    references: [masterSkus.id],
  }),
  warehouseLocation: one(warehouseLocations, {
    fields: [orderItems.warehouseLocationId],
    references: [warehouseLocations.id],
  }),
}));

export const returnsRelations = relations(returns, ({ one, many }) => ({
  order: one(orders, {
    fields: [returns.orderId],
    references: [orders.id],
  }),
  customer: one(customers, {
    fields: [returns.customerId],
    references: [customers.id],
  }),
  returnItems: many(returnItems),
}));

export const returnItemsRelations = relations(returnItems, ({ one }) => ({
  return: one(returns, {
    fields: [returnItems.returnId],
    references: [returns.id],
  }),
  orderItem: one(orderItems, {
    fields: [returnItems.orderItemId],
    references: [orderItems.id],
  }),
  masterSku: one(masterSkus, {
    fields: [returnItems.mskuId],
    references: [masterSkus.id],
  }),
}));

// Schemas
export const insertCustomerSchema = createInsertSchema(customers).omit({
  id: true,
  createdAt: true,
});

export const insertMasterSkuSchema = createInsertSchema(masterSkus).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSkuVariantSchema = createInsertSchema(skuVariants).omit({
  id: true,
  lastMapped: true,
  createdAt: true,
});

export const insertWarehouseLocationSchema = createInsertSchema(warehouseLocations).omit({
  id: true,
  createdAt: true,
});

export const insertInventorySchema = createInsertSchema(inventory).omit({
  id: true,
  lastUpdated: true,
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  createdAt: true,
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  orderDate: true,
});

export const insertOrderItemSchema = createInsertSchema(orderItems).omit({
  id: true,
});

export const insertReturnSchema = createInsertSchema(returns).omit({
  id: true,
  returnDate: true,
  processedAt: true,
});

export const insertReturnItemSchema = createInsertSchema(returnItems).omit({
  id: true,
});

export const insertSkuMappingLogSchema = createInsertSchema(skuMappingLogs).omit({
  id: true,
  createdAt: true,
  validatedAt: true,
});

export const insertUploadedFileSchema = createInsertSchema(uploadedFiles).omit({
  id: true,
  uploadedAt: true,
  processedAt: true,
});

export const insertAiQuerySchema = createInsertSchema(aiQueries).omit({
  id: true,
  createdAt: true,
});

// Types
export type Customer = typeof customers.$inferSelect;
export type InsertCustomer = z.infer<typeof insertCustomerSchema>;

export type MasterSku = typeof masterSkus.$inferSelect;
export type InsertMasterSku = z.infer<typeof insertMasterSkuSchema>;

export type SkuVariant = typeof skuVariants.$inferSelect;
export type InsertSkuVariant = z.infer<typeof insertSkuVariantSchema>;

export type WarehouseLocation = typeof warehouseLocations.$inferSelect;
export type InsertWarehouseLocation = z.infer<typeof insertWarehouseLocationSchema>;

export type Inventory = typeof inventory.$inferSelect;
export type InsertInventory = z.infer<typeof insertInventorySchema>;

export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;

export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;

export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;

export type Return = typeof returns.$inferSelect;
export type InsertReturn = z.infer<typeof insertReturnSchema>;

export type ReturnItem = typeof returnItems.$inferSelect;
export type InsertReturnItem = z.infer<typeof insertReturnItemSchema>;

export type SkuMappingLog = typeof skuMappingLogs.$inferSelect;
export type InsertSkuMappingLog = z.infer<typeof insertSkuMappingLogSchema>;

export type UploadedFile = typeof uploadedFiles.$inferSelect;
export type InsertUploadedFile = z.infer<typeof insertUploadedFileSchema>;

export type AiQuery = typeof aiQueries.$inferSelect;
export type InsertAiQuery = z.infer<typeof insertAiQuerySchema>;

// Complex types for API responses
export type OrderWithCustomerAndItems = Order & {
  customer: Customer;
  orderItems: (OrderItem & { masterSku: MasterSku })[];
  warehouseLocation?: WarehouseLocation;
};

export type MasterSkuWithVariants = MasterSku & {
  skuVariants: SkuVariant[];
  inventory: (Inventory & { warehouseLocation: WarehouseLocation })[];
};

export type InventoryWithDetails = Inventory & {
  masterSku: MasterSku;
  warehouseLocation: WarehouseLocation;
};

export type ReturnWithDetails = Return & {
  customer: Customer;
  order: Order;
  returnItems: (ReturnItem & { 
    masterSku: MasterSku;
    orderItem: OrderItem;
  })[];
};

export type DashboardMetrics = {
  totalRevenue: string;
  totalOrders: number;
  activeCustomers: number;
  avgOrderValue: string;
  revenueChange: string;
  ordersChange: string;
  customersChange: string;
  avgOrderValueChange: string;
};

export type SalesData = {
  date: string;
  revenue: number;
  orders: number;
};

export type TopProduct = {
  id: number;
  name: string;
  totalSales: string;
  unitsSold: number;
  growth: string;
};
