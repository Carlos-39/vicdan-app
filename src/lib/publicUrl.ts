import { generateFriendlySlug } from "./slug";

const BASE_PUBLIC_URL = process.env.NEXT_PUBLIC_APP_URL || "https://vicdan-app.vercel.app";

export function generatePublicProfileLink(nombre: string) {
  const slug = generateFriendlySlug(nombre);
  const url = `${BASE_PUBLIC_URL}/p/${slug}`;
  return { slug, url };
}