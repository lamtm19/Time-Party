// La grande carte blanche au centre de l'écran
export default function GameCard({ word }: { word: string }) {
  // Police plus petite pour les mots longs
  const size = word.length > 22 ? "text-3xl" : word.length > 12 ? "text-4xl" : "text-5xl";
  return (
    <div className="animate-pop flex aspect-[4/3] w-full items-center justify-center rounded-[2rem] bg-white p-6 shadow-2xl shadow-black/25">
      <p className={`text-center leading-tight font-bold break-words text-ink uppercase ${size}`}>{word}</p>
    </div>
  );
}
