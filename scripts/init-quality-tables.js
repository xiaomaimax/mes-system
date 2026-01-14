require('dotenv').config();
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function initializeDatabase() {
  try {
    console.log('Connecting to database...');
    
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'mes_system'
    });
    
    console.log('Reading SQL initialization file...');
    const sqlFile = path.join(__dirname, '../database/init.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');
    
    // Split SQL statements and execute them
    const statements = sql.split(';').filter(stmt => stmt.trim());
    
    for (const statement of statements) {
      if (statement.trim()) {
        try {
          await connection.execute(statement);
          console.log('✓ Executed:', statement.substring(0, 50) + '...');
        } catch (error) {
          // Ignore "already exists" errors
          if (!error.message.includes('already exists')) {
            console.error('Error executing statement:', error.message);
          }
        }
      }
    }
    
    console.log('\n✓ Database initialization completed successfully!');
    console.log('\nQuality inspection tables created:');
    console.log('  - iqc_inspections');
    console.log('  - pqc_inspections');
    console.log('  - fqc_inspections');
    console.log('  - oqc_inspections');
    console.log('  - defect_reasons');
    console.log('  - inspection_standards');
    console.log('  - defect_records');
    console.log('  - batch_tracing');
    
    await connection.end();
    
  } catch (error) {
    console.error('Database initialization failed:', error);
    process.exit(1);
  }
}

initializeDatabase();
