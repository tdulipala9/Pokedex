export type TypeEffectiveness = {
  double: string[];
  half: string[];
  zero: string[];
};

export const TYPE_CHART: Record<string, TypeEffectiveness> = {
  normal: { double: ["fighting"], half: [], zero: ["ghost"] },
  fire: { double: ["water", "ground", "rock"], half: ["fire", "grass", "ice", "bug", "steel", "fairy"], zero: [] },
  water: { double: ["electric", "grass"], half: ["fire", "water", "ice", "steel"], zero: [] },
  electric: { double: ["ground"], half: ["electric", "flying", "steel"], zero: [] },
  grass: { double: ["fire", "ice", "poison", "flying", "bug"], half: ["water", "electric", "grass", "ground"], zero: [] },
  ice: { double: ["fire", "fighting", "rock", "steel"], half: ["ice"], zero: [] },
  fighting: { double: ["flying", "psychic", "fairy"], half: ["bug", "rock", "dark"], zero: [] },
  poison: { double: ["ground", "psychic"], half: ["grass", "fighting", "poison", "bug", "fairy"], zero: [] },
  ground: { double: ["water", "grass", "ice"], half: ["poison", "rock"], zero: ["electric"] },
  flying: { double: ["electric", "ice", "rock"], half: ["grass", "fighting", "bug"], zero: ["ground"] },
  psychic: { double: ["bug", "ghost", "dark"], half: ["fighting", "psychic"], zero: [] },
  bug: { double: ["fire", "flying", "rock"], half: ["grass", "fighting", "ground"], zero: [] },
  rock: { double: ["water", "grass", "fighting", "ground", "steel"], half: ["normal", "fire", "poison", "flying"], zero: [] },
  ghost: { double: ["ghost", "dark"], half: ["poison", "bug"], zero: ["normal", "fighting"] },
  dragon: { double: ["ice", "dragon", "fairy"], half: ["fire", "water", "electric", "grass"], zero: [] },
  steel: { double: ["fire", "fighting", "ground"], half: ["normal", "grass", "ice", "flying", "psychic", "bug", "rock", "dragon", "steel", "fairy"], zero: ["poison"] },
  dark: { double: ["fighting", "bug", "fairy"], half: ["ghost", "dark"], zero: ["psychic"] },
  fairy: { double: ["poison", "steel"], half: ["fighting", "bug", "dark"], zero: ["dragon"] },
};

// Returns a map of type -> multiplier (e.g. { fire: 2, water: 0.5 })
export function calculateDefensiveMatchups(types: string[]): Record<string, number> {
  const matchups: Record<string, number> = {};
  const allTypes = Object.keys(TYPE_CHART);

  // Initialize all to 1
  allTypes.forEach((t) => (matchups[t] = 1));

  types.forEach((defendingType) => {
    const data = TYPE_CHART[defendingType.toLowerCase()];
    if (!data) return;

    data.double.forEach((t) => (matchups[t] *= 2));
    data.half.forEach((t) => (matchups[t] *= 0.5));
    data.zero.forEach((t) => (matchups[t] *= 0));
  });

  return matchups;
}

// Returns types that the attacker is super effective against
export function getOffensiveStrengths(attackerTypes: string[]): string[] {
  const strengths = new Set<string>();
  
  attackerTypes.forEach(atkType => {
    // Find all types that are weak to atkType
    // A type T is weak to atkType if atkType is in T's 'double' list
    Object.entries(TYPE_CHART).forEach(([defType, data]) => {
      if (data.double.includes(atkType.toLowerCase())) {
        strengths.add(defType);
      }
    });
  });
  
  return Array.from(strengths);
}
