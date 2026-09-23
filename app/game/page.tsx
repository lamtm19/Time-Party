"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import GameCard from "@/components/GameCard";
import Scoreboard from "@/components/Scoreboard";
import Timer from "@/components/Timer";
import { Button, ConfirmDialog, TeamDot } from "@/components/ui";
import { beep, unlockAudio, vibrate } from "@/lib/feedback";
import {
  cancelFound,
  endTurn,
  foundCard,
  getRanking,
  nextRound,
  ROUNDS,
  skipCard,
  startTurn,
  totalScore,
  validateTurn,
} from "@/lib/game";
import { load, remove, save, STORAGE_KEYS } from "@/lib/storage";
import { teamColor } from "@/lib/teams";
import type { GameState } from "@/types/game";

export default function GamePage() {
  const router = useRouter();
  const [game, setGame] = useState<GameState | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [confirmQuit, setConfirmQuit] = useState(false);

  // Chargement de la partie sauvegardée (créée par la page de configuration)
  useEffect(() => {
    const saved = load<GameState>(STORAGE_KEYS.game);
    if (saved) setGame(saved);
    else router.replace("/");
  }, [router]);

  // Sauvegarde automatique : la partie survit à un rechargement de la page
  useEffect(() => {
    if (game) save(STORAGE_KEYS.game, game);
  }, [game]);

  // Empêche l'écran de se mettre en veille pendant la partie
  useEffect(() => {
    let lock: WakeLockSentinel | null = null;
    const request = async () => {
      try {
        lock = await navigator.wakeLock.request("screen");
      } catch {}
    };
    const onVisible = () => document.visibilityState === "visible" && request();
    request();
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      lock?.release();
    };
  }, []);

  // Chrono : on rafraîchit l'heure tant qu'un tour est en cours
  const phase = game?.phase;
  useEffect(() => {
    if (phase !== "playing") return;
    const id = setInterval(() => setNow(Date.now()), 200);
    return () => clearInterval(id);
  }, [phase]);

  const secondsLeft = game?.turnEndsAt
    ? Math.min(game.config.turnDuration, Math.ceil((game.turnEndsAt - now) / 1000))
    : 0;

  // Bips des 5 dernières secondes, puis fin du tour
  useEffect(() => {
    if (phase !== "playing") return;
    if (secondsLeft <= 0) {
      beep(440, 0.6);
      vibrate([300, 100, 300]);
      setGame((g) => g && endTurn(g));
    } else if (secondsLeft <= 5) {
      beep();
    }
  }, [secondsLeft, phase]);

  // La barre du téléphone (heure, batterie) prend la couleur de l'écran, comme une vraie app
  const screenColor =
    game && game.phase !== "roundEnd" && game.phase !== "end" ? teamColor(game.currentTeam).bg : "#fbf6ee";
  useEffect(() => {
    const meta = document.querySelector('meta[name="theme-color"]');
    meta?.setAttribute("content", screenColor);
    document.documentElement.style.backgroundColor = screenColor;
    document.body.style.backgroundColor = screenColor;
    return () => {
      meta?.setAttribute("content", "#fbf6ee");
      document.documentElement.style.backgroundColor = "";
      document.body.style.backgroundColor = "";
    };
  }, [screenColor]);

  if (!game) return null;

  const update = (fn: (g: GameState) => GameState) => setGame((g) => g && fn(g));
  const color = teamColor(game.currentTeam);
  const team = game.config.teams[game.currentTeam];
  const round = ROUNDS[game.round];

  function leave(to: string) {
    remove(STORAGE_KEYS.game);
    router.push(to);
  }

  // ---------- Écrans sur fond clair : fin de manche et fin de partie ----------

  if (game.phase === "roundEnd") {
    const isLast = game.round === ROUNDS.length - 1;
    return (
      <main className="mx-auto flex min-h-dvh max-w-md flex-col gap-5 px-5 py-8">
        <div className="animate-pop text-center">
          <p className="text-lg font-semibold text-muted uppercase">
            {round.icon} Manche {game.round + 1} · {round.title}
          </p>
          <h1 className="text-5xl font-bold">Manche terminée !</h1>
        </div>

        <Scoreboard game={game} />

        <Button className="mt-auto py-5! text-xl!" onClick={() => update(nextRound)}>
          {isLast ? "🏆 Voir le résultat" : `Manche ${game.round + 2} : ${ROUNDS[game.round + 1].title}`}
        </Button>
      </main>
    );
  }

  if (game.phase === "end") {
    const ranking = getRanking(game);
    const winners = ranking.filter((r) => r.rank === 1);
    const medals = ["🥇", "🥈", "🥉"];

    return (
      <main className="mx-auto flex min-h-dvh max-w-md flex-col gap-5 px-5 py-8">
        <div className="animate-pop text-center">
          <p className="text-7xl">🏆</p>
          <h1 className="mt-2 text-4xl font-bold">Partie terminée !</h1>
          <p className="mt-2 text-2xl font-semibold" style={{ color: winners.length === 1 ? teamColor(winners[0].index).bg : undefined }}>
            {winners.length === 1
              ? `${winners[0].team.name} gagne !`
              : `Égalité entre ${winners.map((w) => w.team.name).join(" et ")} !`}
          </p>
        </div>

        <ol className="flex flex-col gap-2">
          {ranking.map((r) => (
            <li
              key={r.index}
              className="animate-fade-up flex items-center gap-3 rounded-2xl p-4 text-xl font-bold shadow-md"
              style={{ backgroundColor: teamColor(r.index).bg, color: teamColor(r.index).text }}
            >
              <span className="w-10 text-center text-3xl">{medals[r.rank - 1] ?? `${r.rank}e`}</span>
              <span className="flex-1 truncate">{r.team.name}</span>
              <span className="tabular-nums">{r.total} pts</span>
            </li>
          ))}
        </ol>

        <Scoreboard game={game} />

        <div className="mt-auto flex flex-col gap-3">
          <Button className="py-5! text-xl!" onClick={() => leave(`/setup?mode=${game.config.mode}&replay=1`)}>
            Rejouer
          </Button>
          <Button variant="secondary" onClick={() => leave("/")}>
            Retour à l&apos;accueil
          </Button>
        </div>
      </main>
    );
  }

  // ---------- Écrans à la couleur de l'équipe ----------

  return (
    <main
      className={`flex min-h-dvh flex-col ${game.phase === "draw" ? "" : "transition-colors duration-500"}`}
      style={{ backgroundColor: color.bg, color: color.text }}
    >
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col px-5 pt-4 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
        {/* Titre de la manche, toujours visible */}
        <header className="flex items-center gap-3">
          <button
            onClick={() => setConfirmQuit(true)}
            className="flex size-10 shrink-0 items-center justify-center rounded-full bg-black/15 text-xl active:scale-90"
            aria-label="Quitter"
          >
            ✕
          </button>
          <div className="flex-1 text-center">
            <p className="text-sm font-semibold opacity-80">Manche {game.round + 1} / 3</p>
            <p className="text-2xl leading-tight font-bold uppercase">{round.title}</p>
          </div>
          <div className="w-10" />
        </header>

        {game.phase === "draw" && (
          <StartingTeamDraw
            game={game}
            onPreview={(index) => update((g) => ({ ...g, currentTeam: index }))}
            onDone={() => update((g) => ({ ...g, phase: "ready" }))}
          />
        )}

        {game.phase === "ready" && (
          <div key={game.currentTeam} className="animate-fade-up flex flex-1 flex-col items-center justify-center gap-6 text-center">
            <p className="max-w-xs rounded-2xl bg-black/15 px-4 py-3 text-lg">{round.rule}</p>
            <div>
              <p className="text-2xl font-semibold opacity-90">À vous de jouer !</p>
              <p className="mt-1 text-5xl font-bold break-words">{team.name}</p>
            </div>
            <button
              onClick={() => {
                unlockAudio();
                setNow(Date.now());
                update(startTurn);
              }}
              className="flex size-40 items-center justify-center rounded-full bg-white text-5xl font-bold shadow-2xl shadow-black/25 transition active:scale-90"
              style={{ color: color.text === "#FFFFFF" ? color.bg : color.text }}
            >
              GO
            </button>
            <DeckCount count={game.deck.length} />
          </div>
        )}

        {game.phase === "playing" && (
          <div className="flex flex-1 flex-col items-center gap-5 pt-4">
            <Timer seconds={secondsLeft} />
            <div className="flex w-full flex-1 items-center">
              <GameCard key={`${game.deck[0]}-${game.turnFound.length}-${game.deck.length}`} word={game.deck[0]} />
            </div>
            <DeckCount count={game.deck.length} />
            <div className="grid w-full grid-cols-5 gap-3">
              <button
                onClick={() => update(skipCard)}
                disabled={game.deck.length < 2}
                className="col-span-2 rounded-3xl bg-black/20 py-6 text-2xl font-bold transition active:scale-95 disabled:opacity-40"
              >
                SKIP
              </button>
              <button
                onClick={() => update(foundCard)}
                className="col-span-3 rounded-3xl bg-white py-6 text-2xl font-bold text-ink shadow-xl shadow-black/20 transition active:scale-95"
              >
                ✅ TROUVÉ
              </button>
            </div>
          </div>
        )}

        {game.phase === "review" && (
          <div className="animate-fade-up flex flex-1 flex-col gap-5 pt-6">
            <div className="text-center">
              <h1 className="text-5xl font-bold">{game.deck.length === 0 ? "Plus de cartes !" : "Temps écoulé !"}</h1>
              <p className="mt-2 text-2xl font-semibold">
                {game.turnFound.length} carte{game.turnFound.length > 1 ? "s" : ""} trouvée
                {game.turnFound.length > 1 ? "s" : ""}
              </p>
            </div>

            {game.turnFound.length > 0 && (
              <div className="rounded-3xl bg-white p-3 text-ink shadow-xl shadow-black/20">
                <p className="px-2 pb-2 text-sm text-muted">Une carte validée par erreur ? Retirez-la.</p>
                <ul className="flex max-h-[45dvh] flex-col gap-2 overflow-y-auto">
                  {game.turnFound.map((card, i) => (
                    <li key={`${card}-${i}`} className="flex items-center gap-3 rounded-2xl bg-cream py-2 pr-2 pl-4">
                      <span className="flex-1 text-lg font-semibold">{card}</span>
                      <button
                        onClick={() => update((g) => cancelFound(g, i))}
                        className="rounded-xl bg-white px-3 py-2 text-sm font-semibold text-[#E5383B] shadow-sm active:scale-95"
                      >
                        Retirer
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <Button className="mt-auto bg-white! py-5! text-xl! text-ink!" onClick={() => update(validateTurn)}>
              Valider le score
            </Button>

            {/* Rappel des totaux */}
            <div className="flex flex-wrap justify-center gap-2">
              {game.config.teams.map((t, i) => (
                <span key={i} className="flex items-center gap-2 rounded-full bg-black/15 px-3 py-1 text-sm font-semibold">
                  <TeamDot index={i} className="size-3 ring-2 ring-white/70" />
                  {t.name} · {totalScore(game, i) + (i === game.currentTeam ? game.turnFound.length : 0)}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {confirmQuit && (
        <ConfirmDialog
          emoji="🚪"
          title="Quitter la partie ?"
          message="La partie en cours et les scores seront perdus."
          confirmLabel="Quitter"
          cancelLabel="Continuer"
          onConfirm={() => leave("/")}
          onCancel={() => setConfirmQuit(false)}
        />
      )}
    </main>
  );
}

// Tirage animé de l'équipe qui commence : les couleurs défilent puis s'arrêtent
function StartingTeamDraw({
  game,
  onPreview,
  onDone,
}: {
  game: GameState;
  onPreview: (index: number) => void;
  onDone: () => void;
}) {
  const [target] = useState(game.currentTeam);
  const [spinning, setSpinning] = useState(true);
  const count = game.config.teams.length;

  useEffect(() => {
    // Les couleurs défilent de plus en plus lentement et s'arrêtent sur l'équipe tirée
    const minSteps = 14;
    const total = minSteps + (((target - minSteps) % count) + count) % count;
    let step = 0;
    let timeout: ReturnType<typeof setTimeout>;
    const tick = () => {
      step++;
      onPreview(step % count);
      if (step >= total) return setSpinning(false);
      const progress = step / total;
      timeout = setTimeout(tick, 70 + progress * progress * 330);
    };
    timeout = setTimeout(tick, 70);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 text-center">
      <p className="text-6xl">🎲</p>
      <p className="text-2xl font-semibold opacity-90">{spinning ? "Tirage au sort…" : "L'équipe qui commence"}</p>
      <p key={game.currentTeam} className={`text-5xl font-bold break-words uppercase ${spinning ? "" : "animate-pop"}`}>
        {game.config.teams[game.currentTeam].name}
      </p>
      <div className="h-20">
        {!spinning && (
          <Button className="animate-pop bg-white! px-12! py-5! text-2xl! text-ink!" onClick={onDone}>
            C&apos;est parti !
          </Button>
        )}
      </div>
    </div>
  );
}

function DeckCount({ count }: { count: number }) {
  return (
    <p className="flex items-center gap-2 text-lg font-semibold opacity-90">
      <span className="relative inline-block h-6 w-5">
        <span className="absolute inset-0 translate-x-1 -translate-y-1 rounded border-2 border-current opacity-50" />
        <span className="absolute inset-0 rounded border-2 border-current" />
      </span>
      {count} carte{count > 1 ? "s" : ""} restante{count > 1 ? "s" : ""}
    </p>
  );
}
