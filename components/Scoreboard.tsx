import { TeamDot } from "./ui";
import { ROUNDS, totalScore } from "@/lib/game";
import type { GameState } from "@/types/game";

// Tableau des scores : une ligne par équipe, une colonne par manche
export default function Scoreboard({ game }: { game: GameState }) {
  return (
    <div className="overflow-hidden rounded-3xl bg-white shadow-md ring-1 ring-ink/5">
      <table className="w-full text-center text-lg">
        <thead className="bg-cream text-sm text-muted">
          <tr>
            <th className="p-3 text-left font-semibold">Équipe</th>
            {ROUNDS.map((_, r) => (
              <th key={r} className="p-3 font-semibold">
                M{r + 1}
              </th>
            ))}
            <th className="p-3 font-semibold text-ink">Total</th>
          </tr>
        </thead>
        <tbody>
          {game.config.teams.map((team, t) => (
            <tr key={t} className="border-t border-ink/5">
              <td className="p-3 text-left font-semibold">
                <span className="flex items-center gap-2">
                  <TeamDot index={t} />
                  <span className="truncate">{team.name}</span>
                </span>
              </td>
              {ROUNDS.map((_, r) => (
                <td key={r} className="p-3 tabular-nums">
                  {r <= game.round ? game.scores[r][t] : "–"}
                </td>
              ))}
              <td className="p-3 text-xl font-bold tabular-nums">{totalScore(game, t)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
