import { Button, Modal } from "./ui";
import { ROUNDS } from "@/lib/game";

export default function HowToPlay({ onClose }: { onClose: () => void }) {
  return (
    <Modal onClose={onClose}>
      <h2 className="mb-4 text-3xl font-bold">Comment jouer ?</h2>
      <div className="space-y-3 text-lg leading-snug">
        <p>
          Formez des équipes. À chaque tour, un joueur fait deviner un maximum de cartes à son équipe avant la fin
          du chrono.
        </p>
        <p>
          <b>✅ Trouvé</b> : +1 point, la carte sort du paquet.
          <br />
          <b>Skip</b> : la carte retourne dans le paquet.
        </p>
        <p>La partie se joue en 3 manches, avec les mêmes cartes :</p>
        <ol className="space-y-2">
          {ROUNDS.map((round, i) => (
            <li key={round.title} className="rounded-2xl bg-white p-3 shadow-sm">
              <b>
                Manche {i + 1} · {round.title}
              </b>
              <br />
              <span className="text-muted">{round.rule}</span>
            </li>
          ))}
        </ol>
        <p>Une manche se termine quand toutes les cartes ont été trouvées. L&apos;équipe qui a le plus de points à la fin gagne !</p>
      </div>
      <Button className="mt-6 w-full" onClick={onClose}>
        Compris !
      </Button>
    </Modal>
  );
}
