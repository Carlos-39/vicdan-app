import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

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