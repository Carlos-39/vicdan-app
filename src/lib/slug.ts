import { customAlphabet } from 'nanoid';

const ALPHABET = "0123456789abcdefghijklmnopqrstuvwxyz";
const nano = customAlphabet(ALPHABET, 4); 

function slugify(text: string) {
  return text
    .toString()
    .normalize("NFD")                          // quita acentos
    .replace(/[\u0300-\u036f]/g, "")          // remueve tildes
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")              // reemplaza todo por guiones
    .replace(/^-+|-+$/g, "");                 // quita guiones extras
}

export function generateFriendlySlug(nombre: string) {
  const base = slugify(nombre);
  const unique = nano();
  return `${base}-${unique}`;
}