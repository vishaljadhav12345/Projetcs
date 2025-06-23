# Warehouse Management System (WMS) Platform

## Overview

A comprehensive Warehouse Management System with SKU mapping capabilities, data cleaning functionality, and AI-assisted inventory management. The system evolved from a sales analytics platform to focus on warehouse operations, product catalog management, and marketplace SKU mapping. It features a React frontend with shadcn/ui components, an Express.js backend, and PostgreSQL database with Drizzle ORM.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **UI Library**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens
- **State Management**: TanStack Query (React Query) for server state
- **Routing**: Wouter for lightweight client-side routing
- **Build Tool**: Vite for development and production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database ORM**: Drizzle ORM for type-safe database operations
- **File Processing**: Multer for file uploads with CSV/Excel parsing
- **AI Integration**: OpenAI API for natural language database queries

### Database Design
- **Database**: PostgreSQL (Neon serverless)
- **Schema Management**: Drizzle Kit for migrations and schema management
- **Core Tables**: customers, products, orders, order_items, uploaded_files, ai_queries
- **WMS Tables**: master_skus, sku_variants, warehouse_locations, inventory, returns, return_items, sku_mapping_logs
- **Relationships**: Complex relational schema supporting marketplace SKU mapping to Master SKUs with warehouse location tracking

## Key Components

### SKU Mapping System
- **SKU Mapper Class**: Centralized class for managing SKU to Master SKU mappings
- **AI-Assisted Mapping**: OpenAI GPT-4o integration for intelligent SKU identification
- **Fuzzy Matching**: String similarity algorithms for automatic SKU mapping
- **Marketplace Support**: Multi-platform SKU format validation (Amazon, eBay, Shopify)
- **Combo Product Handling**: Support for bundled products with multiple SKUs

### Data Cleaning & Management
- **Master SKU System**: Centralized product catalog with unified identifiers
- **SKU Variant Tracking**: Marketplace-specific SKU variations with pricing
- **Mapping Validation**: Confidence scoring and manual validation workflows
- **Error Handling**: Missing mapping detection with suggested corrections
- **Logging System**: Comprehensive audit trail for all mapping operations

### Warehouse Operations
- **Multi-Location Inventory**: Track stock across multiple warehouse locations
- **Inventory Management**: Real-time quantity tracking with reorder points
- **Returns Processing**: Complete return workflow with item condition tracking
- **Order Fulfillment**: Marketplace-aware order processing with warehouse routing

### File Processing System
- **Flexible Input Processor**: Support for various CSV/Excel formats
- **Automatic Data Type Detection**: Smart field mapping for different data sources
- **Background Processing**: Asynchronous file processing with status tracking
- **Schema Validation**: Zod schemas for runtime type validation

### AI Query Engine
- **Natural Language Processing**: OpenAI GPT-4o integration for database queries
- **Query Execution**: Safe SQL execution with result visualization
- **Query History**: Persistent storage of AI queries and results
- **WMS-Aware Queries**: Understanding of warehouse and SKU concepts

## Data Flow

1. **SKU Mapping**: User inputs marketplace SKU → System attempts automatic mapping → AI assists with fuzzy matching → Manual validation if needed → Master SKU assigned
2. **Data Import**: Users upload CSV/Excel files → System detects data types → SKU mapping applied → Warehouse locations assigned → Data processed into PostgreSQL
3. **Inventory Management**: Orders received → SKU mapped to Master SKU → Inventory allocated from appropriate warehouse → Fulfillment tracking updated
4. **Returns Processing**: Return initiated → Items mapped back to inventory → Condition assessed → Stock updated if restockable
5. **AI Queries**: User asks warehouse/inventory questions → OpenAI converts to SQL with WMS context → Results returned with visualization
6. **Dashboard Updates**: Real-time WMS metrics fetched → Inventory levels, mapping statistics, warehouse performance displayed

## External Dependencies

### Core Dependencies
- **Database**: @neondatabase/serverless for PostgreSQL connection
- **ORM**: drizzle-orm and drizzle-kit for database operations
- **AI**: OpenAI API for natural language processing
- **File Processing**: csv-parser, xlsx for data parsing
- **UI Components**: @radix-ui/* for accessible UI primitives

### Development Tools
- **Build**: Vite with React plugin and TypeScript support
- **Styling**: Tailwind CSS with PostCSS processing
- **Validation**: Zod for runtime type checking
- **HTTP Client**: TanStack Query for API state management

## Deployment Strategy

### Development Environment
- **Runtime**: Node.js 20 with Replit hosting
- **Database**: PostgreSQL 16 with automatic provisioning
- **Hot Reload**: Vite development server with HMR
- **Port Configuration**: Backend on port 5000, frontend proxied through Vite

### Production Build
- **Frontend**: Vite builds static assets to dist/public
- **Backend**: ESBuild bundles server code for production
- **Database**: Neon serverless PostgreSQL with connection pooling
- **Deployment**: Autoscale deployment target on Replit

### Environment Configuration
- **Database URL**: Automatically provisioned PostgreSQL connection string
- **OpenAI API**: Requires OPENAI_API_KEY or OPENAI_KEY environment variable
- **File Storage**: Local uploads directory with cleanup after processing

## Changelog

```
Changelog:
- June 16, 2025: Initial setup
- June 16, 2025: Complete implementation of SalesFlow Analytics Platform
  * PostgreSQL database with full relational schema
  * File upload system with CSV/Excel parsing
  * AI-powered natural language to SQL query engine
  * Interactive dashboard with metrics and visualizations
  * Sample data populated for demonstration
  * All four project phases completed successfully
- June 16, 2025: WMS Platform Transformation Complete
  * Extended database schema with warehouse management tables
  * Implemented SKU Mapper service with AI-assisted mapping
  * Created comprehensive SKU mapping UI with validation workflows
  * Added multi-location inventory tracking and returns management
  * Integrated fuzzy matching and confidence scoring for data cleaning
  * Populated sample warehouse and SKU mapping data
  * Transformed from sales analytics to full warehouse management system
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```