import { NextResponse } from 'next/server';
import { updateRecord } from '@/lib/nocodb';
import bcrypt from 'bcryptjs';

// POST - Alterar senha do personal
export async function POST(request: Request) {
  try {
    const { user_id, new_password } = await request.json();

    if (!user_id || !new_password) {
      return NextResponse.json({ 
        error: 'ID do usuário e nova senha são obrigatórios' 
      }, { status: 400 });
    }

    if (new_password.length < 6) {
      return NextResponse.json({ 
        error: 'Senha deve ter no mínimo 6 caracteres' 
      }, { status: 400 });
    }

    const password_hash = await bcrypt.hash(new_password, 10);

    await updateRecord('users', user_id, { password_hash });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Erro ao alterar senha:', error);
    return NextResponse.json({ 
      error: 'Erro ao alterar senha'
    }, { status: 500 });
  }
}
