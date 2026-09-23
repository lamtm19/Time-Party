import { useState } from "react";
import PlayerRandomizer from "./PlayerRandomizer";
import { Button, Panel, Stepper, TeamDot } from "./ui";
import { defaultTeamName, MAX_TEAMS, MIN_TEAMS } from "@/lib/teams";
import type { Team } from "@/types/game";

type Props = {
  teams: Team[];
  onChange: (teams: Team[]) => void;
  onNext: () => void;
};

export default function TeamSetup({ teams, onChange, onNext }: Props) {
  const [showRandomizer, setShowRandomizer] = useState(false);

  function changeCount(count: number) {
    if (count > teams.length) {
      onChange([...teams, { name: defaultTeamName(teams.length), players: [] }]);
    } else {
      onChange(teams.slice(0, count));
    }
  }

  function rename(index: number, name: string) {
    onChange(teams.map((team, i) => (i === index ? { ...team, name } : team)));
  }

  return (
    <div className="flex flex-col gap-6">
      <section>
        <h2 className="mb-4 text-center text-3xl font-bold">Combien d&apos;équipes ?</h2>
        <Stepper value={teams.length} min={MIN_TEAMS} max={MAX_TEAMS} onChange={changeCount} />
      </section>

      <section className="flex flex-col gap-3">
        {teams.map((team, i) => (
          <Panel key={i} className="animate-fade-up p-4!">
            <div className="flex items-center gap-3">
              <TeamDot index={i} className="size-8" />
              <input
                value={team.name}
                onChange={(e) => rename(i, e.target.value)}
                placeholder={defaultTeamName(i)}
                maxLength={24}
                className="min-w-0 flex-1 rounded-xl border-2 border-transparent bg-cream px-3 py-2 text-xl font-semibold outline-none focus:border-ink/20"
              />
            </div>
            {team.players.length > 0 && (
              <p className="mt-2 pl-11 text-muted">{team.players.join(", ")}</p>
            )}
          </Panel>
        ))}
      </section>

      <Button variant="secondary" onClick={() => setShowRandomizer(true)}>
        🔀 Créer les équipes aléatoirement
      </Button>

      <Button onClick={onNext}>Continuer</Button>

      {showRandomizer && (
        <PlayerRandomizer
          teams={teams}
          onClose={() => setShowRandomizer(false)}
          onValidate={(groups) => {
            onChange(teams.map((team, i) => ({ ...team, players: groups[i] })));
            setShowRandomizer(false);
          }}
        />
      )}
    </div>
  );
}
