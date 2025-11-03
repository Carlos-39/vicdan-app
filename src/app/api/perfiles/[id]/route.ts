import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { logger } from '@/lib/logger';


export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const perfilId = params.id; 

    const { data: perfil, error: fetchError } = await supabaseAdmin
      .from('perfiles')
      .select('*') 
      .eq('id', perfilId) 
      .single();

    if (fetchError) {
      logger.warn(fetchError, `Perfil no encontrado con id: ${perfilId}`);
      return NextResponse.json(
        { error: 'Perfil no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(perfil, { status: 200 });

  } catch (error: any) {
    logger.error(error, 'Error inesperado al obtener el perfil');
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}