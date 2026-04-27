import { query } from '../src/db/connection';

async function addTestImages() {
  console.log('Adding test image URLs to database...');

  // First, check what vehicles exist
  const sampleVehicles = await query(`SELECT brand, model FROM vehicles WHERE price IS NOT NULL LIMIT 10`);
  console.log('Sample vehicles in database:');
  sampleVehicles.rows.forEach(row => {
    console.log(`  - ${row.brand} ${row.model}`);
  });

  const updates = [
    {
      sql: `UPDATE vehicles SET image_url_path = 'test/vehicle-1.jpg', legal_attribution = 'Foto: Divulgação/Fabricante' WHERE id = (SELECT id FROM vehicles WHERE price IS NOT NULL LIMIT 1)`,
      desc: 'Vehicle 1'
    },
    {
      sql: `UPDATE vehicles SET image_url_path = 'test/vehicle-2.jpg', legal_attribution = 'Foto: Divulgação/Fabricante' WHERE id = (SELECT id FROM vehicles WHERE price IS NOT NULL OFFSET 1 LIMIT 1)`,
      desc: 'Vehicle 2'
    },
    {
      sql: `UPDATE vehicles SET image_url_path = 'test/vehicle-3.jpg', legal_attribution = 'Foto: Divulgação/Fabricante' WHERE id = (SELECT id FROM vehicles WHERE price IS NOT NULL OFFSET 2 LIMIT 1)`,
      desc: 'Vehicle 3'
    },
    {
      sql: `UPDATE vehicles SET image_url_path = 'test/vehicle-4.jpg', legal_attribution = 'Foto: Divulgação/Fabricante' WHERE id = (SELECT id FROM vehicles WHERE price IS NOT NULL OFFSET 3 LIMIT 1)`,
      desc: 'Vehicle 4'
    },
    {
      sql: `UPDATE vehicles SET image_url_path = 'test/vehicle-5.jpg', legal_attribution = 'Foto: Divulgação/Fabricante' WHERE id = (SELECT id FROM vehicles WHERE price IS NOT NULL OFFSET 4 LIMIT 1)`,
      desc: 'Vehicle 5'
    }
  ];

  for (const update of updates) {
    try {
      const result = await query(update.sql);
      console.log(`✓ ${update.desc}: ${result.rowCount} row(s) updated`);
    } catch (error) {
      console.log(`✗ ${update.desc}: Failed - ${error}`);
    }
  }

  console.log('\nVerifying updated vehicles...');
  const verifyResult = await query(`
    SELECT brand, model, image_url_path, legal_attribution 
    FROM vehicles 
    WHERE image_url_path IS NOT NULL 
    LIMIT 5
  `);
  
  console.log('Vehicles with images:');
  verifyResult.rows.forEach(row => {
    console.log(`  - ${row.brand} ${row.model}: ${row.image_url_path}`);
  });

  console.log('\nDone!');
  process.exit(0);
}

addTestImages().catch(error => {
  console.error('Error:', error);
  process.exit(1);
});
