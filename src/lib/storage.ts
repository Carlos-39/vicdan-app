import { createClient } from '@supabase/supabase-js';

// Use server SUPABASE_URL if available, otherwise fallback to NEXT_PUBLIC_SUPABASE_URL
const supabaseUrl = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  throw new Error('SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL is required. Please set it in your environment (.env.local)');
}

if (!serviceKey) {
  throw new Error('SUPABASE_SERVICE_ROLE_KEY is required. Please set it in your environment (.env.local)');
}

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false },
});

async function uploadLogo(file: File, adminId: string) {
  const fileName = `logos/${adminId}-${Date.now()}-${file.name}`;
  const { data, error } = await supabase.storage
    .from('perfiles-logos')
    .upload(fileName, file, { contentType: file.type });
  if (error) throw error;
  const { data: urlData } = supabase.storage.from('perfiles-logos').getPublicUrl(fileName);
  return urlData.publicUrl;
}

export { uploadLogo };