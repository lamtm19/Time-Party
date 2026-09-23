// Petits composants d'interface réutilisés partout
import { teamColor } from "@/lib/teams";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
};

const VARIANTS = {
  primary: "bg-ink text-white shadow-lg shadow-ink/20",
  secondary: "bg-white text-ink shadow-md shadow-ink/10 ring-1 ring-ink/10",
  ghost: "text-muted",
};

export function Button({ variant = "primary", className = "", ...props }: ButtonProps) {
  return (
    <button
      className={`rounded-2xl px-6 py-4 text-lg font-semibold transition active:scale-95 disabled:opacity-40 disabled:active:scale-100 ${VARIANTS[variant]} ${className}`}
      {...props}
    />
  );
}

// Carte blanche arrondie
export function Panel({ className = "", children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={`rounded-3xl bg-white p-5 shadow-md shadow-ink/5 ring-1 ring-ink/5 ${className}`}>
      {children}
    </div>
  );
}

// Pastille de couleur d'équipe
export function TeamDot({ index, className = "size-4" }: { index: number; className?: string }) {
  return (
    <span
      className={`inline-block shrink-0 rounded-full ${className}`}
      style={{ backgroundColor: teamColor(index).bg }}
    />
  );
}

// Sélecteur « − 2 + »
export function Stepper({
  value,
  min,
  max,
  onChange,
}: {
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
}) {
  const round = "flex size-14 items-center justify-center rounded-full bg-white text-3xl font-bold shadow-md ring-1 ring-ink/10 transition active:scale-90 disabled:opacity-30";
  return (
    <div className="flex items-center justify-center gap-6">
      <button className={round} onClick={() => onChange(value - 1)} disabled={value <= min} aria-label="Moins">
        −
      </button>
      <span className="w-16 text-center text-5xl font-bold tabular-nums">{value}</span>
      <button className={round} onClick={() => onChange(value + 1)} disabled={value >= max} aria-label="Plus">
        +
      </button>
    </div>
  );
}

// Fenêtre plein écran sur mobile, centrée sur ordinateur
export function Modal({ children, onClose }: { children: React.ReactNode; onClose?: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/50 sm:items-center sm:p-6" onClick={onClose}>
      <div
        className="animate-fade-up max-h-dvh w-full max-w-md overflow-y-auto rounded-t-3xl bg-cream p-6 text-ink sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

// Fenêtre de confirmation aux couleurs du jeu (remplace le confirm() du navigateur)
export function ConfirmDialog({
  emoji,
  title,
  message,
  confirmLabel,
  cancelLabel = "Annuler",
  onConfirm,
  onCancel,
}: {
  emoji: string;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <Modal onClose={onCancel}>
      <p className="animate-pop text-center text-6xl">{emoji}</p>
      <h2 className="mt-3 text-center text-3xl font-bold">{title}</h2>
      <p className="mt-2 mb-6 text-center text-lg text-muted">{message}</p>
      <div className="grid grid-cols-2 gap-3">
        <Button variant="secondary" onClick={onCancel}>
          {cancelLabel}
        </Button>
        <Button className="bg-[#E5383B]! shadow-[#E5383B]/30!" onClick={onConfirm}>
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
