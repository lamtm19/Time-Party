// Petites fonctions autour du localStorage (peut échouer en navigation privée)
export const STORAGE_KEYS = {
  config: "timeparty:config", // dernière configuration (pour « Rejouer »)
  game: "timeparty:game", // partie en cours (pour la reprise après rechargement)
  usedWords: "timeparty:used-words", // mots déjà joués en mode classique
};

export function load<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export function save(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Pas grave : le jeu fonctionne sans sauvegarde
  }
}

export function remove(key: string) {
  try {
    localStorage.removeItem(key);
  } catch {}
}
