import { TeamDot } from "./ui";
import { getRanking, ROUNDS } from "@/lib/game";
import type { GameState } from "@/types/game";

// Tableau des scores : une ligne par équipe (classées par total), une colonne par manche
export default function Scoreboard({ game }: { game: GameState }) {
  const ranking = getRanking(game);
  // Colonne de la manche qui vient de se jouer, mise en avant
  const current = game.phase === "end" ? -1 : game.round;
  const highlight = (r: number) => (r === current ? "bg-[#F5BF1F]/15" : "");

  return (
    <div className="overflow-hidden rounded-3xl bg-white shadow-md ring-1 ring-ink/5">
      <table className="w-full table-fixed text-center">
        <thead className="bg-cream">
          <tr>
            <th className="w-[40%] p-3 text-left text-sm font-semibold text-muted">Équipe</th>
            {ROUNDS.map((round, r) => (
              <th key={r} className={`px-1 py-2 ${highlight(r)}`} title={round.title}>
                <span className="block text-2xl leading-none">{round.icon}</span>
                <span className="mt-1 block text-xs font-semibold text-muted">M{r + 1}</span>
              </th>
            ))}
            <th className="px-1 py-2">
              <span className="block text-2xl leading-none">🏆</span>
              <span className="mt-1 block text-xs font-semibold text-muted">Total</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {ranking.map(({ team, index, total }) => (
            <tr key={index} className="border-t border-ink/5 text-lg">
              <td className="py-3 pr-1 pl-3 text-left text-base font-semibold">
                <span className="flex items-center gap-2">
                  <TeamDot index={index} className="size-3.5" />
                  <span className="min-w-0 leading-tight break-words">{team.name}</span>
                </span>
              </td>
              {ROUNDS.map((_, r) => (
                <td key={r} className={`p-2 tabular-nums ${highlight(r)} ${r === current ? "font-bold" : ""}`}>
                  {r <= game.round ? game.scores[r][index] : <span className="text-ink/20">–</span>}
                </td>
              ))}
              <td className="p-2 text-xl font-bold tabular-nums">{total}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
