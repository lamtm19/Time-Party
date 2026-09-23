import { useState } from "react";
import { Button, Modal, TeamDot } from "./ui";
import { splitPlayers } from "@/lib/teams";
import type { Team } from "@/types/game";

type Props = {
  teams: Team[];
  onValidate: (groups: string[][]) => void;
  onClose: () => void;
};

export default function PlayerRandomizer({ teams, onValidate, onClose }: Props) {
  // On repart des joueurs déjà tirés, s'il y en a
  const [players, setPlayers] = useState<string[]>(teams.flatMap((t) => t.players));
  const [name, setName] = useState("");
  const [groups, setGroups] = useState<string[][] | null>(null);

  const enoughPlayers = players.length >= teams.length;

  function addPlayer(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed || players.includes(trimmed)) return;
    setPlayers([...players, trimmed]);
    setName("");
    setGroups(null);
  }

  function removePlayer(player: string) {
    setPlayers(players.filter((p) => p !== player));
    setGroups(null);
  }

  return (
    <Modal>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-3xl font-bold">Tirage des équipes</h2>
        <button onClick={onClose} className="text-3xl text-muted" aria-label="Fermer">
          ×
        </button>
      </div>

      {groups === null ? (
        <>
          <p className="mb-3 text-lg text-muted">Entrez les noms des joueurs</p>
          <form onSubmit={addPlayer} className="flex gap-2">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nom du joueur"
              maxLength={20}
              autoFocus
              className="min-w-0 flex-1 rounded-2xl bg-white px-4 py-3 text-lg shadow-sm ring-1 ring-ink/10 outline-none focus:ring-2 focus:ring-ink/30"
            />
            <Button type="submit" className="px-5!" disabled={!name.trim()}>
              + Ajouter
            </Button>
          </form>

          <div className="mt-4 flex min-h-12 flex-wrap gap-2">
            {players.map((player) => (
              <span key={player} className="animate-pop flex items-center gap-1 rounded-full bg-white py-1 pr-1 pl-4 text-lg shadow-sm">
                {player}
                <button
                  onClick={() => removePlayer(player)}
                  className="flex size-8 items-center justify-center rounded-full text-muted active:bg-cream"
                  aria-label={`Retirer ${player}`}
                >
                  ×
                </button>
              </span>
            ))}
          </div>

          <p className="mt-2 text-muted">
            {players.length} joueur{players.length > 1 ? "s" : ""}
            {!enoughPlayers && ` · au moins ${teams.length} pour ${teams.length} équipes`}
          </p>

          <Button className="mt-5 w-full" disabled={!enoughPlayers} onClick={() => setGroups(splitPlayers(players, teams.length))}>
            🎲 Tirer les équipes
          </Button>
        </>
      ) : (
        <>
          <div className="flex flex-col gap-3">
            {groups.map((group, i) => (
              <div key={`${i}-${group.join()}`} className="animate-pop rounded-2xl bg-white p-4 shadow-sm">
                <div className="mb-1 flex items-center gap-2 text-xl font-bold">
                  <TeamDot index={i} />
                  {teams[i].name}
                </div>
                <p className="text-lg">{group.join(", ")}</p>
              </div>
            ))}
          </div>
          <div className="mt-5 flex flex-col gap-3">
            <Button variant="secondary" onClick={() => setGroups(splitPlayers(players, teams.length))}>
              🔀 Remélanger
            </Button>
            <Button onClick={() => onValidate(groups)}>Valider les équipes</Button>
            <Button variant="ghost" onClick={() => setGroups(null)}>
              Modifier les joueurs
            </Button>
          </div>
        </>
      )}
    </Modal>
  );
}
