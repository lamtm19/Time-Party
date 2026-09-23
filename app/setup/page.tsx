"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import CardCountPicker from "@/components/CardCountPicker";
import CustomCards from "@/components/CustomCards";
import TeamSetup from "@/components/TeamSetup";
import { Button, Panel, TeamDot } from "@/components/ui";
import { words } from "@/data/words";
import { createGame, DEFAULT_PLAYER_COUNT, MAX_CARDS, MIN_CARDS, pickClassicWords, TURN_DURATIONS } from "@/lib/game";
import { load, save, STORAGE_KEYS } from "@/lib/storage";
import { createTeams, defaultTeamName } from "@/lib/teams";
import type { GameConfig, GameMode, Team } from "@/types/game";

type Step = "teams" | "cardCount" | "writing" | "summary";

type Props = { searchParams: Promise<{ mode?: string; replay?: string }> };

export default function SetupPage({ searchParams }: Props) {
  const params = use(searchParams);
  const mode: GameMode = params.mode === "custom" ? "custom" : "classic";
  const router = useRouter();

  const [step, setStep] = useState<Step>("teams");
  const [teams, setTeams] = useState<Team[]>(() => createTeams(2));
  const [playerCount, setPlayerCount] = useState(DEFAULT_PLAYER_COUNT);
  const [cardCount, setCardCount] = useState(DEFAULT_PLAYER_COUNT * 10);
  const [customCards, setCustomCards] = useState<string[]>([]);
  const [turnDuration, setTurnDuration] = useState(TURN_DURATIONS[0]);

  const maxCards = mode === "classic" ? words.length : MAX_CARDS;

  // « Rejouer » : on reprend les équipes et réglages de la partie précédente
  useEffect(() => {
    if (!params.replay) return;
    const last = load<GameConfig>(STORAGE_KEYS.config);
    if (!last) return;
    setTeams(last.teams);
    setPlayerCount(last.playerCount);
    setCardCount(last.cards.length);
    setTurnDuration(last.turnDuration);
  }, [params.replay]);

  function finishTeams() {
    // Noms vides → nom par défaut
    setTeams(teams.map((t, i) => ({ ...t, name: t.name.trim() || defaultTeamName(i) })));
    // Si les joueurs ont été tirés au sort, on connaît leur nombre
    const total = teams.reduce((sum, t) => sum + t.players.length, 0);
    if (total > 0 && total !== playerCount) {
      setPlayerCount(total);
      setCardCount(Math.min(total * 10, maxCards));
    }
    setStep("cardCount");
  }

  function goBack() {
    if (step === "teams") return router.push("/");
    if (step === "cardCount") return setStep("teams");
    if (step === "writing" || (step === "summary" && mode === "custom")) {
      if (customCards.length > 0 || step === "writing") {
        if (!confirm("Les cartes déjà écrites seront perdues. Revenir en arrière ?")) return;
      }
      setCustomCards([]);
    }
    setStep("cardCount");
  }

  function startGame() {
    const config: GameConfig = {
      mode,
      teams,
      playerCount,
      cards: mode === "classic" ? pickClassicWords(cardCount) : customCards,
      turnDuration,
    };
    save(STORAGE_KEYS.config, config);
    save(STORAGE_KEYS.game, createGame(config));
    router.push("/game");
  }

  const titles: Record<Step, string> = {
    teams: "Les équipes",
    cardCount: "Les cartes",
    writing: "Écriture des cartes",
    summary: "Prêts ?",
  };

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col px-5 pt-4 pb-10">
      <header className="mb-6 flex items-center gap-3">
        <button
          onClick={goBack}
          className="flex size-11 items-center justify-center rounded-full bg-white text-2xl shadow-sm ring-1 ring-ink/10 active:scale-90"
          aria-label="Retour"
        >
          ←
        </button>
        <div>
          <p className="text-sm font-semibold tracking-wide text-muted uppercase">
            {mode === "classic" ? "🎲 Mode classique" : "✍️ Mode personnalisé"}
          </p>
          <p className="text-xl font-bold">{titles[step]}</p>
        </div>
      </header>

      {step === "teams" && <TeamSetup teams={teams} onChange={setTeams} onNext={finishTeams} />}

      {step === "cardCount" && (
        <div className="flex flex-col gap-6">
          <CardCountPicker
            playerCount={playerCount}
            onPlayerCountChange={setPlayerCount}
            cardCount={cardCount}
            onCardCountChange={setCardCount}
            maxCards={maxCards}
          />
          <Button disabled={cardCount < MIN_CARDS} onClick={() => setStep(mode === "custom" ? "writing" : "summary")}>
            {mode === "custom" ? "Écrire les cartes" : "Continuer"}
          </Button>
        </div>
      )}

      {step === "writing" && (
        <CustomCards
          target={cardCount}
          onDone={(cards) => {
            setCustomCards(cards);
            setStep("summary");
          }}
        />
      )}

      {step === "summary" && (
        <div className="animate-fade-up flex flex-col gap-5">
          <Panel>
            <div className="mb-4 grid grid-cols-2 gap-3 text-center">
              <div className="rounded-2xl bg-cream p-3">
                <p className="text-3xl font-bold">{teams.length}</p>
                <p className="text-muted">équipes</p>
              </div>
              <div className="rounded-2xl bg-cream p-3">
                <p className="text-3xl font-bold">{mode === "classic" ? cardCount : customCards.length}</p>
                <p className="text-muted">cartes</p>
              </div>
            </div>
            <ul className="flex flex-col gap-2">
              {teams.map((team, i) => (
                <li key={i} className="flex items-center gap-3 text-xl font-semibold">
                  <TeamDot index={i} className="size-5" />
                  {team.name}
                </li>
              ))}
            </ul>
          </Panel>

          <section>
            <h2 className="mb-3 text-center text-2xl font-bold">Durée du tour</h2>
            <div className="grid grid-cols-2 gap-3">
              {TURN_DURATIONS.map((d) => (
                <button
                  key={d}
                  onClick={() => setTurnDuration(d)}
                  className={`rounded-2xl py-4 text-2xl font-bold shadow-md transition active:scale-95 ${
                    turnDuration === d ? "bg-ink text-white" : "bg-white ring-1 ring-ink/10"
                  }`}
                >
                  {d} s
                </button>
              ))}
            </div>
          </section>

          <Button className="py-5! text-2xl!" onClick={startGame}>
            Commencer la partie
          </Button>
        </div>
      )}
    </main>
  );
}
