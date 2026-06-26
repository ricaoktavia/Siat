import { db } from '$lib/server/db';
import { krs, krsDetail, mataKuliah, kelasKuliah, mahasiswa, users } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { redirect } from '@sveltejs/kit';

export async function load({ cookies }) {
    const sessionId = cookies.get('session');
    if (!sessionId) {
        throw redirect(303, '/login');
    }

    const userResult = await db.select().from(users).where(eq(users.id, sessionId)).limit(1);
    if (userResult.length === 0 || userResult[0].role !== 'STUDENT') {
        throw redirect(303, '/login');
    }
    const user = userResult[0];

    const scheduleData: Record<string, any[]> = {
        'Senin': [],
        'Selasa': [],
        'Rabu': [],
        'Kamis': [],
        'Jumat': []
    };

    const mhsResult = await db.select().from(mahasiswa).where(eq(mahasiswa.userId, user.id)).limit(1);
    if (mhsResult.length > 0) {
        const mhs = mhsResult[0];
        const activeKrs = await db.select().from(krs).where(eq(krs.mahasiswaId, mhs.id)).limit(1);
        
        if (activeKrs.length > 0 && activeKrs[0].status === 'DISETUJUI') {
            const details = await db.select({
                id: mataKuliah.id,
                mk: mataKuliah.nama,
                waktu: kelasKuliah.jadwal,
                dosen: kelasKuliah.dosenUtama,
                sks: mataKuliah.sks
            })
            .from(krsDetail)
            .innerJoin(mataKuliah, eq(krsDetail.courseId, mataKuliah.id))
            .innerJoin(kelasKuliah, eq(kelasKuliah.mataKuliahId, mataKuliah.id))
            .where(eq(krsDetail.krsId, activeKrs[0].id));

            details.forEach((d, i) => {
                const dayMatch = d.waktu.match(/^(Senin|Selasa|Rabu|Kamis|Jumat)/i);
                let day = dayMatch ? dayMatch[1] : 'Senin';
                day = day.charAt(0).toUpperCase() + day.slice(1).toLowerCase();
                
                const timeStr = d.waktu.replace(/^(Senin|Selasa|Rabu|Kamis|Jumat),?\s*/i, '');
                
                if (scheduleData[day]) {
                    scheduleData[day].push({
                        id: i + 1,
                        mk: d.mk,
                        waktu: timeStr,
                        ruang: 'Menunggu Jadwal Ruangan',
                        dosen: d.dosen,
                        tipe: d.sks > 2 ? 'Praktikum' : 'Teori'
                    });
                }
            });
        }
    }

    return {
        scheduleData
    };
}
