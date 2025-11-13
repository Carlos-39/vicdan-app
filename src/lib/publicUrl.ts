import { generateSlug } from './slug';

const BASE_PUBLIC_URL = 'https://vicdan.link';

export function generatePublicProfileLink() {
  const slug = generateSlug('p');
  const url = `${BASE_PUBLIC_URL}/${slug}`;
  return { slug, url };
}