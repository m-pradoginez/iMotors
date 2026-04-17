import { query, closePool } from './connection';

async function seed() {
  console.log('Seeding test data...');
  try {
    await query(`
      INSERT INTO vehicles_unified (
        fipe_code, brand, model, year, fuel_type, category, price, 
        city_km_l, highway_km_l, efficiency_rating, match_confidence
      ) VALUES 
      ('001', 'HONDA', 'CIVIC SEDAN EXL 2.0 FLEX 16V AUT.', 2021, 'Flex', 'sedan', 135000, 10.5, 12.8, 'A', 'exact'),
      ('002', 'TOYOTA', 'COROLLA ALTIS PREMIUM 2.0 FLEX 16V AUT.', 2021, 'Flex', 'sedan', 145000, 11.2, 13.5, 'A', 'exact'),
      ('003', 'FIAT', 'MOBI LIKE 1.0 FIRE FLEX 5P', 2022, 'Flex', 'hatch', 55000, 13.5, 15.2, 'A', 'exact'),
      ('004', 'VW', 'POLO HIGHLINE 200 TSI 1.0 FLEX 16V AUT.', 2022, 'Flex', 'hatch', 110000, 12.1, 14.8, 'B', 'exact'),
      ('005', 'CHEVROLET', 'ONIX HATCH LT 1.0 TURBO FLEX AUT.', 2023, 'Flex', 'hatch', 95000, 11.9, 15.1, 'A', 'exact'),
      ('006', 'HYUNDAI', 'HB20 SENSATE 1.0 FLEX MEC.', 2023, 'Flex', 'hatch', 82000, 12.8, 14.6, 'A', 'exact'),
      ('007', 'RENAULT', 'KWID INTENSE 1.0 FLEX 4P', 2023, 'Flex', 'hatch', 68000, 15.3, 15.7, 'A', 'exact'),
      ('008', 'JEEP', 'RENEGADE LONGITUDE 1.3 T270 FLEX AUT.', 2022, 'Flex', 'suv', 125000, 11.0, 12.8, 'B', 'exact'),
      ('009', 'JEEP', 'COMPASS LIMITED 1.3 T270 FLEX AUT.', 2022, 'Flex', 'suv', 185000, 10.3, 12.1, 'C', 'exact'),
      ('010', 'NISSAN', 'KICKS EXCLUSIVE 1.6 FLEX AUT.', 2023, 'Flex', 'suv', 130000, 11.4, 13.7, 'B', 'exact')
      ON CONFLICT (fipe_code) DO UPDATE SET
        brand = EXCLUDED.brand,
        model = EXCLUDED.model,
        year = EXCLUDED.year,
        fuel_type = EXCLUDED.fuel_type,
        category = EXCLUDED.category,
        price = EXCLUDED.price,
        city_km_l = EXCLUDED.city_km_l,
        highway_km_l = EXCLUDED.highway_km_l,
        efficiency_rating = EXCLUDED.efficiency_rating,
        match_confidence = EXCLUDED.match_confidence
    `);
    console.log('✓ Seeding complete');
  } catch (error) {
    console.error('✗ Seeding failed:', error);
  } finally {
    await closePool();
  }
}

seed();
