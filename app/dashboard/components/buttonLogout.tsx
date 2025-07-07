// app/actions/logout.ts
'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function logoutAction() {
    const cookieStore = cookies();
    const token = (await cookieStore).get('token')?.value;

    try {
     
        if (token) {
            await fetch(`${process.env.NEXT_URL}/api/agendamento/auth/logout`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
        }
    } catch (error) {
        console.error("Erro durante logout:", error);
    } finally {
        (await
            cookieStore).delete('token');
        redirect('/');
    }
}