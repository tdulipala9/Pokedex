export interface Pokemon {
  id: number;
  name: string;
  sprites: {
    front_default: string;
    other: {
      "official-artwork": {
        front_default: string;
      };
      home: {
        front_default: string;
      };
    };
  };
  types: {
    slot: number;
    type: {
      name: string;
      url: string;
    };
  }[];
  height: number;
  weight: number;
  stats: {
    base_stat: number;
    stat: {
      name: string;
    };
  }[];
}

export const getPokemon = async (query: string | number): Promise<Pokemon> => {
  // If query is empty, default to 1 (Bulbasaur)
  const q = query || 1;
  const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${typeof q === 'string' ? q.toLowerCase() : q}`);
  if (!response.ok) {
    throw new Error("Pokemon not found");
  }
  return response.json();
};
