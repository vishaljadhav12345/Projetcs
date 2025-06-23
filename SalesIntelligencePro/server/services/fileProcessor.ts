import fs from 'fs';
import csv from 'csv-parser';
import xlsx from 'xlsx';
import { storage } from '../storage';
import { insertCustomerSchema, insertProductSchema, insertOrderSchema } from '@shared/schema';
import { z } from 'zod';

interface CSVRow {
  [key: string]: string;
}

export async function processUploadedFile(fileId: number, filePath: string, mimeType: string): Promise<void> {
  try {
    await storage.updateFileStatus(fileId, "processing");

    let data: CSVRow[] = [];

    if (mimeType === 'text/csv') {
      data = await parseCSV(filePath);
    } else if (mimeType.includes('sheet')) {
      data = await parseExcel(filePath);
    } else {
      throw new Error('Unsupported file type');
    }

    // Auto-detect data type based on column headers
    const headers = Object.keys(data[0] || {}).map(h => h.toLowerCase());
    let recordsImported = 0;

    if (isCustomerData(headers)) {
      recordsImported = await importCustomers(data);
    } else if (isProductData(headers)) {
      recordsImported = await importProducts(data);
    } else if (isOrderData(headers)) {
      recordsImported = await importOrders(data);
    } else {
      throw new Error('Unable to determine data type from file headers');
    }

    await storage.updateFileStatus(fileId, "completed", undefined, recordsImported);

    // Clean up uploaded file
    fs.unlinkSync(filePath);

  } catch (error) {
    console.error('File processing error:', error);
    await storage.updateFileStatus(fileId, "failed", error.message);
    
    // Clean up uploaded file
    try {
      fs.unlinkSync(filePath);
    } catch (cleanupError) {
      console.error('File cleanup error:', cleanupError);
    }
  }
}

async function parseCSV(filePath: string): Promise<CSVRow[]> {
  return new Promise((resolve, reject) => {
    const results: CSVRow[] = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', (error) => reject(error));
  });
}

async function parseExcel(filePath: string): Promise<CSVRow[]> {
  const workbook = xlsx.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  return xlsx.utils.sheet_to_json(worksheet, { header: 1 }).slice(1).map((row: any[]) => {
    const headers = xlsx.utils.sheet_to_json(worksheet, { header: 1 })[0] as string[];
    const result: CSVRow = {};
    headers.forEach((header, index) => {
      result[header] = row[index]?.toString() || '';
    });
    return result;
  });
}

function isCustomerData(headers: string[]): boolean {
  const customerFields = ['email', 'first_name', 'firstname', 'last_name', 'lastname', 'customer_name', 'name'];
  return customerFields.some(field => headers.includes(field));
}

function isProductData(headers: string[]): boolean {
  const productFields = ['product_name', 'product', 'name', 'price', 'category', 'sku'];
  return productFields.some(field => headers.includes(field));
}

function isOrderData(headers: string[]): boolean {
  const orderFields = ['order_id', 'order_date', 'total_amount', 'total', 'amount', 'customer_id'];
  return orderFields.some(field => headers.includes(field));
}

async function importCustomers(data: CSVRow[]): Promise<number> {
  let imported = 0;
  
  for (const row of data) {
    try {
      const customerData = {
        firstName: row['first_name'] || row['firstname'] || row['First Name'] || '',
        lastName: row['last_name'] || row['lastname'] || row['Last Name'] || '',
        email: row['email'] || row['Email'] || '',
        phone: row['phone'] || row['Phone'] || undefined,
      };

      // Skip if email is missing
      if (!customerData.email) continue;

      // Check if customer already exists
      const existingCustomer = await storage.getCustomerByEmail(customerData.email);
      if (existingCustomer) continue;

      const validatedData = insertCustomerSchema.parse(customerData);
      await storage.createCustomer(validatedData);
      imported++;
    } catch (error) {
      console.error('Error importing customer row:', error);
    }
  }

  return imported;
}

async function importProducts(data: CSVRow[]): Promise<number> {
  let imported = 0;
  
  for (const row of data) {
    try {
      const productData = {
        name: row['product_name'] || row['name'] || row['Product Name'] || '',
        description: row['description'] || row['Description'] || undefined,
        price: row['price'] || row['Price'] || '0',
        category: row['category'] || row['Category'] || 'General',
        sku: row['sku'] || row['SKU'] || undefined,
        stockQuantity: parseInt(row['stock_quantity'] || row['Stock'] || '0') || 0,
      };

      // Skip if name is missing
      if (!productData.name) continue;

      const validatedData = insertProductSchema.parse(productData);
      await storage.createProduct(validatedData);
      imported++;
    } catch (error) {
      console.error('Error importing product row:', error);
    }
  }

  return imported;
}

async function importOrders(data: CSVRow[]): Promise<number> {
  let imported = 0;
  
  for (const row of data) {
    try {
      // This is a simplified version - in practice you'd need to handle
      // customer lookup/creation and order items
      const orderData = {
        customerId: parseInt(row['customer_id'] || '1'),
        status: row['status'] || 'completed',
        totalAmount: row['total_amount'] || row['total'] || row['amount'] || '0',
        shippingAddress: row['shipping_address'] || undefined,
        notes: row['notes'] || undefined,
      };

      // Skip if total amount is invalid
      if (isNaN(parseFloat(orderData.totalAmount))) continue;

      const validatedData = insertOrderSchema.parse(orderData);
      await storage.createOrder(validatedData, []); // Empty items for now
      imported++;
    } catch (error) {
      console.error('Error importing order row:', error);
    }
  }

  return imported;
}
