import { db } from '$lib/server/db';
import { krs, krsDetail, mataKuliah, kelasKuliah, mahasiswa, users } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { redirect } from '@sveltejs/kit';

export async function load({ cookies }) {
    const sessionId = cookies.get('session');
    if (!sessionId) {
        throw redirect(303, '/login');
    }

    // Get user info
    const userResult = await db.select().from(users).where(eq(users.id, sessionId)).limit(1);
    if (userResult.length === 0) return { classes: [] };
    const user = userResult[0];

    let classes: any[] = [];
    let totalSks = 0;

    if (user.role === 'STUDENT') {
        const mhsResult = await db.select().from(mahasiswa).where(eq(mahasiswa.userId, user.id)).limit(1);
        if (mhsResult.length > 0) {
            const mhs = mhsResult[0];
            const activeKrs = await db.select().from(krs).where(eq(krs.mahasiswaId, mhs.id)).limit(1);
            if (activeKrs.length > 0 && activeKrs[0].status === 'DISETUJUI') {
                const details = await db.select({
                    id: mataKuliah.id,
                    nama: mataKuliah.nama,
                    waktu: kelasKuliah.jadwal,
                    dosen: kelasKuliah.dosenUtama,
                    sks: mataKuliah.sks
                })
                .from(krsDetail)
                .innerJoin(mataKuliah, eq(krsDetail.courseId, mataKuliah.id))
                .innerJoin(kelasKuliah, eq(kelasKuliah.mataKuliahId, mataKuliah.id))
                .where(eq(krsDetail.krsId, activeKrs[0].id));

                classes = details.map((d, index) => ({
                    id: index + 1,
                    nama: d.nama,
                    waktu: d.waktu,
                    ruang: 'Kelas Daring / Menunggu Jadwal', // placeholder as we don't have this in db
                    dosen: d.dosen,
                    status: 'Menunggu',
                    sks: d.sks
                }));
                
                totalSks = classes.reduce((sum, c) => sum + c.sks, 0);
            }
        }
    }

    return {
        classes,
        totalSks
    };
}
