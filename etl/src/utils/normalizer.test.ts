import { Normalizer } from './normalizer';

describe('Normalizer', () => {
  describe('normalizeBrand', () => {
    it('should normalize brand to uppercase', () => {
      expect(Normalizer.normalizeBrand('toyota')).toBe('TOYOTA');
      expect(Normalizer.normalizeBrand('Honda')).toBe('HONDA');
    });

    it('should map common brand abbreviations', () => {
      expect(Normalizer.normalizeBrand('VW')).toBe('VOLKSWAGEN');
      expect(Normalizer.normalizeBrand('vw')).toBe('VOLKSWAGEN');
      expect(Normalizer.normalizeBrand('Chevy')).toBe('CHEVROLET');
      expect(Normalizer.normalizeBrand('GM')).toBe('CHEVROLET');
    });

    it('should map Mercedes to Mercedes-Benz', () => {
      expect(Normalizer.normalizeBrand('Mercedes')).toBe('MERCEDES-BENZ');
      expect(Normalizer.normalizeBrand('mercedes')).toBe('MERCEDES-BENZ');
    });

    it('should remove common suffixes', () => {
      expect(Normalizer.normalizeBrand('Toyota Corporation')).toBe('TOYOTA');
      expect(Normalizer.normalizeBrand('Volkswagen GmbH')).toBe('VOLKSWAGEN');
    });

    it('should trim whitespace', () => {
      expect(Normalizer.normalizeBrand('  TOYOTA  ')).toBe('TOYOTA');
    });
  });

  describe('normalizeModel', () => {
    it('should normalize model to uppercase', () => {
      expect(Normalizer.normalizeModel('corolla')).toBe('COROLLA');
      expect(Normalizer.normalizeModel('Civic')).toBe('CIVIC');
    });

    it('should normalize multiple spaces to single space', () => {
      expect(Normalizer.normalizeModel('COROLLA  XEI')).toBe('COROLLA XEI');
      expect(Normalizer.normalizeModel('HONDA   CIVIC')).toBe('HONDA CIVIC');
    });

    it('should remove special characters except hyphen and period', () => {
      expect(Normalizer.normalizeModel('COROLLA!@#')).toBe('COROLLA');
      expect(Normalizer.normalizeModel('CIVIC-TOURING')).toBe('CIVIC-TOURING');
      expect(Normalizer.normalizeModel('FOCUS 2.0')).toBe('FOCUS 2.0');
    });

    it('should normalize hyphens', () => {
      expect(Normalizer.normalizeModel('CIVIC - TOURING')).toBe('CIVIC-TOURING');
    });

    it('should remove common suffixes', () => {
      expect(Normalizer.normalizeModel('COROLLA EDITION')).toBe('COROLLA');
      expect(Normalizer.normalizeModel('CIVIC VERSAO')).toBe('CIVIC');
      expect(Normalizer.normalizeModel('FOCUS VERSION')).toBe('FOCUS');
    });

    it('should trim whitespace', () => {
      expect(Normalizer.normalizeModel('  COROLLA  ')).toBe('COROLLA');
    });
  });

  describe('normalizeFuelType', () => {
    it('should normalize fuel type to uppercase', () => {
      expect(Normalizer.normalizeFuelType('gasolina')).toBe('GASOLINA');
      expect(Normalizer.normalizeFuelType('Etanol')).toBe('ETANOL');
    });

    it('should map fuel type variations', () => {
      expect(Normalizer.normalizeFuelType('Gás')).toBe('GAS');
      expect(Normalizer.normalizeFuelType('GNV')).toBe('GNV');
      expect(Normalizer.normalizeFuelType('Elétrico')).toBe('ELETRICO');
    });
  });

  describe('calculateSimilarity', () => {
    it('should return 1 for identical strings', () => {
      expect(Normalizer.calculateSimilarity('COROLLA', 'COROLLA')).toBe(1);
      expect(Normalizer.calculateSimilarity('corolla', 'COROLLA')).toBe(1);
    });

    it('should return 0 for completely different strings', () => {
      expect(Normalizer.calculateSimilarity('COROLLA', 'CIVIC')).toBeLessThan(0.5);
    });

    it('should return high similarity for similar strings', () => {
      expect(Normalizer.calculateSimilarity('COROLLA', 'COROLA')).toBeGreaterThanOrEqual(0.8);
      expect(Normalizer.calculateSimilarity('CIVIC', 'CIVC')).toBeGreaterThanOrEqual(0.8);
    });

    it('should handle empty strings', () => {
      expect(Normalizer.calculateSimilarity('', 'COROLLA')).toBe(0);
      expect(Normalizer.calculateSimilarity('COROLLA', '')).toBe(0);
    });
  });
});
