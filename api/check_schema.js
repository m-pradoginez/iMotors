const { Pool } = require('pg');
require('dotenv').config({ path: '.env' });

const pool = new Pool({
  connectionString: process.env.SUPABASE_DB_URL || process.env.DATABASE_URL,
});

(async () => {
  let client;
  try {
    client = await pool.connect();
    
    // Check if vehicles table exists and get its columns
    const result = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'vehicles' 
      ORDER BY ordinal_position
    `);
    
    if (result.rows.length === 0) {
      console.log('Table vehicles does not exist or has no columns');
    } else {
      console.log('vehicles columns:');
      result.rows.forEach(row => {
        console.log(`${row.column_name}: ${row.data_type}`);
      });
      
      // Check specifically for image_url column
      const hasImageUrl = result.rows.some(row => row.column_name === 'image_url');
      console.log('\nHas image_url column:', hasImageUrl);
    }
  } catch (err) {
    console.error('Error:', err);
  } finally {
    if (client) {
      client.release();
    }
    await pool.end();
  }
})();