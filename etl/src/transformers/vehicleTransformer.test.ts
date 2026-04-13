import { VehicleTransformer } from './vehicleTransformer';
import { CatalogEntry } from '../extractors/catalogExtractor';
import { Price } from '../clients/brasilApi';

describe('VehicleTransformer', () => {
  let transformer: VehicleTransformer;

  beforeEach(() => {
    transformer = new VehicleTransformer();
  });

  const createMockEntry = (
    brandName: string,
    modelName: string,
    yearCode: string,
    yearName: string,
    price: Price | null = null
  ): CatalogEntry => ({
    vehicleType: 'carros',
    brandCode: '1',
    brandName,
    modelCode: '101',
    modelName,
    yearCode,
    yearName,
    price,
  });

  const createMockPrice = (valor: string, anoModelo: number, combustivel: string, mesReferencia: string): Price => ({
    valor,
    marca: 'Toyota',
    modelo: 'Corolla',
    anoModelo,
    combustivel,
    codigoFipe: '001101-1',
    mesReferencia,
    tipoVeiculo: 1,
    siglaCombustivel: 'G',
    dataConsulta: '2026-04-13',
  });

  describe('transform', () => {
    it('should transform valid entries into vehicle and price records', () => {
      const entries: CatalogEntry[] = [
        createMockEntry(
          'Toyota',
          'Corolla',
          '001101-1',
          '2024 Gasolina',
          createMockPrice('R$ 150.000,00', 2024, 'Gasolina', 'abril/2026')
        ),
      ];

      const result = transformer.transform(entries);

      expect(result.vehicles).toHaveLength(1);
      expect(result.vehicles[0]).toMatchObject({
        fipe_code: '001101-1',
        brand: 'Toyota',
        model: 'Corolla',
        vehicle_type: 'carros',
      });

      expect(result.prices).toHaveLength(1);
      expect(result.prices[0]).toMatchObject({
        fipe_code: '001101-1',
        model_year: 2024,
        fuel_type: 'Gasolina',
        price: 150000.00,
        reference_month: 'abril/2026',
      });
    });

    it('should handle multiple entries for the same vehicle (different years)', () => {
      const entries: CatalogEntry[] = [
        createMockEntry(
          'Toyota',
          'Corolla',
          '001101-1',
          '2024 Gasolina',
          createMockPrice('R$ 150.000,00', 2024, 'Gasolina', 'abril/2026')
        ),
        createMockEntry(
          'Toyota',
          'Corolla',
          '001101-1',
          '2023 Gasolina',
          createMockPrice('R$ 140.000,00', 2023, 'Gasolina', 'abril/2026')
        ),
      ];

      const result = transformer.transform(entries);

      // Should create 1 vehicle (same FIPE code)
      expect(result.vehicles).toHaveLength(1);
      expect(result.vehicles[0].fipe_code).toBe('001101-1');

      // Should create 2 price records (different years)
      expect(result.prices).toHaveLength(2);
      expect(result.prices.map(p => p.model_year)).toContain(2024);
      expect(result.prices.map(p => p.model_year)).toContain(2023);
    });

    it('should handle entries without price data', () => {
      const entries: CatalogEntry[] = [
        createMockEntry('Toyota', 'Corolla', '001101-1', '2024 Gasolina', null),
      ];

      const result = transformer.transform(entries);

      expect(result.vehicles).toHaveLength(1);
      expect(result.prices).toHaveLength(0);
    });

    it('should handle missing brand or model code', () => {
      const entries: CatalogEntry[] = [
        {
          vehicleType: 'carros',
          brandCode: '',
          brandName: 'Toyota',
          modelCode: '101',
          modelName: 'Corolla',
          yearCode: '001101-1',
          yearName: '2024 Gasolina',
          price: null,
        },
      ];

      const result = transformer.transform(entries);

      expect(result.vehicles).toHaveLength(0);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toContain('Missing brand or model code');
    });

    it('should handle invalid year code format', () => {
      const entries: CatalogEntry[] = [
        createMockEntry('Toyota', 'Corolla', 'invalid', '2024 Gasolina', null),
      ];

      const result = transformer.transform(entries);

      expect(result.vehicles).toHaveLength(0);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toContain('Could not extract FIPE code');
    });

    it('should handle malformed price values', () => {
      const entry = createMockEntry(
        'Toyota',
        'Corolla',
        '001101-1',
        '2024 Gasolina',
        {
          ...createMockPrice('invalid price', 2024, 'Gasolina', 'abril/2026'),
          valor: 'invalid price',
        }
      );

      const result = transformer.transform([entry]);

      // Vehicle should still be created
      expect(result.vehicles).toHaveLength(1);

      // Price should be skipped with error
      expect(result.prices).toHaveLength(0);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toContain('Failed to parse price');
    });

    it('should normalize whitespace in text fields', () => {
      const entries: CatalogEntry[] = [
        createMockEntry(
          '  Toyota  Motors  ',
          '  Corolla   XEI  ',
          '001101-1',
          '2024 Gasolina',
          createMockPrice('R$ 150.000,00', 2024, '  Gasolina  Flex  ', 'abril/2026')
        ),
      ];

      const result = transformer.transform(entries);

      expect(result.vehicles[0].brand).toBe('Toyota Motors');
      expect(result.vehicles[0].model).toBe('Corolla XEI');
      expect(result.prices[0].fuel_type).toBe('Gasolina Flex');
    });

    it('should handle different vehicle types', () => {
      const entries: CatalogEntry[] = [
        { ...createMockEntry('Toyota', 'Corolla', '001101-1', '2024 Gasolina', null), vehicleType: 'carros' },
        { ...createMockEntry('Honda', 'CB 500', '002201-1', '2024 Gasolina', null), vehicleType: 'motos' },
        { ...createMockEntry('Ford', 'F-150', '003301-1', '2024 Diesel', null), vehicleType: 'caminhoes' },
      ];

      const result = transformer.transform(entries);

      expect(result.vehicles).toHaveLength(3);
      expect(result.vehicles.map(v => v.vehicle_type)).toContain('carros');
      expect(result.vehicles.map(v => v.vehicle_type)).toContain('motos');
      expect(result.vehicles.map(v => v.vehicle_type)).toContain('caminhoes');
    });

    it('should handle empty entries array', () => {
      const result = transformer.transform([]);

      expect(result.vehicles).toHaveLength(0);
      expect(result.prices).toHaveLength(0);
      expect(result.errors).toHaveLength(0);
    });

    it('should handle year range format (2023/2024)', () => {
      const entry = createMockEntry(
        'Toyota',
        'Corolla',
        '001101-1',
        '2023/2024 Gasolina',  // Range format
        createMockPrice('R$ 150.000,00', 2024, 'Gasolina', 'abril/2026')
      );

      const result = transformer.transform([entry]);

      expect(result.prices[0].model_year).toBe(2023);  // Takes first year in range
    });
  });
});
