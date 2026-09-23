import type { MetadataRoute } from "next";

// Nom et icônes utilisés quand le site est ajouté à l'écran d'accueil
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Time Party",
    short_name: "Time Party",
    description: "Le party game à jouer sur un seul téléphone : faites deviner, mimez, gagnez !",
    start_url: "/",
    display: "standalone",
    background_color: "#fbf6ee",
    theme_color: "#fbf6ee",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
