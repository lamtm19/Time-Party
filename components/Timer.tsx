// Affichage du chrono (le décompte lui-même est géré par la page de jeu)
export default function Timer({ seconds }: { seconds: number }) {
  const safe = Math.max(0, seconds);
  const text = `${String(Math.floor(safe / 60)).padStart(2, "0")}:${String(safe % 60).padStart(2, "0")}`;
  const hurry = safe <= 5;
  return (
    <div
      className={`rounded-full px-6 py-2 text-5xl font-bold tabular-nums transition ${
        hurry ? "animate-pulse-fast bg-white text-[#E5383B]" : "bg-black/15"
      }`}
    >
      {text}
    </div>
  );
}
