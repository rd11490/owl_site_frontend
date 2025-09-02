import { transformMapName } from './map-name-transformer';

describe('Map Name Transformer', () => {
  it('should transform hyphenated map names', () => {
    expect(transformMapName('watchpoint-gibraltar')).toBe('Watchpoint Gibraltar');
    expect(transformMapName('route-66')).toBe('Route 66');
  });

  it('should handle single word map names', () => {
    expect(transformMapName('ilios')).toBe('Ilios');
    expect(transformMapName('havana')).toBe('Havana');
  });

  it('should handle empty or undefined input', () => {
    expect(transformMapName('')).toBe('');
    expect(transformMapName(undefined as unknown as string)).toBe('');
  });

  it('should handle mixed case input', () => {
    expect(transformMapName('KING-row')).toBe('King Row');
    expect(transformMapName('Circuit-ROYAL')).toBe('Circuit Royal');
  });
});
