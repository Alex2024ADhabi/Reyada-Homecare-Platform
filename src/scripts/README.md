# Database Setup and Management Scripts

## Overview

This directory contains scripts for setting up and managing the database for the Reyada Homecare platform.

## Available Scripts

### db-init.ts

Initializes the database schema and creates necessary indexes for optimal performance.

```bash
# Run the database initialization script
npx ts-node src/scripts/db-init.ts
```

This script performs the following actions:

1. Connects to the MongoDB database using configuration from `database.config.ts`
2. Creates the `referrals` collection if it doesn't exist
3. Sets up validation rules for the collection schema
4. Creates indexes for frequently queried fields
5. Closes the database connection when complete

## Adding New Scripts

When adding new database management scripts, follow these guidelines:

1. Create a new TypeScript file in this directory
2. Import necessary database utilities from `../api/db.ts`
3. Implement proper error handling and logging
4. Add documentation for the script in this README

## Best Practices

- Always use the connection management functions from `db.ts`
- Close database connections when operations are complete
- Include proper error handling for all database operations
- Log important events and errors
- Use transactions for operations that modify multiple documents
