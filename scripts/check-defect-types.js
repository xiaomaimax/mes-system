const pool = require('../server/config/mysql');

(async () => {
  try {
    const [rows] = await pool.query('SELECT id, defect_types FROM quality_inspections LIMIT 5');
    console.log('Sample defect_types data:');
    rows.forEach((row, i) => {
      console.log(`Row ${i + 1}:`, typeof row.defect_types, JSON.stringify(row.defect_types));
    });
  } catch (error) {
    console.error('Error:', error.message);
  }
  process.exit(0);
})();
