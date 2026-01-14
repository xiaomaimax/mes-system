#!/usr/bin/env node

/**
 * Add Missing Inventory Transactions
 * 
 * This script adds the missing inventory transaction data to complete the demo dataset.
 */

const mysql = require('mysql2/promise');

const DB_CONFIG = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'mes_system'
};

async function addInventoryTransactions() {
  console.log('🔄 Adding missing inventory transactions...');
  
  try {
    const connection = await mysql.createConnection(DB_CONFIG);
    
    // Get existing inventory items to create transactions for
    const [inventoryItems] = await connection.execute('SELECT id, material_id FROM inventory LIMIT 20');
    
    if (inventoryItems.length === 0) {
      console.log('❌ No inventory items found to create transactions for');
      await connection.end();
      return;
    }
    
    const transactions = [];
    const transactionTypes = ['in_stock', 'out_stock', 'adjust'];
    const referenceTypes = ['purchase', 'production', 'sale', 'adjustment'];
    
    // Create 30+ transactions
    for (let i = 0; i < 35; i++) {
      const item = inventoryItems[i % inventoryItems.length];
      const transactionType = transactionTypes[Math.floor(Math.random() * transactionTypes.length)];
      const referenceType = referenceTypes[Math.floor(Math.random() * referenceTypes.length)];
      const quantity = Math.floor(Math.random() * 100) + 1;
      const operatorId = 12; // Using admin user
      
      // Create date within last 30 days
      const date = new Date();
      date.setDate(date.getDate() - Math.floor(Math.random() * 30));
      
      transactions.push([
        item.material_id,
        transactionType,
        quantity,
        referenceType,
        `REF-${String(i + 1).padStart(4, '0')}`,
        operatorId,
        `Transaction ${i + 1} - ${referenceType}`,
        date
      ]);
    }
    
    // Insert transactions
    const insertQuery = `
      INSERT INTO inventory_transactions 
      (material_id, transaction_type, quantity, reference_type, reference_id, operator_id, notes, transaction_date)
      VALUES ?
    `;
    
    // Insert transactions one by one to avoid SQL syntax issues
    for (const transaction of transactions) {
      await connection.execute(`
        INSERT INTO inventory_transactions 
        (material_id, transaction_type, quantity, reference_type, reference_id, operator_id, notes, transaction_date)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, transaction);
    }
    
    console.log(`✅ Added ${transactions.length} inventory transactions`);
    
    // Verify the count
    const [result] = await connection.execute('SELECT COUNT(*) as count FROM inventory_transactions');
    console.log(`📊 Total inventory transactions: ${result[0].count}`);
    
    await connection.end();
    
  } catch (error) {
    console.error('❌ Error adding inventory transactions:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  addInventoryTransactions();
}

module.exports = { addInventoryTransactions };