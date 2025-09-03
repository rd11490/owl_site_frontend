import { Injectable } from '@angular/core';

interface ColorMapping {
  // Base colors for the type
  baseColors: { [key: string]: string };
  // Default color if no mapping exists
  defaultColor: string;
}

@Injectable({
  providedIn: 'root',
})
export class ColorMappingService {
  private readonly heroColors: ColorMapping = {
    baseColors: {
      // Support Heroes (Blues and Yellows)
      Ana: '#718ab3', // Soft blue matching her coat
      Baptiste: '#426595', // Deep blue matching his uniform
      Brigitte: '#f08020', // Orange to match her armor
      Illari: '#ffd966', // Golden sun color
      Juno: '#66ccff', // Light blue
      Kiriko: '#ed93c7', // Pink/Cherry blossom color
      Lifeweaver: '#89c268', // Soft green for nature theme
      Lúcio: '#85c952', // Bright green matching his outfit
      Mercy: '#ffd700', // Gold matching her halo/wings
      Moira: '#800080', // Purple matching her design
      Wuyang: '#ff3366', // Vibrant red
      Zenyatta: '#ffe5a0', // Warm gold matching his orbs

      // Tank Heroes (Reds and Grays)
      'D.Va': '#ff69b4', // Pink matching her mech
      Doomfist: '#8b4513', // Brown matching his gauntlet
      Hazard: '#ffcc00', // Warning yellow
      'Junker Queen': '#4169e1', // Royal blue for the queen
      Mauga: '#ff4400', // Volcanic orange
      Orisa: '#228b22', // Forest green
      Ramattra: '#483d8b', // Dark slate blue
      Reinhardt: '#a0a0a0', // Steel gray matching his armor
      Roadhog: '#c68e3c', // Brown/orange matching his design
      Sigma: '#20b2aa', // Light sea green
      Winston: '#4a4a4a', // Dark gray
      'Wrecking Ball': '#deb887', // Burlywood matching Hammond's fur
      Zarya: '#ff69b4', // Pink matching her hair

      // DPS Heroes (Various distinct colors)
      Ashe: '#696969', // Dim gray matching her outfit
      Bastion: '#7cba3d', // Green matching his core
      Cassidy: '#8b4513', // Saddle brown matching his theme
      Echo: '#87ceeb', // Sky blue matching her design
      Freja: '#00ccff', // Ice blue
      Genji: '#98ff98', // Pale green matching his lights
      Hanzo: '#4169e1', // Royal blue matching his outfit
      Junkrat: '#ffd700', // Gold matching his explosions
      Mei: '#87ceeb', // Light blue matching her ice theme
      Pharah: '#4682b4', // Steel blue matching her armor
      Reaper: '#36454f', // Charcoal matching his theme
      Sojourn: '#b8860b', // Dark golden matching her design
      'Soldier: 76': '#b22222', // Firebrick red matching his jacket
      Sombra: '#9370db', // Medium purple matching her theme
      Symmetra: '#40e0d0', // Turquoise matching her design
      Torbjörn: '#cd853f', // Peru brown matching his armor
      Tracer: '#ffa500', // Orange matching her leggings
      Venture: '#00ff99', // Bright mint
      Widowmaker: '#9370db', // Medium purple matching her skin
    },
    defaultColor: '#808080', // Default gray
  };

  private readonly regionColors: ColorMapping = {
    baseColors: {
      All: '#000000', // Black for "All" selection
      Americas: '#ff4444', // Red for Americas
      Asia: '#44ff44', // Green for Asia
      Europe: '#4444ff', // Blue for Europe
    },
    defaultColor: '#808080',
  };

  private readonly rankColors: ColorMapping = {
    baseColors: {
      All: '#000000', // Black for "All" selection
      Bronze: '#CD7F32', // Bronze metal
      Silver: '#C0C0C0', // Silver metal
      Gold: '#FFD700', // Gold metal
      Platinum: '#FF0000', // Pure red
      Diamond: '#B9F2FF', // Diamond blue
      Master: '#006400', // Dark green
      Grandmaster: '#800080', // Royal purple
    },
    defaultColor: '#808080',
  };

  private readonly mapColors: ColorMapping = {
    baseColors: {
      All: '#000000', // Black for "All" selection

      // Control Maps
      busan: '#ff8533', // Orange/red
      ilios: '#3399ff', // Mediterranean blue
      'lijang-tower': '#ff3333', // Chinese red
      nepal: '#ffffff', // Snow white
      oasis: '#ffcc66', // Desert gold
      samoa: '#66cdaa', // Medium aquamarine

      // New Queen Street
      'new-queen-street': '#ff9999', // Toronto red
      esperanca: '#99ffcc', // Portuguese green
      colosseo: '#ffcc99', // Roman sand

      // Circuit Royal
      'circuit-royal': '#4dff4d', // Monte Carlo green
      dorado: '#ffff66', // Mexican yellow
      'route-66': '#ff6600', // Desert orange
      junkertown: '#ff9933', // Australian orange
      rialto: '#009933', // Venice green
      havana: '#66ffff', // Caribbean blue
      shambali: '#cc99ff', // Spiritual purple
      gibraltar: '#3366ff', // Ocean blue

      // Hybrid
      midtown: '#ff6666', // New York red
      paraiso: '#00cc99', // Tropical green
      'blizzard-world': '#3399ff', // Theme park blue
      numbani: '#99cc00', // African green
      hollywood: '#ff99cc', // Pink
      eichenwalde: '#339933', // Forest green
      'kings-row': '#666666', // London gray
    },
    defaultColor: '#808080',
  };

  getHeroColor(heroName: string): string {
    return this.getColor(heroName, this.heroColors);
  }

  getRankColor(rank: string): string {
    return this.getColor(rank, this.rankColors);
  }

  getMapColor(mapName: string): string {
    return this.getColor(mapName, this.mapColors);
  }

  getRegionColor(region: string): string {
    return this.getColor(region, this.regionColors);
  }

  private getColor(key: string, mapping: ColorMapping): string {
    if (!key) return mapping.defaultColor;

    // Try exact match first
    if (mapping.baseColors[key]) {
      return mapping.baseColors[key];
    }

    // Try case-insensitive match
    const lowerKey = key.toLowerCase();
    const matchingKey = Object.keys(mapping.baseColors).find((k) => k.toLowerCase() === lowerKey);
    return matchingKey ? mapping.baseColors[matchingKey] : mapping.defaultColor;
  }
}
