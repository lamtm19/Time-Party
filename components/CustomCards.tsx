import { useState } from "react";
import { Button, Modal, Panel } from "./ui";
import { pickClassicWords } from "@/lib/game";

type Props = {
  target: number;
  onDone: (cards: string[]) => void;
};

// Saisie secrète des cartes : les mots ajoutés ne sont JAMAIS réaffichés.
export default function CustomCards({ target, onDone }: Props) {
  const [cards, setCards] = useState<string[]>([]);
  const [text, setText] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const [error, setError] = useState("");
  const [filling, setFilling] = useState(false);

  const counter = (
    <p className="text-center text-2xl font-bold tabular-nums">
      {cards.length} / {target} <span className="font-normal text-muted">cartes</span>
    </p>
  );

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const word = text.trim();
    if (!word) return;
    if (cards.some((c) => c.toLowerCase() === word.toLowerCase())) {
      setError("Ce mot existe déjà, choisissez-en un autre !");
      return;
    }
    setConfirming(true);
  }

  function confirm() {
    setCards([...cards, text.trim()]);
    setText("");
    setConfirming(false);
    setJustAdded(true);
  }

  // Plus d'inspiration : les cartes manquantes sont tirées dans la liste du mode classique
  function fillWithGameWords() {
    setCards([...cards, ...pickClassicWords(target - cards.length, cards)]);
    setFilling(false);
  }

  if (cards.length >= target) {
    return (
      <div className="animate-pop flex flex-col items-center gap-6 pt-10 text-center">
        <span className="text-7xl">🃏</span>
        <h2 className="text-4xl font-bold">Toutes les cartes sont prêtes !</h2>
        {counter}
        <Button className="w-full" onClick={() => onDone(cards)}>
          Continuer
        </Button>
      </div>
    );
  }

  if (justAdded) {
    return (
      <div className="animate-pop flex flex-col items-center gap-6 pt-10 text-center">
        <span className="flex size-24 items-center justify-center rounded-full bg-[#1FA463] text-5xl text-white">✓</span>
        <h2 className="text-4xl font-bold">Carte ajoutée !</h2>
        {counter}
        <p className="text-lg text-muted">Passez le téléphone au joueur suivant.</p>
        <Button className="w-full" onClick={() => setJustAdded(false)}>
          Joueur suivant
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-center text-3xl font-bold">Ajoutez vos cartes</h2>
      {counter}
      <Panel>
        <form onSubmit={submit} className="flex flex-col gap-3">
          <input
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              setError("");
            }}
            placeholder="Écrivez un mot"
            maxLength={40}
            autoComplete="off"
            autoFocus
            className="rounded-2xl bg-cream px-4 py-4 text-center text-2xl font-semibold outline-none focus:ring-2 focus:ring-ink/20"
          />
          {error && <p className="text-center text-[#E5383B]">{error}</p>}
          <Button type="submit" disabled={!text.trim()}>
            Ajouter
          </Button>
        </form>
      </Panel>
      <p className="text-center text-muted">🤫 Les mots restent secrets : personne ne pourra les revoir.</p>

      <Button variant="secondary" onClick={() => setFilling(true)}>
        🎲 Compléter avec des mots du jeu
      </Button>

      {filling && (
        <Modal onClose={() => setFilling(false)}>
          <p className="text-center text-5xl">🎲</p>
          <p className="my-4 text-center text-2xl font-bold">
            Compléter les {target - cards.length} carte{target - cards.length > 1 ? "s" : ""} restante
            {target - cards.length > 1 ? "s" : ""} avec des mots du jeu ?
          </p>
          <p className="mb-5 text-center text-muted">Les cartes déjà écrites sont conservées. Les mots ajoutés restent secrets.</p>
          <div className="grid grid-cols-2 gap-3">
            <Button variant="secondary" onClick={() => setFilling(false)}>
              Annuler
            </Button>
            <Button onClick={fillWithGameWords}>Compléter</Button>
          </div>
        </Modal>
      )}

      {confirming && (
        <Modal>
          <p className="text-center text-lg text-muted">Vous avez écrit :</p>
          <p className="my-4 text-center text-4xl font-bold break-words">« {text.trim()} »</p>
          <p className="mb-5 text-center text-muted">Vérifiez l&apos;orthographe avant de valider.</p>
          <div className="grid grid-cols-2 gap-3">
            <Button variant="secondary" onClick={() => setConfirming(false)}>
              Corriger
            </Button>
            <Button onClick={confirm}>Confirmer</Button>
          </div>
        </Modal>
      )}
    </div>
  );
}
