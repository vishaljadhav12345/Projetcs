import OpenAI from "openai";
import { storage } from "../storage";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_KEY || "default_key"
});

interface AIQueryResult {
  sql: string;
  data: any[];
  chart?: {
    type: 'bar' | 'line' | 'pie' | 'table';
    config: any;
  };
}

const DATABASE_SCHEMA = `
Database Schema:

Table: customers
- id (Primary Key, Integer)
- first_name (Text)
- last_name (Text) 
- email (Text, Unique)
- phone (Text)
- created_at (Timestamp)

Table: products
- id (Primary Key, Integer)
- name (Text)
- description (Text)
- price (Decimal)
- category (Text)
- sku (Text, Unique)
- stock_quantity (Integer)
- created_at (Timestamp)

Table: orders
- id (Primary Key, Integer)
- customer_id (Foreign Key -> customers.id)
- order_date (Timestamp)
- status (Text: pending, completed, cancelled)
- total_amount (Decimal)
- shipping_address (Text)
- notes (Text)

Table: order_items
- id (Primary Key, Integer)
- order_id (Foreign Key -> orders.id)
- product_id (Foreign Key -> products.id)
- quantity (Integer)
- unit_price (Decimal)
- total_price (Decimal)

Relationships:
- customers -> orders (one to many)
- orders -> order_items (one to many)
- products -> order_items (one to many)
`;

export async function processAIQuery(question: string): Promise<AIQueryResult> {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a SQL expert assistant for a sales database. Generate PostgreSQL queries based on user questions.

${DATABASE_SCHEMA}

Instructions:
1. Generate valid PostgreSQL SQL queries only
2. Use proper table joins when needed
3. Include appropriate WHERE, GROUP BY, ORDER BY clauses
4. Limit results to reasonable amounts (use LIMIT)
5. Format money values properly
6. Suggest appropriate chart types for the data
7. Return response in JSON format

Response format:
{
  "sql": "SELECT query here",
  "explanation": "Brief explanation of what the query does",
  "chart_type": "bar|line|pie|table",
  "chart_config": {
    "title": "Chart title",
    "x_axis": "X-axis label",
    "y_axis": "Y-axis label"
  }
}`
        },
        {
          role: "user",
          content: question
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.1,
    });

    const response = JSON.parse(completion.choices[0].message.content);
    
    if (!response.sql) {
      throw new Error("No SQL query generated");
    }

    // Execute the generated SQL
    const data = await storage.executeRawQuery(response.sql);

    const result: AIQueryResult = {
      sql: response.sql,
      data: data,
    };

    // Add chart configuration if suggested
    if (response.chart_type && response.chart_type !== 'table') {
      result.chart = {
        type: response.chart_type,
        config: {
          title: response.chart_config?.title || "Query Results",
          xAxis: response.chart_config?.x_axis || "X Axis",
          yAxis: response.chart_config?.y_axis || "Y Axis",
          ...response.chart_config
        }
      };
    }

    return result;

  } catch (error) {
    console.error("AI Query Error:", error);
    
    if (error.message.includes("SQL execution error")) {
      throw new Error(`SQL Error: ${error.message}`);
    } else if (error.message.includes("OpenAI")) {
      throw new Error("AI service temporarily unavailable. Please try again.");
    } else {
      throw new Error(`Query processing failed: ${error.message}`);
    }
  }
}

// Helper function for common queries
export function getQuickQuerySQL(queryType: string): string {
  const quickQueries = {
    'top-customers': `
      SELECT 
        CONCAT(c.first_name, ' ', c.last_name) as customer_name,
        SUM(o.total_amount) as total_revenue,
        COUNT(o.id) as order_count
      FROM customers c
      JOIN orders o ON c.id = o.customer_id
      WHERE o.status = 'completed'
      GROUP BY c.id, c.first_name, c.last_name
      ORDER BY total_revenue DESC
      LIMIT 10
    `,
    'monthly-sales': `
      SELECT 
        DATE_TRUNC('month', order_date) as month,
        SUM(total_amount) as revenue,
        COUNT(*) as orders
      FROM orders
      WHERE status = 'completed' 
        AND order_date >= NOW() - INTERVAL '12 months'
      GROUP BY DATE_TRUNC('month', order_date)
      ORDER BY month
    `,
    'product-performance': `
      SELECT 
        p.name,
        p.category,
        SUM(oi.quantity) as units_sold,
        SUM(oi.total_price) as revenue
      FROM products p
      JOIN order_items oi ON p.id = oi.product_id
      JOIN orders o ON oi.order_id = o.id
      WHERE o.status = 'completed'
        AND o.order_date >= NOW() - INTERVAL '3 months'
      GROUP BY p.id, p.name, p.category
      ORDER BY revenue DESC
      LIMIT 15
    `
  };

  return quickQueries[queryType] || '';
}
