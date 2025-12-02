import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getPokemon, type Pokemon } from "@/lib/pokeapi";
import { calculateDefensiveMatchups, getOffensiveStrengths } from "@/lib/type-chart";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Search, ChevronLeft, ChevronRight, Ruler, Weight, Plus, Trash2, ShieldAlert, Swords, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const TYPE_COLORS: Record<string, string> = {
  normal: "bg-type-normal border-black text-black",
  fire: "bg-type-fire border-black text-white",
  water: "bg-type-water border-black text-white",
  electric: "bg-type-electric border-black text-black",
  grass: "bg-type-grass border-black text-black",
  ice: "bg-type-ice border-black text-black",
  fighting: "bg-type-fighting border-black text-white",
  poison: "bg-type-poison border-black text-white",
  ground: "bg-type-ground border-black text-black",
  flying: "bg-type-flying border-black text-black",
  psychic: "bg-type-psychic border-black text-white",
  bug: "bg-type-bug border-black text-white",
  rock: "bg-type-rock border-black text-black",
  ghost: "bg-type-ghost border-black text-white",
  dragon: "bg-type-dragon border-black text-white",
  steel: "bg-type-steel border-black text-black",
  fairy: "bg-type-fairy border-black text-black",
};

const StatBar = ({ label, value, max = 255 }: { label: string; value: number; max?: number }) => (
  <div className="flex items-center gap-3 text-sm w-full" data-testid={`stat-${label}`}>
    <span className="w-24 font-bold text-foreground uppercase text-lg tracking-tight">{label}</span>
    <div className="flex-1 h-4 bg-white border-2 border-black relative">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${(value / max) * 100}%` }}
        transition={{ duration: 0.5, ease: "linear" }}
        className={cn("h-full border-r-2 border-black absolute left-0 top-0 bottom-0", value > 100 ? "bg-green-500" : value > 60 ? "bg-blue-500" : "bg-red-500")}
      />
    </div>
    <span className="w-8 font-bold text-right tabular-nums text-lg">{value}</span>
  </div>
);

export default function Home() {
  const [searchId, setSearchId] = useState<string | number>(1);
  const [inputValue, setInputValue] = useState("");
  const [team, setTeam] = useState<Pokemon[]>([]);
  const { toast } = useToast();

  const { data: pokemon, isLoading, error, isError } = useQuery({
    queryKey: ["pokemon", searchId],
    queryFn: () => getPokemon(searchId),
    retry: false,
  });

  useEffect(() => {
    if (isError) {
      toast({
        title: "MissingNo?",
        description: "Pokemon not found in the database!",
        variant: "destructive",
        className: "font-mono border-2 border-black retro-shadow-sm"
      });
    }
  }, [isError, toast]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      setSearchId(inputValue.toLowerCase());
    }
  };

  const handleNext = () => {
    if (pokemon) setSearchId(pokemon.id + 1);
  };

  const handlePrev = () => {
    if (pokemon && pokemon.id > 1) setSearchId(pokemon.id - 1);
  };

  const addToTeam = () => {
    if (!pokemon) return;
    if (team.length >= 6) {
      toast({
        title: "BOX FULL!",
        description: "Your party is full (max 6)!",
        variant: "destructive",
        className: "font-mono border-2 border-black retro-shadow-sm"
      });
      return;
    }
    if (team.find(p => p.id === pokemon.id)) {
      toast({
        title: "ALREADY CAUGHT!",
        description: `${pokemon.name} is already in your team!`,
        className: "font-mono border-2 border-black retro-shadow-sm bg-yellow-400 text-black"
      });
      return;
    }
    setTeam([...team, pokemon]);
    toast({
      title: "GOTCHA!",
      description: `${pokemon.name} was added to the party!`,
      className: "font-mono border-2 border-black retro-shadow-sm bg-green-400 text-black"
    });
  };

  const removeFromTeam = (id: number) => {
    setTeam(team.filter(p => p.id !== id));
  };

  // Comparison Logic
  const currentTypes = pokemon?.types.map(t => t.type.name) || [];
  
  // 1. Offensive: Does the team have moves super effective against current pokemon?
  // Assumption: If team member has type T, they have T attacks.
  // Current pokemon defensive weaknesses:
  const currentPokemonMatchups = calculateDefensiveMatchups(currentTypes);
  const currentPokemonWeaknesses = Object.entries(currentPokemonMatchups)
    .filter(([_, multiplier]) => multiplier > 1)
    .map(([type]) => type);

  // Which team members have these types?
  const teamAdvantage = team.filter(member => 
    member.types.some(t => currentPokemonWeaknesses.includes(t.type.name))
  );

  // 2. Defensive: Is the current pokemon super effective against my team?
  // Current pokemon's offensive strengths (based on its types)
  const currentPokemonStrengths = getOffensiveStrengths(currentTypes);
  
  // Which team members are weak to these types?
  const teamDisadvantage = team.filter(member => {
    const memberMatchups = calculateDefensiveMatchups(member.types.map(t => t.type.name));
    return currentPokemonStrengths.some(atkType => memberMatchups[atkType] > 1);
  });

  return (
    <div className="min-h-screen flex flex-col items-center py-8 px-4 sm:px-6 font-mono pb-32">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-4 bg-red-600 text-white p-6 border-4 border-black retro-shadow-lg relative overflow-hidden">
          <div className="absolute top-3 left-3 flex gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-400 border border-black"></div>
            <div className="w-3 h-3 rounded-full bg-green-400 border border-black"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-400 border border-black"></div>
          </div>
          
          <h1 className="text-3xl font-retro pt-4 tracking-tighter text-white text-retro-shadow">
            POKéDEX v2.0
          </h1>
          <p className="text-white/90 font-bold tracking-wide uppercase text-sm">
            Team Builder & Analyzer
          </p>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="relative group flex gap-2" data-testid="search-form">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-foreground" />
            </div>
            <Input
              type="text"
              placeholder="NAME OR ID..."
              className="pl-10 h-14 rounded-none border-4 border-black bg-white focus:border-black focus:ring-0 text-xl font-bold uppercase placeholder:text-muted-foreground/70 retro-shadow-sm"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              data-testid="input-search"
            />
          </div>
          <Button 
            type="submit" 
            className="h-14 px-6 rounded-none border-4 border-black bg-yellow-400 hover:bg-yellow-500 text-black font-bold text-lg retro-shadow-sm active:translate-y-1 active:shadow-none transition-none"
            data-testid="button-search"
          >
            GO
          </Button>
        </form>

        {/* Main Card */}
        <div className="relative min-h-[500px]">
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col justify-center items-center h-[500px] w-full border-4 border-black bg-white retro-shadow-lg p-8"
              >
                <div className="text-2xl font-retro animate-pulse">LOADING...</div>
              </motion.div>
            ) : pokemon ? (
              <motion.div
                key={pokemon.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2, ease: "linear" }}
                className="w-full"
              >
                <Card className="overflow-hidden bg-white border-4 border-black retro-shadow-lg rounded-none p-0" data-testid={`card-pokemon-${pokemon.id}`}>
                  
                  {/* Screen Container */}
                  <div className="bg-muted p-6 border-b-4 border-black relative">
                    <div className="bg-[#9BBC0F] border-4 border-black p-8 relative flex items-center justify-center min-h-[240px] shadow-inner">
                      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMyIgaGVpZ2h0PSIzIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXRoIGQ9Ik0wIDBoMXYxSDB6IiBmaWxsPSJyZ2JhKDAsMCwwLDAuMSkiIGZpbGwtcnVsZT0iZXZlbm9kZCIvPjwvc3ZnPg==')] opacity-20 pointer-events-none z-0"></div>
                      
                      <motion.img
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.1, ease: "linear" }}
                        src={`https://raw.githubusercontent.com/msikma/pokesprite/master/pokemon-gen8/regular/${pokemon.name}.png`}
                        onError={(e) => {
                          e.currentTarget.src = pokemon.sprites.front_default;
                        }}
                        alt={pokemon.name}
                        className="w-32 h-32 object-contain z-10 pixelated contrast-125"
                        data-testid="img-pokemon-sprite"
                      />
                      
                      <span className="absolute top-2 left-2 font-retro text-xs text-[#0f380f]">
                        No.{String(pokemon.id).padStart(3, "0")}
                      </span>

                      <Button
                        onClick={addToTeam}
                        className="absolute bottom-2 right-2 rounded-none border-2 border-[#0f380f] bg-[#0f380f] text-[#9BBC0F] hover:bg-[#0f380f]/80 h-8 text-xs font-bold px-3 shadow-none transition-none"
                        disabled={team.some(p => p.id === pokemon.id) || team.length >= 6}
                      >
                        {team.some(p => p.id === pokemon.id) ? "CAUGHT" : "ADD +"}
                      </Button>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6 space-y-6 bg-white">
                    <div className="text-center space-y-2">
                      <h2 className="text-4xl font-retro uppercase text-foreground tracking-tight" data-testid="text-name">
                        {pokemon.name}
                      </h2>
                      
                      <div className="flex flex-wrap gap-3 justify-center pt-2" data-testid="container-types">
                        {pokemon.types.map((t) => (
                          <span
                            key={t.type.name}
                            className={cn(
                              "px-3 py-1 text-sm font-retro uppercase border-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]",
                              TYPE_COLORS[t.type.name] || "bg-gray-400 text-white border-black"
                            )}
                          >
                            {t.type.name}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* VS Analysis (Only if team has members) */}
                    {team.length > 0 && (
                      <div className="border-4 border-black p-4 bg-blue-50 relative mt-4">
                        <div className="absolute -top-3 left-4 bg-blue-500 text-white px-2 font-retro text-xs border-2 border-black">
                          VS SQUAD
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-xs">
                          <div>
                            <div className="font-bold mb-2 flex items-center gap-1">
                              <Swords className="w-3 h-3" /> TEAM ADVANTAGE
                            </div>
                            {teamAdvantage.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {teamAdvantage.map(p => (
                                  <img key={p.id} src={`https://raw.githubusercontent.com/msikma/pokesprite/master/pokemon-gen8/regular/${p.name}.png`} className="w-8 h-8 pixelated" title={p.name} />
                                ))}
                              </div>
                            ) : (
                              <span className="text-muted-foreground italic">No super effective counters</span>
                            )}
                          </div>
                          <div>
                            <div className="font-bold mb-2 flex items-center gap-1">
                              <ShieldAlert className="w-3 h-3" /> TEAM RISK
                            </div>
                            {teamDisadvantage.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {teamDisadvantage.map(p => (
                                  <img key={p.id} src={`https://raw.githubusercontent.com/msikma/pokesprite/master/pokemon-gen8/regular/${p.name}.png`} className="w-8 h-8 pixelated" title={p.name} />
                                ))}
                              </div>
                            ) : (
                              <span className="text-muted-foreground italic">Team is safe</span>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Stats */}
                    <div className="space-y-2 pt-2">
                      <div className="text-center mb-4">
                        <span className="font-retro text-xs border-b-4 border-red-500 pb-1">STATS</span>
                      </div>
                      
                      <div className="space-y-3">
                        {pokemon.stats.map((s) => (
                          <StatBar 
                            key={s.stat.name} 
                            label={s.stat.name.replace("special-", "SP.").replace("attack", "ATK").replace("defense", "DEF")} 
                            value={s.base_stat} 
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Navigation Controls */}
                <div className="grid grid-cols-2 gap-4 mt-6">
                  <Button
                    variant="outline"
                    onClick={handlePrev}
                    disabled={pokemon.id === 1}
                    className="rounded-none h-16 border-4 border-black bg-white hover:bg-gray-100 text-black font-bold text-lg retro-shadow disabled:opacity-50 disabled:shadow-none active:translate-y-1 active:shadow-none transition-none"
                    data-testid="button-prev"
                  >
                    <ChevronLeft className="w-6 h-6 mr-1" />
                    PREV
                  </Button>
                  
                  <Button
                    variant="default"
                    onClick={handleNext}
                    className="rounded-none h-16 border-4 border-black bg-red-600 hover:bg-red-700 text-white font-bold text-lg retro-shadow active:translate-y-1 active:shadow-none transition-none"
                    data-testid="button-next"
                  >
                    NEXT
                    <ChevronRight className="w-6 h-6 ml-1" />
                  </Button>
                </div>

              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </div>

      {/* Fixed Bottom Party Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-muted border-t-4 border-black p-4 z-50 shadow-[0_-4px_0_0_rgba(0,0,0,0.1)]">
        <div className="max-w-md mx-auto">
          <div className="flex justify-between items-center mb-2">
            <span className="font-retro text-xs">PARTY ({team.length}/6)</span>
            {team.length > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 text-xs hover:bg-red-100 hover:text-red-600 rounded-none"
                onClick={() => setTeam([])}
              >
                CLEAR
              </Button>
            )}
          </div>
          <div className="grid grid-cols-6 gap-2">
            {Array.from({ length: 6 }).map((_, i) => {
              const member = team[i];
              return (
                <div key={i} className="aspect-square relative">
                  {member ? (
                    <Dialog>
                      <DialogTrigger asChild>
                        <button className="w-full h-full bg-white border-2 border-black hover:bg-yellow-50 transition-colors flex items-center justify-center relative group">
                          <img 
                            src={`https://raw.githubusercontent.com/msikma/pokesprite/master/pokemon-gen8/regular/${member.name}.png`} 
                            className="w-full h-full object-contain pixelated"
                            alt={member.name}
                          />
                        </button>
                      </DialogTrigger>
                      <DialogContent className="bg-white border-4 border-black rounded-none font-mono sm:max-w-sm">
                        <DialogHeader>
                          <div className="flex justify-between items-start">
                            <DialogTitle className="font-retro uppercase text-xl">{member.name}</DialogTitle>
                            <Button variant="ghost" size="icon" className="h-6 w-6 rounded-none hover:bg-red-100" onClick={() => removeFromTeam(member.id)}>
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </Button>
                          </div>
                        </DialogHeader>
                        
                        <div className="mt-4 space-y-4">
                          <div className="flex gap-2">
                            {member.types.map((t) => (
                              <span key={t.type.name} className={cn("px-2 py-0.5 text-xs font-bold uppercase border border-black text-white", TYPE_COLORS[t.type.name].split(' ')[0])}>
                                {t.type.name}
                              </span>
                            ))}
                          </div>

                          {/* Type Effectiveness Analysis for this Member */}
                          {(() => {
                             const defensive = calculateDefensiveMatchups(member.types.map(t => t.type.name));
                             const weaknesses = Object.entries(defensive).filter(([_, m]) => m > 1).sort((a, b) => b[1] - a[1]);
                             const resistances = Object.entries(defensive).filter(([_, m]) => m < 1).sort((a, b) => a[1] - b[1]);
                             
                             return (
                               <div className="space-y-3 text-sm">
                                 <div>
                                   <div className="font-bold mb-1 text-red-600 flex items-center gap-1">
                                      <ShieldAlert className="w-3 h-3" /> WEAK TO
                                   </div>
                                   <div className="flex flex-wrap gap-1">
                                     {weaknesses.length > 0 ? weaknesses.map(([type, mult]) => (
                                       <span key={type} className={cn("px-1.5 py-0.5 text-[10px] uppercase border border-black bg-muted", mult > 2 ? "font-bold border-red-500 text-red-600 bg-red-50" : "")}>
                                         {type} x{mult}
                                       </span>
                                     )) : <span className="text-muted-foreground text-xs">No weaknesses</span>}
                                   </div>
                                 </div>
                                 
                                 <div>
                                   <div className="font-bold mb-1 text-green-600 flex items-center gap-1">
                                      <ShieldAlert className="w-3 h-3 rotate-180" /> RESISTANT TO
                                   </div>
                                   <div className="flex flex-wrap gap-1">
                                     {resistances.length > 0 ? resistances.map(([type, mult]) => (
                                       <span key={type} className="px-1.5 py-0.5 text-[10px] uppercase border border-black bg-muted">
                                         {type} x{mult}
                                       </span>
                                     )) : <span className="text-muted-foreground text-xs">No resistances</span>}
                                   </div>
                                 </div>
                               </div>
                             );
                          })()}
                        </div>
                      </DialogContent>
                    </Dialog>
                  ) : (
                    <div className="w-full h-full bg-muted/20 border-2 border-dashed border-black/30 flex items-center justify-center">
                      <Plus className="w-4 h-4 text-black/20" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
