import { shuffle, randomInt } from "./shuffle";
import type { Team } from "@/types/game";

export const MIN_TEAMS = 2;
export const MAX_TEAMS = 8;

// Une couleur par équipe, dans l'ordre. `text` = couleur du texte posé sur la couleur.
export const TEAM_COLORS = [
  { name: "Rouge", bg: "#E5383B", text: "#FFFFFF" },
  { name: "Bleue", bg: "#2F6FDE", text: "#FFFFFF" },
  { name: "Verte", bg: "#1FA463", text: "#FFFFFF" },
  { name: "Jaune", bg: "#F5BF1F", text: "#3A2C00" },
  { name: "Violette", bg: "#8E44D6", text: "#FFFFFF" },
  { name: "Orange", bg: "#F27B21", text: "#FFFFFF" },
  { name: "Rose", bg: "#E94B9A", text: "#FFFFFF" },
  { name: "Turquoise", bg: "#0FA3B1", text: "#FFFFFF" },
];

export function teamColor(index: number) {
  return TEAM_COLORS[index % TEAM_COLORS.length];
}

export function defaultTeamName(index: number) {
  return `Équipe ${teamColor(index).name}`;
}

export function createTeams(count: number): Team[] {
  return Array.from({ length: count }, (_, i) => ({ name: defaultTeamName(i), players: [] }));
}

// Répartit les joueurs le plus équitablement possible.
// Le décalage aléatoire évite que ce soit toujours la première équipe qui ait un joueur de plus.
export function splitPlayers(players: string[], teamCount: number): string[][] {
  const groups: string[][] = Array.from({ length: teamCount }, () => []);
  const offset = randomInt(teamCount);
  shuffle(players).forEach((player, i) => {
    groups[(i + offset) % teamCount].push(player);
  });
  return groups;
}
