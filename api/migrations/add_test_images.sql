-- Add test image URLs to verify frontend image loading
-- This updates a few vehicles with placeholder image paths

UPDATE vehicles
SET image_url_path = 'test/fiat-uno.jpg',
    legal_attribution = 'Foto: Divulgação/Fabricante'
WHERE brand = 'Fiat' AND model LIKE '%Uno%' LIMIT 1;

UPDATE vehicles
SET image_url_path = 'test/vw-gol.jpg',
    legal_attribution = 'Foto: Divulgação/Volkswagen'
WHERE brand = 'Volkswagen' AND model LIKE '%Gol%' LIMIT 1;

UPDATE vehicles
SET image_url_path = 'test/chevrolet-onix.jpg',
    legal_attribution = 'Foto: Divulgação/Chevrolet'
WHERE brand = 'Chevrolet' AND model LIKE '%Onix%' LIMIT 1;

UPDATE vehicles
SET image_url_path = 'test/jeep-renegade.jpg',
    legal_attribution = 'Foto: Divulgação/Jeep'
WHERE brand = 'Jeep' AND model LIKE '%Renegade%' LIMIT 1;

UPDATE vehicles
SET image_url_path = 'test/toyota-corolla.jpg',
    legal_attribution = 'Foto: Divulgação/Toyota'
WHERE brand = 'Toyota' AND model LIKE '%Corolla%' LIMIT 1;
