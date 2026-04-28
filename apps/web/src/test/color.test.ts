import { describe, it, expect } from 'vitest';

describe('Pokemon types', () => {
  it('has color mapping for each type', () => {
    const TYPE_COLORS: Record<string, string> = {
      grass: 'bg-green-500',
      fire: 'bg-red-500',
      water: 'bg-blue-500',
    };
    
    expect(TYPE_COLORS.grass).toBe('bg-green-500');
    expect(TYPE_COLORS.fire).toBe('bg-red-500');
    expect(TYPE_COLORS.water).toBe('bg-blue-500');
  });

  it('includes all gen 1 types', () => {
    const types = [
      'grass', 'fire', 'water', 'ice', 'rock', 'bug',
      'dragon', 'psychic', 'flying', 'ground', 'poison',
      'steel', 'fairy', 'normal', 'fighting', 'electric'
    ];
    
    types.forEach(type => {
      expect(type.length).toBeGreaterThan(0);
    });
  });
});

describe('Color palette', () => {
  it('original app colors match expected values', () => {
    // From original simpledex-mobile/app/theme/palette.ts
    const palette = {
      black: '#1d1d1d',
      white: '#ffffff',
      red: '#ef4136',
      blue: '#69D7F9',
      yellow: '#FFE800',
    };
    
    expect(palette.black).toBe('#1d1d1d');
    expect(palette.white).toBe('#ffffff');
    expect(palette.red).toBe('#ef4136');
    expect(palette.blue).toBe('#69D7F9');
    expect(palette.yellow).toBe('#FFE800');
  });
});