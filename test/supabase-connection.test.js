import { createClient } from '@supabase/supabase-js';
import assert from 'assert';
import 'dotenv/config';

const url = process.env.SUPABASE_URL;
const anonKey = process.env.SUPABASE_ANON_KEY; // o SERVICE_ROLE_KEY si necesitas permisos

if (!url || !anonKey) {
  console.error('Faltan variables de entorno SUPABASE_URL o SUPABASE_ANON_KEY');
  process.exit(2);
}

const supabase = createClient(url, anonKey);

async function runTest() {
  try {
    const admin = {
      nombre: 'Administrador de prueba',
      correo: `test_${Date.now()}@correo.com`, // correo único para evitar conflicto con índice UNIQUE
      contraseña_hash: 'hash_prueba',
      fechas: new Date().toISOString()
    };

    // 🔹 Insertar registro de prueba
    const { data: insertData, error: insertError } = await supabase
      .from('administradores')
      .insert([admin])
      .select();

    if (insertError) throw insertError;
    assert(Array.isArray(insertData) && insertData.length > 0, 'Insert falló');

    const insertedAdmin = insertData[0];
    console.log('🟢 Registro insertado:', insertedAdmin);

    // 🔹 Verificar lectura del registro insertado
    const { data: selectData, error: selectError } = await supabase
      .from('administradores')
      .select('*')
      .eq('correo', admin.correo);

    if (selectError) throw selectError;
    assert(selectData && selectData.length === 1, 'Select no devolvió lo esperado');

    console.log('✅ Conexión y prueba OK — registro insertado y leído con éxito:', selectData[0].id);
    process.exit(0);
  } catch (err) {
    console.error('❌ Error en la prueba de conexión:', err.message || err);
    process.exit(1);
  }
}

runTest();
