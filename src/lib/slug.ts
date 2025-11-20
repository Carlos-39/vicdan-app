import { customAlphabet } from 'nanoid';

const ALPHABET = '0123456789abcdefghijklmnopqrstuvwxyz';
const DEFAULT_SIZE = 10; 

const nano = customAlphabet(ALPHABET, DEFAULT_SIZE);

export function generateSlug(prefix = 'p') {
  return `${prefix}_${nano()}`;
}
