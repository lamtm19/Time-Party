import { shuffle, randomInt } from "./shuffle";
import { load, save, STORAGE_KEYS } from "./storage";
import { words } from "@/data/words";
import type { GameConfig, GameState } from "@/types/game";

// ---------- Réglages faciles à modifier ----------

export const ROUNDS = [
  {
    title: "Plusieurs mots",
    rule: "Faites deviner la carte avec autant de mots que vous voulez, sans dire le mot écrit dessus.",
  },
  {
    title: "Un seul mot",
    rule: "Un seul mot pour faire deviner, pas un de plus. Pas de gestes !",
  },
  {
    title: "Mimes",
    rule: "Aucun mot : uniquement des mimes et des gestes.",
  },
];

export const TURN_DURATIONS = [30, 40];

// Nombre de cartes par joueur selon la longueur de partie souhaitée
export const CARD_PRESETS = [
  { label: "Courte", perPlayer: 5 },
  { label: "Normale", perPlayer: 10 },
  { label: "Longue", perPlayer: 15 },
];

export const DEFAULT_PLAYER_COUNT = 4;
export const MIN_CARDS = 5;
export const MAX_CARDS = 200;

// ---------- Cartes ----------

// Tire des mots du mode classique en évitant ceux des parties précédentes.
// Quand il n'en reste plus assez, on repart de la liste complète.
// `exclude` : mots à ne jamais tirer (ex. cartes déjà écrites par les joueurs).
export function pickClassicWords(count: number, exclude: string[] = []): string[] {
  const excluded = exclude.map((w) => w.toLowerCase());
  const allowed = words.filter((w) => !excluded.includes(w.toLowerCase()));
  let used = load<string[]>(STORAGE_KEYS.usedWords) ?? [];
  let available = allowed.filter((w) => !used.includes(w));
  if (available.length < count) {
    used = [];
    available = allowed;
  }
  const picked = shuffle(available).slice(0, count);
  save(STORAGE_KEYS.usedWords, [...used, ...picked]);
  return picked;
}

// ---------- Déroulement de la partie ----------
// Chaque fonction prend l'état actuel et renvoie le nouvel état.

export function createGame(config: GameConfig): GameState {
  return {
    config,
    phase: "draw",
    round: 0,
    deck: shuffle(config.cards),
    currentTeam: randomInt(config.teams.length),
    scores: ROUNDS.map(() => config.teams.map(() => 0)),
    turnFound: [],
    turnEndsAt: null,
  };
}

export function startTurn(state: GameState): GameState {
  return {
    ...state,
    phase: "playing",
    turnFound: [],
    turnEndsAt: Date.now() + state.config.turnDuration * 1000,
  };
}

export function endTurn(state: GameState): GameState {
  return { ...state, phase: "review", turnEndsAt: null };
}

export function foundCard(state: GameState): GameState {
  const [card, ...rest] = state.deck;
  const next = { ...state, deck: rest, turnFound: [...state.turnFound, card] };
  // Plus aucune carte : le tour s'arrête
  return rest.length === 0 ? endTurn(next) : next;
}

// La carte passée retourne sous le paquet : elle reviendra plus tard dans la manche
export function skipCard(state: GameState): GameState {
  const [card, ...rest] = state.deck;
  return { ...state, deck: [...rest, card] };
}

// Annule une carte validée par erreur : elle retourne dans le paquet
export function cancelFound(state: GameState, index: number): GameState {
  const card = state.turnFound[index];
  return {
    ...state,
    turnFound: state.turnFound.filter((_, i) => i !== index),
    deck: shuffle([...state.deck, card]),
  };
}

export function validateTurn(state: GameState): GameState {
  const scores = state.scores.map((roundScores, r) =>
    r === state.round
      ? roundScores.map((s, t) => (t === state.currentTeam ? s + state.turnFound.length : s))
      : roundScores,
  );
  return {
    ...state,
    scores,
    turnFound: [],
    currentTeam: (state.currentTeam + 1) % state.config.teams.length,
    phase: state.deck.length === 0 ? "roundEnd" : "ready",
  };
}

// Manche suivante : mêmes cartes, complètement remélangées
export function nextRound(state: GameState): GameState {
  if (state.round >= ROUNDS.length - 1) return { ...state, phase: "end" };
  return {
    ...state,
    round: state.round + 1,
    deck: shuffle(state.config.cards),
    phase: "ready",
  };
}

// ---------- Scores ----------

export function totalScore(state: GameState, team: number): number {
  return state.scores.reduce((sum, roundScores) => sum + roundScores[team], 0);
}

// Classement avec gestion des égalités (ex. 1er, 1er, 3e)
export function getRanking(state: GameState) {
  const sorted = state.config.teams
    .map((team, index) => ({ team, index, total: totalScore(state, index) }))
    .sort((a, b) => b.total - a.total);
  return sorted.map((entry) => ({
    ...entry,
    rank: sorted.findIndex((e) => e.total === entry.total) + 1,
  }));
}
