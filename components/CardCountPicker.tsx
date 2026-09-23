import { Panel, Stepper } from "./ui";
import { CARD_PRESETS, MIN_CARDS } from "@/lib/game";

type Props = {
  playerCount: number;
  onPlayerCountChange: (count: number) => void;
  cardCount: number;
  onCardCountChange: (count: number) => void;
  maxCards: number;
};

export default function CardCountPicker({ playerCount, onPlayerCountChange, cardCount, onCardCountChange, maxCards }: Props) {
  function changePlayers(count: number) {
    // On garde la même longueur de partie quand on change le nombre de joueurs
    const preset = CARD_PRESETS.find((p) => p.perPlayer * playerCount === cardCount);
    onPlayerCountChange(count);
    if (preset) onCardCountChange(Math.min(preset.perPlayer * count, maxCards));
  }

  return (
    <div className="flex flex-col gap-6">
      <section>
        <h2 className="mb-4 text-center text-3xl font-bold">Combien de joueurs ?</h2>
        <Stepper value={playerCount} min={2} max={30} onChange={changePlayers} />
      </section>

      <section>
        <h2 className="mb-4 text-center text-3xl font-bold">Combien de cartes ?</h2>
        <div className="grid grid-cols-3 gap-3">
          {CARD_PRESETS.map((preset) => {
            const count = Math.min(preset.perPlayer * playerCount, maxCards);
            const selected = count === cardCount;
            return (
              <button
                key={preset.label}
                onClick={() => onCardCountChange(count)}
                className={`rounded-2xl p-3 text-center shadow-md transition active:scale-95 ${
                  selected ? "bg-ink text-white" : "bg-white ring-1 ring-ink/10"
                }`}
              >
                <span className="block text-lg font-semibold">{preset.label}</span>
                <span className="block text-3xl font-bold">{count}</span>
                <span className={`block text-sm ${selected ? "text-white/70" : "text-muted"}`}>
                  {preset.perPlayer} / joueur
                </span>
              </button>
            );
          })}
        </div>

        <Panel className="mt-4 flex items-center justify-between gap-3 p-4!">
          <label htmlFor="card-count" className="text-lg font-semibold">
            Ou choisissez :
          </label>
          <input
            id="card-count"
            type="number"
            inputMode="numeric"
            min={MIN_CARDS}
            max={maxCards}
            value={cardCount || ""}
            onChange={(e) => onCardCountChange(Math.min(Number(e.target.value) || 0, maxCards))}
            className="w-24 rounded-xl bg-cream px-3 py-2 text-center text-2xl font-bold outline-none focus:ring-2 focus:ring-ink/20"
          />
        </Panel>
        {cardCount < MIN_CARDS && <p className="mt-2 text-center text-[#E5383B]">Minimum {MIN_CARDS} cartes</p>}
      </section>
    </div>
  );
}
