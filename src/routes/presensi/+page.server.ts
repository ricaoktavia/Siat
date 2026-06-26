import { db } from '$lib/server/db';
import { presensi, kelasKuliah, mataKuliah, mahasiswa, krs, krsDetail } from '$lib/server/db/schema';
import { eq, sql, and } from 'drizzle-orm';
import { redirect } from '@sveltejs/kit';

export async function load({ cookies }) {
    const sessionId = cookies.get('session');
    if (!sessionId) throw redirect(303, '/login');

    const mhsResult = await db.select().from(mahasiswa).where(eq(mahasiswa.userId, sessionId)).limit(1);
    if (mhsResult.length === 0) throw redirect(303, '/login');
    const mhsId = mhsResult[0].id;
    
    // Join presensi with mataKuliah and kelasKuliah
    const classes = await db.select({
        kode: mataKuliah.kode,
        nama: mataKuliah.nama,
        kelasId: kelasKuliah.id,
        hadir: presensi.hadir,
        total: presensi.totalPertemuan,
        mataKuliahId: mataKuliah.id
    })
    .from(krsDetail)
    .innerJoin(krs, eq(krsDetail.krsId, krs.id))
    .innerJoin(mataKuliah, eq(krsDetail.courseId, mataKuliah.id))
    .innerJoin(kelasKuliah, eq(kelasKuliah.mataKuliahId, mataKuliah.id))
    .leftJoin(presensi, and(
        eq(presensi.mataKuliahId, mataKuliah.id),
        eq(presensi.mahasiswaId, mhsId)
    ))
    .where(and(
        eq(krs.mahasiswaId, mhsId),
        eq(krs.status, 'DISETUJUI')
    ));
    
    const formattedPresensi = classes.map(c => {
        const h = c.hadir || 0;
        const t = c.total || 14;
        return {
            kode: c.kode,
            nama: c.nama,
            kelasId: c.kelasId,
            hadir: h,
            total: t,
            persentase: parseFloat(((h / t) * 100).toFixed(1))
        };
    });

    return {
        presensi: formattedPresensi
    };
}

export const actions = {
    markAttendance: async ({ request, cookies }) => {
        const sessionId = cookies.get('session');
        if (!sessionId) throw redirect(303, '/login');

        const mhsResult = await db.select().from(mahasiswa).where(eq(mahasiswa.userId, sessionId)).limit(1);
        if (mhsResult.length === 0) return { success: false, message: 'Unauthorized' };
        const mhsId = mhsResult[0].id;

        const data = await request.formData();
        const kelasId = Number(data.get('kelasId'));
        
        // Find mataKuliahId
        const kelasRes = await db.select().from(kelasKuliah).where(eq(kelasKuliah.id, kelasId)).limit(1);
        if (kelasRes.length === 0) return { success: false, message: 'Kelas tidak ditemukan' };
        const mkId = kelasRes[0].mataKuliahId;
        
        // check if presensi exists
        const pRes = await db.select().from(presensi).where(and(eq(presensi.mataKuliahId, mkId), eq(presensi.mahasiswaId, mhsId))).limit(1);
        if (pRes.length > 0) {
            await db.update(presensi).set({ hadir: pRes[0].hadir + 1 }).where(eq(presensi.id, pRes[0].id));
        } else {
            await db.insert(presensi).values({
                mataKuliahId: mkId,
                mahasiswaId: mhsId,
                hadir: 1,
                totalPertemuan: 14
            });
        }
        
        return { success: true, message: `Absensi Berhasil tersimpan ke Database!` };
    }
};
