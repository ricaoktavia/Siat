import { db } from '$lib/server/db';
import { mahasiswa } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { fail } from '@sveltejs/kit';

export const actions = {
    updateProfile: async ({ request, locals, cookies }) => {
        const sessionId = cookies.get('session');
        if (!sessionId) return fail(401, { message: 'Unauthorized' });
        
        const data = await request.formData();
        const emailPribadi = data.get('emailPribadi')?.toString();
        const noHp = data.get('noHp')?.toString();
        const alamatDomisili = data.get('alamatDomisili')?.toString();
        
        try {
            await db.update(mahasiswa)
                .set({
                    emailPribadi: emailPribadi,
                    noHp: noHp,
                    alamatDomisili: alamatDomisili
                })
                .where(eq(mahasiswa.userId, sessionId));
            
            return { success: true };
        } catch (e) {
            console.error(e);
            return fail(500, { message: 'Gagal memperbarui profil' });
        }
    }
};
