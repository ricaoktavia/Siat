import { db } from '$lib/server/db';
import { uktKeuangan, mahasiswa, users } from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';
import { redirect } from '@sveltejs/kit';

export async function load({ cookies }) {
    const sessionId = cookies.get('session');
    if (!sessionId) throw redirect(303, '/login');

    const mhsResult = await db.select().from(mahasiswa).where(eq(mahasiswa.userId, sessionId)).limit(1);
    if (mhsResult.length === 0) throw redirect(303, '/login');
    const mhs = mhsResult[0];

    const uktRes = await db.select().from(uktKeuangan).where(and(eq(uktKeuangan.mahasiswaId, mhs.id), eq(uktKeuangan.semester, mhs.semester.toString()))).limit(1);
    const status = uktRes.length > 0 ? uktRes[0].status : 'BELUM_BAYAR';

    return {
        status,
        billing: {
            semester: mhs.semester,
            jumlah: 5000000,
            deadline: '01 Agustus 2026',
            virtualAccount: '8888000' + mhs.id
        }
    };
}

export const actions = {
    pay: async ({ cookies }) => {
        const sessionId = cookies.get('session');
        if (!sessionId) throw redirect(303, '/login');

        const mhsResult = await db.select().from(mahasiswa).where(eq(mahasiswa.userId, sessionId)).limit(1);
        if (mhsResult.length === 0) return { success: false };
        const mhs = mhsResult[0];

        const uktRes = await db.select().from(uktKeuangan).where(and(eq(uktKeuangan.mahasiswaId, mhs.id), eq(uktKeuangan.semester, mhs.semester.toString()))).limit(1);

        if (uktRes.length > 0) {
            await db.update(uktKeuangan)
                .set({ status: 'LUNAS' })
                .where(eq(uktKeuangan.id, uktRes[0].id));
        } else {
            await db.insert(uktKeuangan).values({
                mahasiswaId: mhs.id,
                semester: mhs.semester.toString(),
                jumlah: '5000000',
                deadline: '2026-08-01',
                virtualAccount: '8888000' + mhs.id,
                status: 'LUNAS'
            });
        }
        
        return { success: true, message: 'Pembayaran UKT Berhasil! Akses KRS telah dibuka.' };
    }
};
