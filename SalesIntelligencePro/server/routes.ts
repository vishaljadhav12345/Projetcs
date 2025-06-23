import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import { storage } from "./storage";
import { insertCustomerSchema, insertProductSchema, insertOrderSchema, insertAiQuerySchema } from "@shared/schema";
import { processUploadedFile } from "./services/fileProcessor";
import { processAIQuery } from "./services/aiQuery";
import { z } from "zod";

const upload = multer({ 
  dest: 'uploads/',
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only CSV and Excel files are allowed.'));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Dashboard metrics
  app.get("/api/dashboard/metrics", async (req, res) => {
    try {
      const metrics = await storage.getDashboardMetrics();
      res.json(metrics);
    } catch (error) {
      console.error("Error fetching dashboard metrics:", error);
      res.status(500).json({ message: "Failed to fetch dashboard metrics" });
    }
  });

  // Sales data for charts
  app.get("/api/dashboard/sales-data", async (req, res) => {
    try {
      const days = parseInt(req.query.days as string) || 30;
      const salesData = await storage.getSalesData(days);
      res.json(salesData);
    } catch (error) {
      console.error("Error fetching sales data:", error);
      res.status(500).json({ message: "Failed to fetch sales data" });
    }
  });

  // Top products
  app.get("/api/dashboard/top-products", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 5;
      const topProducts = await storage.getTopProducts(limit);
      res.json(topProducts);
    } catch (error) {
      console.error("Error fetching top products:", error);
      res.status(500).json({ message: "Failed to fetch top products" });
    }
  });

  // Customer operations
  app.get("/api/customers", async (req, res) => {
    try {
      const customers = await storage.getAllCustomers();
      res.json(customers);
    } catch (error) {
      console.error("Error fetching customers:", error);
      res.status(500).json({ message: "Failed to fetch customers" });
    }
  });

  app.post("/api/customers", async (req, res) => {
    try {
      const customerData = insertCustomerSchema.parse(req.body);
      const customer = await storage.createCustomer(customerData);
      res.status(201).json(customer);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid customer data", errors: error.errors });
      } else {
        console.error("Error creating customer:", error);
        res.status(500).json({ message: "Failed to create customer" });
      }
    }
  });

  app.get("/api/customers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const customer = await storage.getCustomer(id);
      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }
      res.json(customer);
    } catch (error) {
      console.error("Error fetching customer:", error);
      res.status(500).json({ message: "Failed to fetch customer" });
    }
  });

  // Product operations
  app.get("/api/products", async (req, res) => {
    try {
      const products = await storage.getAllProducts();
      res.json(products);
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.post("/api/products", async (req, res) => {
    try {
      const productData = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(productData);
      res.status(201).json(product);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid product data", errors: error.errors });
      } else {
        console.error("Error creating product:", error);
        res.status(500).json({ message: "Failed to create product" });
      }
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const product = await storage.getProduct(id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      console.error("Error fetching product:", error);
      res.status(500).json({ message: "Failed to fetch product" });
    }
  });

  // Order operations
  app.get("/api/orders", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;
      const orders = await storage.getAllOrders(limit, offset);
      res.json(orders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  app.get("/api/orders/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const order = await storage.getOrder(id);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      res.json(order);
    } catch (error) {
      console.error("Error fetching order:", error);
      res.status(500).json({ message: "Failed to fetch order" });
    }
  });

  app.patch("/api/orders/:id/status", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      
      if (!status || !['pending', 'completed', 'cancelled'].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }

      const order = await storage.updateOrderStatus(id, status);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      res.json(order);
    } catch (error) {
      console.error("Error updating order status:", error);
      res.status(500).json({ message: "Failed to update order status" });
    }
  });

  // File upload operations
  app.post("/api/upload", upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const uploadedFile = await storage.createUploadedFile({
        filename: req.file.filename,
        originalName: req.file.originalname,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
        status: "pending",
      });

      // Process file asynchronously
      processUploadedFile(uploadedFile.id, req.file.path, req.file.mimetype)
        .catch(error => console.error("File processing error:", error));

      res.status(201).json(uploadedFile);
    } catch (error) {
      console.error("Error uploading file:", error);
      res.status(500).json({ message: "Failed to upload file" });
    }
  });

  app.get("/api/uploads", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const uploads = await storage.getRecentUploads(limit);
      res.json(uploads);
    } catch (error) {
      console.error("Error fetching uploads:", error);
      res.status(500).json({ message: "Failed to fetch uploads" });
    }
  });

  // AI Query operations
  app.post("/api/ai/query", async (req, res) => {
    try {
      const { question } = req.body;
      
      if (!question || typeof question !== 'string') {
        return res.status(400).json({ message: "Question is required" });
      }

      const startTime = Date.now();
      
      try {
        const result = await processAIQuery(question);
        const executionTime = Date.now() - startTime;

        const aiQuery = await storage.createAiQuery({
          question,
          generatedSql: result.sql,
          results: JSON.stringify(result.data),
          executionTime,
          success: true,
        });

        res.json({
          id: aiQuery.id,
          question: aiQuery.question,
          sql: result.sql,
          data: result.data,
          chart: result.chart,
          executionTime,
          success: true,
        });
      } catch (error) {
        const executionTime = Date.now() - startTime;
        
        const aiQuery = await storage.createAiQuery({
          question,
          executionTime,
          success: false,
          errorMessage: error.message,
        });

        res.status(400).json({
          id: aiQuery.id,
          question: aiQuery.question,
          success: false,
          error: error.message,
          executionTime,
        });
      }
    } catch (error) {
      console.error("Error processing AI query:", error);
      res.status(500).json({ message: "Failed to process AI query" });
    }
  });

  app.get("/api/ai/queries", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const queries = await storage.getRecentAiQueries(limit);
      res.json(queries);
    } catch (error) {
      console.error("Error fetching AI queries:", error);
      res.status(500).json({ message: "Failed to fetch AI queries" });
    }
  });

  // Database schema information
  app.get("/api/database/schema", async (req, res) => {
    try {
      const schema = {
        tables: [
          {
            name: "customers",
            rowCount: await storage.getAllCustomers().then(data => data.length),
            columns: ["id", "first_name", "last_name", "email", "phone", "created_at"],
            primaryKey: "id",
            foreignKeys: [],
          },
          {
            name: "products", 
            rowCount: await storage.getAllProducts().then(data => data.length),
            columns: ["id", "name", "description", "price", "category", "sku", "stock_quantity", "created_at"],
            primaryKey: "id",
            foreignKeys: [],
          },
          {
            name: "orders",
            rowCount: await storage.getAllOrders(1000).then(data => data.length),
            columns: ["id", "customer_id", "order_date", "status", "total_amount", "shipping_address", "notes"],
            primaryKey: "id",
            foreignKeys: ["customer_id -> customers.id"],
          },
          {
            name: "order_items",
            rowCount: 0, // Would need a specific query
            columns: ["id", "order_id", "product_id", "quantity", "unit_price", "total_price"],
            primaryKey: "id",
            foreignKeys: ["order_id -> orders.id", "product_id -> products.id"],
          },
        ],
      };
      res.json(schema);
    } catch (error) {
      console.error("Error fetching database schema:", error);
      res.status(500).json({ message: "Failed to fetch database schema" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
