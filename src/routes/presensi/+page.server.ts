import { db } from '$lib/server/db';
import { presensiLog, kelasKuliah, mataKuliah } from '$lib/server/db/schema';
import { eq, sql, and } from 'drizzle-orm';

export async function load() {
    // Demo: Budi (mahasiswa_id = 1)
    const mahasiswaId = 1;
    
    const classes = await db.select({
        kode: mataKuliah.kode,
        nama: mataKuliah.nama,
        kelasId: kelasKuliah.id,
        hadir: sql<number>`COUNT(${presensiLog.id})`.mapWith(Number),
        total: sql<number>`14`.mapWith(Number)
    })
    .from(kelasKuliah)
    .innerJoin(mataKuliah, eq(kelasKuliah.mataKuliahId, mataKuliah.id))
    .leftJoin(presensiLog, and(
        eq(presensiLog.kelasKuliahId, kelasKuliah.id),
        eq(presensiLog.mahasiswaId, mahasiswaId)
    ))
    .groupBy(kelasKuliah.id, mataKuliah.kode, mataKuliah.nama);
    
    const formattedPresensi = classes.map(c => ({
        kode: c.kode,
        nama: c.nama,
        kelasId: c.kelasId,
        hadir: c.hadir,
        total: c.total,
        persentase: parseFloat(((c.hadir / c.total) * 100).toFixed(1))
    }));

    return {
        presensi: formattedPresensi
    };
}

export const actions = {
    markAttendance: async ({ request }) => {
        const data = await request.formData();
        const kelasId = Number(data.get('kelasId'));
        
        await db.insert(presensiLog).values({
            kelasKuliahId: kelasId,
            mahasiswaId: 1
        });
        
        return { success: true, message: `Absensi Berhasil tersimpan ke Database!` };
    }
};
