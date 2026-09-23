"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import HowToPlay from "@/components/HowToPlay";
import { Button } from "@/components/ui";
import { load, STORAGE_KEYS } from "@/lib/storage";
import { TEAM_COLORS } from "@/lib/teams";
import type { GameState } from "@/types/game";

export default function Home() {
  const router = useRouter();
  const [showRules, setShowRules] = useState(false);
  const [canResume, setCanResume] = useState(false);

  useEffect(() => {
    const saved = load<GameState>(STORAGE_KEYS.game);
    setCanResume(!!saved && saved.phase !== "end");
  }, []);

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col px-5 py-10">
      {/* Logo : trois cartes en éventail */}
      <div className="mt-6 mb-10 flex flex-col items-center">
        <div className="relative mb-6 h-28 w-40">
          {[-14, 0, 14].map((angle, i) => (
            <div
              key={angle}
              className="absolute top-0 left-1/2 h-28 w-20 -ml-10 rounded-2xl border-4 border-white shadow-lg"
              style={{ backgroundColor: TEAM_COLORS[i].bg, transform: `rotate(${angle}deg) translateY(${i === 1 ? -6 : 0}px)` }}
            />
          ))}
        </div>
        <h1 className="text-center text-6xl leading-none font-bold tracking-tight">
          TIME
          <br />
          <span className="text-[#E5383B]">PARTY</span>
        </h1>
        <p className="mt-3 text-center text-lg text-muted">Faites deviner, mimez, gagnez !</p>
      </div>

      <div className="flex flex-col gap-4">
        {canResume && (
          <Button className="w-full bg-[#1FA463]!" onClick={() => router.push("/game")}>
            ▶ Reprendre la partie
          </Button>
        )}
        <ModeCard
          href="/setup?mode=classic"
          emoji="🎲"
          title="Mode classique"
          text="Les mots sont fournis par l'application."
        />
        <ModeCard
          href="/setup?mode=custom"
          emoji="✍️"
          title="Mode personnalisé"
          text="Les joueurs écrivent eux-mêmes les cartes."
        />
      </div>

      <Button variant="ghost" className="mt-6" onClick={() => setShowRules(true)}>
        Comment jouer ?
      </Button>

      {showRules && <HowToPlay onClose={() => setShowRules(false)} />}
    </main>
  );
}

function ModeCard({ href, emoji, title, text }: { href: string; emoji: string; title: string; text: string }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-4 rounded-3xl bg-white p-5 shadow-md shadow-ink/5 ring-1 ring-ink/5 transition active:scale-[0.97]"
    >
      <span className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-cream text-4xl">{emoji}</span>
      <span>
        <span className="block text-2xl font-bold">{title}</span>
        <span className="block text-muted">{text}</span>
      </span>
    </Link>
  );
}
