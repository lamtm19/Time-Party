export type GameMode = "classic" | "custom";

export type Team = {
  name: string;
  // Rempli uniquement si le tirage aléatoire a été utilisé
  players: string[];
};

// Tout ce qui est choisi pendant la configuration
export type GameConfig = {
  mode: GameMode;
  teams: Team[];
  playerCount: number;
  cards: string[];
  turnDuration: number; // en secondes
};

export type Phase =
  | "draw" // tirage de l'équipe qui commence
  | "ready" // écran « À vous de jouer ! »
  | "playing" // chrono en cours
  | "review" // fin du tour : correction du score
  | "roundEnd" // fin de manche
  | "end"; // fin de partie

export type GameState = {
  config: GameConfig;
  phase: Phase;
  round: number; // 0, 1 ou 2
  deck: string[]; // cartes restantes de la manche, deck[0] = carte affichée
  currentTeam: number;
  scores: number[][]; // scores[manche][équipe]
  turnFound: string[]; // cartes trouvées pendant le tour en cours
  turnEndsAt: number | null; // timestamp de fin du chrono
};
